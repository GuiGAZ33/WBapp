/* =========================================================
   逻辑自检：在 Node 里用最小 DOM 桩执行 app.js 的渲染与校验函数
   - 目的：在没有浏览器的情况下验证模板不抛错、不产生 "undefined"
   - 不替代真机/浏览器测试，但能挡住引用错误与明显的模板回归
   用法：node _test/logic-test.js
   ========================================================= */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0;
let fail = 0;

function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail ? ' → ' + detail : '')); }
}

/* ---------------- 最小 DOM 桩 ---------------- */
function makeEl(tag = 'div') {
  const classes = new Set();
  const attrs = new Map();
  const el = {
    tagName: tag.toUpperCase(),
    style: { setProperty() {}, removeProperty() {} },
    dataset: {},
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    offsetWidth: 10,
    offsetTop: 0,
    scrollTop: 0,
    scrollHeight: 0,
    children: [],
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      toggle: (c, on) => (on === undefined ? (classes.has(c) ? (classes.delete(c), false) : (classes.add(c), true)) : (on ? classes.add(c) : classes.delete(c))),
      contains: (c) => classes.has(c)
    },
    setAttribute: (k, v) => attrs.set(k, String(v)),
    getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
    removeAttribute: (k) => attrs.delete(k),
    appendChild: (c) => { el.children.push(c); return c; },
    removeChild: (c) => { el.children = el.children.filter((x) => x !== c); return c; },
    remove: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    focus: () => {},
    blur: () => {},
    click: () => {},
    select: () => {},
    closest: () => null,
    matches: () => false,
    querySelector: () => null,
    querySelectorAll: () => [],
    scrollIntoView: () => {},
    insertAdjacentHTML: () => {},
    getContext: () => ({ fillRect(){}, clearRect(){}, set imageSmoothingEnabled(v){}, fillStyle: '' })
  };
  return el;
}

function makeDocument() {
  const cache = new Map();
  const doc = {
    readyState: 'complete',
    title: '',
    hidden: false,
    documentElement: makeEl('html'),
    body: makeEl('body'),
    head: makeEl('head'),
    activeElement: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: (t) => makeEl(t),
    createTextNode: () => makeEl('#text'),
    getElementById: (id) => ensure('#' + id),
    querySelector: (sel) => ensure(sel),
    querySelectorAll: () => []
  };
  function ensure(sel) {
    if (!cache.has(sel)) cache.set(sel, makeEl('div'));
    return cache.get(sel);
  }
  return doc;
}

const storage = new Map();
const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  performance: { now: () => Date.now() },
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  URLSearchParams,
  URL,
  TextDecoder, TextEncoder,
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Promise,
  navigator: {
    userAgent: 'node-test',
    clipboard: null,
    storage: { persist: async () => true, persisted: async () => true, estimate: async () => ({ usage: 0, quota: 0 }) }
  },
  location: { protocol: 'http:', search: '', href: 'http://127.0.0.1:8787/', origin: 'http://127.0.0.1:8787' },
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k)
  },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  fetch: () => Promise.reject(new Error('no network in logic test'))
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.document = makeDocument();
sandbox.window.WW = {
  api: async () => { throw new Error('not stubbed'); },
  health: async () => null,
  openExternal: () => true,
  QQ_GROUP: '1137437440',
  setToken() {}
};
sandbox.window.WWShell = undefined;

const context = vm.createContext(sandbox);

/* ---------------- 载入数据层 ---------------- */
const dataSrc = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
vm.runInContext(dataSrc, context, { filename: 'data.js' });
const boxSrc = fs.readFileSync(path.join(ROOT, 'box-data.js'), 'utf8');
vm.runInContext(boxSrc, context, { filename: 'box-data.js' });
const gameSrc = fs.readFileSync(path.join(ROOT, 'game-data.js'), 'utf8');
vm.runInContext(gameSrc, context, { filename: 'game-data.js' });
const blocksSrc = fs.readFileSync(path.join(ROOT, 'blocks-data.js'), 'utf8');
vm.runInContext(blocksSrc, context, { filename: 'blocks-data.js' });
const nbtSrc = fs.readFileSync(path.join(ROOT, 'nbt.js'), 'utf8');
vm.runInContext(nbtSrc, context, { filename: 'nbt.js' });

