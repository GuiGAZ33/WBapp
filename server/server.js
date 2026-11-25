/* =========================================================
   世界织卷APP · 本地服务端
   - 静态文件托管（index.html / app.js / styles.css / data.js）
   - 账号 API：手机验证码、QQ 邮箱校验、微软/Xbox 官方授权、本地账号
   - 零依赖，Node 18+（需内置 fetch）
   ---------------------------------------------------------
   启动：node server/server.js
   规则：任何无法被真实服务商验证的登录，一律失败（fail closed）。
   ========================================================= */
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const config = require('./config');
const store = require('./store');
const admin = require('./admin');
const sms = require('./providers/sms');
const qqmail = require('./providers/qqmail');
const ms = require('./providers/microsoft');

/* ---------------- 工具 ---------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function apiError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  res.end(body);
}

function ok(res, data, status = 200) {
  sendJson(res, status, { ok: true, data });
}

function fail(res, err) {
  const status = err.status || 500;
  sendJson(res, status, {
    ok: false,
    error: {
      code: err.code || 'internal_error',
      message: status >= 500 && !err.code ? '服务端内部错误' : err.message
    }
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 32 * 1024) {
        reject(apiError(413, 'payload_too_large', '请求体过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8').trim();
      if (!text) return resolve({});
      try {
        const json = JSON.parse(text);
        resolve(json && typeof json === 'object' ? json : {});
      } catch {
        reject(apiError(400, 'invalid_json', '请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}

function clientIp(req) {
  return req.socket.remoteAddress || 'unknown';
}

function bearer(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : '';
}

/* ---------------- 限流 ---------------- */
const buckets = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  bucket.count += 1;
  if (bucket.count > limit) return false;
  return true;
}

/* ---------------- 验证码 ---------------- */
const codes = new Map(); // key -> {hash, exp, attempts}
const cooldowns = new Map(); // key -> 可再次发送的时间戳

function codeKey(scene, phone) {
  return `${scene}:${phone}`;
}

function hashCode(code, phone) {
  return crypto.createHash('sha256').update(`${phone}|${code}`).digest('hex');
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const local = digits.startsWith('86') && digits.length === 13 ? digits.slice(2) : digits;
  return local;
}

function assertPhone(phone) {
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    throw apiError(400, 'invalid_phone', '请输入正确的 11 位中国大陆手机号');
  }
}

function uniqueDisplayId(base) {
  let candidate = base;
  let i = 1;
  while (store.raw.users.some((u) => u.displayId === candidate)) {
    i += 1;
    candidate = `${base}_${i}`;
  }
  return candidate;
}

