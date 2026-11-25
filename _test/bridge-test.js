/* =========================================================
   桥接层自检：在 Node 里真实调用 bridge.js → 本机账号服务
   验证：API 封装、令牌持久化、错误映射、外链、QQ 群 / QQ 好友名片
   用法：node _test/bridge-test.js [baseUrl]
   前提：账号服务已运行
   ========================================================= */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8787';
let pass = 0;
let fail = 0;

function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail ? ' → ' + detail : '')); }
}

const storage = new Map();
const clicked = [];

const sandbox = {
  console,
  setTimeout, clearTimeout,
  URL, URLSearchParams,
  AbortSignal,
  TextDecoder, TextEncoder,
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise,
  fetch,
  location: { protocol: 'http:', href: BASE + '/', origin: BASE, search: '' },
  navigator: {
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7)'
  },
  document: {
    hidden: false,
    body: {
      appendChild(el) { clicked.push(el.href); },
      removeChild() {}
    },
    createElement() {
      return {
        href: '',
        target: '',
        rel: '',
        style: {},
        click() { clicked.push(this.href); },
        remove() {}
      };
    },
    addEventListener() {},
    removeEventListener() {}
  },
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k)
  }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.WW_API_BASE = BASE;
const context = vm.createContext(sandbox);

const src = fs.readFileSync(path.join(ROOT, 'bridge.js'), 'utf8');
vm.runInContext(src, context, { filename: 'bridge.js' });
const WW = sandbox.WW;

(async () => {
  console.log('== 基础 ==');
  check('bridge.js 暴露 WW 命名空间', Boolean(WW && typeof WW.api === 'function'));
  check('尊重 WW_API_BASE 覆盖', WW.apiBase() === BASE, WW.apiBase());
  check('QQ 群号常量正确', WW.QQ_GROUP === '1137437440');

  console.log('== 健康检查 ==');
  const health = await WW.health();
  check('health() 返回能力位', Boolean(health && typeof health.sms === 'boolean' && 'microsoft' in health), JSON.stringify(health));

  console.log('== 注册 / 会话 ==');
  const username = '桥接测试' + Math.floor(Math.random() * 10000);
  const reg = await WW.api('/api/auth/local/register', {
    body: { username, password: 'BridgePass123', skinId: 'creeper' }
  });
  check('注册成功并返回令牌', Boolean(reg && reg.token && reg.user), JSON.stringify(reg && reg.user));
  WW.setToken(reg.token);
  check('令牌可写入 localStorage', storage.get('szyj.token.v1') === reg.token);
  check('令牌可读回', WW.getToken() === reg.token);
  check('注册返回状态 isNew', reg.isNew === true, String(reg.isNew));

  const me = await WW.me();
  check('me() 用令牌取回账号', Boolean(me && me.username === username), JSON.stringify(me));
  check('me() 返回 UID 与皮肤', Boolean(me.uid && me.skinId === 'creeper'));

  console.log('== 好友 / 聊天 ==');
  const friendName = '桥接好友' + Math.floor(Math.random() * 10000);
  const regFriend = await WW.api('/api/auth/local/register', {
    body: { username: friendName, password: 'BridgePass123' },
    auth: false
  });
  const added = await WW.api('/api/social/friends/add', { body: { query: regFriend.user.uid } });
  check('可以添加本应用用户为好友', added.friend && added.friend.uid === regFriend.user.uid);
  check('好友列表返回该好友', Array.isArray(added.friends) && added.friends.some((f) => f.uid === regFriend.user.uid));
  const sent = await WW.api('/api/social/chat/send', { body: { friend: regFriend.user.uid, text: '桥接测试消息' } });
  check('可以向好友发送消息', sent.message && sent.message.text === '桥接测试消息');
  const chat = await WW.api('/api/social/chat?friend=' + encodeURIComponent(regFriend.user.uid), { method: 'GET' });
  check('好友聊天记录可读回', Array.isArray(chat.messages) && chat.messages.some((m) => m.text === '桥接测试消息'));
  let notAppUser = null;
  try {
    await WW.api('/api/social/friends/add', { body: { query: '不存在的应用用户' + Date.now() } });
  } catch (err) { notAppUser = err; }
  check('非本应用用户无法添加', notAppUser && notAppUser.code === 'user_not_found', notAppUser && notAppUser.code);

  console.log('== 错误映射 ==');
  let badLogin = null;
  try {
    await WW.api('/api/auth/local/login', { body: { username, password: 'wrong-password' } });
  } catch (err) { badLogin = err; }
  check('错误密码抛出 WWError', badLogin instanceof WW.WWError, badLogin && badLogin.name);
  check('保留服务端状态码 401', badLogin && badLogin.status === 401, badLogin && badLogin.status);
  check('保留服务端错误码', badLogin && badLogin.code === 'bad_credentials', badLogin && badLogin.code);
  check('错误信息为中文可读文案', Boolean(badLogin && /密码|账号/.test(badLogin.message)), badLogin && badLogin.message);

  console.log('== 网络不可用 ==');
  sandbox.WW_API_BASE = 'http://127.0.0.1:9';
  let netErr = null;
  try {
    await WW.api('/api/health', { method: 'GET', auth: false, timeout: 3000 });
  } catch (err) { netErr = err; }
  check('无法连接时抛出 network 错误', Boolean(netErr && netErr.code === 'network'), netErr && netErr.code);
  check('网络错误提示可操作', Boolean(netErr && netErr.message.includes('server/server.js')), netErr && netErr.message);
  sandbox.WW_API_BASE = BASE;

  console.log('== 外链 ==');
  clicked.length = 0;
  const ok = WW.openExternal('https://www.minecraft.net/zh-hans');
  check('openExternal 返回 true', ok === true);
  check('确实触发外部链接点击', clicked.includes('https://www.minecraft.net/zh-hans'), JSON.stringify(clicked));
  check('识别 http(s)', WW.isHttpLink('https://a.com') && !WW.isHttpLink('mqqapi://x'));

  console.log('== QQ 群 / 好友深链 ==');
  const scheme = WW.qqGroupScheme();
  check('深链包含群号', scheme.includes('uin=1137437440'), scheme);
  check('深链协议正确', scheme.startsWith('mqqapi://card/show_pslcard'), scheme);
  const friend = WW.qqFriendScheme('3335750182');
  check('好友深链包含 QQ 号', friend.includes('uin=3335750182'), friend);
  check('好友名片类型正确', friend.includes('card_type=friend'), friend);
  const coopGroup = WW.qqGroupScheme('1095886790');
  check('合作群深链可指定群号', coopGroup.includes('uin=1095886790'), coopGroup);
  check('不再暴露存储权限 API', !('requestStoragePermission' in WW) && !('storageStatus' in WW));

  console.log('== 登出 ==');
  await WW.logout();
  check('登出清除本地令牌', !storage.has('szyj.token.v1'));
  const afterLogout = await WW.me();
  check('无令牌时 me() 返回 null', afterLogout === null);

  console.log(`\n结果：通过 ${pass} 项，失败 ${fail} 项`);
  process.exit(fail ? 1 : 0);
})().catch((err) => {
  console.error('自检异常：', err);
  process.exit(1);
});