/* ---------------- 把 app.js 的 IIFE 打开并导出内部函数 ---------------- */
const raw = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const openIdx = raw.indexOf('(() => {');
const closeIdx = raw.lastIndexOf('})();');
if (openIdx < 0 || closeIdx < 0) {
  console.error('无法定位 app.js 的 IIFE 结构');
  process.exit(1);
}
const exported = [
  'renderLoginScreen', 'renderLoginFormContent', 'phoneFormHTML', 'qqFormHTML',
  'offlineFormHTML', 'deviceCodeFormHTML', 'accountListHTML', 'validateLoginForm',
  'renderHome', 'renderLaunchers', 'renderResources', 'renderMine', 'renderSearchPanel',
  'apiErrorMessage', 'sessionFromApi', 'accountServiceNote', 'setTab',
  'renderHomeAccount', 'renderHomePromo', 'renderHomeHot', 'renderHomeResources',
  'openLauncherDetail', 'handleLoginSubmit', 'sendPhoneCode', 'msPendingHTML',
  'switchLoginMethod', 'setAccountView', 'renderLoginBody', 'openLogin',
  'renderBox', 'boxCommandsHTML', 'boxComplexHTML', 'boxBlocksHTML', 'boxToolsHTML',
  'filterCommands', 'cmdCardsHTML', 'complexCardsHTML', 'versionChipsHTML',
  'checkComplexCommand', 'complexSuggestions',
  'aboutUsHTML', 'aboutPersonHTML', 'partnerHTML', 'otherAppsHTML', 'supportHTML',
  'adaptCommand', 'currentVersion', 'dailyPanelHTML', 'createDailyTasks', 'levelInfo',
  'loadDailyState', 'settingsSheetHTML', 'exportPathLabel',
  'blockRowsHTML', 'openToolSheet', 'runToolFromForm', 'renderToolOut',
  'PIXEL_BLOCKS', 'PIXEL_RECOMMENDED', 'quizEntryHTML', 'deviceLauncherHTML',
  'refreshDailyTasks', 'updatePaneHTML', 'updateState',
  'SHOP_ITEMS', 'ROLE_LIMIT', 'decoratedName', 'roleState', 'EXTRACT_GEAR', 'EXTRACT_MAPS',
  'TOOL_RUNNERS', 'QUARK', 'state'
];
let body = '(function () {' + raw.slice(openIdx + '(() => {'.length, closeIdx);
body += '\nreturn { ' + exported.join(', ') + ' };\n})()';

let api;
try {
  api = vm.runInContext(body, context, { filename: 'app.inline.js' });
  check('app.js 在 DOM 桩中完成求值（无顶层异常）', true);
} catch (err) {
  check('app.js 在 DOM 桩中完成求值（无顶层异常）', false, err && err.message);
  console.log(err);
  process.exit(1);
}

/* ---------------- 模板渲染 ---------------- */
console.log('== 模板渲染 ==');
const templates = {
  '登录页': () => api.renderLoginScreen(),
  '手机号表单': () => api.phoneFormHTML(),
  'QQ邮箱表单': () => api.qqFormHTML(),
  '离线表单': () => api.offlineFormHTML(),
  '微软设备码表单': () => api.deviceCodeFormHTML('microsoft', '微软登录', 'MICROSOFT'),
  '账号方式列表': () => api.accountListHTML(),
  '我的页面': () => api.renderMine(),
  '启动器页面': () => api.renderLaunchers(),
  '资源页面': () => api.renderResources(),
  '首页账号胶囊': () => { api.renderHomeAccount(); return 'ok'; },
  '首页推荐位': () => { api.renderHomePromo(); return 'ok'; },
  '首页热门': () => { api.renderHomeHot(); return 'ok'; },
  '首页资源': () => { api.renderHomeResources(); return 'ok'; }
};
for (const [name, fn] of Object.entries(templates)) {
  try {
    const html = fn();
    const text = String(html == null ? '' : html);
    const bad = /\bundefined\b|\bNaN\b|\[object Object\]/.test(text);
    check(name + '渲染正常', !bad, bad ? text.slice(0, 160) : '');
  } catch (err) {
    check(name + '渲染正常', false, err && err.message);
  }
}

