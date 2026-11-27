/* =========================================================
   静态一致性检查：图标、字段、类名、脚本顺序
   用法：node _test/static-check.js
   ========================================================= */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail ? ' → ' + detail : '')); }
}

const html = read('index.html');
const app = read('app.js');
const css = read('styles.css');
const bridge = read('bridge.js');
const data = read('data.js');
const server = read('server/server.js');
const game = read('game-data.js');
const blocks = read('blocks-data.js');
const update = read('update.json');
const adminHtml = read('admin/index.html');
const adminJs = read('admin/admin.js');
const adminCss = read('admin/admin.css');

console.log('== 脚本与样式引用 ==');
for (const asset of ['styles.css', 'data.js', 'box-data.js', 'blocks-data.js', 'bridge.js', 'app.js', 'favicon.svg', 'manifest.webmanifest', 'assets/icon-180.png']) {
  check(`index.html 引用 ${asset}`, html.includes(asset));
}
check('页面标题使用应用全名', html.includes('世界织卷 · MC 指令与资源工具箱'));
check('manifest 应用名正确', fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8').includes('世界织卷 · MC 指令与资源工具箱'));
for (const icon of ['assets/icon-1024.png', 'assets/icon-512.png', 'assets/icon-192.png', 'assets/icon-180.png', 'assets/icon-maskable-512.png', 'assets/app-icon.svg']) {
  check(`应用图标存在 ${icon}`, fs.existsSync(path.join(ROOT, icon)));
}
check('favicon 已换成新图标', fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8').includes('fav-bg'));
const order = ['data.js', 'box-data.js', 'game-data.js', 'blocks-data.js', 'nbt.js', 'bridge.js', 'app.js'].map((f) => html.indexOf('<script src="' + f + '">'));
check('脚本顺序为 data → box-data → game-data → blocks-data → nbt → bridge → app', order.every((n) => n > 0) && order[0] < order[1] && order[1] < order[2] && order[2] < order[3] && order[3] < order[4] && order[4] < order[5] && order[5] < order[6], order.join(','));
for (const f of ['styles.css', 'data.js', 'box-data.js', 'game-data.js', 'blocks-data.js', 'nbt.js', 'bridge.js', 'app.js']) {
  check(`文件存在 ${f}`, fs.existsSync(path.join(ROOT, f)));
}

console.log('== SVG 图标 ==');
const symbols = new Set([...html.matchAll(/<symbol id="i-([a-z0-9-]+)"/g)].map((m) => m[1]));
const used = new Set();
for (const m of app.matchAll(/SVG\('([a-z0-9-]+)'/g)) used.add(m[1]);
for (const m of html.matchAll(/href="#i-([a-z0-9-]+)"/g)) used.add(m[1]);
const missing = [...used].filter((n) => !symbols.has(n));
check(`所有引用的图标都已定义（共 ${used.size} 个）`, missing.length === 0, missing.join(', '));
check('图标库非空', symbols.size > 10, String(symbols.size));

console.log('== 已移除的旧流程 ==');
for (const legacy of ['msEmail', 'msPassword', 'xboxTag', 'xboxPassword', '演示码 123456', '演示密码', '任意 6 位数字']) {
  check(`app.js 不再包含「${legacy}」`, !app.includes(legacy));
}
check('index.html 的 tabbar 不再使用 aria-selected', !/data-tab="[a-z]+"[^>]*aria-selected/.test(html));
check('tabbar 使用 aria-current', /data-tab="home" aria-current="page"/.test(html));

console.log('== 新增样式 ==');
for (const cls of ['auth-mode', 'auth-mode-btn', 'service-note', 'link-inline', 'steps', 'step-no', 'ms-panel', 'ms-code-row', 'ms-code', 'ms-status',
  'box-mode', 'box-mode-btn', 'box-search', 'cmd-card', 'cmd-name', 'cmd-usage', 'block-row', 'block-id', 'block-num', 'tool-card', 'tool-code']) {
  check(`styles.css 定义 .${cls}`, css.includes('.' + cls), cls);
}
check('styles.css 支持系统减少动效', /@media \(prefers-reduced-motion: reduce\)/.test(css));

console.log('== 进入动画 ==');
check('默认进入时长为 12 秒', /const duration = reduce \? 1200 : 12000;/.test(app));
check('进度条有可访问名称', html.includes('aria-label="世界生成进度"'));
check('导出路径说明存储权限与默认目录', app.includes('存储权限') && app.includes('/storage/emulated/0/Download'));
check('阶段文案包含账号服务', app.includes('连接账号服务'));
check('到 100% 后才调用 finish', /setProgress\(100\);\s*setTimeout\(\(\) => finish\(false\), 700\);/.test(app));
check('启动期间对 app 使用 inert', app.includes("app.setAttribute('inert', '')"));
check('启动结束时移除 inert', app.includes("app.removeAttribute('inert')"));
check('支持 ?skip 直接进入', app.includes("has('skip')"));

console.log('== 外链与权限 ==');
check('全局拦截 http(s) 链接', app.includes("closest('a[href]')"));
check('外链走统一复制 + 浏览器打开', app.includes('openBrowserLink(href)'));
check('bridge 提供 openExternal', bridge.includes('function openExternal'));
check('bridge 不再提供存储权限申请', !bridge.includes('requestStoragePermission') && !bridge.includes('WWStorage'));
check('关于我们设置项存在', app.includes("settingRowHTML('about-us'"));
check('关于软件设置项存在', app.includes("settingRowHTML('about-app'"));
check('赞助我们设置项存在', app.includes("settingRowHTML('sponsor-us'"));
check('其他APP设置项存在', app.includes("settingRowHTML('other-apps'"));
check('设置页不再有清理缓存', !app.includes("settingRowHTML('cache'") && !app.includes('已清理 24.6 MB'));
check('bridge 提供 QQ 好友名片跳转', bridge.includes('openQQFriend') && bridge.includes('qqFriendScheme'));
check('bridge 外链优先系统浏览器', bridge.includes('WWShell.openExternal') && bridge.includes("InAppBrowser.open(target, '_system')"));

console.log('== 2.0 新功能 ==');
check('启动画面不再有跳过按钮', !html.includes('id="skipSplash"') && !html.includes('splash-skip'));
check('方块库覆盖全部 Minecraft 方块', (blocks.match(/"block": "minecraft:/g) || []).length >= 1000);
check('像素画尺寸为 64–2048', app.includes('const PIXEL_MIN = 64') && app.includes('const PIXEL_MAX = 2048'));
check('点阵字尺寸为 5–128', app.includes('const DOT_MIN = 5') && app.includes('const DOT_MAX = 128'));
check('点阵字包含字体选择与方块分组', app.includes('const DOT_FONTS') && app.includes('dotBlockOptionsHTML'));
check('每日任务支持每日刷新一次', app.includes('function refreshDailyTasks') && app.includes('refreshed: true'));
check('每日答题已从任务按钮组拆出', app.includes('function quizEntryHTML') && !app.includes('data-action="daily-quiz"${disabled}'));
for (const audio of ['lilypad.mp3', 'os-piano.mp3', 'bromeliad.mp3', 'aerie.mp3']) {
  check(`内置音频存在 ${audio}`, fs.existsSync(path.join(ROOT, 'assets/audio', audio)));
}
check('内置更新清单存在且版本一致', (() => {
  try { return JSON.parse(update).version === '2.1.5' && data.includes("version: '2.1.5'"); } catch { return false; }
})());
check('内置更新有下载进度与路径', app.includes('downloadAppUpdate') && app.includes('updateDownloadBar') && app.includes('installFile(full)'));
check('账号找回需要联系作者', app.includes('function forgotPasswordHTML') && app.includes('需要联系作者本人'));
check('我的页包含设备启动器', app.includes('function deviceLauncherHTML') && app.includes('listInstalledApps'));
check('导出 100% 显示导出成功', (app.match(/setExportProgress\(100, '导出成功'\)/g) || []).length >= 2);

console.log('== 管理后台 ==');
for (const f of ['admin/index.html', 'admin/admin.js', 'admin/admin.css', 'admin/admin.webmanifest', 'server/admin.js']) {
  check(`后台文件存在 ${f}`, fs.existsSync(path.join(ROOT, f)));
}
check('后台使用账号密码登录', adminHtml.includes('管理员账号') && adminHtml.includes('adminPass') && adminJs.includes('/api/admin/login'));
check('后台支持首次初始化管理员', adminJs.includes('/api/admin/setup') && adminJs.includes('初始化管理员'));
check('后台包含概览 / 账号 / 消息 / 更新', ['概览', '账号管理', '消息记录', 'APP 更新'].every((t) => adminHtml.includes(t)));
check('后台不索引搜索引擎', adminHtml.includes('noindex'));
check('服务端提供管理 API', server.includes('/api/admin/status') && server.includes('/api/admin/login') && server.includes('/api/admin/overview'));
check('服务端管理 API 需要鉴权', server.includes('admin.requireAdmin(req)') && fs.readFileSync(path.join(ROOT, 'server/admin.js'), 'utf8').includes('admin_unauthorized'));
check('管理后台入口已接入主 APP', app.includes('admin-console') && app.includes('openAdminConsole'));
check('后台样式覆盖移动端', adminCss.includes('@media (max-width: 600px)'));

console.log('== 平板适配 ==');
check('viewport 支持刘海安全区与键盘缩放', html.includes('viewport-fit=cover') && html.includes('interactive-widget=resizes-content'));
check('PWA 允许平板横竖屏旋转', fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8').includes('"orientation": "any"'));
check('平板全屏布局覆盖 721–2200px', css.includes('@media (min-width: 721px) and (max-width: 2200px)'));
check('平板横屏使用左侧导航栏', css.includes('@media (min-width: 1000px) and (max-width: 2200px)') && css.includes('grid-template-rows: repeat(5, 76px)'));
check('平板弹层改为居中对话框', css.includes('@keyframes sheetTabletIn') && css.includes('width: min(720px, calc(100% - 56px))'));
check('平板使用安全区 padding', css.includes('env(safe-area-inset-left)') && css.includes('env(safe-area-inset-right)'));

console.log('== 2.1.5 权限 / 存储 ==');
check('页面禁止双指缩放', html.includes('user-scalable=no') && css.includes('touch-action: pan-x pan-y'));
check('首次启动权限门存在', html.includes('id="permissionLayer"') && app.includes('function showPermissionGateIfNeeded'));
check('权限门要求全部权限', app.includes('必须允许全部权限') && app.includes("id: 'storage'") && app.includes("id: 'packages'"));
check('读取下载路径与 APK 文件', app.includes('getDownloadPath') && app.includes('listApkFiles') && app.includes('listFiles'));
check('导出统一到下载路径', app.includes("const EXPORT_PATH_DEFAULT = '/storage/emulated/0/Download'") && !app.includes('showSaveFilePicker'));
check('我的页包含存储与 APK', app.includes('function storageCardHTML') && app.includes("data-action=\"open-storage\""));
for (const f of ['android/AndroidManifest.xml', 'android/res/xml/file_paths.xml', 'android/README.md']) {
  check(`Android 权限文件存在 ${f}`, fs.existsSync(path.join(ROOT, f)));
}
check('Android 清单包含存储与安装权限', fs.readFileSync(path.join(ROOT, 'android/AndroidManifest.xml'), 'utf8').includes('MANAGE_EXTERNAL_STORAGE'));

console.log('== 2.1.5 APP角色 / GM ==');
check('APP主人账号固定且不存明文密码', app.includes("username: 'Rushi_MC'") && app.includes("qq: '3335750182'") && !app.includes('DYF145243'));
check('超级管理员 10 个、管理员 50 个上限', app.includes('ROLE_LIMIT = { super: 10, admin: 50 }'));
check('设置顶部三张角色卡', app.includes('function roleMastheadHTML') && app.includes("card('super'") && app.includes("card('owner'") && app.includes("card('admin'"));
check('超级管理员登录必须安全密钥', app.includes('安全密钥不正确，登录失败') && app.includes("if (role === 'super' && !key)"));
check('APP主人独占密钥复制与更换', app.includes('只有 APP主人可以更换安全密钥') && app.includes("roleState.session.role !== 'owner'"));
check('管理员不能使用 GM / 添加管理员', app.includes("function gmAllowed()") && app.includes("if (role === 'admin') return current === 'owner' || current === 'super';") && app.includes('管理员不能使用 GM 后台'));
check('GM 刷与删成对出现', app.includes('data-gm-run="give"') && app.includes('data-gm-run="clear-item"') && app.includes('data-gm-run="summon"') && app.includes('data-gm-run="kill"'));
check('GM 仅生成命令不执行外部服务器', app.includes('GM 后台负责生成命令') && app.includes('不会直接连接你的服务器'));

console.log('== 2.1.5 货币 / 商店 / 改名 ==');
check('金锭兑换钻石为 1888 且单向说明', app.includes('e.gold < 1888') && app.includes('1888 金锭 → 1 钻石') && app.includes('不可反兑换'));
check('答题金锭为 250 / 200 / 50', app.includes('score === 10 ? 250 : score === 9 ? 200 : score === 8 ? 50'));
check('任务全完成奖励 100–200 金锭', app.includes('randomInt(100, 200)') && app.includes('每日任务全部完成'));
check('商店物品数量与价格区间', (app.match(/\{ id: '[^']+', type: '(frame|theme|title|namecard|xp|role)'/g) || []).length >= 20 && app.includes('priceGold: 120'));
check('货币未登录不可使用', app.includes('未登录不可使用商店') && app.includes('登录后开启金锭、钻石、背包与商店'));
check('删除本地启动器并放入背包商店', !app.includes('${deviceLauncherHTML()}') && app.includes('data-action="open-bag"') && app.includes('data-action="open-shop"'));
check('名字后缀显示管理员 / 超级管理员', app.includes('【超级管理员】') && app.includes('【管理员】') && app.includes('【APP主人】'));
check('权限卡成本与升级返还', app.includes('priceDiamonds: 10') && app.includes('priceDiamonds: 30') && app.includes('e.diamonds += 5') && app.includes('e.gold += 1000'));
check('GM 货币 / 经验 / 商店命令', app.includes('data-gm-run="gold-add"') && app.includes('data-gm-run="level-add"') && app.includes('data-gm-run="shop-list"'));

console.log('== 数据层 ==');
check('主页推荐启动器为 PCL2', data.includes("id: 'pcl2'") && data.includes('龙腾猫跃') && data.includes('FEATURED · PCL2'));
check('基岩版包含网易我的世界', data.includes('neteaseBedrock') && data.includes('网易我的世界（基岩版）'));
for (const img of ['pcl2', 'hmcl', 'bakaxl', 'pojav', 'fcl', 'zalith', 'amethyst', 'atlauncher', 'technic', 'gdlauncher', 'modrinthapp', 'prism', 'multimc', 'official', 'bedrock', 'netease']) {
  check(`启动器图片存在 ${img}.png`, fs.existsSync(path.join(ROOT, 'assets/launchers', img + '.png')));
}
const resourceCount = (data.match(/^\s+cat: '/gm) || []).length;
check('资源站数量为 12', resourceCount === 12, String(resourceCount));
const themeLines = data.split('\n').filter((l) => l.includes('colors: ['));
check('主题数量为 8（含 4 个商店主题）', themeLines.length === 8, String(themeLines.length));
check('主题 id 齐全', ['grass', 'nether', 'end', 'ocean', 'sakura', 'amethyst', 'gold', 'ice'].every((id) => themeLines.some((l) => l.includes(`id: '${id}'`))));
check('新夸克链接已写入', data.includes('https://pan.quark.cn/s/aa533c25cb16'));
check('云析下载链接与提取码已更新', data.includes('https://pan.quark.cn/s/09c698b0e1ae?pwd=qshu') && data.includes("pwd: 'qshu'"));
check('旧夸克链接与提取码已移除', !data.includes('371f8fd0153a') && !data.includes('W6iC') && !app.includes('W6iC'));
check('关于我们包含新增赞助商 QQ', data.includes('3372731544') && data.includes('1447017701') && data.includes('3657815839') && data.includes("name: 'suz'"));
check('关于我们包含三个合作群', ['1137154951', '1095886790', '1124692610'].every((g) => data.includes(g)));
for (const asset of [
  'assets/avatar-zaoan.jpg', 'assets/avatar-zayu.jpg', 'assets/avatar-muchen.jpg',
  'assets/avatar-vayrm.jpg', 'assets/avatar-cty.jpg', 'assets/avatar-gui.jpg',
  'assets/avatar-zhangwanqiu.jpg', 'assets/avatar-suz.jpg', 'assets/sponsor-qr.png', 'assets/app-yunxi.jpg',
  'assets/app-geekcat.jpg', 'assets/app-yiye.jpg'
]) {
  check(`图片资源存在 ${asset}`, fs.existsSync(path.join(ROOT, asset)));
}

console.log('== 设置 / 每日 / 好友 / 登录 ==');
check('设置集中到一个设置入口', app.includes('settings-entry') && !app.includes('settings-section') && app.includes("data-action=\"open-settings\""));
check('设置底部有最终解释权', app.includes('最终解释权归作者所有'));
check('每日中心包含签到 / 任务 / 答题 / 好友', ['checkIn()', 'openDailyTasksSheet', 'openQuizSheet', 'openFriendsSheet'].every((x) => app.includes(x)));
check('经验等级逐级递增且封顶 100', app.includes('xpNeedForLevel') && app.includes('MAX_LEVEL = 100') && app.includes('MAX_XP'));
check('每级都有升级鼓励语', app.includes('LEVEL_CHEERS') && app.includes('达成！'));
check('签到不再限制正版账号', !app.includes('签到仅限微软') && app.includes('function checkIn()'));
check('任务/答题仅登录后可运行', app.includes('const disabled = logged') && app.includes('data-action="daily-tasks"${disabled}') && app.includes("data-action=\"daily-quiz\" ${logged ? '' : 'disabled'}"));
check('每日答题已从每日任务按钮组拆出', !app.includes('data-action="daily-quiz"${disabled}') && app.includes('function quizEntryHTML'));
check('每日任务每天可刷新一次', app.includes('function refreshDailyTasks') && app.includes('refreshed: true') && app.includes('data-action="refresh-tasks"'));
check('每日任务 2 简单 + 1 普通 + 1 困难', app.includes("pick(GAME.taskPool.easy, 2)") && app.includes("pick(GAME.taskPool.normal, 1)") && app.includes("pick(GAME.taskPool.hard, 1)"));
check('每日答题 10 题与奖励规则', game.includes('perfectExp: 100') && game.includes('oneWrongExp: 50') && (game.match(/\{ q:/g) || []).length >= 30);
check('好友服务端路由完整', ['/api/social/friends', '/api/social/friends/add', '/api/social/chat', '/api/social/chat/send'].every((r) => server.includes(r)));
check('好友只能添加本应用用户', server.includes('user_not_found') && server.includes('对方可能不是本应用用户'));
check('本机账号好友不依赖正版 / 服务', app.includes('function localAddFriend') && app.includes('localSocialBucket') && app.includes('state.session.local'));
check('答题按 3 简单 + 3 普通 + 4 困难抽取', app.includes("pickBy('简单', 3)") && app.includes("pickBy('普通', 3)") && app.includes("pickBy('困难', 4)"));
check('像素画尺寸 64–2048 可滑动', app.includes('PIXEL_MIN = 64') && app.includes('PIXEL_MAX = 2048') && app.includes('id="pixelSize" type="range"'));
check('点阵字尺寸 5–128 可滑动', app.includes('DOT_MIN = 5') && app.includes('DOT_MAX = 128') && app.includes('id="dotSize" type="range"'));
check('像素画可选择 Minecraft 方块', app.includes('data-pixel-block') && app.includes('pixelActivePalette'));
check('红石音乐使用音符盒并可选音色', app.includes('minecraft:note_block') && app.includes('MUSIC_INSTRUMENTS') && app.includes('id="musicInstrument"'));
check('导出进度与生成 / 导出历史', app.includes('showExportProgress') && app.includes('recordActivity') && app.includes('openHistorySheet') && app.includes('data-history-tab'));
check('历史可检测存储文件并提示复制下载', app.includes('checkHistoryFile') && app.includes('fileExists') && app.includes('路径已复制'));
check('登录只保留账号密码 / 微软 / Xbox', app.includes('data-account-method="microsoft"') && app.includes('data-account-method="xbox"') && app.includes('data-account-method="offline"') && !app.includes('data-login-method="phone"') && !app.includes('data-login-method="qq"'));
check('微软 / Xbox 仅登录成功后可进入', app.includes('login.showOfficial') && app.includes("!login.showOfficial && !state.session"));
check('基岩版启动器及版本选择', data.includes("id: 'bedrock'") && data.includes('versions: [') && app.includes('data-bedrock-version'));
check('Java 启动器新增 4 款', ['atlauncher', 'technic', 'gdlauncher', 'modrinthapp'].every((id) => data.includes("id: '" + id + "'")));
check('导出路径与 .schem 导出', app.includes('exportPathLabel') && app.includes('WWNBT.buildSchematic') && app.includes('worldweave-pixel-'));
check('导出默认目录与原生壳路径', app.includes('/storage/emulated/0/Download') && app.includes('saveFile(filename, base64, mime, targetPath)'));
check('种子 / 音乐 / 点阵字 / 像素画工具齐全', ['openSeedSheet', 'openMusicSheet', 'openDotSheet', 'exportPixelSchematic'].every((x) => app.includes(x)));

console.log('== 百宝箱 ==');
const tabCount = (html.match(/data-tab="/g) || []).length;
check('底部导航为 5 项', tabCount === 5, String(tabCount));
check('包含百宝箱标签', html.includes('data-tab="box"'));
check('包含百宝箱面板', html.includes('data-panel="box"'));
check('图标 i-box 已定义', html.includes('<symbol id="i-box"'));
check('图标 i-terminal 已定义', html.includes('<symbol id="i-terminal"'));
check('版本切换带二次确认', app.includes('data-confirm-version') && app.includes('需要二次确认'));
check('复杂指令检查器存在', app.includes('function checkComplexCommand') && app.includes('complexSuggestions'));

const boxSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'box-data.js'), 'utf8'), boxSandbox);
const B = boxSandbox.window.BOX_DATA;
const gameSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'game-data.js'), 'utf8'), gameSandbox);
const G = gameSandbox.window.GAME_DATA;
check('答题难度数量满足 3 / 3 / 4', ['简单', '普通', '困难'].every((level) => G.quiz.filter((q) => q.difficulty === level).length >= (level === '困难' ? 4 : 3)), JSON.stringify(G.quiz.reduce((m, q) => { m[q.difficulty] = (m[q.difficulty] || 0) + 1; return m; }, {})));
check('Java 指令不少于 50 条', B.javaCommands.length >= 50, String(B.javaCommands.length));
check('基岩指令不少于 35 条', B.bedrockCommands.length >= 35, String(B.bedrockCommands.length));
check('方块条目不少于 200 条', B.blocks.length >= 200, String(B.blocks.length));
check('工具共 6 个（移除红石音乐 / 点阵字）', B.tools.length === 6, String(B.tools.length));
check('登录页三个角色登录按钮', ['APP主人登录', '超级管理员登录', '管理员登录'].every((text) => app.includes(text)) && app.includes('data-action="login-role"'));
check('签到日历与连续签到', app.includes('function calendarHTML') && app.includes('连续签到') && app.includes('randomInt(10, 50)'));
check('设置指令盒与三种角色', app.includes("settingRowHTML('command-box'") && app.includes("const COMMAND_BOX_LABEL = { owner: 'APP主人', super: '超级管理员', admin: '管理员' }") && app.includes("data-command-role"));
check('商店官方 / 玩家分区', app.includes('data-shop-view="official"') && app.includes('data-shop-view="player"') && app.includes('playerPriceCap'));
check('搜打撤三地图与装备槽', app.includes('EXTRACT_MAPS') && app.includes("hard: {") && app.includes("['helmet', '头盔']") && app.includes('capacity >= 50'));
check('资源分网站 / 下载 / 服务器', app.includes('RESOURCE_DOWNLOADS') && app.includes('RESOURCE_SERVERS') && app.includes('resourceSearch') && app.includes('data-resource-view="servers"'));
check('微软 / Xbox 本地验证码', app.includes('randomMixedCode') && app.includes('data-ms-code-open') && app.includes('A–Z · 1–9 · a–z'));
check('账号密码跨版本备份', app.includes('KEY_ACCOUNT_BACKUP') && app.includes('restoreAccountsFromBackup') && app.includes('backupAccounts'));
check('搜打撤战力门槛', app.includes('power: 40') && app.includes('power: 80') && app.includes('战力不足'));
check('复杂指令不少于 20 条', B.complexCommands.length >= 20, String(B.complexCommands.length));
check('复杂指令字段完整', B.complexCommands.every((c) => c.id && c.name && c.cat && c.edition && c.desc && c.code && c.hint && typeof c.s === 'number'));
check('复杂指令覆盖两种版本', new Set(B.complexCommands.map((c) => c.edition)).size === 2);
check('Java 指令版本不少于 6 个', B.commandVersions.java.length >= 6, String(B.commandVersions.java.length));
check('基岩指令版本不少于 6 个', B.commandVersions.bedrock.length >= 6, String(B.commandVersions.bedrock.length));
check('投影网站不少于 5 个', B.projectionSites.length >= 5, String(B.projectionSites.length));

const dups = (arr, key) => {
  const seen = new Set();
  return arr.filter((x) => {
    if (seen.has(x[key])) return true;
    seen.add(x[key]);
    return false;
  }).map((x) => x[key]);
};
check('复杂指令 id 无重复', dups(B.complexCommands, 'id').length === 0, dups(B.complexCommands, 'id').join(','));
check('Java 指令无重名', dups(B.javaCommands, 'c').length === 0, dups(B.javaCommands, 'c').join(','));
check('基岩指令无重名', dups(B.bedrockCommands, 'c').length === 0, dups(B.bedrockCommands, 'c').join(','));
check('方块 ID 无重复', dups(B.blocks, 'i').length === 0, dups(B.blocks, 'i').join(','));
const badCmd = B.javaCommands.concat(B.bedrockCommands).filter((c) => !c.c || !c.cat || !c.u || !c.d || !c.e || !c.v);
check('指令字段完整', badCmd.length === 0, String(badCmd.length));
const badBlock = B.blocks.filter((b) => !b.i || !b.n || !b.en || !(b.num === null || typeof b.num === 'number'));
check('方块字段与数字 ID 类型合法', badBlock.length === 0, String(badBlock.length));
check('存在历史数字 ID 数据', B.blocks.filter((b) => typeof b.num === 'number').length > 150, String(B.blocks.filter((b) => typeof b.num === 'number').length));
check('存在 1.13+ 无数字 ID 数据', B.blocks.filter((b) => b.num === null).length > 40, String(B.blocks.filter((b) => b.num === null).length));
check('工具都有字段或自定义界面', B.tools.every((t) => (Array.isArray(t.fields) && t.fields.length > 0) || ['projection', 'seed', 'java', 'network', 'pixel-site'].includes(t.kind)), B.tools.map((t) => t.id).join(','));
check('表单工具都有执行器', B.tools.filter((t) => !t.kind).every((t) => new RegExp('\\n    ' + t.id + '\\(v\\) \\{').test(app)), B.tools.filter((t) => !t.kind).map((t) => t.id).join(','));
check('像素画工具已接入', app.includes('function openPixelSheet') && app.includes('function exportPixelSchematic'));
check('投影网站工具已接入', app.includes('function openProjectionSheet'));
check('种子查找器已接入', app.includes('function openSeedSheet') && app.includes('chunkbase.com'));
check('红石音乐网站已接入', app.includes('function openMusicSheet') && app.includes('noteblock.studio'));
check('Java 8/17/21/26 下载已接入', app.includes('function openJavaSheet') && ['version=8', 'version=17', 'version=21', 'jdk.java.net/26'].every((x) => app.includes(x)));
check('联网工具集合已接入', app.includes('function openNetworkSheet') && ['natfrp.com', 'radmin-lan.cn', 'playit.gg', 'zerotier.com'].every((x) => app.includes(x)));
check('普通外链只复制不跳转', app.includes('链接已复制，请到手机浏览器粘贴打开') && app.includes('if (forceOpen || isQuark || isAuth)'));
check('夸克 / QQ 例外保留跳转', app.includes('pan\\.quark\\.cn') && app.includes('openQQGroup') && app.includes('openQQFriend'));
check('背景音乐可开关 / 切换 / 导入多格式', app.includes('function openBgmSheet') && app.includes('function importBgmFile') && app.includes("startsWith('audio/')") && app.includes('BGM_TRACKS'));
check('背景音乐有进度 / 记忆 / 后台暂停', app.includes('bgmProgress') && app.includes('bgmPositions') && app.includes("document.addEventListener('visibilitychange'"));
check('Minecraft 官方曲目已替换', ['Lilypad', "O's Piano", 'Bromeliad', 'Aerie', 'Amos Roddy', 'Aaron Cherof', 'Lena Raine'].every((n) => app.includes(n)));
check('旧 BGM 曲目已删除', ['Sweden', 'Wet Hands', 'Subwoofer Lullaby', 'Haggstrom', 'Mice on Venus'].every((n) => !app.includes(n)));
check('启动器与主页使用 PCL2 图片', app.includes('function launcherImage') && app.includes('assets/launchers/') && data.includes('assets/launchers/pcl2.png'));
check('点阵字工具已接入', app.includes('function openDotSheet') && app.includes('function exportDotSchematic'));
check('Sponge 投影导出器已接入', app.includes('WWNBT.buildSchematic') && fs.readFileSync(path.join(ROOT, 'nbt.js'), 'utf8').includes('BlockData'));
check('颜色表 16 色齐全', B.colorCodes.length === 16, String(B.colorCodes.length));

console.log('== 账号服务契约 ==');
for (const route of ['/api/auth/phone/code', '/api/auth/phone/verify', '/api/auth/qq/login', '/api/auth/local/login', '/api/auth/ms/start', '/api/auth/ms/poll']) {
  check(`前端调用 ${route}`, app.includes(route) || bridge.includes(route));
}
check('账号密码注册使用本地即注册即登录', app.includes('function localAccountRegister') && app.includes('applyLocalSession') && app.includes('KEY_LOCAL_ACCOUNTS'));
check('本地注册不检测账号服务', app.includes('不需要连接或检测账号服务'));

console.log(`\n结果：通过 ${pass} 项，失败 ${fail} 项`);
process.exit(fail ? 1 : 0);
