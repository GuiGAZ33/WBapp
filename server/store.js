/* =========================================================
   账号存储（JSON 文件持久化，零依赖）
   - 密码使用 scrypt 加盐哈希，绝不存明文
   - 会话令牌只保存 SHA-256 摘要
   ========================================================= */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const config = require('./config');

const DB_FILE = path.join(config.dataDir, 'db.json');
const EMPTY = { version: 2, users: [], sessions: {}, messages: [] };
let db = structuredClone(EMPTY);
let saveTimer = null;

function ensureDir() {
  fs.mkdirSync(config.dataDir, { recursive: true });
}

function load() {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    db = structuredClone(EMPTY);
    return;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    db = {
      version: 2,
      users: Array.isArray(raw.users) ? raw.users : [],
      sessions: raw.sessions && typeof raw.sessions === 'object' ? raw.sessions : {},
      messages: Array.isArray(raw.messages) ? raw.messages : []
    };
  } catch {
    // 损坏时备份并重建，避免服务起不来
    try { fs.renameSync(DB_FILE, DB_FILE + '.broken-' + Date.now()); } catch { /* ignore */ }
    db = structuredClone(EMPTY);
  }
}

function saveSoon() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    save();
  }, 120);
}

function save() {
  ensureDir();
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

function flush() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  save();
}

/* ---------------- 密码哈希 ---------------- */
const SCRYPT_KEYLEN = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return ['scrypt', salt.toString('base64'), derived.toString('base64')].join('$');
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  let actual;
  try {
    actual = crypto.scryptSync(password, salt, expected.length);
  } catch {
    return false;
  }
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/* ---------------- 用户 ---------------- */
const UID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function makeUid() {
  const pick = (n) => Array.from({ length: n }, () => UID_CHARS[crypto.randomInt(UID_CHARS.length)]).join('');
  return `WJ-${pick(4)}-${pick(4)}`;
}

function findByPhone(phone) {
  return db.users.find((u) => u.phone === phone) || null;
}
function findByEmail(email) {
  const normalized = String(email).toLowerCase();
  return db.users.find((u) => (u.email || '').toLowerCase() === normalized) || null;
}
function findByUsername(username) {
  const normalized = String(username).toLowerCase();
  return db.users.find((u) => (u.username || '').toLowerCase() === normalized) || null;
}
function findByMsId(profileId) {
  return db.users.find((u) => u.msProfileId === profileId) || null;
}
function findById(id) {
  return db.users.find((u) => u.id === id) || null;
}
function findByUid(uid) {
  return db.users.find((u) => u.uid === uid) || null;
}
function findByAccountQuery(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  return db.users.find((u) => (u.uid || '').toLowerCase() === q
    || (u.displayId || '').toLowerCase() === q
    || (u.username || '').toLowerCase() === q) || null;
}

function createUser(data) {
  const now = Date.now();
  const user = {
    id: 'u_' + crypto.randomBytes(9).toString('base64url'),
    uid: makeUid(),
    displayId: data.displayId,
    method: data.method,
    phone: data.phone || null,
    email: data.email || null,
    username: data.username || null,
    passHash: data.passHash || null,
    msProfileId: data.msProfileId || null,
    skinId: data.skinId || 'steve',
    createdAt: now,
    lastLoginAt: now
  };
  db.users.push(user);
  saveSoon();
  return user;
}

function touchUser(user) {
  user.lastLoginAt = Date.now();
  saveSoon();
  return user;
}

/* ---------------- 会话 ---------------- */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString('base64url');
  const exp = Date.now() + config.sessionTtlMs;
  db.sessions[hashToken(token)] = { userId: user.id, exp, createdAt: Date.now() };
  saveSoon();
  return { token, exp };
}

function getSessionUser(token) {
  if (!token) return null;
  const key = hashToken(token);
  const session = db.sessions[key];
  if (!session) return null;
  if (session.exp <= Date.now()) {
    delete db.sessions[key];
    saveSoon();
    return null;
  }
  return findById(session.userId);
}