/* ---------------- 关键内容断言 ---------------- */
console.log('== 关键内容 ==');
const loginHtml = api.renderLoginScreen();
const methodHtml = api.accountListHTML();
check('未登录登录页直接显示账号密码注册', loginHtml.includes('name="offlineName"') && loginHtml.includes('注册一个'));
check('未登录注册不检测账号服务', loginHtml.includes('不需要连接或检测账号服务'));
check('登录后可选择微软 / Xbox / 账号方式', methodHtml.includes('data-account-method="microsoft"') && methodHtml.includes('data-account-method="xbox"') && methodHtml.includes('data-account-method="offline"'));
check('登录页不再显示手机号 / QQ 登录', !loginHtml.includes('data-login-method="phone"') && !loginHtml.includes('data-login-method="qq"'));
check('登录页包含可返回提示', loginHtml.includes('可返回'));
check('登录页包含账号服务状态提示', loginHtml.includes('service-note'));
check('登录页声明 dialog 语义所需标题 id', loginHtml.includes('id="loginTitle"'));

const pendingHtml = api.msPendingHTML();
check('未申请设备码时 pending 面板为空', pendingHtml === '');

/* ---------------- 表单校验 ---------------- */
console.log('== 表单校验 ==');
function makeForm(values) {
  const elements = {};
  for (const [k, v] of Object.entries(values)) {
    const el = makeEl('input');
    el.value = v;
    elements[k] = el;
  }
  return {
    elements,
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    offsetWidth: 10,
    querySelector: () => makeEl('button'),
    querySelectorAll: () => []
  };
}

api.setAccountView('offline');
api.openLogin({ method: 'account', account: 'offline', mode: 'register' });
const offlineShort = api.validateLoginForm(makeForm({ offlineName: '玩家一', offlinePassword: '123', offlinePassword2: '123' }));
check('离线账号弱密码被拒', offlineShort === null);

const offlineOk = api.validateLoginForm(makeForm({ offlineName: '玩家一', offlinePassword: 'Secret12345', offlinePassword2: 'Secret12345' }));
check('离线账号合法输入通过', offlineOk === true, String(offlineOk));

const offlineMismatch = api.validateLoginForm(makeForm({ offlineName: '玩家一', offlinePassword: 'Secret12345', offlinePassword2: 'Secret54321' }));
check('两次密码不一致被拒', offlineMismatch === null);

/* ---------------- 辅助函数 ---------------- */
console.log('== 辅助函数 ==');
const sess = api.sessionFromApi({ id: 'WJ_123456', uid: 'WJ-AAAA-BBBB', method: 'phone', skinId: 'alex', createdAt: 1700000000000 });
check('会话映射字段完整', sess.id === 'WJ_123456' && sess.uid === 'WJ-AAAA-BBBB' && sess.skinId === 'alex' && sess.loginAt === 1700000000000);

check('检测中状态有提示', String(api.accountServiceNote(undefined)).includes('正在检测账号服务'));
check('服务未连接时给出可操作提示', String(api.accountServiceNote(false)).includes('node server/server.js'));
check('服务已连接时说明官方授权', String(api.accountServiceNote({ microsoft: true })).includes('微软 / Xbox 授权已就绪'));
check('微软未配置时如实提示', String(api.accountServiceNote({ microsoft: false })).includes('微软 / Xbox 授权未配置'));
check('网络错误提示包含启动命令', api.apiErrorMessage({ code: 'network', message: 'x' }).includes('server/server.js'));
check('短信未配置提示明确', api.apiErrorMessage({ code: 'sms_not_configured', message: 'x' }).includes('短信通道未配置'));
check('微软未配置提示明确', api.apiErrorMessage({ code: 'ms_not_configured', message: 'x' }).includes('MS_CLIENT_ID'));

