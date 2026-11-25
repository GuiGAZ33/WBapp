/* =========================================================
   自检脚本：对运行中的服务跑一遍真实 HTTP 用例
   用法：node server/selftest.js [baseUrl]
   默认 http://127.0.0.1:8787
   ========================================================= */
'use strict';

const base = process.argv[2] || 'http://127.0.0.1:8787';
let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.log(`  ✗ ${name}${detail ? ' → ' + detail : ''}`);
  }
}

async function call(method, path, body, token) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = 'Bearer ' + token;
  const res = await fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let json = null;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { /* 非 JSON */ }
  return { status: res.status, json, text };
}

(async () => {
  console.log('== 健康检查 ==');
  const health = await call('GET', '/api/health');
  check('GET /api/health 返回 200', health.status === 200, health.status);
  check('健康信息包含 sms/microsoft 能力位', Boolean(health.json && health.json.data && 'sms' in health.json.data));
  const devCode = health.json && health.json.data && health.json.data.devCode;

  console.log('== 静态资源 ==');
  const index = await call('GET', '/');
  check('首页可访问', index.status === 200 && index.text.includes('世界织卷APP'));
  const leak = await call('GET', '/server/config.js');
  check('server/ 目录不可访问', leak.status === 404, leak.status);
  const traversal = await call('GET', '/../server/config.js');
  check('路径穿越被拦截', traversal.status === 404, traversal.status);
  const adminPage = await call('GET', '/admin/');
  check('管理后台页面可访问', adminPage.status === 200 && adminPage.text.includes('管理后台'), adminPage.status);
  const adminStatus = await call('GET', '/api/admin/status');
  check('管理后台状态接口可访问', adminStatus.status === 200 && adminStatus.json && typeof adminStatus.json.data.initialized === 'boolean');
  const adminNoAuth = await call('GET', '/api/admin/overview');
  check('未登录访问后台数据被拒绝(401)', adminNoAuth.status === 401, adminNoAuth.status);
  const adminLoginBad = await call('POST', '/api/admin/login', { username: 'admin', password: 'not-the-password' });
  const adminReady = Boolean(adminStatus.json && adminStatus.json.data && adminStatus.json.data.initialized);
  check(adminReady ? '错误管理员密码登录失败(401)' : '未初始化时管理员登录被拒绝(503)', adminLoginBad.status === (adminReady ? 401 : 503), adminLoginBad.status);

  console.log('== 手机号验证码（严格模式） ==');
  const phoneCode = await call('POST', '/api/auth/phone/code', { phone: '13800138000', scene: 'login' });
  if (devCode) {
    check('开发模式可获取验证码', phoneCode.status === 200 && phoneCode.json.data.devCode, JSON.stringify(phoneCode.json));
    const code = phoneCode.json.data.devCode;
    const wrong = await call('POST', '/api/auth/phone/verify', { phone: '13800138000', code: '000000', scene: 'login' });
    check('错误验证码被拒绝(400)', wrong.status === 400, wrong.status);
    const verified = await call('POST', '/api/auth/phone/verify', { phone: '13800138000', code, scene: 'login' });
    check('正确验证码登录成功(200)', verified.status === 200 && verified.json.data.token, JSON.stringify(verified.json));
    check('首次手机号登录自动建号', verified.json && verified.json.data.isNew === true);
    const reuse = await call('POST', '/api/auth/phone/verify', { phone: '13800138000', code, scene: 'login' });
    check('验证码一次性使用(400)', reuse.status === 400, reuse.status);
    const again = await call('POST', '/api/auth/phone/code', { phone: '13800138000', scene: 'login' });
    check('60 秒内不可重复获取(429)', again.status === 429, again.status);
  } else {
    check('未配置短信时发送失败(503)', phoneCode.status === 503, JSON.stringify(phoneCode.json));
    check('失败原因是短信未配置', Boolean(phoneCode.json && phoneCode.json.error && phoneCode.json.error.code === 'sms_not_configured'));
  }
  const badPhone = await call('POST', '/api/auth/phone/code', { phone: '12345', scene: 'login' });
  check('非法手机号被拒绝(400)', badPhone.status === 400, badPhone.status);
  const badCode = await call('POST', '/api/auth/phone/verify', { phone: '13800138000', code: '000000', scene: 'login' });
  check('无验证码记录时校验失败(400)', badCode.status === 400, badCode.status);

  console.log('== 本地账号注册 / 登录 ==');
  const username = '自检玩家' + Math.floor(Math.random() * 1000);
  const reg = await call('POST', '/api/auth/local/register', { username, password: 'Secret12345', skinId: 'alex' });
  check('注册成功(201)', reg.status === 201, JSON.stringify(reg.json));
  const token = reg.json && reg.json.data && reg.json.data.token;
  check('注册返回会话令牌', Boolean(token));
  check('注册返回 UID', Boolean(reg.json.data.user.uid && /^WJ-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(reg.json.data.user.uid)), reg.json.data.user.uid);

  const me = await call('GET', '/api/auth/me', undefined, token);
  check('凭令牌读取当前账号(200)', me.status === 200 && me.json.data.user.username === username, me.status);

  const dup = await call('POST', '/api/auth/local/register', { username, password: 'Secret12345' });
  check('重复用户名被拒绝(409)', dup.status === 409, dup.status);

  const weak = await call('POST', '/api/auth/local/register', { username: 'weak' + Date.now(), password: '123' });
  check('弱密码被拒绝(400)', weak.status === 400, weak.status);

  const wrongLogin = await call('POST', '/api/auth/local/login', { username, password: 'wrong-password' });
  check('错误密码登录失败(401)', wrongLogin.status === 401, wrongLogin.status);

  const login = await call('POST', '/api/auth/local/login', { username, password: 'Secret12345' });
  check('正确密码登录成功(200)', login.status === 200 && login.json.data.token, JSON.stringify(login.json));

  const logout = await call('POST', '/api/auth/logout', {}, token);
  check('登出成功', logout.status === 200);
  const meAfter = await call('GET', '/api/auth/me', undefined, token);
  check('登出后旧令牌失效(401)', meAfter.status === 401, meAfter.status);

  console.log('== QQ 邮箱（必须真实校验） ==');
  const qqBad = await call('POST', '/api/auth/qq/login', { email: '123456789@qq.com', password: 'abcdefghijklmnop' });
  check('伪造 QQ 凭据登录失败', qqBad.status === 401, qqBad.status);
  check('失败带明确原因', Boolean(qqBad.json && qqBad.json.error && qqBad.json.error.message), JSON.stringify(qqBad.json));
  const qqFormat = await call('POST', '/api/auth/qq/login', { email: 'not-a-qq@example.com', password: 'abcdefghijklmnop' });
  check('非 QQ 邮箱被拒绝(400)', qqFormat.status === 400, qqFormat.status);

  console.log('== 微软 / Xbox（未配置时必须失败） ==');
  const msStart = await call('POST', '/api/auth/ms/start', {});
  const msConfigured = health.json && health.json.data && health.json.data.microsoft;
  if (msConfigured) {
    check('已配置时可获取设备码', msStart.status === 200 && msStart.json.data.userCode, JSON.stringify(msStart.json));
  } else {
    check('未配置 MS_CLIENT_ID 时失败(503)', msStart.status === 503, msStart.status);
  }

  console.log('== 未知接口 ==');
  const notFound = await call('GET', '/api/nope');
  check('未知接口返回 404', notFound.status === 404, notFound.status);

  console.log(`\n结果：通过 ${passed} 项，失败 ${failed} 项`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('自检异常：', err);
  process.exit(1);
});