/* ---------------- 各登录方式 ---------------- */
async function handlePhoneCode(req, res) {
  const { phone: rawPhone, scene = 'login' } = await readJson(req);
  const phone = normalizePhone(rawPhone);
  assertPhone(phone);
  if (!['login', 'register'].includes(scene)) {
    throw apiError(400, 'invalid_scene', '未知的验证码场景');
  }
  if (!rateLimit('code:' + clientIp(req), 8, 10 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '请求过于频繁，请稍后再试');
  }

  const key = codeKey(scene, phone);
  const readyAt = cooldowns.get(key) || 0;
  if (readyAt > Date.now()) {
    const wait = Math.ceil((readyAt - Date.now()) / 1000);
    throw apiError(429, 'code_cooldown', `请 ${wait} 秒后再获取验证码`);
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  // 严格模式：只有真实短信发送成功，验证码才生效
  // 仅本机开发调试时（ALLOW_DEV_CODE=1）才跳过发送
  if (config.allowDevCode) {
    console.log(`[dev] ${phone} 验证码：${code}`);
  } else {
    // 先发送，成功后才写入，避免发送失败却占用冷却时间
    await sms.sendCode(phone, code);
  }

  cooldowns.set(key, Date.now() + config.sms.resendCooldownMs);
  codes.set(key, {
    hash: hashCode(code, phone),
    exp: Date.now() + config.sms.codeTtlMs,
    attempts: 0
  });

  const payload = { sent: true, ttl: Math.round(config.sms.codeTtlMs / 1000) };
  if (config.allowDevCode) {
    payload.devCode = code;
    console.log(`[dev] ${phone} 验证码：${code}`);
  }
  ok(res, payload);
}

function consumeCode(scene, phone, code) {
  const key = codeKey(scene, phone);
  const entry = codes.get(key);
  if (!entry) throw apiError(400, 'code_missing', '请先获取验证码');
  if (entry.exp <= Date.now()) {
    codes.delete(key);
    throw apiError(400, 'code_expired', '验证码已过期，请重新获取');
  }
  if (entry.attempts >= config.sms.maxAttempts) {
    codes.delete(key);
    throw apiError(429, 'code_attempts', '验证码错误次数过多，请重新获取');
  }
  entry.attempts += 1;
  const incoming = Buffer.from(hashCode(String(code), phone), 'hex');
  const expected = Buffer.from(entry.hash, 'hex');
  const match = incoming.length === expected.length && crypto.timingSafeEqual(incoming, expected);
  if (!match) {
    const left = config.sms.maxAttempts - entry.attempts;
    throw apiError(400, 'code_invalid', left > 0 ? `验证码不正确，还可尝试 ${left} 次` : '验证码错误次数过多，请重新获取');
  }
  codes.delete(key);
}

async function handlePhoneVerify(req, res) {
  const { phone: rawPhone, code, scene = 'login' } = await readJson(req);
  const phone = normalizePhone(rawPhone);
  assertPhone(phone);
  if (!/^\d{6}$/.test(String(code || ''))) {
    throw apiError(400, 'invalid_code', '请输入 6 位数字验证码');
  }
  if (!rateLimit('verify:' + clientIp(req), 20, 10 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '尝试过于频繁，请稍后再试');
  }
  consumeCode(scene, phone, code);

  let user = store.findByPhone(phone);
  const isNew = !user;
  if (!user) {
    user = store.createUser({
      displayId: uniqueDisplayId('WJ_' + phone.slice(-6)),
      method: 'phone',
      phone,
      skinId: 'steve'
    });
  } else if (scene === 'register') {
    throw apiError(409, 'phone_registered', '该手机号已注册，请直接登录');
  }
  if (user.disabled) throw apiError(403, 'account_disabled', '该账号已被管理员停用');
  store.touchUser(user);
  const session = store.createSession(user);
  ok(res, { token: session.token, expiresAt: session.exp, user: store.publicUser(user), isNew });
}

async function handleQqLogin(req, res) {
  const { email: rawEmail, password } = await readJson(req);
  const local = String(rawEmail || '').trim().replace(/@.*$/, '');
  const email = /^\d{5,12}$/.test(local) ? `${local}@qq.com` : String(rawEmail || '').trim().toLowerCase();
  if (!/^\d{5,12}@qq\.com$/.test(email)) {
    throw apiError(400, 'invalid_email', '请使用 QQ 号形式的邮箱，如 123456789@qq.com');
  }
  const secret = String(password || '');
  if (secret.length < 8) {
    throw apiError(400, 'invalid_password', '请输入 QQ 邮箱的授权码（16 位）或密码');
  }
  if (!rateLimit('qq:' + clientIp(req), 10, 10 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '尝试过于频繁，请稍后再试');
  }

  // 真正连 QQ 邮箱服务器校验凭据；校验失败即登录失败
  const result = await qqmail.verifyQqMail(email, secret);
  if (!result.ok) {
    throw apiError(401, 'qq_auth_failed', result.reason || 'QQ 邮箱验证失败');
  }

  let user = store.findByEmail(email);
  const isNew = !user;
  if (!user) {
    user = store.createUser({
      displayId: uniqueDisplayId('QQ_' + email.split('@')[0].slice(0, 12)),
      method: 'qq',
      email,
      skinId: 'steve'
    });
  }
  if (user.disabled) throw apiError(403, 'account_disabled', '该账号已被管理员停用');
  store.touchUser(user);
  const session = store.createSession(user);
  ok(res, { token: session.token, expiresAt: session.exp, user: store.publicUser(user), isNew });
}

async function handleLocalRegister(req, res) {
  const { username: rawName, password, skinId } = await readJson(req);
  const username = String(rawName || '').trim();
  const pass = String(password || '');
  if (!/^[\u4e00-\u9fa5A-Za-z0-9_]{3,16}$/.test(username)) {
    throw apiError(400, 'invalid_username', '名称需为 3–16 位中文、字母、数字或下划线');
  }
  if (pass.length < 8) {
    throw apiError(400, 'weak_password', '密码至少 8 位');
  }
  if (!rateLimit('register:' + clientIp(req), 10, 60 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '注册过于频繁，请稍后再试');
  }
  if (store.findByUsername(username)) {
    throw apiError(409, 'username_taken', '该名称已被使用，换一个试试');
  }
  const user = store.createUser({
    displayId: username,
    method: 'offline',
    username,
    passHash: store.hashPassword(pass),
    skinId: typeof skinId === 'string' && /^[a-z]{2,16}$/.test(skinId) ? skinId : 'steve'
  });
  const session = store.createSession(user);
  ok(res, { token: session.token, expiresAt: session.exp, user: store.publicUser(user), isNew: true }, 201);
}

async function handleLocalLogin(req, res) {
  const { username: rawName, password } = await readJson(req);
  const username = String(rawName || '').trim();
  const pass = String(password || '');
  if (!rateLimit('login:' + clientIp(req), 15, 10 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '尝试过于频繁，请稍后再试');
  }
  const user = store.findByUsername(username);
  // 统一错误信息，避免枚举账号
  if (!user || !user.passHash || !store.verifyPassword(pass, user.passHash)) {
    throw apiError(401, 'bad_credentials', '账号或密码不正确');
  }
  if (user.disabled) throw apiError(403, 'account_disabled', '该账号已被管理员停用');
  store.touchUser(user);
  const session = store.createSession(user);
  ok(res, { token: session.token, expiresAt: session.exp, user: store.publicUser(user), isNew: false });
}

async function handleMsStart(req, res) {
  if (!rateLimit('ms:' + clientIp(req), 20, 10 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '请求过于频繁，请稍后再试');
  }
  const device = await ms.startDeviceCode();
  ok(res, device);
}

async function handleMsPoll(req, res) {
  const { deviceCode } = await readJson(req);
  if (!deviceCode) throw apiError(400, 'missing_device_code', '缺少设备码');
  const poll = await ms.pollDeviceCode(String(deviceCode));
  if (poll.status === 'pending') return ok(res, { status: 'pending' });
  if (poll.status === 'slow_down') return ok(res, { status: 'slow_down' });
  if (poll.status === 'expired') return ok(res, { status: 'expired' });
  if (poll.status === 'declined') return ok(res, { status: 'declined' });
  if (poll.status !== 'ok') {
    throw apiError(401, 'ms_auth_failed', poll.message || '微软授权失败');
  }
  const profile = await ms.resolveXboxProfile(poll.tokens.access_token);
  let user = store.findByMsId(profile.profileId);
  const isNew = !user;
  if (!user) {
    user = store.createUser({
      displayId: uniqueDisplayId(profile.name || profile.gamertag || 'Player'),
      method: 'microsoft',
      msProfileId: profile.profileId,
      skinId: 'steve'
    });
  }
  if (user.disabled) throw apiError(403, 'account_disabled', '该账号已被管理员停用');
  store.touchUser(user);
  const session = store.createSession(user);
  ok(res, { status: 'ok', token: session.token, expiresAt: session.exp, user: store.publicUser(user), isNew });
}

async function handleMe(req, res) {
  const user = store.getSessionUser(bearer(req));
  if (!user) throw apiError(401, 'unauthorized', '登录已过期，请重新登录');
  if (user.disabled) throw apiError(403, 'account_disabled', '该账号已被管理员停用');
  ok(res, { user: store.publicUser(user) });
}

async function handleLogout(req, res) {
  const token = bearer(req);
  if (token) store.deleteSession(token);
  ok(res, { loggedOut: true });
}

/* ---------------- 好友 / 聊天 ---------------- */
function requireUser(req) {
  const user = store.getSessionUser(bearer(req));
  if (!user) throw apiError(401, 'unauthorized', '登录已过期，请重新登录');
  if (user.disabled) throw apiError(403, 'account_disabled', '该账号已被管理员停用');
  return user;
}

function handleFriendsList(req, res) {
  const user = requireUser(req);
  ok(res, { friends: store.friendsOf(user).map(store.publicUser) });
}

async function handleFriendAdd(req, res) {
  if (!rateLimit('friend-add:' + clientIp(req), 20, 10 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '操作过于频繁，请稍后再试');
  }
  const user = requireUser(req);
  const { query } = await readJson(req);
  const target = store.findByAccountQuery(query);
  if (!target) throw apiError(404, 'user_not_found', '没有找到这个账号：对方可能不是本应用用户');
  if (target.id === user.id) throw apiError(400, 'cannot_add_self', '不能添加自己为好友');
  if (store.areFriends(user, target)) throw apiError(409, 'already_friends', '你们已经是好友了');
  store.addFriend(user, target);
  ok(res, { friend: store.publicUser(target), friends: store.friendsOf(user).map(store.publicUser) });
}

async function handleFriendRemove(req, res) {
  const user = requireUser(req);
  const { uid } = await readJson(req);
  const target = store.findByUid(uid);
  if (!target) throw apiError(404, 'user_not_found', '好友不存在');
  store.removeFriend(user, target);
  ok(res, { friends: store.friendsOf(user).map(store.publicUser) });
}

function handleChatList(req, res) {
  const user = requireUser(req);
  const url = new URL(req.url, 'http://localhost');
  const uid = url.searchParams.get('friend') || '';
  const target = store.findByUid(uid);
  if (!target) throw apiError(404, 'user_not_found', '好友不存在');
  if (!store.areFriends(user, target)) throw apiError(403, 'not_friends', '你们还不是好友');
  ok(res, { friend: store.publicUser(target), messages: store.messagesBetween(user, target) });
}

async function handleChatSend(req, res) {
  const user = requireUser(req);
  const { friend: uid, text } = await readJson(req);
  const target = store.findByUid(uid);
  if (!target) throw apiError(404, 'user_not_found', '好友不存在');
  if (!store.areFriends(user, target)) throw apiError(403, 'not_friends', '你们还不是好友');
  const body = String(text || '').trim();
  if (!body) throw apiError(400, 'empty_message', '消息不能为空');
  if (body.length > 500) throw apiError(400, 'message_too_long', '消息最多 500 个字符');
  const message = store.appendMessage(user, target, body);
  ok(res, { message });
}

/* ---------------- 管理后台 ---------------- */
function handleAdminStatus(req, res) {
  ok(res, admin.status(req));
}

async function handleAdminSetup(req, res) {
  if (!admin.isLoopback(req)) {
    throw apiError(403, 'admin_setup_forbidden', '首次初始化只允许在本机访问；远程部署请先在 server/.env 配置 ADMIN_USERNAME / ADMIN_PASSWORD');
  }
  if (!rateLimit('admin-setup:' + clientIp(req), 5, 60 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '初始化尝试过于频繁，请稍后再试');
  }
  const { username, password } = await readJson(req);
  ok(res, admin.setup(username, password), 201);
}

async function handleAdminLogin(req, res) {
  if (!rateLimit('admin-login:' + clientIp(req), 12, 10 * 60 * 1000)) {
    throw apiError(429, 'too_many_requests', '登录尝试过于频繁，请稍后再试');
  }
  const { username, password } = await readJson(req);
  ok(res, admin.login(username, password));
}

function handleAdminLogout(req, res) {
  admin.logout(req);
  ok(res, { loggedOut: true });
}

function handleAdminMe(req, res) {
  admin.requireAdmin(req);
  ok(res, admin.status(req));
}

function handleAdminOverview(req, res) {
  admin.requireAdmin(req);
  ok(res, admin.overview());
}

function handleAdminUsers(req, res) {
  admin.requireAdmin(req);
  const url = new URL(req.url, 'http://localhost');
  ok(res, admin.listUsers(url.searchParams.get('q') || '', url.searchParams.get('page') || 1, url.searchParams.get('limit') || 24));
}

function handleAdminMessages(req, res) {
  admin.requireAdmin(req);
  ok(res, { messages: admin.getMessages() });
}

function handleAdminUserAction(req, res) {
  admin.requireAdmin(req);
  return readJson(req).then((body) => {
    ok(res, admin.userAction(body.userId, body.action, body.password));
  });
}

function handleAdminGetUpdate(req, res) {
  admin.requireAdmin(req);
  ok(res, { update: admin.readUpdate() });
}

async function handleAdminSaveUpdate(req, res) {
  admin.requireAdmin(req);
  const body = await readJson(req);
  ok(res, { update: admin.writeUpdate(body.update || body) });
}

/* ---------------- 路由 ---------------- */
const API_ROUTES = {
  'POST /api/auth/phone/code': handlePhoneCode,
  'POST /api/auth/phone/verify': handlePhoneVerify,
  'POST /api/auth/qq/login': handleQqLogin,
  'POST /api/auth/local/register': handleLocalRegister,
  'POST /api/auth/local/login': handleLocalLogin,
  'POST /api/auth/ms/start': handleMsStart,
  'POST /api/auth/ms/poll': handleMsPoll,
  'POST /api/auth/logout': handleLogout,
  'GET /api/auth/me': handleMe,
  'GET /api/social/friends': handleFriendsList,
  'POST /api/social/friends/add': handleFriendAdd,
  'POST /api/social/friends/remove': handleFriendRemove,
  'GET /api/social/chat': handleChatList,
  'POST /api/social/chat/send': handleChatSend,
  'GET /api/admin/status': handleAdminStatus,
  'POST /api/admin/setup': handleAdminSetup,
  'POST /api/admin/login': handleAdminLogin,
  'POST /api/admin/logout': handleAdminLogout,
  'GET /api/admin/me': handleAdminMe,
  'GET /api/admin/overview': handleAdminOverview,
  'GET /api/admin/users': handleAdminUsers,
  'GET /api/admin/messages': handleAdminMessages,
  'POST /api/admin/user-action': handleAdminUserAction,
  'GET /api/admin/update': handleAdminGetUpdate,
  'POST /api/admin/update': handleAdminSaveUpdate,
  'GET /api/health': (req, res) => ok(res, {
    version: '2.0.3',
    sms: config.isConfigured.sms,
    smsProvider: config.sms.provider,
    microsoft: config.isConfigured.microsoft,
    qq: 'imap',
    devCode: config.allowDevCode
  })
};

/* ---------------- 静态文件 ---------------- */
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  if (rel === '/admin') {
    res.writeHead(302, { location: '/admin/' });
    res.end();
    return true;
  }
  if (rel === '/admin/') rel = '/admin/index.html';
  // 禁止访问服务端目录、测试目录与隐藏文件
  if (rel.startsWith('/server/') || rel.startsWith('/_test/') || rel.startsWith('/.') || rel.includes('/.')) return false;

  const filePath = path.resolve(config.root, '.' + rel);
  if (!filePath.startsWith(config.root + path.sep)) return false;

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const etag = `W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { etag });
    res.end();
    return true;
  }
  res.writeHead(200, {
    'content-type': type,
    'content-length': stat.size,
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
    etag
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

/* ---------------- 跨域 ---------------- */
function applyCors(req, res) {
  const allowed = config.allowedOrigins;
  const origin = req.headers.origin || '';
  if (allowed === '*') {
    res.setHeader('access-control-allow-origin', '*');
  } else if (origin && allowed.split(',').map((s) => s.trim()).includes(origin)) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('vary', 'Origin');
  }
  res.setHeader('access-control-allow-headers', 'authorization, content-type');
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
  res.setHeader('access-control-max-age', '600');
}

/* ---------------- 主处理 ---------------- */
const server = http.createServer(async (req, res) => {
  applyCors(req, res);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'no-referrer');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  if (pathname.startsWith('/api/')) {
    const key = `${req.method} ${pathname}`;
    const handler = API_ROUTES[key];
    if (!handler) return fail(res, apiError(404, 'not_found', '接口不存在'));
    try {
      await handler(req, res);
    } catch (err) {
      if (err && err.code === 'ECONNREFUSED') {
        return fail(res, apiError(502, 'provider_unreachable', '无法连接第三方服务，请检查服务器网络'));
      }
      if (!res.headersSent) fail(res, err);
      else res.end();
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }
  if (serveStatic(req, res, pathname)) return;

  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><meta charset="utf-8"><title>404</title><p style="font-family:system-ui;padding:40px">页面不存在。</p>');
});

/* ---------------- 启动 ---------------- */
function start() {
  store.load();
  admin.load();
  store.purgeExpiredSessions();
  setInterval(() => store.purgeExpiredSessions(), 30 * 60 * 1000).unref();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of codes) if (entry.exp < now - 60000) codes.delete(key);
    for (const [key, readyAt] of cooldowns) if (readyAt < now - 60000) cooldowns.delete(key);
  }, 5 * 60 * 1000).unref();

  server.listen(config.port, config.host, () => {
    console.log(`世界织卷APP 服务已启动：http://${config.host}:${config.port}`);
    console.log(`  短信通道：${config.isConfigured.sms ? config.sms.provider : '未配置（手机登录会失败）'}`);
    console.log(`  微软登录：${config.isConfigured.microsoft ? '已配置' : '未配置（微软/Xbox 登录会失败）'}`);
    console.log(`  QQ 邮箱：IMAP 校验（${config.qq.imapHost}:${config.qq.imapPort}）`);
    console.log(`  管理后台：http://${config.host}:${config.port}/admin/（${admin.isInitialized() ? '已初始化' : '首次本机访问可创建管理员'}）`);
    if (config.allowDevCode) console.warn('  [开发模式] 验证码会打印到控制台，请勿在生产环境开启。');
  });
}

process.on('SIGINT', () => { store.flush(); server.close(() => process.exit(0)); });
process.on('SIGTERM', () => { store.flush(); server.close(() => process.exit(0)); });

if (require.main === module) start();

module.exports = { server, start };