/* ---------------- 百宝箱 ---------------- */
console.log('== 百宝箱渲染 ==');
const cmdHtml = api.boxCommandsHTML();
const blockHtml = api.boxBlocksHTML();
const toolHtml = api.boxToolsHTML();
check('指令页渲染正常', cmdHtml.includes('cmd-card') && !/\bundefined\b/.test(cmdHtml));
check('指令页包含 /give', cmdHtml.includes('/give'));
check('指令页包含版本切换', cmdHtml.includes('data-box-edition="java"'));
check('方块页渲染正常', blockHtml.includes('block-row') && !/\bundefined\b/.test(blockHtml));
check('方块页包含 minecraft:stone', blockHtml.includes('minecraft:stone'));
check('方块页同时显示数字 ID 与占位符', blockHtml.includes('block-num') && blockHtml.includes('—'));
check('工具页渲染出 8 个工具', (toolHtml.match(/class="tool-card"/g) || []).length === 8, String((toolHtml.match(/class="tool-card"/g) || []).length));
check('工具页包含种子 / 音乐 / Java / 联网 / 像素画 / 点阵字', ['MC种子查找器', 'MC红石音乐', 'Java 下载', '联网工具', 'MC像素画生成器', 'MC点阵字'].every((name) => toolHtml.includes(name)));
check('指令版本选择包含 Java 1.12.2', cmdHtml.includes('data-box-version="1.12.2"'));
check('指令版本选择包含基岩 1.21.50', api.versionChipsHTML('bedrock').includes('data-box-version="1.21.50"'));

const B = sandbox.window.BOX_DATA;
api.state.boxEdition = 'java';
api.state.boxVersion.java = '1.12.2';
const legacyGive = api.adaptCommand(B.javaCommands.find((c) => c.c === '/give'));
check('Java 1.12.2 的 /give 改写为数字 ID', legacyGive.e.includes('264') && !legacyGive.e.includes('minecraft:diamond'), legacyGive.e);
api.state.boxVersion.java = '1.21.4';
const modernGive = api.adaptCommand(B.javaCommands.find((c) => c.c === '/give'));
check('Java 1.21.4 的 /give 保持命名空间 ID', modernGive.e.includes('minecraft:diamond'), modernGive.e);

console.log('== 复杂指令 ==');
const complexHtml = api.boxComplexHTML();
check('复杂指令页渲染正常', complexHtml.includes('complex-lab') && complexHtml.includes('id="complexInput"') && !/\bundefined\b/.test(complexHtml));
check('复杂指令页包含 execute 模板', complexHtml.includes('execute 条件执行链'));
check('复杂指令无重复 id', new Set(B.complexCommands.map((c) => c.id)).size === B.complexCommands.length);
check('复杂指令覆盖 Java 与基岩版', new Set(B.complexCommands.map((c) => c.edition)).size === 2);
check('复杂指令模板都有提示与代码', B.complexCommands.every((c) => c.hint && c.code && c.desc));