function deleteSession(token) {
  if (!token) return;
  delete db.sessions[hashToken(token)];
  saveSoon();
}

function deleteSessionsForUser(userId) {
  let removed = 0;
  for (const [key, session] of Object.entries(db.sessions)) {
    if (session && session.userId === userId) {
      delete db.sessions[key];
      removed += 1;
    }
  }
  if (removed) saveSoon();
  return removed;
}

function setDisabled(user, disabled) {
  if (!user) return false;
  user.disabled = !!disabled;
  if (user.disabled) deleteSessionsForUser(user.id);
  saveSoon();
  return true;
}

function deleteUser(user) {
  if (!user) return false;
  db.users = db.users.filter((u) => u.id !== user.id);
  for (const other of db.users) {
    if (!Array.isArray(other.friends)) continue;
    other.friends = other.friends.filter((id) => id !== user.id);
  }
  db.messages = db.messages.filter((m) => m.from !== user.uid && m.to !== user.uid);
  deleteSessionsForUser(user.id);
  saveSoon();
  return true;
}

function purgeExpiredSessions() {
  const now = Date.now();
  let removed = 0;
  for (const [key, session] of Object.entries(db.sessions)) {
    if (!session || session.exp <= now) { delete db.sessions[key]; removed += 1; }
  }
  if (removed) saveSoon();
  return removed;
}

/* ---------------- 好友 / 聊天 ---------------- */
function friendsOf(user) {
  if (!user) return [];
  if (!Array.isArray(user.friends)) user.friends = [];
  return user.friends.map(findById).filter(Boolean);
}

function addFriend(user, target) {
  if (!Array.isArray(user.friends)) user.friends = [];
  if (!Array.isArray(target.friends)) target.friends = [];
  if (user.friends.includes(target.id)) return false;
  user.friends.push(target.id);
  target.friends.push(user.id);
  saveSoon();
  return true;
}

function removeFriend(user, target) {
  if (!Array.isArray(user.friends)) user.friends = [];
  if (!Array.isArray(target.friends)) target.friends = [];
  user.friends = user.friends.filter((id) => id !== target.id);
  target.friends = target.friends.filter((id) => id !== user.id);
  saveSoon();
}

function areFriends(user, target) {
  return Boolean(user && target && Array.isArray(user.friends) && user.friends.includes(target.id));
}

function appendMessage(fromUser, toUser, text) {
  const message = {
    id: 'm_' + crypto.randomBytes(8).toString('base64url'),
    from: fromUser.uid,
    fromName: fromUser.displayId,
    to: toUser.uid,
    text: String(text).slice(0, 500),
    at: Date.now()
  };
  db.messages.push(message);
  if (db.messages.length > 2000) db.messages = db.messages.slice(-2000);
  saveSoon();
  return message;
}

function messagesBetween(user, friend) {
  const mine = user.uid;
  const other = friend.uid;
  return db.messages.filter((m) => (m.from === mine && m.to === other) || (m.from === other && m.to === mine)).slice(-100);
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.displayId,
    uid: user.uid,
    method: user.method,
    skinId: user.skinId,
    premium: user.method === 'microsoft' || user.method === 'xbox',
    createdAt: user.createdAt,
    phone: user.phone ? user.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : null,
    email: user.email || null,
    username: user.username || null
  };
}

module.exports = {
  load, save, flush,
  hashPassword, verifyPassword,
  findByPhone, findByEmail, findByUsername, findByMsId, findById, findByUid, findByAccountQuery,
  createUser, touchUser,
  createSession, getSessionUser, deleteSession, deleteSessionsForUser, setDisabled, deleteUser, purgeExpiredSessions,
  friendsOf, addFriend, removeFriend, areFriends, appendMessage, messagesBetween,
  publicUser,
  get raw() { return db; }
};
