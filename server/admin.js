/* =========================================================
   世界织卷APP · 管理后台（账号密码）
   - 管理员凭据持久化到 server/data/admin.json（scrypt 哈希）
   - 管理会话只保存在内存，服务重启后需要重新登录
   - 只读取服务端账号，不接触前端 localStorage 本机账号
   ========================================================= */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const config = require('./config');
const store = require('./store');

const ADMIN_FILE = path.join(config.dataDir, 'admin.json');
const UPDATE_FILE = path.join(config.root, 'update.json');
const sessions = new Map(); // sha256(token) -> { exp, username }
let admin = null;

function fail(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function ensureDir() {
  fs.mkdirSync(config.dataDir, { recursive: true });
}

function save() {
  if (!admin) return;
  ensureDir();
  const tmp = ADMIN_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(admin, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, ADMIN_FILE);
}

function load() {
  if (fs.existsSync(ADMIN_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
      if (raw && raw.username && raw.passHash) {
        admin = {
          username: String(raw.username),
          passHash: String(raw.passHash),
          createdAt: Number(raw.createdAt) || Date.now(),
          updatedAt: Number(raw.updatedAt) || Date.now()
        };
      }
    } catch { /* 损坏时允许重新初始化 */ }
  }
  if (config.admin.username && config.admin.password) {
    admin = {
      username: config.admin.username,
      passHash: store.hashPassword(config.admin.password),
      createdAt: (admin && admin.createdAt) || Date.now(),
      updatedAt: Date.now(),
      fromEnv: true
    };
    save();
  }
  return admin;
}

function isInitialized() {
  return Boolean(admin);
}

function isLoopback(req) {
  const addr = String((req && req.socket && req.socket.remoteAddress) || '');
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function status(req) {
  return {
    initialized: isInitialized(),
    setupAllowed: !admin && isLoopback(req),
    username: admin ? admin.username : null,
    version: require('../package.json').version,
    updateManifest: fs.existsSync(UPDATE_FILE)
  };
}

function validateUsername(value) {
  const username = String(value || '').trim();
  if (!/^[\u4e00-\u9fa5A-Za-z0-9_]{3,32}$/.test(username)) {
    throw fail(400, 'invalid_admin_username', '管理员账号需为 3–32 位中文、字母、数字或下划线');
  }
  return username;
}

function validatePassword(value) {
  const password = String(value || '');
  if (password.length < 8) throw fail(400, 'weak_admin_password', '管理员密码至少 8 位');
  if (password.length > 128) throw fail(400, 'long_admin_password', '管理员密码过长');
  return password;
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function issueSession() {
  const token = crypto.randomBytes(32).toString('base64url');
  const exp = Date.now() + Math.max(3600000, config.admin.sessionTtlMs || 12 * 3600 * 1000);
  sessions.set(tokenHash(token), { exp, username: admin.username });
  return { token, expiresAt: exp, admin: { username: admin.username } };
}

function cleanupSessions() {
  const now = Date.now();
  for (const [key, session] of sessions) if (!session || session.exp <= now) sessions.delete(key);
}

function setup(username, password) {
  if (admin) throw fail(409, 'admin_initialized', '管理员已经初始化，请直接登录');
  const name = validateUsername(username);
  const pass = validatePassword(password);
  admin = {
    username: name,
    passHash: store.hashPassword(pass),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  save();
  return issueSession();
}

function login(username, password) {
  cleanupSessions();
  if (!admin) throw fail(503, 'admin_uninitialized', '后台还没有初始化管理员');
  const name = String(username || '').trim();
  const pass = String(password || '');
  const ok = name.toLowerCase() === admin.username.toLowerCase()
    && store.verifyPassword(pass, admin.passHash);
  if (!ok) throw fail(401, 'admin_bad_credentials', '管理员账号或密码不正确');
  return issueSession();
}

function bearer(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : '';
}

function authorized(req) {
  const token = bearer(req);
  if (!token) return false;
  const key = tokenHash(token);
  const session = sessions.get(key);
  if (!session) return false;
  if (session.exp <= Date.now()) {
    sessions.delete(key);
    return false;
  }
  return true;
}

function requireAdmin(req) {
  if (!authorized(req)) throw fail(401, 'admin_unauthorized', '后台登录已过期，请重新登录');
  return true;
}

function logout(req) {
  const token = bearer(req);
  if (token) sessions.delete(tokenHash(token));
}

function toAdminUser(user, messageCounts) {
  const maskedPhone = user.phone
    ? String(user.phone).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
    : null;
  const email = user.email ? String(user.email).replace(/^(.{2}).*(@.*)$/, '$1***$2') : null;
  return {
    id: user.id,
    uid: user.uid,
    displayId: user.displayId,
    method: user.method,
    disabled: !!user.disabled,
    phone: maskedPhone,
    email,
    username: user.username || null,
    skinId: user.skinId || 'steve',
    createdAt: Number(user.createdAt) || 0,
    lastLoginAt: Number(user.lastLoginAt) || 0,
    friendCount: Array.isArray(user.friends) ? user.friends.length : 0,
    messageCount: messageCounts ? (messageCounts[user.uid] || 0) : 0
  };
}

function messageCounts() {
  const counts = {};
  for (const message of store.raw.messages || []) {
    counts[message.from] = (counts[message.from] || 0) + 1;
    counts[message.to] = (counts[message.to] || 0) + 1;
  }
  return counts;
}

function overview() {
  const users = store.raw.users || [];
  const messages = store.raw.messages || [];
  const sessionsDb = store.raw.sessions || {};
  const now = Date.now();
  const validSessions = Object.values(sessionsDb).filter((s) => s && s.exp > now).length;
  const methods = { offline: 0, phone: 0, qq: 0, microsoft: 0, xbox: 0, other: 0 };
  users.forEach((u) => {
    const key = Object.prototype.hasOwnProperty.call(methods, u.method) ? u.method : 'other';
    methods[key] += 1;
  });

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    days.push({
      date: `${start.getMonth() + 1}/${start.getDate()}`,
      count: users.filter((u) => u.createdAt >= start.getTime() && u.createdAt < end.getTime()).length
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = now - 7 * 86400000;
  const counts = messageCounts();
  return {
    users: users.length,
    disabled: users.filter((u) => u.disabled).length,
    activeSessions: validSessions,
    messages: messages.length,
    onlineUsers: validSessions,
    newToday: users.filter((u) => u.createdAt >= today.getTime()).length,
    newWeek: users.filter((u) => u.createdAt >= weekAgo).length,
    methods,
    days,
    recent: users.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8).map((u) => toAdminUser(u, counts))
  };
}

function listUsers(query = '', page = 1, limit = 24) {
  const q = String(query || '').trim().toLowerCase();
  const counts = messageCounts();
  const all = (store.raw.users || []).filter((u) => {
    if (!q) return true;
    return [u.uid, u.displayId, u.username, u.email, u.phone]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  }).sort((a, b) => (b.lastLoginAt || b.createdAt || 0) - (a.lastLoginAt || a.createdAt || 0));
  const size = Math.max(8, Math.min(50, Number(limit) || 24));
  const current = Math.max(1, Number(page) || 1);
  return {
    total: all.length,
    page: current,
    limit: size,
    pages: Math.max(1, Math.ceil(all.length / size)),
    users: all.slice((current - 1) * size, current * size).map((u) => toAdminUser(u, counts))
  };
}

function getMessages() {
  const users = new Map((store.raw.users || []).map((u) => [u.uid, u]));
  return (store.raw.messages || []).slice(-80).reverse().map((m) => ({
    id: m.id,
    from: m.from,
    fromName: m.fromName,
    to: m.to,
    toName: (users.get(m.to) || {}).displayId || m.to,
    text: m.text,
    at: m.at
  }));
}

function userAction(userId, action, password) {
  const user = store.findById(String(userId || ''));
  if (!user) throw fail(404, 'user_not_found', '账号不存在');
  const act = String(action || '');
  if (act === 'disable') {
    store.setDisabled(user, true);
  } else if (act === 'enable') {
    store.setDisabled(user, false);
  } else if (act === 'force-logout') {
    store.deleteSessionsForUser(user.id);
  } else if (act === 'reset-password') {
    const pass = validatePassword(password);
    user.passHash = store.hashPassword(pass);
    user.passwordResetAt = Date.now();
    store.deleteSessionsForUser(user.id);
    store.save();
  } else if (act === 'delete') {
    store.deleteUser(user);
    return { deleted: true, uid: user.uid };
  } else {
    throw fail(400, 'invalid_action', '未知的管理操作');
  }
  return { user: toAdminUser(user, messageCounts()) };
}

function readUpdate() {
  try {
    const raw = JSON.parse(fs.readFileSync(UPDATE_FILE, 'utf8'));
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function writeUpdate(input) {
  const version = String((input && input.version) || '').trim();
  if (!/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.\-]+)?$/.test(version)) {
    throw fail(400, 'invalid_version', '版本号格式应为 2.1.5');
  }
  const packageUrl = String((input && input.packageUrl) || '').trim();
  if (packageUrl && !/^https?:\/\//i.test(packageUrl) && !/^[A-Za-z0-9._\-\/]+$/.test(packageUrl)) {
    throw fail(400, 'invalid_package_url', '更新包地址必须是 http(s) 链接或相对路径');
  }
  const sha256 = String((input && input.sha256) || '').trim().toLowerCase();
  if (sha256 && !/^[a-f0-9]{64}$/.test(sha256)) {
    throw fail(400, 'invalid_sha256', 'sha256 需为 64 位十六进制');
  }
  const rawNotes = input && input.notes;
  const notes = (Array.isArray(rawNotes) ? rawNotes : String(rawNotes || '').split(/\r?\n/))
    .map((n) => String(n).trim())
    .filter(Boolean)
    .slice(0, 40);
  const filename = path.basename(String((input && input.filename) || `世界织卷APP-v${version}.apk`));
  const manifest = {
    version,
    releasedAt: String((input && input.releasedAt) || new Date().toISOString().slice(0, 10)),
    notes,
    packageUrl,
    filename,
    size: Math.max(0, Number(input && input.size) || 0),
    sha256,
    minVersion: String((input && input.minVersion) || '1.0.0'),
    mandatory: Boolean(input && input.mandatory)
  };
  const tmp = UPDATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, UPDATE_FILE);
  return manifest;
}

module.exports = {
  load,
  status,
  isInitialized,
  isLoopback,
  setup,
  login,
  logout,
  authorized,
  requireAdmin,
  overview,
  listUsers,
  getMessages,
  userAction,
  readUpdate,
  writeUpdate
};