const okCheck = api.checkComplexCommand('/execute as @a at @s run say hi');
check('合法 execute 链检查通过', okCheck.state === 'ok', JSON.stringify(okCheck));
const missRun = api.checkComplexCommand('/execute as @a at @s say hi');
check('缺少 run 会报错', missRun.issues.some((i) => i.level === 'error' && i.text.includes('run')), JSON.stringify(missRun.issues));
const badJson = api.checkComplexCommand('/tellraw @a {text:"hi"}');
check('非法 JSON 会报错', badJson.issues.some((i) => i.level === 'error' && i.text.includes('JSON')), JSON.stringify(badJson.issues));
const badBracket = api.checkComplexCommand('/tellraw @a {"text":"hi"');
check('未闭合括号会报错', badBracket.issues.some((i) => i.level === 'error' && /闭合/.test(i.text)), JSON.stringify(badBracket.issues));
const typo = api.checkComplexCommand('/gvie @s stone');
check('未知指令会给出 /give 建议', typo.issues.some((i) => i.text.includes('/give')), JSON.stringify(typo.issues));
const shortTypo = api.checkComplexCommand('/ex');
check('短前缀会建议 /execute 而不是乱猜', shortTypo.issues.some((i) => i.text.includes('/execute')), JSON.stringify(shortTypo.issues));
const danger = api.checkComplexCommand('/kill @e[type=zombie]');
check('危险选择器有提醒', danger.issues.some((i) => i.level === 'warn'), JSON.stringify(danger.issues));
api.state.boxVersion.java = '1.12.2';
const oldAttr = api.checkComplexCommand('/attribute @s minecraft:generic.max_health get');
check('旧版本不支持 attribute 会报错', oldAttr.issues.some((i) => i.level === 'error' && i.text.includes('1.16.5')), JSON.stringify(oldAttr.issues));
api.state.boxVersion.java = '1.21.4';
const suggests = api.complexSuggestions('/ex', 3);
check('输入 /ex 会补全 /execute', suggests.items.some((i) => i.value === '/execute'), JSON.stringify(suggests.items));

console.log('== 投影文件 / 每日系统 ==');
const nbt = sandbox.WWNBT;
const built = nbt.buildSchematic({
  width: 2, height: 2, length: 1,
  blocks: ['minecraft:stone', 'minecraft:air', 'minecraft:stone', 'minecraft:glass'],
  name: '测试'
});
check('Sponge schematic 根标签正确', built.data[0] === 10 && built.data[2] === 9 && String.fromCharCode(...built.data.slice(3, 12)) === 'Schematic');
check('Sponge schematic 记录尺寸与调色板', built.width === 2 && built.height === 2 && built.length === 1 && built.palette.includes('minecraft:stone') && built.palette.includes('minecraft:glass'));
check('Sponge schematic 方块计数正确', built.blockCount === 3, String(built.blockCount));
const many = Array.from({ length: 300 }, (_, i) => 'minecraft:test_block_' + i);
const manyBuilt = nbt.buildSchematic({ width: 300, height: 1, length: 1, blocks: many });
check('Sponge 调色板超过 128 时使用多字节 varint', manyBuilt.palette.length === 300 && manyBuilt.data.length > 300, `${manyBuilt.palette.length}/${manyBuilt.data.length}`);

api.state.session = { id: '测试玩家', uid: 'WJ-TEST-0001', method: 'microsoft', skinId: 'steve' };
api.loadDailyState();
const tasks = api.createDailyTasks();
check('每日任务固定 4 个', tasks.length === 4, String(tasks.length));
check('每日任务为 2 简单 / 1 普通 / 1 困难', tasks.filter((t) => t.difficulty === '简单').length === 2 && tasks.filter((t) => t.difficulty === '普通').length === 1 && tasks.filter((t) => t.difficulty === '困难').length === 1);
check('每日任务奖励在 1–20 之间', tasks.every((t) => t.reward >= 1 && t.reward <= 20));
api.state.daily.xp = 100;
const level1 = api.levelInfo();
check('第 1 级需要 100 EXP', level1.level === 1 && level1.progress === 0, JSON.stringify(level1));
api.state.daily.xp = 225;
const level2 = api.levelInfo();
check('升级所需经验逐级递增', level2.level === 2 && level2.into === 0 && level2.need === 150, JSON.stringify(level2));
const dailyHtml = api.dailyPanelHTML();
check('每日中心包含签到 / 任务 / 好友', ['签到', '每日任务', '好友'].every((t) => dailyHtml.includes(t)));
check('每日答题为每日任务之外的独立入口', dailyHtml.includes('quiz-entry-card') && dailyHtml.includes('每日答题') && !/daily-actions[\s\S]{0,600}data-action="daily-quiz"/.test(dailyHtml));
api.state.daily.tasks.refreshed = false;
api.refreshDailyTasks();
check('每日任务可刷新一次且仍为 4 个', api.state.daily.tasks.refreshed === true && api.state.daily.tasks.items.length === 4, JSON.stringify(api.state.daily.tasks));
const refreshedIds = api.state.daily.tasks.items.map((t) => t.id).sort().join(',');
api.refreshDailyTasks();
check('同一天不能刷新第二次', api.state.daily.tasks.items.map((t) => t.id).sort().join(',') === refreshedIds);
check('方块库覆盖 Minecraft 全部方块', api.PIXEL_BLOCKS.length >= 1000, String(api.PIXEL_BLOCKS.length));
check('方块库包含推荐调色板与中文名', api.PIXEL_RECOMMENDED.length >= 40 && api.PIXEL_BLOCKS.every((b) => b.block.startsWith('minecraft:') && b.name && b.hex));
check('设备启动器只包含 APP 收录软件', ['net.kdt.pojavlaunch', 'com.tungsten.fcl', 'com.mojang.minecraftpe'].every((p) => api.deviceLauncherHTML().includes(p)));
check('商店商品数量与价格满足要求', api.SHOP_ITEMS.length >= 20 && api.SHOP_ITEMS.filter((item) => item.priceGold).every((item) => item.priceGold >= 100));
check('超级管理员 10 个 / 管理员 50 个上限', api.ROLE_LIMIT.super === 10 && api.ROLE_LIMIT.admin === 50);
check('APP主人名字直接带后缀', api.decoratedName('Rushi_MC').includes('APP主人'));
check('搜打撤装备覆盖八个槽位', ['helmet', 'chest', 'legs', 'boots', 'sword', 'bow', 'axe', 'totem'].every((slot) => api.EXTRACT_GEAR.some((gear) => gear.slot === slot)));
check('搜打撤包含三张地图', ['normal', 'advanced', 'hard'].every((id) => api.EXTRACT_MAPS[id]));
check('搜打撤装备可购买与附魔', api.EXTRACT_GEAR.length >= 29 && api.EXTRACT_GEAR.every((gear) => gear.price > 0 && gear.power > 0));
const settingsHtml = api.settingsSheetHTML();
check('设置集中面板包含下载路径与最终解释权', settingsHtml.includes('下载路径') && settingsHtml.includes('最终解释权归作者所有'));

api.renderLaunchers();
const launcherHtml = sandbox.document.getElementById('launcherPage').innerHTML;
check('启动器包含基岩版可选版本', launcherHtml.includes('MC基岩版') && launcherHtml.includes('data-launcher="bedrock"'));
check('基岩版包含网易我的世界', launcherHtml.includes('网易我的世界（基岩版）') && launcherHtml.includes('data-launcher="netease-bedrock"'));
check('启动器新增更多 Java 启动器', ['ATLauncher', 'Technic Launcher', 'GDLauncher', 'Modrinth App'].every((n) => launcherHtml.includes(n)));
check('主页推荐 PCL2 并带图片', sandbox.document.getElementById('homePromo').innerHTML.includes('assets/launchers/pcl2.png') && sandbox.document.getElementById('homePromo').innerHTML.includes('龙腾猫跃'));
check('启动器卡片使用封面图', launcherHtml.includes('assets/launchers/hmcl.png') && launcherHtml.includes('assets/launchers/pcl2.png') && launcherHtml.includes('assets/launchers/bedrock.png'));
check('设置面板包含背景音乐入口', settingsHtml.includes('背景音乐'));

console.log('== 关于我们 ==');
const aboutHtml = api.aboutUsHTML();
check('关于我们包含作者 QQ', aboutHtml.includes('3335750182') && aboutHtml.includes('3692754827'));
check('关于我们包含全部赞助商 QQ', ['2575104168', '1751249668', '2729262309', '3372731544', '1447017701'].every((qq) => aboutHtml.includes(qq)));
check('关于我们不再出现㘬可', !aboutHtml.includes('㘬可'));
check('关于我们写出官方群号', aboutHtml.includes('1137437440'));
check('关于我们包含合作作者 cty 与 Vayrm', aboutHtml.includes('cty') && aboutHtml.includes('Vayrm'));
check('关于我们包含三个群号', ['1137154951', '1095886790', '1124692610'].every((g) => aboutHtml.includes(g)));
check('关于我们包含所有头像图片', ['avatar-zaoan.jpg', 'avatar-zayu.jpg', 'avatar-muchen.jpg', 'avatar-vayrm.jpg', 'avatar-cty.jpg', 'avatar-gui.jpg', 'avatar-zhangwanqiu.jpg'].every((img) => aboutHtml.includes(img)));
check('关于我们包含三个 APP 图片', ['app-yunxi.jpg', 'app-geekcat.jpg', 'app-yiye.jpg'].every((img) => aboutHtml.includes(img)));
check('关于我们包含赞助我们图片', aboutHtml.includes('assets/sponsor-qr.png') && aboutHtml.includes('赞助我们'));
check('关于我们所有群都可点击', (aboutHtml.match(/data-qq-group=/g) || []).length >= 4);
check('关于我们提供内置更新入口', aboutHtml.includes('data-action="check-update"') && !aboutHtml.includes('data-action="open-quark"'));
check('其他APP仍使用夸克链接', api.QUARK.url === 'https://pan.quark.cn/s/aa533c25cb16' && api.QUARK.pwd === '');
check('其他APP列出三个应用', ['云析APP', '极客猫APP', '一叶知音APP'].every((name) => api.otherAppsHTML().includes(name)));
check('云析 APP 显示新链接提取码', api.otherAppsHTML().includes('09c698b0e1ae') && api.otherAppsHTML().includes('qshu'));
check('无 QQ 的成员不生成加好友按钮', api.aboutPersonHTML({ name: '占位成员', qq: '', role: '赞助商' }).includes('disabled'));

const mineHtml = sandbox.document.getElementById('minePage').innerHTML;
const settingsPanel = api.settingsSheetHTML();
check('我的页只有一个设置入口', mineHtml.includes('data-action="open-settings"') && !mineHtml.includes('settings-section'));
check('设置面板包含其他APP', settingsPanel.includes('其他APP'));
check('设置面板包含赞助我们', settingsPanel.includes('赞助我们'));
check('设置面板不再包含清理缓存', !settingsPanel.includes('清理缓存'));

api.state.boxMode = 'commands';
api.renderBox();
api.state.boxMode = 'complex';
api.renderBox();
api.state.boxMode = 'blocks';
api.renderBox();
api.state.boxMode = 'tools';
api.renderBox();
check('四种模式都可以完整渲染', true);

console.log('== 保留的颜色工具 ==');
const colorTool = api.TOOL_RUNNERS.color({ text: '世界', color: '6', style: 'l' });
check('颜色工具输出 § 与 & 两种写法', colorTool.code.includes('§6§l世界') && colorTool.code.includes('&6&l世界'), colorTool.code);
check('颜色工具带预览主题色', colorTool.preview && colorTool.preview.hex === '#FFAA00', JSON.stringify(colorTool.preview));
check('百宝箱旧 give / tp / shape / xp / coord / tellraw 执行器已恢复', ['give', 'tp', 'shape', 'xp', 'coord', 'tellraw'].every((id) => typeof api.TOOL_RUNNERS[id] === 'function'));
check('旧 give 执行器能生成命令', api.TOOL_RUNNERS.give({ target: '@s', item: 'minecraft:diamond', count: 3 }).code.includes('/give @s minecraft:diamond 3'));
check('旧 coord 执行器能双向换算', api.TOOL_RUNNERS.coord({ dimension: 'overworld', x: 80, z: -16 }).code.includes('下界 (10, -2)'));
check('旧 shape 执行器能生成填充命令', api.TOOL_RUNNERS.shape({ shape: 'solid', block: 'minecraft:stone', x: 0, y: 64, z: 0, w: 2, h: 2, l: 2 }).code.includes('/fill 0 64 0 1 65 1 minecraft:stone'));

console.log(`\n结果：通过 ${pass} 项，失败 ${fail} 项`);
process.exit(fail ? 1 : 0);
