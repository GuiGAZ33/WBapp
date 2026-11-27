/* =========================================================
   世界织卷APP · 应用逻辑
   纯前端演示：账号与设置保存在浏览器本地
   ========================================================= */
(() => {
  'use strict';

  const DATA = window.APP_DATA;
  const BOX = window.BOX_DATA || { javaCommands: [], bedrockCommands: [], blocks: [], tools: [], colorCodes: [] };
  const WW = window.WW || {};
  const QQ_GROUP = (DATA.about && DATA.about.qqGroup) || WW.QQ_GROUP || '1137437440';
  const QUARK = (DATA.about && DATA.about.download) || {
    url: 'https://pan.quark.cn/s/aa533c25cb16',
    pwd: '',
    label: '夸克网盘'
  };
  const COMPLEX = Array.isArray(BOX.complexCommands) ? BOX.complexCommands : [];
  const GAME = window.GAME_DATA || { quiz: [], taskPool: { easy: [], normal: [], hard: [] }, quizRules: { perfectExp: 100, oneWrongExp: 50, questions: 10 } };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const SVG = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const GRASS = (cls = '') => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true"><use href="#i-grass"></use></svg>`;
  const esc = (str) => String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const METHOD_LABEL = { phone: '手机号', qq: 'QQ邮箱', microsoft: '微软账号', xbox: 'Xbox 账号', offline: '账号密码' };
  const METHOD_EN = { phone: 'PHONE', qq: 'QQ MAIL', microsoft: 'MICROSOFT', xbox: 'XBOX', offline: 'ACCOUNT' };

  /* 像素画 / 点阵字方块库：Minecraft 1.21.4 全部 1094 种方块，颜色来自原版纹理平均色
     数据由 blocks-data.js 提供；缺失时退回 16 色混凝土，保证离线也能用。 */
  const PIXEL_LEGACY = [
    { name: '白色混凝土', hex: '#cfd5d6', block: 'minecraft:white_concrete' },
    { name: '橙色混凝土', hex: '#e06101', block: 'minecraft:orange_concrete' },
    { name: '品红色混凝土', hex: '#a9309f', block: 'minecraft:magenta_concrete' },
    { name: '淡蓝色混凝土', hex: '#2389c6', block: 'minecraft:light_blue_concrete' },
    { name: '黄色混凝土', hex: '#f1af15', block: 'minecraft:yellow_concrete' },
    { name: '黄绿色混凝土', hex: '#5ea918', block: 'minecraft:lime_concrete' },
    { name: '粉色混凝土', hex: '#d5658e', block: 'minecraft:pink_concrete' },
    { name: '灰色混凝土', hex: '#36393d', block: 'minecraft:gray_concrete' },
    { name: '淡灰色混凝土', hex: '#7d7d73', block: 'minecraft:light_gray_concrete' },
    { name: '青色混凝土', hex: '#157788', block: 'minecraft:cyan_concrete' },
    { name: '紫色混凝土', hex: '#64209c', block: 'minecraft:purple_concrete' },
    { name: '蓝色混凝土', hex: '#2c2e8f', block: 'minecraft:blue_concrete' },
    { name: '棕色混凝土', hex: '#603b1f', block: 'minecraft:brown_concrete' },
    { name: '绿色混凝土', hex: '#495b24', block: 'minecraft:green_concrete' },
    { name: '红色混凝土', hex: '#8e2121', block: 'minecraft:red_concrete' },
    { name: '黑色混凝土', hex: '#080a0f', block: 'minecraft:black_concrete' }
  ];
  const PIXEL_BLOCKS = (Array.isArray(window.WW_BLOCKS) && window.WW_BLOCKS.length ? window.WW_BLOCKS : PIXEL_LEGACY)
    .map((b) => ({ name: b.name || b.en || b.block, en: b.en || '', block: b.block, hex: b.hex || '#888888', group: b.group || 'other' }));
  const PIXEL_BY_BLOCK = PIXEL_BLOCKS.reduce((map, c, index) => { map[c.block] = index + 1; return map; }, {});
  const PIXEL_GROUP_LABELS = Object.assign({ recommended: '推荐', all: '全部' }, window.WW_BLOCK_GROUPS || {});
  const PIXEL_RECOMMENDED = (Array.isArray(window.WW_BLOCK_RECOMMENDED) && window.WW_BLOCK_RECOMMENDED.length
    ? window.WW_BLOCK_RECOMMENDED
    : PIXEL_LEGACY.map((b) => b.block));
  const PIXEL_CONCRETE_IDS = PIXEL_LEGACY.map((b) => b.block);
  const BGM_TRACKS = [
    { id: 'lilypad', name: 'Lilypad', composer: 'Amos Roddy / Minecraft', desc: 'Minecraft 官方录音', src: 'assets/audio/lilypad.mp3', duration: 235.875 },
    { id: 'os-piano', name: "O's Piano", composer: 'Amos Roddy / Minecraft', desc: 'Minecraft 官方录音', src: 'assets/audio/os-piano.mp3', duration: 275.125 },
    { id: 'bromeliad', name: 'Bromeliad', composer: 'Aaron Cherof / Minecraft', desc: 'Minecraft 官方录音', src: 'assets/audio/bromeliad.mp3', duration: 312.279 },
    { id: 'aerie', name: 'Aerie', composer: 'Lena Raine / Minecraft', desc: 'Minecraft 官方录音', src: 'assets/audio/aerie.mp3', duration: 296.787 }
  ];
  const KEY_CUSTOM_MUSIC_NAME = 'szyj.customMusicName.v1';
  const PAGE_META = {
    home: { title: '首页', desc: '世界织卷 · MC 指令与资源工具箱', icon: 'home' },
    launchers: { title: '启动器', desc: 'PCL2、HMCL、安卓与 Java 启动器', icon: 'rocket' },
    resources: { title: '资源', desc: '我的世界资源网站导航', icon: 'chest' },
    box: { title: '百宝箱', desc: '指令速查、复杂指令、方块编号与实用工具', icon: 'box' },
    mine: { title: '我的', desc: '账号、皮肤与设置', icon: 'user' }
  };

  /* ---------------- 本地存储 ---------------- */
  const KEY_SESSION = 'szyj.session.v1';
  const KEY_SETTINGS = 'szyj.settings.v1';
  const KEY_HISTORY = 'szyj.history.v1';
  const KEY_EXPORT_PATH = 'szyj.exportPath.v1';
  const EXPORT_PATH_DEFAULT = '/storage/emulated/0/Download';
  const KEY_DAILY = 'szyj.daily.v1';
  const KEY_LOCAL_ACCOUNTS = 'szyj.localAccounts.v1';
  const KEY_LOCAL_SESSION = 'szyj.localSession.v1';
  const KEY_ACTIVITY = 'szyj.activity.v1';
  const KEY_PERMISSIONS = 'szyj.permissions.v1';
  const KEY_ROLE_DATA = 'szyj.roles.v1';
  const KEY_ROLE_SESSION = 'szyj.roleSession.v1';
  const KEY_ECONOMY_PREFIX = 'szyj.economy.v1.';
  const KEY_SHOP = 'szyj.shop.v1';
  const KEY_PLAYER_SHOP = 'szyj.playerShop.v1';
  const KEY_ACCOUNT_BACKUP = 'szyj.accountBackup.v1';
  const OWNER = {
    role: 'owner',
    username: 'Rushi_MC',
    qq: '3335750182',
    salt: 'ww-owner-2026',
    hash: 'f17da04047c5b566725970d07a9a5d54c5970835638111f9f8809723aea947f4'
  };
  const ROLE_LIMIT = { super: 10, admin: 50 };
  let historyTab = 'generate';
  let exportDirHandle = null;

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 隐私模式下忽略 */ }
    },
    del(key) {
      try { localStorage.removeItem(key); } catch { /* 忽略 */ }
    }
  };

  /* ---------------- 状态 ---------------- */
  const savedSettings = store.get(KEY_SETTINGS, {});
  const state = {
    tab: 'home',
    session: store.get(KEY_SESSION, null),
    settings: Object.assign({ theme: 'grass', sound: true, motion: true, notify: true, bgm: true, bgmTrack: 'lilypad', bgmVolume: 0.45, bgmPositions: {} }, savedSettings || {}),
    history: store.get(KEY_HISTORY, []),
    resourceFilter: 'all',
    resourceView: 'sites',
    resourceQuery: '',
    downloadCat: '全部',
    serverRegion: '全部',
    bedrockVersion: '1.21.50',
    boxMode: 'commands',
    commandMode: 'search',
    boxEdition: 'java',
    boxVersion: {
      java: '1.21.4',
      bedrock: '1.21.50'
    },
    boxCat: '全部',
    boxQuery: '',
    blockQuery: '',
    complexCat: '全部',
    complexQuery: '',
    complexCode: '',
    complexResult: null,
    exportPath: EXPORT_PATH_DEFAULT,
    storageFiles: [],
    storageFilter: 'apk',
    storagePath: EXPORT_PATH_DEFAULT,
    storageScanning: false,
    storageSource: 'native',
    daily: null,
    searchCursor: -1,
    searchResults: [],
    sheetOpen: false,
    sheetClosing: false,
    server: undefined,
    deviceApps: null,
    deviceScanning: false
  };

  const roleState = {
    data: loadRoleData(),
    session: store.get(KEY_ROLE_SESSION, null),
    tab: 'super'
  };
  const gmState = { tab: 'item' };
  const shopState = loadShopState();
  const playerShopState = loadPlayerShop();
  let economyState = null;
  let shopCategory = 'all';
  let shopView = 'official';
  const SHOP_ITEMS = [
    { id: 'frame-oak', type: 'frame', name: '橡木头像框', desc: '像刚砍下的原木一样温暖', priceGold: 120, frame: 'oak', icon: 'user' },
    { id: 'frame-gold', type: 'frame', name: '金锭头像框', desc: '低调的金色边框', priceGold: 180, frame: 'gold', icon: 'sparkle' },
    { id: 'frame-nether', type: 'frame', name: '下界头像框', desc: '熔岩与黑石的配色', priceGold: 260, frame: 'nether', icon: 'sparkle' },
    { id: 'frame-diamond', type: 'frame', name: '钻石头像框', desc: '清透的钻石蓝', priceGold: 320, frame: 'diamond', icon: 'sparkle' },
    { id: 'frame-ocean', type: 'frame', name: '海洋头像框', desc: '潮汐与海晶石', priceGold: 380, frame: 'ocean', icon: 'globe' },
    { id: 'frame-end', type: 'frame', name: '末地头像框', desc: '紫珀色的虚空回响', priceGold: 450, frame: 'end', icon: 'sparkle' },
    { id: 'frame-sakura', type: 'frame', name: '樱花头像框', desc: '春日限定的粉色花瓣', priceGold: 550, frame: 'sakura', icon: 'sparkle' },
    { id: 'frame-amethyst', type: 'frame', name: '紫水晶头像框', desc: '晶簇切面的微光', priceGold: 700, frame: 'amethyst', icon: 'sparkle' },
    { id: 'theme-sakura', type: 'theme', name: '樱花主题', desc: '粉色樱花与浅木色界面', priceGold: 600, theme: 'sakura', icon: 'palette' },
    { id: 'theme-amethyst', type: 'theme', name: '紫水晶主题', desc: '紫水晶与深紫夜色', priceGold: 700, theme: 'amethyst', icon: 'palette' },
    { id: 'theme-gold', type: 'theme', name: '黄金主题', desc: '金锭与暖金高光', priceGold: 800, theme: 'gold', icon: 'palette' },
    { id: 'theme-ice', type: 'theme', name: '冰霜主题', desc: '蓝冰与雪原冷光', priceGold: 900, theme: 'ice', icon: 'palette' },
    { id: 'title-wanderer', type: 'title', name: '称号·方块旅人', desc: '适合刚开始冒险的人', priceGold: 200, title: '方块旅人', icon: 'user' },
    { id: 'title-redstone', type: 'title', name: '称号·红石学徒', desc: '信号与中继器的学徒', priceGold: 300, title: '红石学徒', icon: 'sparkle' },
    { id: 'title-command', type: 'title', name: '称号·指令大师', desc: '让每一条命令准确落点', priceGold: 500, title: '指令大师', icon: 'terminal' },
    { id: 'title-weaver', type: 'title', name: '称号·世界织者', desc: '把方块编织成世界', priceGold: 800, title: '世界织者', icon: 'sparkle' },
    { id: 'title-night', type: 'title', name: '称号·星辉守夜人', desc: '在夜里守护方块世界', priceGold: 1200, title: '星辉守夜人', icon: 'sparkle' },
    { id: 'title-void', type: 'title', name: '称号·虚空漫游者', desc: '从末地边缘带回故事', priceGold: 1500, title: '虚空漫游者', icon: 'globe' },
    { id: 'name-card', type: 'namecard', name: '改名卡', desc: '第二次及以后改名使用', priceGold: 500, icon: 'key' },
    { id: 'xp-candy', type: 'xp', name: '经验糖果', desc: '使用后获得 50 EXP', priceGold: 300, exp: 50, icon: 'sparkle' },
    { id: 'admin-card', type: 'role', role: 'admin', name: '管理员权限卡', desc: '需要 LV.50 与 10 钻石，使用后获得管理员账号与登录密钥', priceDiamonds: 10, level: 50, icon: 'shield' },
    { id: 'super-card', type: 'role', role: 'super', name: '超级管理员权限卡', desc: '需要 LV.90 与 30 钻石，使用后获得超级管理员账号与安全密钥', priceDiamonds: 30, level: 90, icon: 'shield' }
  ];
  const SHOP_CATEGORIES = [
    { id: 'all', name: '全部' }, { id: 'frame', name: '头像框' }, { id: 'theme', name: '主题' },
    { id: 'title', name: '称号' }, { id: 'item', name: '道具' }, { id: 'role', name: '权限卡' }
  ];
  const EXTRACT_GEAR = (() => {
    const tiers = [
      { id: 'leather', name: '皮革', tier: 1, color: '#a87852' },
      { id: 'iron', name: '铁', tier: 2, color: '#c9d1d6' },
      { id: 'diamond', name: '钻石', tier: 3, color: '#65e6df' },
      { id: 'netherite', name: '下界合金', tier: 4, color: '#8b6cff' }
    ];
    const slots = [
      { id: 'helmet', name: '头盔', icon: 'shield', weight: 4 },
      { id: 'chest', name: '胸甲', icon: 'shield', weight: 6 },
      { id: 'legs', name: '护腿', icon: 'shield', weight: 5 },
      { id: 'boots', name: '靴子', icon: 'shield', weight: 3 },
      { id: 'sword', name: '剑', icon: 'terminal', weight: 5 },
      { id: 'bow', name: '弓', icon: 'globe', weight: 4 },
      { id: 'axe', name: '斧头', icon: 'box', weight: 5 }
    ];
    const list = [];
    tiers.forEach((tier) => {
      slots.forEach((slot) => {
        list.push({
          id: `${tier.id}-${slot.id}`,
          name: `${tier.name}${slot.name}`,
          slot: slot.id,
          slotName: slot.name,
          tier: tier.tier,
          color: tier.color,
          power: tier.tier * 8 + slot.weight,
          price: 160 + tier.tier * 220 + slot.weight * 10,
          icon: slot.icon
        });
      });
    });
    list.push({ id: 'totem', name: '不死图腾', slot: 'totem', slotName: '图腾', tier: 3, color: '#f4c44e', power: 12, price: 1200, icon: 'sparkle' });
    return list;
  })();
  const RESOURCE_DOWNLOADS = [
    { id: 'rlcraft', name: 'RLCraft', cat: '整合包', author: 'Shivaxi', version: '1.12.2', size: '2.1 GB', color: '#c75b39', mono: 'RL', desc: '硬核生存整合包，真实生存、龙与高难度怪物。', url: 'https://www.curseforge.com/minecraft/modpacks/rlcraft' },
    { id: 'atm10', name: 'All the Mods 10', cat: '整合包', author: 'ATM Team', version: '1.21', size: '4.8 GB', color: '#8b6cff', mono: 'ATM', desc: '大型科技 / 魔法整合包，任务线完整。', url: 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-10' },
    { id: 'better-mc', name: 'Better MC', cat: '整合包', author: 'Luna Pixel', version: '1.20.1', size: '3.2 GB', color: '#5abf7a', mono: 'BMC', desc: '优化与冒险并重的轻量整合包。', url: 'https://www.curseforge.com/minecraft/modpacks/better-mc-fabric-bmc1' },
    { id: 'dawncraft', name: 'DawnCraft', cat: '整合包', author: 'DawnCraft Team', version: '1.18.2', size: '3.6 GB', color: '#e0a84e', mono: 'DC', desc: '魂系战斗、探索与 RPG 任务整合包。', url: 'https://www.curseforge.com/minecraft/modpacks/dawn-craft' },
    { id: 'create-astral', name: 'Create: Astral', cat: '整合包', author: 'Create Astral', version: '1.18.2', size: '1.4 GB', color: '#57c7d4', mono: 'CA', desc: '机械动力 + 星空探索的科技整合包。', url: 'https://modrinth.com/modpack/create-astral' },
    { id: 'vault-hunters', name: 'Vault Hunters', cat: '整合包', author: 'Iskall', version: '1.18.2', size: '2.8 GB', color: '#8ada5a', mono: 'VH', desc: 'RPG 地牢、职业与随机词条装备。', url: 'https://www.curseforge.com/minecraft/modpacks/vault-hunters-1-18-2' },
    { id: 'sodium', name: 'Sodium', cat: '模组', author: 'CaffeineMC', version: '1.21.x', size: '1.2 MB', color: '#65e6df', mono: 'NA', desc: '大幅提升帧数的渲染优化模组。', url: 'https://modrinth.com/mod/sodium' },
    { id: 'iris', name: 'Iris Shaders', cat: '模组', author: 'Iris Team', version: '1.21.x', size: '8.5 MB', color: '#57d6e8', mono: 'IR', desc: '让 Sodium 支持光影的兼容层。', url: 'https://modrinth.com/mod/iris' },
    { id: 'jei', name: 'JEI', cat: '模组', author: 'mezz', version: '1.20.x', size: '1.5 MB', color: '#f0c35a', mono: 'JEI', desc: '物品与合成表查询，整合包必备。', url: 'https://modrinth.com/mod/jei' },
    { id: 'create', name: 'Create', cat: '模组', author: 'simibubi', version: '1.20.1', size: '12 MB', color: '#c7a35a', mono: 'CR', desc: '机械动力，用齿轮与传送带建造工厂。', url: 'https://modrinth.com/mod/create' },
    { id: 'ae2', name: 'Applied Energistics 2', cat: '模组', author: 'AlgorithmX2', version: '1.20.1', size: '9 MB', color: '#7ba9d8', mono: 'AE', desc: '数字存储与自动化网络。', url: 'https://modrinth.com/mod/ae2' },
    { id: 'twilight', name: 'Twilight Forest', cat: '模组', author: 'Benimatic', version: '1.20.1', size: '35 MB', color: '#7a5cc4', mono: 'TF', desc: '暮色森林维度与 Boss 冒险。', url: 'https://www.curseforge.com/minecraft/mc-mods/the-twilight-forest' },
    { id: 'complementary', name: 'Complementary Shaders', cat: '光影', author: 'EminGT', version: '1.21', size: '9 MB', color: '#6fb7e8', mono: 'CS', desc: '均衡画质与性能的经典光影。', url: 'https://www.complementary.dev/shaders' },
    { id: 'bsl', name: 'BSL Shaders', cat: '光影', author: 'capttatsu', version: '1.21', size: '2 MB', color: '#f0a35a', mono: 'BSL', desc: '温暖柔和的天空与光照。', url: 'https://bitslablab.com/bslshaders/' },
    { id: 'sildurs', name: "Sildur's Vibrant", cat: '光影', author: 'Sildur', version: '1.21', size: '1.5 MB', color: '#e85858', mono: 'SV', desc: '鲜艳色彩与轻量性能档位。', url: 'https://sildurs-shaders.github.io/' },
    { id: 'replay', name: 'Replay Mod', cat: '模组', author: 'ReplayMod', version: '1.21', size: '6 MB', color: '#b48cff', mono: 'RP', desc: '录制与回放游戏画面，制作视频素材。', url: 'https://www.replaymod.com/' },
    { id: 'fresh-animations', name: 'Fresh Animations', cat: '资源包', author: 'FreshLX', version: '1.21', size: '12 MB', color: '#8ada5a', mono: 'FA', desc: '让生物动作更自然的资源包。', url: 'https://modrinth.com/resourcepack/fresh-animations' },
    { id: 'stay-true', name: 'Stay True', cat: '资源包', author: 'FredBob', version: '1.21', size: '8 MB', color: '#6fa8dc', mono: 'ST', desc: '保留原版风格的高清材质。', url: 'https://www.curseforge.com/minecraft/texture-packs/stay-true' },
    { id: 'faithful', name: 'Faithful 32x', cat: '资源包', author: 'Faithful Team', version: '1.21', size: '6 MB', color: '#c9d1d6', mono: 'F32', desc: '32× 原版风格高清材质。', url: 'https://faithfulpack.net/' },
    { id: 'bare-bones', name: 'Bare Bones', cat: '资源包', author: 'Pac', version: '1.21', size: '5 MB', color: '#d6b77a', mono: 'BB', desc: '极简宣传片风格材质包。', url: 'https://www.curseforge.com/minecraft/texture-packs/bare-bones-texture-pack' }
  ];

  const RESOURCE_SERVERS = [
    { name: 'Minecraft 官方服务器', region: '国外', ip: 'play.minecraft.net', version: '1.21', players: '20k+', ping: 32, level: 'A', desc: 'Mojang 官方服务器与活动入口。', color: '#7ddc75' },
    { name: 'Hypixel', region: '国外', ip: 'mc.hypixel.net', version: '1.8–1.21', players: '50k+', ping: 180, level: 'A', desc: '全球最大小游戏服务器。', color: '#f0c35a' },
    { name: 'The Hive', region: '国外', ip: 'play.hivemc.com', version: '1.20+', players: '8k+', ping: 160, level: 'B+', desc: '小游戏与派对服务器。', color: '#f0a35a' },
    { name: 'Mineplex', region: '国外', ip: 'us.mineplex.com', version: '1.8–1.20', players: '2k+', ping: 150, level: 'B', desc: '经典小游戏与冒险地图。', color: '#65e6df' },
    { name: 'CubeCraft', region: '国外', ip: 'play.cubecraft.net', version: '1.20+', players: '4k+', ping: 140, level: 'B+', desc: 'Bedrock / Java 小游戏服务器。', color: '#57d6e8' },
    { name: '2B2T', region: '国外', ip: 'connect.2b2t.org', version: '1.21', players: '1k+', ping: 210, level: 'C', desc: '无政府生存服务器，注意风险。', color: '#ef7474' },
    { name: '花雨庭', region: '国内', ip: 'play.huayuting.com', version: '1.8–1.21', players: '10k+', ping: 38, level: 'A', desc: '国内综合小游戏服务器。', color: '#f3a6c8' },
    { name: 'EC 服务器', region: '国内', ip: 'play.ecraft.net', version: '1.12–1.21', players: '5k+', ping: 45, level: 'A', desc: '生存、空岛与小游戏。', color: '#8ada5a' },
    { name: 'MCBBS 服务器', region: '国内', ip: 'mc.mcbbs.net', version: '1.20+', players: '3k+', ping: 52, level: 'B+', desc: '社区联机与整合包服务器。', color: '#6fa8dc' },
    { name: '星空服务器', region: '国内', ip: 'play.xingkong.net', version: '1.16–1.21', players: '2k+', ping: 48, level: 'B+', desc: 'RPG 与空岛生存。', color: '#b48cff' },
    { name: '猫窝服务器', region: '国内', ip: 'play.maowo.fun', version: '1.20+', players: '1k+', ping: 60, level: 'B', desc: '休闲生存与建筑。', color: '#f0c35a' },
    { name: '云梦服务器', region: '国内', ip: 'mc.yunmeng.fun', version: '1.12–1.21', players: '800+', ping: 66, level: 'B', desc: '生存、RPG 与副本。', color: '#57c7d4' }
  ];

  const EXTRACT_MAPS = {
    normal: { name: '普通地图', desc: '低战力 · 不掉装备 · 掉落背包物品', color: '#7ddc75', boss: 0.05, mini: 0.16, mult: 1, power: 0 },
    advanced: { name: '进阶地图', desc: '中战力 · 随机掉落装备', color: '#f0c35a', boss: 0.12, mini: 0.28, mult: 1.35, power: 40 },
    hard: { name: '困难地图', desc: '高战力 · 装备与物品全掉', color: '#ef7474', boss: 0.24, mini: 0.4, mult: 1.8, power: 80 }
  };

  /* 复杂指令编辑器：补全与防抖检查的临时状态 */
  const complex = {
    suggestIndex: 0,
    suggestRange: { start: 0, end: 0 },
    suggestItems: [],
    timer: null
  };

  const friendState = {
    list: [],
    active: null,
    messages: [],
    timer: null,
    loading: false
  };

  const permissionState = {
    status: {},
    busy: false,
    opened: false,
    source: window.WWShell ? 'native' : 'browser'
  };

  /* 像素画工具状态 */
  const pixel = {
    size: 256,
    grid: new Uint16Array(0),
    source: null,
    enabled: new Set(PIXEL_CONCRETE_IDS.map((id) => PIXEL_BY_BLOCK[id]).filter(Boolean)),
    paletteGroup: 'recommended',
    paletteQuery: '',
    paletteLimit: 120,
    dither: false
  };
  let pixelResizeTimer = null;
  let pixelPaletteTimer = null;
  let dotResizeTimer = null;

  const login = {
    method: 'account',
    mode: 'login',
    accountView: 'offline',
    showOfficial: false,
    allowBack: true,
    skinId: 'steve',
    submitting: false,
    countdown: 0,
    codeTimer: null,
    ms: null,
    msTimer: null
  };

  /* ---------------- 音效 ---------------- */
  let audioCtx = null;
  let bgmCtx = null;
  let bgmSource = null;
  let bgmGain = null;
  let bgmAudio = null;
  let bgmUiTimer = null;
  let bgmSaveTimer = null;
  let bgmBufferCache = new Map();
  let bgmOffset = 0;
  let bgmStartAt = 0;
  let bgmDuration = 0;
  let bgmPlaying = false;
  let bgmCurrentTrackId = '';
  let customMusicBlob = null;

  function ensureAudio() {
    if (!state.settings.sound) return null;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch { return null; }
  }
  function tone(ctx, freq, delay, dur, type, vol) {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfx(kind) {
    const ctx = ensureAudio();
    if (!ctx) return;
    if (kind === 'success') {
      tone(ctx, 523.25, 0, 0.1, 'triangle', 0.035);
      tone(ctx, 659.25, 0.09, 0.1, 'triangle', 0.035);
      tone(ctx, 783.99, 0.18, 0.2, 'triangle', 0.04);
    } else if (kind === 'error') {
      tone(ctx, 196, 0, 0.08, 'square', 0.025);
      tone(ctx, 146, 0.08, 0.12, 'square', 0.025);
    } else if (kind === 'tab') {
      tone(ctx, 392, 0, 0.045, 'triangle', 0.02);
      tone(ctx, 587.33, 0.04, 0.055, 'triangle', 0.02);
    } else if (kind === 'open') {
      tone(ctx, 329.63, 0, 0.045, 'triangle', 0.018);
      tone(ctx, 493.88, 0.045, 0.06, 'triangle', 0.018);
    } else {
      tone(ctx, 520, 0, 0.04, 'square', 0.012);
    }
  }

  /* ---------------- 背景音乐 ---------------- */
  function bgmTrackById(id) {
    return BGM_TRACKS.find((t) => t.id === id) || BGM_TRACKS[0];
  }

  function bgmTrackLabel() {
    if (!state.settings.bgm) return '已关闭';
    if (state.settings.bgmTrack === 'custom') return customMusicBlob ? '自定义音乐' : '自定义（待导入）';
    return bgmTrackById(state.settings.bgmTrack).name;
  }

  function bgmVolumeValue() {
    const value = Number(state.settings.bgmVolume);
    return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0.45));
  }

  function ensureBgmCtx() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!bgmCtx) bgmCtx = new Ctx();
      if (bgmCtx.state === 'suspended') bgmCtx.resume();
      return bgmCtx;
    } catch { return null; }
  }

  function bgmTrackDuration(track) {
    if (track && Number(track.duration) > 0) return Number(track.duration);
    const beat = 60 / (track.bpm || 60);
    const melody = (track.notes || []).reduce((sum, n) => sum + n[1], 0) * beat;
    const bass = (track.bass || []).reduce((sum, n) => sum + n[1], 0) * beat;
    return Math.max(8, melody, bass);
  }

  function buildBgmBuffer(track) {
    if (bgmBufferCache.has(track.id)) return bgmBufferCache.get(track.id);
    const ctx = ensureBgmCtx();
    if (!ctx) return null;
    const rate = 22050;
    const duration = bgmTrackDuration(track);
    const length = Math.ceil(duration * rate);
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const beat = 60 / (track.bpm || 60);

    const addNote = (midi, start, dur, volume, pan) => {
      const from = Math.max(0, Math.floor(start * rate));
      const to = Math.min(length, Math.ceil((start + dur) * rate));
      if (to <= from) return;
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      const attack = Math.min(0.08, dur * 0.25);
      const release = Math.min(0.22, dur * 0.45);
      const lGain = volume * (1 - Math.max(0, pan) * 0.55);
      const rGain = volume * (1 + Math.min(0, pan) * 0.55);
      for (let i = from; i < to; i++) {
        const t = i / rate - start;
        let env = 1;
        if (t < attack) env = t / attack;
        if (dur - t < release) env = Math.min(env, Math.max(0, (dur - t) / release));
        if (env <= 0) continue;
        const sample = (Math.sin(Math.PI * 2 * freq * t) + 0.18 * Math.sin(Math.PI * 4 * freq * t)) * env;
        left[i] += sample * lGain;
        right[i] += sample * rGain;
      }
    };

    let cursor = 0;
    (track.notes || []).forEach(([midi, beats]) => {
      addNote(midi, cursor, beats * beat * 0.9, 0.20, 0.12);
      cursor += beats * beat;
    });
    cursor = 0;
    (track.bass || []).forEach(([midi, beats]) => {
      addNote(midi, cursor, beats * beat * 0.96, 0.14, -0.15);
      cursor += beats * beat;
    });
    for (let i = 0; i < length; i++) {
      left[i] = Math.max(-0.95, Math.min(0.95, left[i]));
      right[i] = Math.max(-0.95, Math.min(0.95, right[i]));
    }
    bgmBufferCache.set(track.id, buffer);
    return buffer;
  }

  function bgmPositionFor(id) {
    const map = state.settings.bgmPositions || {};
    const value = Number(map[id]);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function saveBgmPosition(position, id = state.settings.bgmTrack) {
    if (!id) return;
    if (!state.settings.bgmPositions) state.settings.bgmPositions = {};
    state.settings.bgmPositions[id] = Math.max(0, Number(position) || 0);
    saveSettings();
  }

  function currentBgmPosition() {
    if (bgmAudio) return Number(bgmAudio.currentTime) || 0;
    if (!bgmPlaying || !bgmCtx) return bgmOffset;
    const duration = bgmDuration || 1;
    return (bgmOffset + (bgmCtx.currentTime - bgmStartAt)) % duration;
  }

  function currentBgmDuration() {
    if (bgmAudio) return Number.isFinite(bgmAudio.duration) ? bgmAudio.duration : 0;
    if (bgmDuration) return bgmDuration;
    return bgmTrackDuration(bgmTrackById(state.settings.bgmTrack));
  }

  function startBgmSaveTicker() {
    if (bgmSaveTimer) return;
    bgmSaveTimer = setInterval(() => {
      if (bgmPlaying) saveBgmPosition(currentBgmPosition());
    }, 10000);
  }

  function stopBgmSaveTicker() {
    if (bgmSaveTimer) {
      clearInterval(bgmSaveTimer);
      bgmSaveTimer = null;
    }
  }

  function startBgmUiTicker() {
    if (bgmUiTimer) clearInterval(bgmUiTimer);
    bgmUiTimer = setInterval(() => {
      if (!$('#bgmProgress')) {
        clearInterval(bgmUiTimer);
        bgmUiTimer = null;
        return;
      }
      updateBgmUi();
    }, 500);
  }

  function formatBgmTime(seconds) {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(value / 60);
    const s = String(value % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateBgmUi() {
    const bar = $('#bgmProgress');
    if (!bar) return;
    const duration = currentBgmDuration();
    const position = currentBgmPosition();
    bar.max = String(Math.max(1, Math.round(duration)));
    if (document.activeElement !== bar) bar.value = String(Math.min(duration, position));
    const time = $('#bgmTime');
    if (time) time.textContent = `${formatBgmTime(position)} / ${formatBgmTime(duration)}`;
  }

  function stopSource() {
    if (bgmSource) {
      try { bgmSource.stop(); } catch { /* ignore */ }
      bgmSource = null;
    }
    bgmGain = null;
  }

  function pauseBgm() {
    const wasPlaying = bgmPlaying || !!bgmAudio;
    const position = currentBgmPosition();
    const trackId = bgmCurrentTrackId || state.settings.bgmTrack;
    stopSource();
    if (bgmAudio) {
      try { bgmAudio.pause(); } catch { /* ignore */ }
    }
    bgmPlaying = false;
    bgmOffset = position;
    stopBgmSaveTicker();
    if (wasPlaying) saveBgmPosition(position, trackId);
    updateBgmUi();
  }

  function stopBgm() {
    pauseBgm();
    if (bgmAudio) {
      try { bgmAudio.pause(); } catch { /* ignore */ }
      if (bgmAudio._wwUrl) URL.revokeObjectURL(bgmAudio._wwUrl);
      bgmAudio = null;
    }
    bgmSource = null;
    bgmGain = null;
    bgmCurrentTrackId = '';
  }

  function playAudioFileAt(src, offset, trackId) {
    if (!src) return;
    try {
      stopSource();
      if (bgmAudio) {
        try { bgmAudio.pause(); } catch { /* ignore */ }
        if (bgmAudio._wwUrl) URL.revokeObjectURL(bgmAudio._wwUrl);
      }
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = bgmVolumeValue();
      bgmAudio = audio;
      bgmOffset = Math.max(0, Number(offset) || 0);
      bgmDuration = 0;
      bgmPlaying = true;
      bgmCurrentTrackId = trackId;
      startBgmSaveTicker();
      const seek = () => {
        if (bgmOffset > 0 && Number.isFinite(audio.duration)) {
          try { audio.currentTime = Math.min(bgmOffset, Math.max(0, audio.duration - 0.25)); } catch { /* ignore */ }
        }
        updateBgmUi();
      };
      audio.addEventListener('loadedmetadata', seek, { once: true });
      audio.addEventListener('error', () => {
        if (bgmCurrentTrackId !== trackId) return;
        toast('内置音乐文件加载失败，可在「背景音乐」中重新导入音频', 'error', 4200);
      }, { once: true });
      const play = audio.play();
      if (play && typeof play.catch === 'function') {
        play.catch(() => {
          // 浏览器自动播放限制：等用户下一次点击页面再继续
          if (bgmCurrentTrackId === trackId) toast('点击页面后继续播放背景音乐', 'info', 2600);
        });
      }
    } catch {
      toast('背景音乐播放失败，请检查音频文件', 'warn');
    }
  }

  function playBufferAt(track, offset) {
    if (!track) return;
    playAudioFileAt(track.src, offset, track.id);
  }

  function playCustomAt(offset) {
    if (!customMusicBlob) return;
    try {
      stopSource();
      if (bgmAudio) {
        try { bgmAudio.pause(); } catch { /* ignore */ }
        if (bgmAudio._wwUrl) URL.revokeObjectURL(bgmAudio._wwUrl);
      }
      const url = URL.createObjectURL(customMusicBlob);
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = bgmVolumeValue();
      audio._wwUrl = url;
      bgmAudio = audio;
      bgmOffset = Math.max(0, Number(offset) || 0);
      bgmDuration = 0;
      bgmPlaying = true;
      bgmCurrentTrackId = 'custom';
      startBgmSaveTicker();
      const seek = () => {
        if (bgmOffset > 0 && Number.isFinite(audio.duration)) {
          try { audio.currentTime = Math.min(bgmOffset, Math.max(0, audio.duration - 0.2)); } catch { /* ignore */ }
        }
        updateBgmUi();
      };
      audio.addEventListener('loadedmetadata', seek, { once: true });
      const play = audio.play();
      if (play && typeof play.catch === 'function') {
        play.catch(() => toast('音乐需要点击页面后才能播放', 'info', 3000));
      }
    } catch {
      toast('自定义音乐播放失败，已切回内置音乐', 'warn');
      state.settings.bgmTrack = 'lilypad';
      applyBgm();
    }
  }

  function applyBgm() {
    stopBgm();
    if (!state.settings.bgm) return;
    const trackId = state.settings.bgmTrack;
    const position = bgmPositionFor(trackId);
    if (trackId === 'custom' && customMusicBlob) {
      playCustomAt(position);
    } else {
      playBufferAt(bgmTrackById(trackId), position);
    }
    startBgmUiTicker();
  }

  function setBgmTrack(id) {
    stopBgm();
    state.settings.bgmTrack = id === 'custom' ? 'custom' : bgmTrackById(id).id;
    state.settings.bgm = true;
    saveSettings();
    applyBgm();
    if (state.sheetOpen && $('#bgmTracks')) openBgmSheet();
    toast(`背景音乐：${bgmTrackLabel()}`, 'success', 2200);
  }

  function setBgmVolume(value) {
    state.settings.bgmVolume = Math.max(0, Math.min(1, Number(value) / 100));
    saveSettings();
    if (bgmAudio) bgmAudio.volume = bgmVolumeValue();
    if (bgmGain) bgmGain.gain.value = bgmVolumeValue();
    updateBgmUi();
  }

  function setBgmPosition(value) {
    const duration = currentBgmDuration();
    const position = Math.max(0, Math.min(duration || 0, Number(value) || 0));
    if (bgmAudio) {
      try { bgmAudio.currentTime = position; } catch { /* ignore */ }
      bgmOffset = position;
    } else {
      const track = bgmTrackById(state.settings.bgmTrack);
      bgmOffset = position;
      if (state.settings.bgm) playBufferAt(track, position);
    }
    saveBgmPosition(position);
    updateBgmUi();
  }

  function openBgmSheet() {
    const current = state.settings.bgmTrack;
    const tracks = BGM_TRACKS.map((track) => `
      <button class="bgm-track ${current === track.id ? 'is-active' : ''}" type="button" data-bgm-track="${esc(track.id)}">
        <span class="bgm-track-ico">${SVG('sound')}</span>
        <span class="bgm-track-main"><b>${esc(track.name)}</b><small>${esc(track.composer || '')} · ${esc(track.desc)}</small></span>
        <span class="bgm-check">${current === track.id ? SVG('check') : ''}</span>
      </button>`).join('');
    const custom = customMusicBlob ? `
      <button class="bgm-track ${current === 'custom' ? 'is-active' : ''}" type="button" data-bgm-track="custom">
        <span class="bgm-track-ico">${SVG('download')}</span>
        <span class="bgm-track-main"><b>${esc(customMusicName() || '自定义音乐')}</b><small>已导入 · 本地音频</small></span>
        <span class="bgm-check">${current === 'custom' ? SVG('check') : ''}</span>
      </button>` : '';
    const duration = currentBgmDuration();
    const position = Math.min(currentBgmPosition(), duration || 0);
    openSheet(`
      <div class="bgm-progress-card">
        <div class="bgm-progress-top">
          <span><b>播放进度</b><small>可拖动调整</small></span>
          <span class="mono" id="bgmTime">${formatBgmTime(position)} / ${formatBgmTime(duration)}</span>
        </div>
        <input id="bgmProgress" type="range" min="0" max="${Math.max(1, Math.round(duration))}" step="1" value="${Math.round(position)}" aria-label="背景音乐播放进度">
      </div>
      <div class="settings-card">
        ${toggleRowHTML('bgm', 'sound', 'c-green', '背景音乐', 'Minecraft 官方录音 / 自定义音频')}
      </div>
      <div class="bgm-volume-row">
        <span class="field-label"><span>音量</span><small>${Math.round(bgmVolumeValue() * 100)}%</small></span>
        <input id="bgmVolume" type="range" min="0" max="100" step="1" value="${Math.round(bgmVolumeValue() * 100)}" aria-label="背景音乐音量">
      </div>
      <div class="bgm-track-list" id="bgmTracks">
        ${tracks}
        ${custom}
      </div>
      <div class="bgm-actions">
        <button class="btn btn-primary btn-sm" type="button" data-action="import-bgm">${SVG('download')}导入音乐</button>
        ${customMusicBlob ? `<button class="btn btn-ghost btn-sm" type="button" data-action="remove-bgm">删除自定义</button>` : ''}
      </div>
      <input type="file" id="bgmFile" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus" hidden>
      <p class="download-note">内置 Lilypad / O's Piano / Bromeliad / Aerie 四首随 APP 打包的音频，离线播放；支持导入 MP3 / WAV / OGG / M4A / AAC / FLAC 等浏览器可播放格式，导入文件保存在本机 IndexedDB，不会上传。</p>
    `, { title: '背景音乐', sub: '进度 / 开关 / 切换 / 导入音乐' });
    const file = $('#bgmFile');
    if (file) file.addEventListener('change', () => {
      importBgmFile(file.files && file.files[0]);
      file.value = '';
    });
    startBgmUiTicker();
    updateBgmUi();
  }

  function customMusicName() {
    try { return localStorage.getItem(KEY_CUSTOM_MUSIC_NAME) || ''; } catch { return ''; }
  }

  async function importBgmFile(file) {
    if (!file) return;
    const ext = /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba|webm)$/i;
    if (!(String(file.type || '').startsWith('audio/') || ext.test(file.name))) {
      toast('只支持音频文件（MP3 / WAV / OGG / M4A / AAC / FLAC 等）', 'error', 4200);
      return;
    }
    customMusicBlob = file;
    try { localStorage.setItem(KEY_CUSTOM_MUSIC_NAME, file.name.replace(/\.[a-z0-9]+$/i, '')); } catch { /* ignore */ }
    await idbSet('customMusic', file);
    state.settings.bgmTrack = 'custom';
    state.settings.bgm = true;
    state.settings.bgmPositions = state.settings.bgmPositions || {};
    state.settings.bgmPositions.custom = 0;
    saveSettings();
    applyBgm();
    openBgmSheet();
    toast(`已导入音乐：${file.name}`, 'success', 3600);
  }

  async function removeCustomMusic() {
    customMusicBlob = null;
    try { localStorage.removeItem(KEY_CUSTOM_MUSIC_NAME); } catch { /* ignore */ }
    await idbDelete('customMusic');
    if (state.settings.bgmTrack === 'custom') state.settings.bgmTrack = 'lilypad';
    saveSettings();
    applyBgm();
    openBgmSheet();
    toast('已删除自定义音乐', 'success');
  }

  async function restoreCustomMusic() {
    try {
      const blob = await idbGet('customMusic');
      if (blob instanceof Blob) {
        customMusicBlob = blob;
        if (state.settings.bgm && state.settings.bgmTrack === 'custom') applyBgm();
      }
    } catch { /* ignore */ }
  }

  /* ---------------- 通用工具 ---------------- */
  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function makeUid(seed) {
    const a = hashString(seed + '|weave|1').toString(16).padStart(8, '0').toUpperCase();
    const b = hashString(seed + '|weave|2').toString(16).padStart(8, '0').toUpperCase();
    return 'WJ-' + a.slice(0, 4) + '-' + b.slice(0, 4);
  }
  function skinById(id) {
    return DATA.skins.find(s => s.id === id) || DATA.skins[0];
  }
  function skinForSeed(seed) {
    return DATA.skins[hashString(seed || 'seed') % DATA.skins.length].id;
  }
  function methodLabel(method) {
    return METHOD_LABEL[method] || '账号';
  }
  function themeById(id) {
    return DATA.themes.find(t => t.id === id) || DATA.themes[0];
  }
  function hostOf(url) {
    try { return new URL(url).host; } catch { return url; }
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function copyText(text, notify = true) {
    const done = () => { if (notify) toast('已复制到剪贴板', 'success'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function openBrowserLink(url, forceOpen = false) {
    const link = String(url || '');
    if (!/^https?:\/\//i.test(link)) {
      if (typeof WW.openExternal === 'function') WW.openExternal(link);
      return;
    }
    copyText(link, false);
    let isQuark = false;
    let isAuth = false;
    try {
      const host = new URL(link).hostname;
      isQuark = /(^|\.)pan\.quark\.cn$/i.test(host);
      isAuth = /(^|\.)(microsoftonline\.com|microsoft\.com|live\.com)$/i.test(host);
    } catch { /* ignore */ }
    if (forceOpen || isQuark || isAuth) {
      toast('链接已复制，正在用手机浏览器打开；若未跳转，请到浏览器粘贴打开', 'info', 4600);
      if (typeof WW.openExternal === 'function') WW.openExternal(link);
    } else {
      toast('链接已复制，请到手机浏览器粘贴打开', 'info', 4200);
    }
  }
  function fallbackCopy(text, done) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (ok) done(); else toast('复制失败，请手动选择文本', 'error');
    } catch { toast('复制失败，请手动选择文本', 'error'); }
  }

  /* ---------------- 权限门 / 存储 ---------------- */
  const PERMISSION_ITEMS = [
    { id: 'storage', icon: 'download', name: '存储 / 文件', desc: '读取下载目录、APK 文件并写入导出文件', required: true },
    { id: 'notifications', icon: 'bell', name: '通知', desc: '版本更新、任务与好友消息提醒', required: true },
    { id: 'camera', icon: 'shield', name: '相机', desc: '扫描二维码或拍摄图片', required: true },
    { id: 'microphone', icon: 'sound', name: '麦克风', desc: '语音输入与音频相关功能', required: true },
    { id: 'packages', icon: 'box', name: '已安装应用', desc: '扫描本机启动器与 Minecraft 客户端', required: true }
  ];

  function permissionBool(value) {
    return value === true || value === 1 || value === '1'
      || value === 'granted' || value === 'allowed' || value === 'yes';
  }

  function normalizePermissionStatus(raw) {
    const out = {};
    if (!raw) return out;
    if (permissionBool(raw.granted) || permissionBool(raw.allGranted)) {
      PERMISSION_ITEMS.forEach((item) => { out[item.id] = true; });
      return out;
    }
    const aliases = {
      storage: ['storage', 'files', 'file', 'externalStorage', 'manageExternalStorage'],
      notifications: ['notifications', 'notification', 'postNotifications'],
      camera: ['camera'],
      microphone: ['microphone', 'mic', 'recordAudio'],
      packages: ['packages', 'installedApps', 'packageVisibility', 'queryAllPackages']
    };
    PERMISSION_ITEMS.forEach((item) => {
      const keys = aliases[item.id] || [item.id];
      for (const key of keys) {
        if (raw[key] !== undefined) { out[item.id] = permissionBool(raw[key]); break; }
      }
    });
    return out;
  }

  async function nativePermissionStatus() {
    if (!window.WWShell) return null;
    const fn = window.WWShell.getPermissionStatus || window.WWShell.checkPermissions;
    if (typeof fn !== 'function') return null;
    try {
      const raw = await fn();
      if (!raw) return null;
      const normalized = normalizePermissionStatus(raw);
      return Object.keys(normalized).length ? normalized : null;
    } catch { return null; }
  }

  async function requestNativePermissions() {
    if (!window.WWShell) return {};
    const allFn = window.WWShell.requestAllPermissions || window.WWShell.requestAppPermissions;
    if (typeof allFn === 'function') {
      try {
        const raw = await allFn();
        if (raw && typeof raw === 'object') return normalizePermissionStatus(raw);
      } catch { /* 继续逐个申请 */ }
    }
    const result = {};
    const call = async (names, fallback) => {
      for (const name of names) {
        const fn = window.WWShell[name];
        if (typeof fn === 'function') {
          try {
            const value = await fn();
            return value === false ? false : true;
          } catch { return false; }
        }
      }
      return fallback;
    };
    result.storage = await call(['requestStoragePermission', 'ensureStoragePermission'], true);
    result.notifications = await call(['requestNotificationPermission'], true);
    result.camera = await call(['requestCameraPermission'], true);
    result.microphone = await call(['requestMicrophonePermission'], true);
    result.packages = await call(['requestPackagePermission', 'requestInstalledAppsPermission'], true);
    return result;
  }

  function permissionStatusHTML() {
    const browser = permissionState.source !== 'native' || !window.WWShell;
    return PERMISSION_ITEMS.map((item) => {
      const status = permissionState.status[item.id];
      const granted = browser || status === true;
      const denied = !browser && status === false;
      const label = browser ? '浏览器托管' : granted ? '已允许' : denied ? '未允许' : '待申请';
      const cls = granted ? 'is-ok' : denied ? 'is-bad' : 'is-pending';
      return `
        <div class="permission-item ${cls}">
          <span class="permission-ico">${SVG(item.icon)}</span>
          <span class="permission-main"><b>${esc(item.name)}</b><small>${esc(item.desc)}</small></span>
          <span class="permission-state">${label}</span>
        </div>`;
    }).join('');
  }

  function renderPermissionGate() {
    const list = $('#permissionList');
    if (list) list.innerHTML = permissionStatusHTML();
    const err = $('#permissionError');
    if (err && permissionState.source === 'native' && window.WWShell && !PERMISSION_ITEMS.every((i) => permissionState.status[i.id] === true)) {
      err.textContent = '必须允许全部权限后才能使用 APP；如果系统已拒绝，请打开系统设置手动开启后重试。';
    }
    const settingsBtn = $('#permissionSettings');
    if (settingsBtn) settingsBtn.hidden = permissionState.source !== 'native' || !window.WWShell;
  }

  function openPermissionGate() {
    const layer = $('#permissionLayer');
    if (!layer) return;
    permissionState.opened = true;
    layer.hidden = false;
    layer.classList.add('is-open');
    $('#permissionAgree').checked = false;
    $('#permissionAllow').disabled = true;
    $('#permissionAllow').textContent = '允许全部并进入 APP';
    $('#permissionError').textContent = '';
    permissionState.source = window.WWShell ? 'native' : 'browser';
    renderPermissionGate();
    const app = $('#app');
    if (app) app.setAttribute('inert', '');
    setTimeout(() => $('#permissionAllow').focus({ preventScroll: true }), 120);
  }

  function closePermissionGate() {
    const layer = $('#permissionLayer');
    if (!layer) return;
    layer.classList.add('is-closing');
    setTimeout(() => {
      layer.hidden = true;
      layer.classList.remove('is-open', 'is-closing');
      permissionState.opened = false;
      const app = $('#app');
      if (app) app.removeAttribute('inert');
    }, 220);
  }

  async function showPermissionGateIfNeeded() {
    if (permissionState.opened) return;
    const saved = store.get(KEY_PERMISSIONS, {});
    const status = await nativePermissionStatus();
    if (status) {
      permissionState.status = Object.assign({}, permissionState.status, status);
      permissionState.source = 'native';
      const all = PERMISSION_ITEMS.every((item) => permissionState.status[item.id] === true);
      if (all && saved && saved.accepted) return;
      openPermissionGate();
      return;
    }
    permissionState.source = window.WWShell ? 'native' : 'browser';
    if (saved && saved.accepted) return;
    openPermissionGate();
  }

  async function allowPermissionsAndEnter() {
    if (permissionState.busy) return;
    const agree = $('#permissionAgree');
    if (!agree || !agree.checked) {
      $('#permissionError').textContent = '请先阅读并勾选权限说明';
      return;
    }
    permissionState.busy = true;
    const btn = $('#permissionAllow');
    if (btn) { btn.disabled = true; btn.textContent = '正在申请系统权限…'; }
    try {
      if (window.WWShell && permissionState.source === 'native') {
        const result = await requestNativePermissions();
        permissionState.status = Object.assign({}, permissionState.status, result);
        PERMISSION_ITEMS.forEach((item) => {
          if (permissionState.status[item.id] === undefined) permissionState.status[item.id] = true;
        });
      } else {
        PERMISSION_ITEMS.forEach((item) => { permissionState.status[item.id] = true; });
      }
      renderPermissionGate();
      const denied = PERMISSION_ITEMS.filter((item) => permissionState.status[item.id] !== true);
      if (denied.length) {
        $('#permissionError').textContent = '以下权限未允许，无法进入 APP：' + denied.map((i) => i.name).join('、') + '。请到系统设置开启后重试。';
        if (btn) { btn.disabled = false; btn.textContent = '重新申请权限'; }
        return;
      }
      store.set(KEY_PERMISSIONS, { accepted: true, at: Date.now(), status: permissionState.status });
      await refreshDownloadPath(false);
      closePermissionGate();
      toast('权限已允许，欢迎进入世界织卷', 'success', 3200);
      sfx('success');
    } catch (err) {
      $('#permissionError').textContent = (err && err.message) || '权限申请失败，请到系统设置手动开启';
      if (btn) { btn.disabled = false; btn.textContent = '重新申请权限'; }
    } finally {
      permissionState.busy = false;
    }
  }

  function openAppSettings() {
    if (window.WWShell && typeof window.WWShell.openAppSettings === 'function') {
      try { window.WWShell.openAppSettings(); return; } catch { /* 回退 */ }
    }
    toast('请到系统设置 → 应用 → 世界织卷 → 权限，手动开启全部权限', 'info', 6000);
  }

  function normalizeStoragePath(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.replace(/\\/g, '/').replace(/\/+$/, '') || EXPORT_PATH_DEFAULT;
  }

  async function readDownloadPath() {
    if (!window.WWShell) return EXPORT_PATH_DEFAULT;
    const fn = window.WWShell.getDownloadPath || window.WWShell.getDownloadsPath
      || window.WWShell.getDownloadDir || window.WWShell.getStoragePaths;
    if (typeof fn !== 'function') return EXPORT_PATH_DEFAULT;
    try {
      const result = await fn();
      if (typeof result === 'string') return normalizeStoragePath(result) || EXPORT_PATH_DEFAULT;
      if (result && typeof result === 'object') {
        return normalizeStoragePath(result.download || result.downloads || result.downloadPath || result.path)
          || EXPORT_PATH_DEFAULT;
      }
    } catch { /* 回退 */ }
    return EXPORT_PATH_DEFAULT;
  }

  async function refreshDownloadPath(notify = true) {
    const path = await readDownloadPath();
    state.exportPath = path;
    state.storagePath = path;
    rememberExportPath(path);
    const storagePath = $('#storagePathText');
    if (storagePath) storagePath.textContent = path;
    const cardPath = $('.storage-card-main small');
    if (cardPath) cardPath.textContent = path;
    if (notify) toast('下载路径已更新：' + path, 'success', 3600);
    return path;
  }

  function formatFileSize(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
    return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  }

  function storageFileRowsHTML() {
    const files = (state.storageFiles || []).filter((file) => state.storageFilter !== 'apk' || /\.apk$/i.test(file.name || file.path || ''));
    if (!files.length) {
      return `<p class="storage-empty">${state.storageScanning ? '正在扫描…' : state.storageFilter === 'apk' ? '没有找到 APK 文件。请允许存储权限后重新扫描。' : '没有找到文件。'}</p>`;
    }
    return files.map((file) => {
      const name = String(file.name || String(file.path || '').split('/').pop() || '文件');
      const path = String(file.path || '');
      const size = formatFileSize(file.size || 0);
      const time = file.modified || file.lastModified ? new Date(file.modified || file.lastModified).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
      return `
        <button class="storage-file" type="button" data-storage-open="${esc(path)}" data-storage-name="${esc(name)}">
          <span class="storage-file-ico ${/\.apk$/i.test(name) ? 'is-apk' : ''}">${/\.apk$/i.test(name) ? 'APK' : SVG('box')}</span>
          <span class="storage-file-main"><b>${esc(name)}</b><small>${esc(path)}</small><small class="mono">${esc(size)}${time ? ' · ' + esc(time) : ''}</small></span>
          ${SVG('chevron')}
        </button>`;
    }).join('');
  }

  function renderStorageSheet() {
    const list = $('#storageFileList');
    if (list) list.innerHTML = storageFileRowsHTML();
    const count = $('#storageApkCount');
    if (count) {
      const apks = (state.storageFiles || []).filter((f) => /\.apk$/i.test(f.name || f.path || '')).length;
      count.textContent = `${apks} 个 APK · ${(state.storageFiles || []).length} 个文件`;
    }
    const scan = $('#storageScanBtn');
    if (scan) { scan.disabled = state.storageScanning; scan.textContent = state.storageScanning ? '扫描中…' : '重新扫描'; }
  }

  async function scanStorageFiles() {
    if (state.storageScanning) return;
    if (!window.WWShell) {
      if (typeof window.showDirectoryPicker !== 'function') {
        toast('当前浏览器不支持读取文件夹；请使用带存储权限的原生壳', 'warn', 5200);
        return;
      }
      try {
        const handle = await window.showDirectoryPicker({ id: 'worldweave-storage', mode: 'read' });
        state.storageScanning = true;
        renderStorageSheet();
        const files = [];
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            files.push({ name: file.name, path: handle.name + '/' + file.name, size: file.size, modified: file.lastModified });
          }
        }
        state.storageFiles = files;
        state.storageSource = 'browser';
        state.storagePath = handle.name;
        toast(`已读取「${handle.name}」中的 ${files.length} 个文件`, 'success', 3600);
      } catch (err) {
        if (err && err.name !== 'AbortError') toast('读取文件夹失败：' + (err.message || err), 'error');
      } finally {
        state.storageScanning = false;
        renderStorageSheet();
      }
      return;
    }
    const fn = window.WWShell.listApkFiles || window.WWShell.listApks
      || window.WWShell.listDownloadFiles || window.WWShell.listFiles;
    if (typeof fn !== 'function') {
      toast('当前原生壳未提供文件扫描接口 listFiles / listApkFiles', 'warn', 5200);
      return;
    }
    state.storageScanning = true;
    renderStorageSheet();
    try {
      await requestStoragePermission();
      let list;
      if (fn === window.WWShell.listDownloadFiles || fn === window.WWShell.listFiles) {
        list = await fn(state.storagePath || EXPORT_PATH_DEFAULT);
      } else {
        list = await fn();
      }
      const rawList = Array.isArray(list) ? list : (list && Array.isArray(list.files) ? list.files : []);
      state.storageFiles = rawList.map((item) => {
        if (typeof item === 'string') return { name: item.split('/').pop(), path: item, size: 0 };
        return {
          name: item.name || String(item.path || '').split('/').pop(),
          path: item.path || item.absolutePath || '',
          size: item.size || 0,
          modified: item.modified || item.lastModified || 0,
          isDirectory: !!item.isDirectory
        };
      }).filter((f) => !f.isDirectory);
      state.storageSource = 'native';
      toast(`扫描完成：${state.storageFiles.length} 个文件`, 'success', 3200);
    } catch (err) {
      toast('扫描存储失败：' + (err.message || '请检查存储权限'), 'error', 4600);
    } finally {
      state.storageScanning = false;
      renderStorageSheet();
    }
  }

  async function openStorageFile(path, name) {
    if (!path) return;
    if (window.WWShell && typeof window.WWShell.openFile === 'function') {
      try {
        const ok = await window.WWShell.openFile(path);
        if (ok !== false) return;
      } catch { /* 回退 */ }
    }
    copyText(path, false);
    toast(`文件路径已复制：${name || path}`, 'info', 4200);
  }

  function openStorageSheet() {
    openSheet(`
      <div class="storage-hero">
        <span class="storage-hero-ico">${SVG('download')}</span>
        <div><span class="mono">DOWNLOAD PATH</span><b id="storagePathText">${esc(state.storagePath || exportPathLabel())}</b><small>所有导出文件与 APK 读取都使用这个下载路径</small></div>
        <button class="mini-link" type="button" data-action="refresh-download-path">重新读取</button>
      </div>
      <div class="storage-toolbar">
        <div class="storage-filter" role="group" aria-label="文件筛选">
          <button class="chip ${state.storageFilter === 'apk' ? 'is-active' : ''}" type="button" data-storage-filter="apk">APK</button>
          <button class="chip ${state.storageFilter === 'all' ? 'is-active' : ''}" type="button" data-storage-filter="all">全部文件</button>
        </div>
        <span class="mono" id="storageApkCount">0 个 APK · 0 个文件</span>
        <button class="btn btn-primary btn-sm" type="button" id="storageScanBtn" data-action="scan-storage">${SVG('search')}扫描存储</button>
      </div>
      <div class="storage-file-list" id="storageFileList">${storageFileRowsHTML()}</div>
      <p class="download-note">原生壳需要 <span class="mono">listFiles(path)</span> 或 <span class="mono">listApkFiles()</span> 返回文件列表；浏览器会请求选择一个文件夹后读取。读取 APK 需要存储 / 所有文件访问权限。</p>
    `, { title: '存储与 APK', sub: '下载路径 / APK 文件 / 导出位置' });
    renderStorageSheet();
    refreshDownloadPath(false).then(updatePathDisplays);
    if (window.WWShell) setTimeout(() => scanStorageFiles(), 260);
  }

  /* ---------------- 像素皮肤绘制 ---------------- */
  function drawHeadPixels(ctx, ox, oy, p) {
    ctx.fillStyle = p.skin;
    ctx.fillRect(ox, oy, 8, 8);
    ctx.fillStyle = p.hair;
    ctx.fillRect(ox, oy, 8, 2);
    ctx.fillRect(ox, oy, 1, 4);
    ctx.fillRect(ox + 7, oy, 1, 4);
    if (p.rainbow) {
      const colours = ['#f26d8a', '#f4c44e', '#7ac74f', '#57d6e8', '#b48cff'];
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = colours[x % colours.length];
        ctx.fillRect(ox + x, oy, 1, 2);
      }
      ctx.fillStyle = p.hair;
      ctx.fillRect(ox, oy + 2, 1, 2);
      ctx.fillRect(ox + 7, oy + 2, 1, 2);
    }
    ctx.fillStyle = p.hairShade;
    ctx.fillRect(ox + 1, oy + 2, 1, 1);
    ctx.fillRect(ox + 4, oy + 2, 2, 1);
    if (p.special === 'creeper') {
      ctx.fillStyle = '#111611';
      ctx.fillRect(ox + 1, oy + 3, 2, 2);
      ctx.fillRect(ox + 5, oy + 3, 2, 2);
      ctx.fillRect(ox + 3, oy + 4, 2, 3);
      ctx.fillRect(ox + 2, oy + 6, 1, 1);
      ctx.fillRect(ox + 5, oy + 6, 1, 1);
      ctx.fillStyle = p.skinShade;
      ctx.fillRect(ox, oy + 5, 1, 2);
      ctx.fillRect(ox + 7, oy + 5, 1, 2);
      return;
    }
    ctx.fillStyle = '#f2f5ec';
    ctx.fillRect(ox + 1, oy + 3, 2, 1);
    ctx.fillRect(ox + 5, oy + 3, 2, 1);
    ctx.fillStyle = p.eye;
    ctx.fillRect(ox + 2, oy + 3, 1, 1);
    ctx.fillRect(ox + 5, oy + 3, 1, 1);
    ctx.fillStyle = p.skinShade;
    ctx.fillRect(ox, oy + 4, 1, 2);
    ctx.fillRect(ox + 7, oy + 4, 1, 2);
    ctx.fillRect(ox + 3, oy + 4, 2, 1);
    ctx.fillRect(ox + 3, oy + 5, 1, 1);
    ctx.fillStyle = p.hairShade;
    ctx.fillRect(ox + 3, oy + 6, 2, 1);
  }

  function drawHead(canvas, skinId) {
    if (!canvas) return;
    const p = skinById(skinId);
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 8, 8);
    drawHeadPixels(ctx, 0, 0, p);
  }

  function drawBody(canvas, skinId) {
    if (!canvas) return;
    const p = skinById(skinId);
    const W = 16, H = 32;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);

    /* 头部 */
    drawHeadPixels(ctx, 4, 0, p);

    /* 躯干 */
    ctx.fillStyle = p.shirt;
    ctx.fillRect(4, 8, 8, 12);
    ctx.fillStyle = p.shirtShade;
    ctx.fillRect(4, 8, 1, 12);
    ctx.fillRect(11, 8, 1, 12);
    ctx.fillRect(4, 18, 8, 2);
    ctx.fillStyle = p.sleeve || p.shirt;
    ctx.fillRect(5, 8, 2, 2);

    /* 手臂 */
    ctx.fillStyle = p.sleeve || p.shirt;
    ctx.fillRect(0, 8, 4, 6);
    ctx.fillRect(12, 8, 4, 6);
    ctx.fillStyle = p.shirtShade;
    ctx.fillRect(0, 8, 1, 6);
    ctx.fillRect(15, 8, 1, 6);
    ctx.fillStyle = p.skin;
    ctx.fillRect(0, 14, 4, 6);
    ctx.fillRect(12, 14, 4, 6);
    ctx.fillStyle = p.skinShade;
    ctx.fillRect(0, 14, 1, 6);
    ctx.fillRect(15, 14, 1, 6);

    /* 腿 */
    ctx.fillStyle = p.pants;
    ctx.fillRect(4, 20, 8, 10);
    ctx.fillStyle = p.pantsShade;
    ctx.fillRect(4, 20, 1, 10);
    ctx.fillRect(11, 20, 1, 10);
    ctx.fillRect(7, 20, 1, 10);
    ctx.fillStyle = p.shoe;
    ctx.fillRect(4, 28, 4, 4);
    ctx.fillRect(8, 28, 4, 4);
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(4, 31, 4, 1);
    ctx.fillRect(8, 31, 4, 1);
    ctx.fillRect(7, 29, 1, 2);

    /* 名字与高光 */
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(5, 9, 5, 1);
    if (p.special === 'creeper') {
      ctx.fillStyle = 'rgba(12,26,8,.4)';
      ctx.fillRect(5, 8, 6, 1);
    }
  }

  function paintSkins(root = document) {
    $$('canvas[data-skin-head]', root).forEach(c => drawHead(c, c.dataset.skinHead));
    $$('canvas[data-skin-body]', root).forEach(c => drawBody(c, c.dataset.skinBody));
  }

  /* ---------------- 设置与主题 ---------------- */
  function applySettings() {
    if (state.settings.bgmTrack !== 'custom' && !BGM_TRACKS.some((track) => track.id === state.settings.bgmTrack)) {
      state.settings.bgmTrack = 'lilypad';
      saveSettings();
    }
    if (premiumTheme(state.settings.theme) && !themeUnlocked(state.settings.theme)) {
      state.settings.theme = 'grass';
      saveSettings();
    }
    document.documentElement.dataset.theme = state.settings.theme;
    const systemReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.toggle('reduce-motion', !state.settings.motion || systemReduce);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const colors = { grass: '#0b1119', nether: '#150e0d', end: '#100e19', ocean: '#0a141b', sakura: '#1a1016', amethyst: '#100e19', gold: '#171208', ice: '#08131a' };
      meta.setAttribute('content', colors[state.settings.theme] || '#0b1119');
    }
  }
  function saveSettings() { store.set(KEY_SETTINGS, state.settings); }
  function setTheme(id) {
    if (premiumTheme(id) && !themeUnlocked(id)) {
      toast('这是商店主题，请先在背包中使用对应主题道具', 'warn', 4200);
      return;
    }
    state.settings.theme = id;
    saveSettings();
    applySettings();
  }
  function toggleSetting(key) {
    state.settings[key] = !state.settings[key];
    saveSettings();
    applySettings();
    if (key === 'sound' && state.settings.sound) sfx('tap');
    if (key === 'bgm') applyBgm();
    refreshMine(true);
    const btn = document.querySelector(`[data-set-toggle="${key}"]`);
    if (btn) {
      btn.setAttribute('aria-checked', String(!!state.settings[key]));
      const sw = btn.querySelector('.switch');
      if (sw) sw.classList.toggle('is-on', !!state.settings[key]);
    }
    const labels = { sound: '音效与反馈', motion: '界面动画', notify: '消息通知', bgm: '背景音乐' };
    toast(`${labels[key]}已${state.settings[key] ? '开启' : '关闭'}`, 'success');
  }
  /* ---------------- Toast ---------------- */
  function toast(message, type = 'success', duration = 2300) {
    const root = $('#toastRoot');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'warn' ? ' is-warn' : type === 'error' ? ' is-error' : '');
    const ico = type === 'warn' || type === 'error' ? 'info' : 'check';
    el.innerHTML = `<span class="toast-ico">${SVG(ico)}</span><span>${esc(message)}</span>`;
    root.appendChild(el);
    while (root.children.length > 3) root.firstElementChild.remove();
    setTimeout(() => {
      el.classList.add('is-out');
      setTimeout(() => el.remove(), 240);
    }, duration);
  }

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    paintSkins(document);
    renderHomeAccount();
    renderHomePromo();
    renderHomeHot();
    renderHomeResources();
  }

  function renderHomeAccount() {
    const pill = $('#homeAccount');
    if (!pill) return;
    if (state.session) {
      const s = state.session;
      pill.innerHTML = `<span class="acc-dot"></span><canvas data-skin-head="${s.skinId}" width="8" height="8"></canvas><span class="acc-name">${esc(displayName())}</span>`;
      pill.setAttribute('aria-label', `账号中心，当前账号 ${displayName()}`);
    } else {
      pill.innerHTML = `${SVG('user')}<span class="acc-name">登录 / 注册</span>`;
      pill.setAttribute('aria-label', '登录或注册账号');
    }
    paintSkins(pill);
  }

  function renderHomePromo() {
    const host = $('#homePromo');
    if (!host) return;
    const f = DATA.featuredLauncher;
    const image = launcherImage(f);
    host.innerHTML = `
      <div class="promo">
        <div class="promo-glow"></div>
        <div class="promo-art">${image ? `<img src="${esc(image)}" alt="${esc(f.name)}" loading="lazy" decoding="async">` : GRASS()}</div>
        <span class="badge badge-official">推荐启动器</span>
        <p class="promo-kicker">${esc(f.kicker || 'FEATURED LAUNCHER')}</p>
        <h2>${esc(f.name)}</h2>
        <p class="promo-desc">${esc(f.desc)}</p>
        <div class="promo-actions">
          <button class="btn btn-primary btn-sm" type="button" data-download="${esc(f.id)}">${SVG('download')}下载</button>
          <button class="btn btn-ghost btn-sm" type="button" data-launcher="${esc(f.id)}">查看详情</button>
        </div>
        <div class="promo-platforms">${(f.platforms || []).map((p) => `<span>${esc(String(p).toUpperCase())}</span>`).join('')}</div>
      </div>`;
  }

  function renderHomeHot() {
    const host = $('#homeHot');
    if (!host) return;
    const ids = ['pcl2', 'hmcl', 'pojav'];
    const items = ids.map(id => findLauncher(id)).filter(Boolean);
    host.innerHTML = `
      <div class="section-head">
        <h2 class="section-title">热门启动器 <span class="count">HOT</span></h2>
        <button class="section-link" type="button" data-goto="launchers">查看全部${SVG('chevron')}</button>
      </div>
      <div class="h-scroll">
        ${items.map(l => {
          const image = launcherImage(l);
          return `
          <button class="hot-card" type="button" data-launcher="${l.id}">
            <span class="hot-top">
              ${image ? `<img class="hot-img" src="${esc(image)}" alt="${esc(l.name)}" loading="lazy" decoding="async">` : `<span class="hot-icon" style="--c:${l.color}">${esc(l.mono)}</span>`}
              <span class="tag-mini">${esc(l.tags[0] || '启动器')}</span>
            </span>
            <span class="hot-name">${esc(l.name)}</span>
            <span class="hot-desc">${esc(l.desc)}</span>
            <span class="hot-go">查看详情${SVG('arrow-right')}</span>
          </button>`;
        }).join('')}
      </div>`;
  }

  function renderHomeResources() {
    const host = $('#homeRes');
    if (!host) return;
    const items = ['mcmod', 'modrinth', 'klpbbs'].map(id => DATA.resources.find(r => r.id === id)).filter(Boolean);
    host.innerHTML = `
      <div class="section-head">
        <h2 class="section-title">资源速达 <span class="count">SITES</span></h2>
        <button class="section-link" type="button" data-goto="resources">全部资源${SVG('chevron')}</button>
      </div>
      <div class="res-mini-list">
        ${items.map(r => `
          <a class="res-mini" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">
            <span class="res-mini-ico" style="--c:${r.color}">${esc(r.mono)}</span>
            <span class="res-mini-main"><b>${esc(r.name)}</b><span>${esc(r.desc)}</span></span>
            ${SVG('external')}
          </a>`).join('')}
      </div>`;
  }

  /* ---------------- 启动器页 ---------------- */
  function findLauncher(id) {
    if (DATA.featuredLauncher.id === id) return DATA.featuredLauncher;
    if (DATA.bedrockLauncher && DATA.bedrockLauncher.id === id) return DATA.bedrockLauncher;
    if (DATA.neteaseBedrock && DATA.neteaseBedrock.id === id) return DATA.neteaseBedrock;
    return DATA.androidLaunchers.find(l => l.id === id) || DATA.javaLaunchers.find(l => l.id === id) || null;
  }
  function launcherMeta(l) {
    if (DATA.bedrockLauncher && DATA.bedrockLauncher.id === l.id) return 'bedrock';
    if (DATA.neteaseBedrock && DATA.neteaseBedrock.id === l.id) return 'netease-bedrock';
    if (DATA.featuredLauncher.id === l.id) return 'java';
    const context = DATA.androidLaunchers.includes(l) ? 'android' : DATA.javaLaunchers.includes(l) ? 'java' : 'official';
    return context;
  }

  function launcherImage(l) {
    if (!l) return '';
    return l.image || (l.id ? `assets/launchers/${l.id}.png` : '');
  }

  function launcherCard(l, context) {
    const monoClass = String(l.mono).length > 2 ? ' small-text' : '';
    const image = launcherImage(l);
    return `
      <button class="launcher-card" type="button" data-launcher="${l.id}" aria-label="查看 ${esc(l.name)} 详情">
        <span class="lc-icon${monoClass}" style="--c:${l.color}">${image ? `<img src="${esc(image)}" alt="${esc(l.name)}" loading="lazy" decoding="async">` : esc(l.mono)}</span>
        <span class="lc-body">
          <span class="lc-top">
            <span class="lc-name">${esc(l.name)}</span>
            ${(l.tags || []).slice(0, 2).map(t => `<span class="tag-mini">${esc(t)}</span>`).join('')}
          </span>
          <span class="lc-desc">${esc(l.desc)}</span>
          <span class="lc-meta">${(l.tags || []).slice(2).map(t => `<span class="tag-mini">${esc(t)}</span>`).join('')}
            <span class="tag-mini">${context === 'android' ? 'Android' : context === 'bedrock' ? '基岩版' : 'Windows / Java'}</span>
          </span>
        </span>
        <span class="lc-go">${SVG('chevron')}</span>
      </button>`;
  }

  function renderLaunchers() {
    const host = $('#launcherPage');
    if (!host) return;
    const f = DATA.featuredLauncher;
    host.innerHTML = `
      <header class="page-head">
        <p class="kicker"><span class="kicker-block"></span>LAUNCHERS · 02</p>
        <div class="page-head-row">
          <div>
            <h1>启动器</h1>
            <p class="page-sub">挑一个顺手的启动器，推开方块世界的大门。</p>
          </div>
          <span class="page-count mono">${String(DATA.androidLaunchers.length + DATA.javaLaunchers.length + 2 + (DATA.neteaseBedrock ? 1 : 0)).padStart(2, '0')}</span>
        </div>
      </header>

      <section class="launcher-hero" aria-label="${esc(f.name)}">
        <div class="launcher-hero-head">
          <span class="launcher-hero-logo">${launcherImage(f) ? `<img src="${esc(launcherImage(f))}" alt="${esc(f.name)}" loading="lazy" decoding="async">` : GRASS()}</span>
          <div class="launcher-hero-title">
            <h2>${esc(f.name)}</h2>
            <p>${esc(f.kicker)}</p>
          </div>
        </div>
        <span class="badge badge-official">推荐启动器</span>
        <p class="launcher-hero-desc">${esc(f.desc)}</p>
        <div class="launcher-hero-meta">
          ${f.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
        </div>
        <div class="launcher-hero-actions">
          <button class="btn btn-primary" type="button" data-download="${esc(f.id)}">${SVG('download')}下载 PCL2</button>
          <button class="btn btn-ghost" type="button" data-launcher="${esc(f.id)}">${SVG('info')}详情</button>
        </div>
        <div class="launcher-hero-foot">
          <div class="platforms">${f.platforms.map(p => `<span>${esc(p.toUpperCase())}</span>`).join('')}</div>
          <small>作者：${esc(f.author || '龙腾猫跃')} · 官方 GitHub 仓库</small>
        </div>
      </section>

      <section class="page-section" id="launcherAndroid">
        <div class="section-head">
          <h2 class="section-title">MC启动器安卓版 <span class="pill-count">${pad2(DATA.androidLaunchers.length)}</span></h2>
          <span class="section-link mono">ANDROID</span>
        </div>
        <p class="section-note">在手机上运行我的世界 Java 版，支持模组、整合包与多版本切换。</p>
        <div class="launcher-list">
          ${DATA.androidLaunchers.map(l => launcherCard(l, 'android')).join('')}
        </div>
      </section>

      <section class="page-section" id="launcherBedrock">
        <div class="section-head">
          <h2 class="section-title">MC基岩版 <span class="count">[手机 / 电脑]</span> <span class="pill-count">${pad2((DATA.bedrockLauncher ? 1 : 0) + (DATA.neteaseBedrock ? 1 : 0))}</span></h2>
          <span class="section-link mono">BEDROCK</span>
        </div>
        <p class="section-note">微软官方基岩版与网易我的世界中国版；官方版点开可先选择版本，再前往官网下载。</p>
        <div class="launcher-list">
          ${DATA.bedrockLauncher ? launcherCard(DATA.bedrockLauncher, 'bedrock') : ''}
          ${DATA.neteaseBedrock ? launcherCard(DATA.neteaseBedrock, 'bedrock') : ''}
        </div>
      </section>

      <section class="page-section" id="launcherJava">
        <div class="section-head">
          <h2 class="section-title">MC启动器Java版 <span class="count">[电脑版]</span> <span class="pill-count">${pad2(DATA.javaLaunchers.length)}</span></h2>
          <span class="section-link mono">JAVA / PC</span>
        </div>
        <p class="section-note">Windows、macOS 与 Linux 上的电脑版启动器，模组与整合包的主场。</p>
        <div class="launcher-list">
          ${DATA.javaLaunchers.map(l => launcherCard(l, 'java')).join('')}
        </div>
      </section>

      <p class="resource-note">${SVG('info')}<span>下载与安装均跳转至各启动器的官方页面或代码仓库，请认准官方来源；本应用不提供安装包托管。</span></p>`;
  }

  /* ---------------- 资源页 ---------------- */
  function resourceSiteCardHTML(r) {
    return `<a class="res-card" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" data-res-id="${r.id}" aria-label="打开 ${esc(r.name)}（新窗口）">
      <span class="res-icon ${r.mono.length > 2 ? 'long' : ''}" style="--c:${r.color}">${esc(r.mono)}</span>
      <div class="res-main"><div class="res-top"><h3>${esc(r.name)}</h3><span class="res-domain">${esc(r.domain)}</span></div><p class="res-main-desc">${esc(r.desc)}</p><div class="res-tags">${r.tags.map(t => `<span class="tag-mini">${esc(t)}</span>`).join('')}</div></div>
      <span class="res-go">${SVG('external')}</span>
    </a>`;
  }

  function downloadCardHTML(item) {
    return `<a class="download-card" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">
      <span class="download-cover" style="--cover:${item.color}"><b>${esc(item.mono)}</b><small>${esc(item.cat)}</small></span>
      <div class="download-main"><div class="download-top"><b>${esc(item.name)}</b><span>${esc(item.version)}</span></div><small>${esc(item.author)} · ${esc(item.size)}</small><p>${esc(item.desc)}</p><span class="download-tag">${esc(item.cat)}</span></div>
      <span class="res-go">${SVG('download')}</span>
    </a>`;
  }

  function serverRowHTML(server) {
    const pingClass = server.ping < 60 ? 'is-good' : server.ping < 120 ? 'is-mid' : 'is-bad';
    return `<article class="server-row">
      <span class="server-avatar" style="--c:${server.color}">${esc(server.name.slice(0, 1))}</span>
      <div class="server-main"><div class="server-top"><b>${esc(server.name)}</b><span class="server-region">${esc(server.region)}</span></div><small class="mono">${esc(server.ip)} · ${esc(server.version)} · ${esc(server.players)} 在线</small><p>${esc(server.desc)}</p></div>
      <div class="server-net"><span class="net-level">${esc(server.level)}</span><span class="ping ${pingClass}"><i style="width:${Math.max(8, 100 - server.ping / 3)}%"></i></span><small>${server.ping} ms</small><button class="mini-act" type="button" data-copy="${esc(server.ip)}">复制 IP</button></div>
    </article>`;
  }

  function renderResources(preserveScroll = false) {
    const host = $('#resourcePage');
    if (!host) return;
    const panel = document.querySelector('[data-panel="resources"]');
    const top = panel ? panel.scrollTop : 0;
    const q = state.resourceQuery.trim().toLowerCase();
    const search = (text) => !q || String(text).toLowerCase().includes(q);
    const sites = DATA.resources.filter((r) => (state.resourceFilter === 'all' || r.cat === state.resourceFilter) && search([r.name, r.desc, r.tags.join(' '), r.cat].join(' ')));
    const downloads = RESOURCE_DOWNLOADS.filter((d) => (state.downloadCat === '全部' || d.cat === state.downloadCat) && search([d.name, d.desc, d.cat, d.author].join(' ')));
    const servers = RESOURCE_SERVERS.filter((s) => (state.serverRegion === '全部' || s.region === state.serverRegion) && search([s.name, s.desc, s.ip, s.region].join(' ')));
    const total = DATA.resources.length + RESOURCE_DOWNLOADS.length + RESOURCE_SERVERS.length;
    const searchMode = !!q;
    host.innerHTML = `
      <header class="page-head">
        <p class="kicker"><span class="kicker-block"></span>RESOURCES · 03</p>
        <div class="page-head-row"><div><h1>资源</h1><p class="page-sub">网站资源、下载资源与服务器资源，点击即可打开。</p></div><span class="page-count mono">${pad2(total)}</span></div>
      </header>

      <div class="resource-search"><div class="input-wrap">${SVG('search')}<input id="resourceSearch" type="search" value="${esc(state.resourceQuery)}" placeholder="搜索所有资源：模组 / 整合包 / 光影 / 服务器" aria-label="搜索所有资源" autocomplete="off"></div><button class="btn btn-primary btn-sm" type="button" data-resource-search-go>${SVG('search')}搜索</button></div>

      <div class="resource-view-tabs">
        <button class="resource-view-tab ${state.resourceView === 'sites' && !searchMode ? 'is-active' : ''}" type="button" data-resource-view="sites">网站资源</button>
        <button class="resource-view-tab ${state.resourceView === 'downloads' && !searchMode ? 'is-active' : ''}" type="button" data-resource-view="downloads">下载资源</button>
        <button class="resource-view-tab ${state.resourceView === 'servers' && !searchMode ? 'is-active' : ''}" type="button" data-resource-view="servers">服务器资源</button>
      </div>

      ${searchMode ? `
        <section class="resource-search-results">
          <h3>搜索结果 <span>${sites.length + downloads.length + servers.length} 项</span></h3>
          <div class="resource-list">${sites.map(resourceSiteCardHTML).join('')}</div>
          <div class="download-grid">${downloads.map(downloadCardHTML).join('')}</div>
          <div class="server-list">${servers.map(serverRowHTML).join('')}</div>
          ${sites.length + downloads.length + servers.length ? '' : '<div class="resource-empty">没有找到匹配的资源。</div>'}
        </section>` : state.resourceView === 'downloads' ? `
        <div class="filter-row download-filter">${['全部', '整合包', '模组', '光影', '资源包'].map((cat) => `<button class="chip ${state.downloadCat === cat ? 'is-active' : ''}" type="button" data-download-cat="${cat}">${cat}</button>`).join('')}</div>
        <div class="download-grid">${downloads.map(downloadCardHTML).join('') || '<div class="resource-empty">这个分类暂时没有下载资源。</div>'}</div>
        <p class="resource-note">${SVG('info')}<span>下载资源来自 Modrinth、CurseForge 与作者官网；请确认游戏版本与加载器后再下载。</span></p>` : state.resourceView === 'servers' ? `
        <div class="filter-row">${['全部', '国内', '国外'].map((region) => `<button class="chip ${state.serverRegion === region ? 'is-active' : ''}" type="button" data-server-region="${region}">${region}服务器</button>`).join('')}</div>
        <div class="server-list">${servers.map(serverRowHTML).join('') || '<div class="resource-empty">没有匹配的服务器。</div>'}</div>
        <p class="resource-note">${SVG('info')}<span>服务器延迟为参考值，实际延迟受网络、地区和服务器状态影响；进入服务器前请确认版本与规则。</span></p>` : `
        <div class="filter-row" role="tablist" aria-label="网站分类">${DATA.resourceCategories.map((c) => `<button class="chip ${state.resourceFilter === c.id ? 'is-active' : ''}" type="button" data-cat="${c.id}">${esc(c.name)}</button>`).join('')}</div>
        <div class="resource-list">${sites.map(resourceSiteCardHTML).join('') || '<div class="resource-empty">这个分类暂时还没有收录资源。</div>'}</div>
        <p class="resource-note">${SVG('info')}<span>以上均为第三方网站，点击后将在新窗口打开。请注意甄别下载内容，保护好自己的账号信息。</span></p>`}
    `;
    if (preserveScroll && panel) panel.scrollTop = top;
  }

  /* ---------------- 百宝箱 ---------------- */
  function renderBox(preserveScroll = false) {
    const host = $('#boxPage');
    if (!host) return;
    const panel = document.querySelector('[data-panel="box"]');
    const top = panel ? panel.scrollTop : 0;
    if (state.boxMode === 'complex') { state.boxMode = 'commands'; state.commandMode = 'complex'; }
    const count = state.boxMode === 'blocks'
      ? BOX.blocks.length
      : state.boxMode === 'tools'
        ? BOX.tools.length
        : state.commandMode === 'complex'
          ? COMPLEX.length
          : BOX.javaCommands.length + BOX.bedrockCommands.length;

    host.innerHTML = `
      <header class="page-head">
        <p class="kicker"><span class="kicker-block"></span>TOOLBOX · 05</p>
        <div class="page-head-row">
          <div>
            <h1>百宝箱</h1>
            <p class="page-sub">Java / 基岩指令速查、复杂指令实验室、方块编号与实用工具。</p>
          </div>
          <span class="page-count mono">${pad2(count)}</span>
        </div>
      </header>

      <div class="box-mode" role="tablist" aria-label="百宝箱分类">
        <button class="box-mode-btn ${state.boxMode === 'commands' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.boxMode === 'commands'}" data-box-mode="commands">${SVG('terminal')}指令大全</button>
        <button class="box-mode-btn ${state.boxMode === 'blocks' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.boxMode === 'blocks'}" data-box-mode="blocks">${SVG('chest')}方块查询</button>
        <button class="box-mode-btn ${state.boxMode === 'tools' ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.boxMode === 'tools'}" data-box-mode="tools">${SVG('terminal')}实用工具</button>
      </div>

      ${state.boxMode === 'commands'
        ? `<div class="command-subtabs"><button class="command-subtab ${state.commandMode === 'search' ? 'is-active' : ''}" type="button" data-box-command-mode="search">指令速查</button><button class="command-subtab ${state.commandMode === 'complex' ? 'is-active' : ''}" type="button" data-box-command-mode="complex">复杂指令实验室</button></div>${state.commandMode === 'complex' ? boxComplexHTML() : boxCommandsHTML()}`
        : state.boxMode === 'blocks'
          ? boxBlocksHTML()
          : boxToolsHTML()}

      <p class="resource-note">${SVG('info')}<span>${state.boxMode === 'commands' && state.commandMode === 'complex'
        ? '复杂指令支持输入提示、实时语法检查与危险操作提醒；版本与「指令速查」共用，切换版本需要二次确认。'
        : '指令语法可在版本栏切换；高版本指令会灰显并标注所需版本。方块数字 ID 仅适用于 1.12.2 及更早版本。'}</span></p>`;

    if (state.boxMode === 'commands' && state.commandMode === 'complex' && state.complexResult) {
      renderComplexResult(state.complexResult);
    }
    if (preserveScroll && panel) panel.scrollTop = top;
  }

  /* ---------------- 指令版本 ---------------- */
  function versionsFor(edition) {
    const list = (BOX.commandVersions && BOX.commandVersions[edition]) || [];
    return Array.isArray(list) && list.length ? list : [{ id: 'latest', label: '最新', ver: 999, note: '' }];
  }

  function currentVersion(edition = state.boxEdition) {
    const list = versionsFor(edition);
    const saved = state.boxVersion[edition];
    return list.find((v) => v.id === saved) || list[list.length - 1];
  }

  function versionById(edition, id) {
    return versionsFor(edition).find((v) => v.id === id) || null;
  }

  function commandSince(c, edition = state.boxEdition) {
    const map = (BOX.commandSince && BOX.commandSince[edition]) || {};
    const value = map[c.c];
    return typeof value === 'number' ? value : 0;
  }

  function minVersionLabel(edition, since) {
    const list = versionsFor(edition);
    const found = list.find((v) => v.ver >= since);
    return (found || list[list.length - 1]).label;
  }

  function commandSupported(c, edition = state.boxEdition) {
    return commandSince(c, edition) <= currentVersion(edition).ver + 0.0001;
  }

  function versionChipsHTML(edition) {
    const list = versionsFor(edition);
    const cur = currentVersion(edition);
    return `
      <div class="version-bar">
        <span class="version-label">版本</span>
        <div class="version-chips" role="tablist" aria-label="${edition === 'java' ? 'Java 版指令版本' : '基岩版指令版本'}">
          ${list.map((v) => `<button class="chip version-chip ${v.id === cur.id ? 'is-active' : ''}" type="button" role="tab" aria-selected="${v.id === cur.id}" data-box-version="${esc(v.id)}" title="${esc(v.note || v.label)}">${esc(v.label)}</button>`).join('')}
        </div>
      </div>`;
  }

  function versionBannerHTML(all) {
    const cur = currentVersion();
    const supported = all.filter((c) => commandSupported(c)).length;
    const hidden = all.length - supported;
    return `
      <div class="version-banner" role="status">
        ${SVG('info')}
        <span><b>${state.boxEdition === 'java' ? 'Java' : '基岩版'} ${esc(cur.label)}</b> · ${supported} / ${all.length} 条指令可用${hidden ? `，${hidden} 条高版本指令已灰显` : ''}。${cur.note ? `<em>${esc(cur.note)}</em>` : ''}</span>
      </div>`;
  }

  function openVersionConfirm(edition, id) {
    const next = versionById(edition, id);
    if (!next) return;
    const cur = currentVersion(edition);
    if (next.id === cur.id) return;
    const where = edition === 'java' ? 'Java 版' : '基岩版';
    const content = `
      <p class="confirm-copy">把 <b>${where}</b> 指令从 <b>${esc(cur.label)}</b> 切换到 <b>${esc(next.label)}</b>？</p>
      <div class="version-confirm-box">
        <span class="mono">${esc(next.label)}</span>
        <p>${esc(next.note || '该版本使用对应时期的指令语法。')}</p>
        <small>切换后，高版本新增指令会灰显并标注最低版本；/give、/execute 等示例会改写为该版本的写法。</small>
      </div>
      <div class="confirm-actions">
        <button class="btn btn-ghost" type="button" data-sheet-close>取消</button>
        <button class="btn btn-primary" type="button" data-confirm-version="${esc(next.id)}" data-version-edition="${edition}">${SVG('check')}确认切换</button>
      </div>`;
    openSheet(content, { title: '切换指令版本', sub: '需要二次确认 · 避免误触' });
  }

  function applyBoxVersion(edition, id) {
    const next = versionById(edition, id);
    if (!next) return;
    state.boxVersion[edition] = next.id;
    state.boxCat = '全部';
    state.boxQuery = '';
    closeSheet();
    renderBox(true);
    if (state.complexCode) runComplexCheck();
    sfx('success');
    toast(`已切换到 ${edition === 'java' ? 'Java' : '基岩版'} ${next.label}`, 'success');
  }

  function legacyItemId(name) {
    const map = {
      stone: 1, dirt: 3, cobblestone: 4, oak_planks: 5, bedrock: 7, sand: 12,
      gravel: 13, gold_ore: 14, iron_ore: 15, coal_ore: 16, oak_log: 17,
      glass: 20, sandstone: 24, white_wool: 35, gold_block: 41, iron_block: 42,
      bricks: 45, tnt: 46, obsidian: 49, torch: 50, chest: 54,
      diamond_ore: 56, diamond_block: 57, crafting_table: 58, furnace: 61,
      apple: 260, golden_apple: 322, bread: 297, arrow: 262,
      coal: 263, diamond: 264, iron_ingot: 265, gold_ingot: 266,
      diamond_sword: 276, diamond_pickaxe: 278, stick: 280, redstone: 331,
      ender_pearl: 368, cooked_beef: 364
    };
    return map[name] || 0;
  }

  function legacyEntityName(name) {
    const map = {
      zombie: 'Zombie', skeleton: 'Skeleton', creeper: 'Creeper',
      boat: 'Boat', armor_stand: 'ArmorStand', lightning_bolt: 'LightningBolt',
      item: 'Item', villager: 'Villager', cow: 'Cow', pig: 'Pig'
    };
    return map[name] || name;
  }

  function stripNamespace(text) {
    return String(text).replace(/minecraft:([a-z0-9_]+)/g, '$1');
  }

  /** 按当前版本改写指令用法/示例，返回 { u, e, note } */
  function adaptCommand(c, edition = state.boxEdition, version = currentVersion(edition)) {
    const out = { u: c.u, e: c.e, note: '' };
    if (edition === 'java' && version.legacy) {
      switch (c.c) {
        case '/give': {
          out.u = '/give <目标> <物品数字ID> [数量] [数据值]';
          out.e = c.e.replace(/minecraft:([a-z0-9_]+)/g, (all, name) => String(legacyItemId(name) || all));
          out.note = '1.12.2 及更早使用数字 ID（264 = 钻石），没有 minecraft: 命名空间。';
          break;
        }
        case '/clear':
          out.u = '/clear [目标] [物品数字ID] [数据值] [最大数量]';
          out.e = '/clear @s 3';
          out.note = '旧版 /clear 的物品参数同样使用数字 ID（3 = 泥土）。';
          break;
        case '/execute':
          out.u = '/execute <实体> <x> <y> <z> <指令>';
          out.e = '/execute @a ~ ~ ~ summon LightningBolt';
          out.note = '1.12.2 及更早是旧版 /execute；1.13 起重写为 as / at / if / run 链。';
          break;
        case '/effect':
          out.u = '/effect <玩家> <效果名> [秒] [等级] [隐藏粒子]';
          out.e = stripNamespace(c.e).replace(/^\/effect\s+give\s+/, '/effect ');
          out.note = '旧版 /effect 没有 give / clear 子命令，效果名也不带命名空间。';
          break;
        case '/xp':
          out.u = '/xp <数量> [玩家] [levels | points]';
          out.e = '/xp 30L @s';
          out.note = '旧版用数字后缀 L 表示等级，例如 30L；1.13+ 改为 /xp add @s 30 levels。';
          break;
        case '/enchant':
        case '/particle':
          out.e = stripNamespace(c.e);
          out.note = '该版本的效果 / 音效 / 粒子名不带 minecraft: 命名空间。';
          break;
        case '/playsound':
          out.e = '/playsound entity.player.levelup @s';
          out.note = '旧版 /playsound 的参数顺序是 <音效> <玩家>，音效名也不带命名空间。';
          break;
        case '/summon':
          out.e = c.e.replace(/minecraft:([a-z0-9_]+)/g, (all, name) => legacyEntityName(name));
          out.note = '1.12.2 及更早使用首字母大写的实体名，例如 Zombie、ArmorStand。';
          break;
        case '/setblock':
        case '/fill':
          out.e = stripNamespace(c.e);
          out.note = '1.12.2 及更早的方块 ID 不带 minecraft: 命名空间。';
          break;
        default:
          break;
      }
    }
    if (edition === 'bedrock' && version.ver < 19.1 && c.c === '/execute') {
      out.u = '/execute <实体> <x> <y> <z> <指令>';
      out.e = '/execute @a ~ ~ ~ summon lightning_bolt';
      out.note = '基岩版 1.19.10 起 execute 才与 Java 对齐；更早版本使用旧语法。';
    }
    return out;
  }

  function boxCommandsHTML() {
    const isJava = state.boxEdition === 'java';
    const all = isJava ? BOX.javaCommands : BOX.bedrockCommands;
    const cats = ['全部', ...Array.from(new Set(all.map((c) => c.cat)))];

    return `
      <div class="box-edition" role="tablist" aria-label="指令版本">
        <button class="chip ${isJava ? 'is-active' : ''}" type="button" role="tab" aria-selected="${isJava}" data-box-edition="java">Java 版</button>
        <button class="chip ${!isJava ? 'is-active' : ''}" type="button" role="tab" aria-selected="${!isJava}" data-box-edition="bedrock">基岩版</button>
      </div>

      ${versionChipsHTML(state.boxEdition)}
      ${versionBannerHTML(all)}

      <div class="box-search">
        <div class="input-wrap">
          ${SVG('search')}
          <input id="boxSearch" type="search" value="${esc(state.boxQuery)}" placeholder="搜索指令，例如 give / tp / execute" aria-label="搜索指令" autocomplete="off">
        </div>
        <span class="box-count mono" id="boxCmdCount">${filterCommands().length} / ${all.length}</span>
      </div>

      <div class="filter-row" role="tablist" aria-label="指令分类">
        ${cats.map((c) => `<button class="chip ${state.boxCat === c ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.boxCat === c}" data-box-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>

      <div class="cmd-list" id="cmdList">${cmdCardsHTML()}</div>`;
  }

  function filterCommands() {
    const all = state.boxEdition === 'java' ? BOX.javaCommands : BOX.bedrockCommands;
    const q = state.boxQuery.trim().toLowerCase();
    return all.filter((c) => {
      if (state.boxCat !== '全部' && c.cat !== state.boxCat) return false;
      if (!q) return true;
      const adapted = adaptCommand(c);
      return [c.c, c.u, c.d, c.e, c.cat, c.v, adapted.u, adapted.e].join(' ').toLowerCase().includes(q);
    });
  }

  function cmdCardsHTML() {
    const list = filterCommands();
    if (!list.length) return `<div class="resource-empty">没有匹配的指令，换个关键词试试。</div>`;
    return list.map((c) => {
      const supported = commandSupported(c);
      const adapted = adaptCommand(c);
      return `
      <article class="cmd-card${supported ? '' : ' is-unsupported'}">
        <div class="cmd-head">
          <code class="cmd-name">${esc(c.c)}</code>
          <span class="tag-mini">${esc(c.cat)}</span>
          <span class="tag-mini cmd-ver">${esc(adapted.note ? '当前 ' + currentVersion().label : c.v)}</span>
          ${supported ? '' : `<span class="tag-mini cmd-lock">需 ${esc(minVersionLabel(state.boxEdition, commandSince(c)))}</span>`}
          <button class="copy-inline" type="button" data-copy="${esc(adapted.e)}" aria-label="复制 ${esc(c.c)} 的示例"${supported ? '' : ' disabled aria-disabled="true"'}>${SVG('copy')}</button>
        </div>
        <p class="cmd-desc">${esc(c.d)}</p>
        <p class="cmd-usage mono">${esc(adapted.u)}</p>
        <p class="cmd-example mono"><span>示例</span>${esc(adapted.e)}</p>
        ${adapted.note ? `<p class="cmd-version-note">${SVG('info')}<span>${esc(adapted.note)}</span></p>` : ''}
      </article>`;
    }).join('');
  }

  /* ---------------- 复杂指令 ---------------- */
  const SELECTOR_ARGS = ['type', 'name', 'tag', 'distance', 'dx', 'dy', 'dz', 'x', 'y', 'z', 'limit', 'sort', 'gamemode', 'level', 'scores', 'team', 'nbt', 'predicate', 'advancements', 'x_rotation', 'y_rotation'];
  const EXECUTE_SUBS = [
    { v: 'as', d: '改变执行者' }, { v: 'at', d: '改变执行位置与朝向' },
    { v: 'if', d: '条件成立才继续' }, { v: 'unless', d: '条件不成立才继续' },
    { v: 'store', d: '把结果写入记分板 / NBT' }, { v: 'run', d: '执行最终指令' },
    { v: 'positioned', d: '指定坐标' }, { v: 'facing', d: '指定朝向' },
    { v: 'rotated', d: '指定旋转角' }, { v: 'anchored', d: '切换眼睛 / 脚部锚点' },
    { v: 'align', d: '对齐到方块坐标' }, { v: 'in', d: '指定维度' },
    { v: 'on', d: '指定关系实体' }
  ];
  const NBT_KEYS = ['CustomName:', 'CustomNameVisible:', 'Invisible:', 'Marker:', 'NoGravity:', 'Silent:', 'Glowing:', 'Invulnerable:', 'Health:', 'Attributes:', 'HandItems:', 'ArmorItems:', 'ArmorDropChances:', 'HandDropChances:', 'Tags:', 'Rotation:', 'Pos:', 'Motion:', 'PersistenceRequired:', 'NoAI:'];
  const ENTITY_IDS = ['minecraft:zombie', 'minecraft:skeleton', 'minecraft:creeper', 'minecraft:villager', 'minecraft:armor_stand', 'minecraft:item', 'minecraft:boat', 'minecraft:minecart', 'minecraft:cow', 'minecraft:pig', 'minecraft:sheep', 'minecraft:chicken', 'minecraft:wolf', 'minecraft:cat', 'minecraft:horse', 'minecraft:villager_v2', 'minecraft:npc'];
  const PARTICLE_IDS = ['minecraft:flame', 'minecraft:happy_villager', 'minecraft:heart', 'minecraft:cloud', 'minecraft:smoke', 'minecraft:crit', 'minecraft:enchanted_hit', 'minecraft:end_rod', 'minecraft:explosion', 'minecraft:lava', 'minecraft:portal', 'minecraft:soul_fire_flame', 'minecraft:basic_flame_particle'];
  const ITEM_IDS = ['minecraft:diamond', 'minecraft:diamond_sword', 'minecraft:diamond_pickaxe', 'minecraft:iron_ingot', 'minecraft:gold_ingot', 'minecraft:stone', 'minecraft:oak_planks', 'minecraft:glass', 'minecraft:apple', 'minecraft:golden_apple', 'minecraft:bread', 'minecraft:ender_pearl', 'minecraft:arrow', 'minecraft:torch', 'minecraft:command_block'];

  function complexEditionCommands() {
    return COMPLEX.filter((c) => c.edition === state.boxEdition);
  }

  function complexSupported(c) {
    return c.s <= currentVersion().ver + 0.0001;
  }

  function filteredComplex() {
    const q = state.complexQuery.trim().toLowerCase();
    return complexEditionCommands().filter((c) => {
      if (state.complexCat !== '全部' && c.cat !== state.complexCat) return false;
      if (!q) return true;
      return [c.name, c.desc, c.code, c.hint, c.cat].join(' ').toLowerCase().includes(q);
    });
  }

  function complexVersionBanner(all) {
    const cur = currentVersion();
    const supported = all.filter((c) => c.s <= cur.ver + 0.0001).length;
    const hidden = all.length - supported;
    return `
      <div class="version-banner" role="status">
        ${SVG('info')}
        <span><b>${state.boxEdition === 'java' ? 'Java' : '基岩版'} ${esc(cur.label)}</b> · ${supported} / ${all.length} 条复杂指令可用${hidden ? `，${hidden} 条高版本模板已灰显` : ''}。${cur.note ? `<em>${esc(cur.note)}</em>` : ''}</span>
      </div>`;
  }

  function boxComplexHTML() {
    const isJava = state.boxEdition === 'java';
    const all = complexEditionCommands();
    const cats = ['全部', ...Array.from(new Set(all.map((c) => c.cat)))];
    if (state.complexCat !== '全部' && !cats.includes(state.complexCat)) state.complexCat = '全部';
    return `
      <div class="box-edition" role="tablist" aria-label="复杂指令版本">
        <button class="chip ${isJava ? 'is-active' : ''}" type="button" role="tab" aria-selected="${isJava}" data-box-edition="java">Java 版</button>
        <button class="chip ${!isJava ? 'is-active' : ''}" type="button" role="tab" aria-selected="${!isJava}" data-box-edition="bedrock">基岩版</button>
      </div>
      ${versionChipsHTML(state.boxEdition)}
      ${complexVersionBanner(all)}

      <section class="complex-lab" id="complexLab" aria-label="复杂指令实验室">
        <div class="complex-lab-head">
          <div>
            <span class="mono">COMMAND LAB</span>
            <h2>复杂指令实验室</h2>
          </div>
          <span class="complex-status is-idle" id="complexStatus">等待输入</span>
        </div>
        <div class="complex-editor-wrap">
          <textarea id="complexInput" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="复杂指令输入框" placeholder="输入以 / 开头的指令，例如：&#10;/execute as @a at @s run tellraw @s {&quot;text&quot;:&quot;你好&quot;}">${esc(state.complexCode)}</textarea>
          <div class="complex-suggest" id="complexSuggest" hidden></div>
        </div>
        <div class="complex-toolbar">
          <button class="btn btn-primary btn-sm" type="button" data-complex-action="check">${SVG('check')}检查指令</button>
          <button class="btn btn-ghost btn-sm" type="button" data-complex-action="format">${SVG('sparkle')}格式化 JSON</button>
          <button class="btn btn-ghost btn-sm" type="button" data-complex-action="clear">${SVG('close')}清空</button>
          <button class="btn btn-ghost btn-sm" type="button" data-complex-action="copy">${SVG('copy')}复制</button>
        </div>
        <div class="complex-issues" id="complexIssues" aria-live="polite"></div>
        <p class="complex-tip">${SVG('info')}<span>输入时会给出补全建议；检查会验证指令名、括号、JSON、选择器与参数，并提示高危操作。</span></p>
      </section>

      <div class="box-search">
        <div class="input-wrap">
          ${SVG('search')}
          <input id="complexSearch" type="search" value="${esc(state.complexQuery)}" placeholder="搜索复杂指令模板，例如 execute / tellraw / 记分板" aria-label="搜索复杂指令模板" autocomplete="off">
        </div>
        <span class="box-count mono" id="complexCount">${filteredComplex().length} / ${all.length}</span>
      </div>

      <div class="filter-row" role="tablist" aria-label="复杂指令分类">
        ${cats.map((c) => `<button class="chip ${state.complexCat === c ? 'is-active' : ''}" type="button" role="tab" aria-selected="${state.complexCat === c}" data-complex-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>

      <div class="complex-list" id="complexList">${complexCardsHTML()}</div>`;
  }

  function complexCardsHTML() {
    const list = filteredComplex();
    if (!list.length) return `<div class="resource-empty">没有匹配的复杂指令模板。</div>`;
    return list.map((c) => {
      const supported = complexSupported(c);
      return `
      <article class="complex-card${supported ? '' : ' is-unsupported'}" data-complex-id="${esc(c.id)}">
        <div class="complex-card-head">
          <span class="complex-card-ico">${SVG('terminal')}</span>
          <div class="complex-card-title">
            <b>${esc(c.name)}</b>
            <small>${esc(c.cat)} · ${c.edition === 'java' ? 'Java' : '基岩版'} ${esc(minVersionLabel(c.edition, c.s))}+</small>
          </div>
          <span class="tag-mini">${esc(c.cat)}</span>
          ${supported ? '' : `<span class="tag-mini cmd-lock">需 ${esc(minVersionLabel(c.edition, c.s))}</span>`}
        </div>
        <p class="complex-card-desc">${esc(c.desc)}</p>
        <pre class="complex-code mono">${esc(c.code)}</pre>
        <p class="complex-hint">${SVG('info')}<span>${esc(c.hint)}</span></p>
        <div class="complex-card-actions">
          <button class="btn btn-soft btn-sm" type="button" data-complex-load="${esc(c.id)}">${SVG('terminal')}载入编辑器</button>
          <button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(c.code)}">${SVG('copy')}复制</button>
        </div>
      </article>`;
    }).join('');
  }

  function loadComplexTemplate(id) {
    const item = COMPLEX.find((c) => c.id === id);
    if (!item) return;
    state.complexCode = item.code;
    const input = $('#complexInput');
    if (input) {
      input.value = item.code;
      input.focus();
      try { input.setSelectionRange(item.code.length, item.code.length); } catch { /* ignore */ }
    }
    runComplexCheck();
    renderComplexSuggestions();
    const lab = $('#complexLab');
    if (lab) lab.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sfx('tap');
  }

  function onComplexInput() {
    const input = $('#complexInput');
    if (!input) return;
    state.complexCode = input.value;
    renderComplexSuggestions();
    clearTimeout(complex.timer);
    complex.timer = setTimeout(() => runComplexCheck(), 280);
  }

  function runComplexCheck() {
    const input = $('#complexInput');
    if (input) state.complexCode = input.value;
    state.complexResult = checkComplexCommand(state.complexCode);
    renderComplexResult(state.complexResult);
    return state.complexResult;
  }

  function renderComplexResult(result) {
    const status = $('#complexStatus');
    const host = $('#complexIssues');
    if (!status || !host) return;
    const stateName = result && result.state ? result.state : 'idle';
    status.className = 'complex-status is-' + stateName;
    status.textContent = result && result.summary ? result.summary : '等待输入';
    if (!result || !result.issues || !result.issues.length) {
      host.innerHTML = stateName === 'ok'
        ? `<div class="complex-ok">${SVG('check')}<span>语法检查通过，可以复制到游戏里执行。</span></div>`
        : '';
      return;
    }
    host.innerHTML = result.issues.map((i) => `
      <div class="complex-issue is-${esc(i.level)}">
        <span class="complex-issue-ico">${SVG(i.level === 'error' ? 'close' : i.level === 'warn' ? 'info' : 'check')}</span>
        <span>${esc(i.text)}</span>
      </div>`).join('');
  }

  function issue(level, text) { return { level, text }; }

  function tokenizeCommand(code) {
    const src = String(code || '').replace(/^\//, '');
    const tokens = [];
    let cur = '';
    let quote = null;
    let depth = 0;
    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (quote) {
        cur += ch;
        if (ch === quote && src[i - 1] !== '\\') quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
      if (ch === '{' || ch === '[' || ch === '(') { depth++; cur += ch; continue; }
      if (ch === '}' || ch === ']' || ch === ')') { depth = Math.max(0, depth - 1); cur += ch; continue; }
      if (/\s/.test(ch) && depth === 0) {
        if (cur) { tokens.push(cur); cur = ''; }
        continue;
      }
      cur += ch;
    }
    if (cur) tokens.push(cur);
    return tokens;
  }

  function scanBrackets(text) {
    const pairs = { ']': '[', '}': '{', ')': '(' };
    const stack = [];
    const issues = [];
    let quote = null;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quote) {
        if (ch === quote && text[i - 1] !== '\\') quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '[' || ch === '{' || ch === '(') stack.push({ ch, i });
      else if (ch === ']' || ch === '}' || ch === ')') {
        const top = stack.pop();
        if (!top || top.ch !== pairs[ch]) {
          issues.push(issue('error', `第 ${i + 1} 个字符处出现不匹配的「${ch}」`));
        }
      }
    }
    if (quote) issues.push(issue('error', '引号没有闭合，请检查 JSON / NBT 里的引号'));
    if (stack.length) {
      const top = stack[stack.length - 1];
      issues.push(issue('error', `「${top.ch}」没有闭合（第 ${top.i + 1} 个字符）`));
    }
    return issues;
  }

  function extractJsonText(text) {
    const start = text.search(/[\[{]/);
    if (start < 0) return '';
    let depth = 0;
    let quote = null;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (quote) {
        if (ch === quote && text[i - 1] !== '\\') quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
    return text.slice(start);
  }

  function editDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return dp[m][n];
  }

  function closestCommandName(name, names) {
    const lower = String(name).toLowerCase();
    const prefix = names.find((candidate) => candidate.toLowerCase().startsWith(lower));
    if (prefix) return prefix;
    let best = '';
    let bestD = Infinity;
    names.forEach((candidate) => {
      const d = editDistance(lower, candidate.toLowerCase());
      if (d < bestD) { bestD = d; best = candidate; }
    });
    return bestD <= (lower.length <= 3 ? 2 : 3) ? best : '';
  }

  function checkCommandArgs(name, args) {
    const issues = [];
    const needs = {
      give: 2, tp: 2, teleport: 2, setblock: 4, fill: 7, clone: 7, summon: 1,
      tellraw: 2, title: 3, effect: 2, scoreboard: 2, tag: 2, data: 2,
      item: 2, loot: 2, bossbar: 2, attribute: 2, particle: 1, playsound: 1,
      execute: 1, function: 1, schedule: 2, random: 1, place: 1, locate: 1,
      forceload: 1, worldborder: 1, team: 1, advancement: 2, recipe: 2,
      damage: 2, ride: 1, camera: 2, structure: 2, dialogue: 2, fog: 2,
      music: 1, inputpermission: 3, gamemode: 1, xp: 1, clear: 0
    };
    if (needs[name] !== undefined && args.length < needs[name]) {
      issues.push(issue('error', `参数不足：/${name} 至少需要 ${needs[name]} 个参数，当前只有 ${args.length} 个`));
    }
    return issues;
  }

  function validateSelectors(code) {
    const issues = [];
    const re = /@([a-z]+)(\[[^\]]*\])?/gi;
    let match;
    while ((match = re.exec(code))) {
      const type = match[1].toLowerCase();
      if (!['a', 'p', 'r', 's', 'e', 'initiator'].includes(type)) {
        issues.push(issue('error', `未知的选择器 @${match[1]}，可用 @a / @p / @r / @s / @e`));
        continue;
      }
      if (!match[2]) continue;
      const inner = match[2].slice(1, -1).trim();
      if (!inner) continue;
      inner.split(',').forEach((part) => {
        const text = part.trim();
        if (!text) return;
        const eq = text.indexOf('=');
        if (eq < 0) {
          if (!/^scores\.\{/.test(text)) issues.push(issue('warn', `选择器参数「${text}」缺少 =，格式应为 key=value`));
          return;
        }
        const key = text.slice(0, eq).trim();
        if (!SELECTOR_ARGS.includes(key)) {
          issues.push(issue('warn', `选择器参数「${key}」不常见，请确认拼写`));
        }
        const value = text.slice(eq + 1).trim();
        if ((key === 'limit' || key === 'level') && !/^-?\d+$/.test(value)) {
          issues.push(issue('error', `选择器参数 ${key}= 需要整数`));
        }
        if (key === 'distance' && !/^(\d+(\.\d+)?|\.\.\d+(\.\d+)?|\d+(\.\d+)?\.\.)$/.test(value)) {
          issues.push(issue('warn', `distance= 的推荐写法是 5、..10 或 5..10`));
        }
      });
    }
    return issues;
  }

  function fillVolume(args) {
    if (args.length < 7) return 0;
    const num = (token) => {
      const t = String(token || '');
      if (t === '~' || t === '^') return 0;
      if (/^[~^]-?\d+(\.\d+)?$/.test(t)) return Number(t.slice(1));
      if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
      return null;
    };
    const v = args.slice(0, 6).map(num);
    if (v.some((x) => x === null)) return 0;
    return Math.abs(v[3] - v[0] + 1) * Math.abs(v[4] - v[1] + 1) * Math.abs(v[5] - v[2] + 1);
  }

  function checkComplexCommand(raw, edition = state.boxEdition, version = currentVersion(edition)) {
    const code = String(raw == null ? '' : raw).trim();
    if (!code) return { state: 'idle', summary: '等待输入', issues: [] };

    /* 多条独立指令逐行检查；多行 JSON 不拆 */
    const lines = code.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every((line) => line.startsWith('/'))) {
      const collected = [];
      lines.forEach((line, index) => {
        const result = checkComplexCommand(line, edition, version);
        result.issues.forEach((item) => collected.push(Object.assign({}, item, { text: `第 ${index + 1} 行：${item.text}` })));
      });
      const errors = collected.filter((i) => i.level === 'error').length;
      const warnings = collected.filter((i) => i.level === 'warn').length;
      return {
        state: errors ? 'error' : warnings ? 'warn' : 'ok',
        summary: errors
          ? `发现 ${errors} 个错误${warnings ? `、${warnings} 条提醒` : ''}`
          : warnings ? `语法通过，${warnings} 条提醒` : `全部 ${lines.length} 行语法检查通过`,
        issues: collected
      };
    }

    const issues = [];
    if (!code.startsWith('/')) issues.push(issue('error', '指令必须以 / 开头，例如 /execute as @a at @s run say hi'));

    const body = code.replace(/^\//, '').trim();
    const tokens = tokenizeCommand(code);
    const name = (tokens[0] || '').toLowerCase().replace(/^\//, '');
    const allCommands = [...BOX.javaCommands, ...BOX.bedrockCommands];
    const known = allCommands.find((c) => c.c.slice(1).toLowerCase() === name);
    const editionCommands = edition === 'java' ? BOX.javaCommands : BOX.bedrockCommands;

    if (!name) {
      issues.push(issue('error', '缺少指令名'));
    } else if (!known) {
      const names = [...new Set(allCommands.map((c) => c.c.slice(1)))];
      const near = closestCommandName(name, names);
      issues.push(issue('error', `未知指令 /${name}${near ? `，你是不是想用 /${near}？` : ''}`));
    } else {
      if (!editionCommands.some((c) => c.c.slice(1).toLowerCase() === name)) {
        issues.push(issue('warn', `/${name} 不在${edition === 'java' ? ' Java ' : '基岩版'}指令表中，请确认版本`));
      }
      const since = commandSince(known, edition);
      if (since > version.ver + 0.0001) {
        issues.push(issue('error', `/${name} 需要 ${edition === 'java' ? 'Java' : '基岩版'} ${minVersionLabel(edition, since)}+，当前选择的是 ${version.label}`));
      }
    }

    issues.push(...scanBrackets(code));
    issues.push(...validateSelectors(code));
    issues.push(...checkCommandArgs(name, tokens.slice(1)));

    const jsonText = extractJsonText(body);
    if (['tellraw', 'title', 'bossbar'].includes(name) && jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        if (name === 'tellraw' && edition === 'bedrock' && parsed && !parsed.rawtext && !parsed.text) {
          issues.push(issue('warn', '基岩版 tellraw 通常需要 {"rawtext":[...]} 包装'));
        }
        if (name === 'tellraw' && edition === 'java' && parsed && parsed.rawtext) {
          issues.push(issue('warn', 'Java 版 tellraw 使用 text 组件，不使用 rawtext'));
        }
      } catch (err) {
        issues.push(issue('error', 'JSON 解析失败：' + err.message + '（键和字符串必须使用双引号）'));
      }
    } else if (name === 'tellraw') {
      issues.push(issue('warn', 'tellraw 还需要一段 JSON 文本，例如 {"text":"你好"}'));
    }

    if (name === 'execute') {
      const modern = edition === 'java' ? version.ver >= 13 : version.ver >= 19.1;
      if (modern) {
        if (!tokens.includes('run')) issues.push(issue('error', 'execute 条件链末尾需要 run <指令>'));
        else if (tokens[tokens.length - 1] === 'run') issues.push(issue('error', 'run 后面还需要一条要执行的指令'));
      } else {
        if (tokens.length < 6) issues.push(issue('warn', '旧版 execute 需要 <实体> <x> <y> <z> <指令> 五个参数'));
      }
    }

    if (name === 'give') {
      const item = tokens[2] || '';
      if (edition === 'java' && version.ver >= 13 && item && !item.includes(':') && !/^\d+$/.test(item)) {
        issues.push(issue('warn', 'Java 1.13+ 建议使用命名空间 ID，例如 minecraft:diamond'));
      }
      if (edition === 'java' && version.ver >= 13 && /^\d+$/.test(item)) {
        issues.push(issue('error', 'Java 1.13+ 已移除物品数字 ID，请改用命名空间 ID'));
      }
    }

    if (name === 'fill') {
      const volume = fillVolume(tokens.slice(1));
      if (volume > 32768) issues.push(issue('warn', `fill 体积约 ${volume} 格，超过单次 32768 格上限，请拆分执行`));
    }
    if (name === 'kill' && tokens.some((t) => /^@[ae](\[|$)/.test(t))) {
      issues.push(issue('warn', '这会清除所有玩家 / 实体，执行前请确认目标选择器'));
    }
    if (['op', 'deop', 'ban', 'ban-ip', 'pardon', 'stop', 'whitelist'].includes(name)) {
      issues.push(issue('warn', '这是服务器管理指令，请确认你有权限并已备份存档'));
    }
    if (code.includes('command_block') && ['setblock', 'give', 'fill'].includes(name)) {
      issues.push(issue('info', '涉及命令方块，请确认服务器允许使用'));
    }
    if (name === 'function' || name === 'schedule') {
      issues.push(issue('info', '这需要数据包中已存在对应函数'));
    }
    if (/@e\[/.test(code) && !/limit=/.test(code)) {
      issues.push(issue('info', '选择器没有 limit，可能命中大量实体，建议加上 limit=1'));
    }

    const errors = issues.filter((i) => i.level === 'error').length;
    const warnings = issues.filter((i) => i.level === 'warn').length;
    const infos = issues.filter((i) => i.level === 'info').length;
    const summary = errors
      ? `发现 ${errors} 个错误${warnings ? `、${warnings} 条提醒` : ''}`
      : warnings
        ? `语法通过，${warnings} 条提醒${infos ? `、${infos} 条提示` : ''}`
        : `语法检查通过${infos ? ` · ${infos} 条提示` : ''}`;
    return { state: errors ? 'error' : warnings ? 'warn' : 'ok', summary, issues };
  }

  function complexSuggestions(code, caret) {
    const before = String(code || '').slice(0, caret);
    const match = before.match(/([^\s]*)$/);
    const token = match ? match[1] : '';
    const start = caret - token.length;
    const end = caret;
    const tokenLower = token.toLowerCase();
    const editionCommands = state.boxEdition === 'java' ? BOX.javaCommands : BOX.bedrockCommands;
    const bodyBefore = before.replace(/^\//, '');
    const name = (bodyBefore.split(/\s+/)[0] || '').toLowerCase();
    const items = [];

    if (token.startsWith('@')) {
      [
        { value: '@s', desc: '自己' }, { value: '@p', desc: '最近玩家' },
        { value: '@a', desc: '所有玩家' }, { value: '@r', desc: '随机玩家' },
        { value: '@e', desc: '所有实体' }
      ].filter((x) => x.value.startsWith(tokenLower)).forEach((x) => items.push({ value: x.value, label: x.value, desc: x.desc }));
    } else if (tokenLower.startsWith('minecraft:')) {
      BOX.blocks.filter((b) => ('minecraft:' + b.i).startsWith(tokenLower)).slice(0, 10).forEach((b) => {
        items.push({ value: 'minecraft:' + b.i, label: 'minecraft:' + b.i, desc: b.n });
      });
    } else if (token.startsWith('[')) {
      SELECTOR_ARGS.filter((k) => k.startsWith(token.slice(1))).forEach((k) => items.push({ value: k + '=', label: k + '=', desc: '选择器参数' }));
    } else if (token.startsWith('{')) {
      NBT_KEYS.filter((k) => k.toLowerCase().startsWith(token.slice(1).toLowerCase())).forEach((k) => items.push({ value: k, label: k, desc: 'NBT 键' }));
    } else if (!before.trim() || !bodyBefore.includes(' ')) {
      const typed = tokenLower.replace(/^\//, '');
      editionCommands.filter((c) => c.c.slice(1).toLowerCase().startsWith(typed)).slice(0, 10).forEach((c) => {
        items.push({ value: '/' + c.c.slice(1), label: c.c, desc: c.d });
      });
    } else if (name === 'execute') {
      EXECUTE_SUBS.filter((x) => x.v.startsWith(tokenLower)).forEach((x) => items.push({ value: x.v, label: x.v, desc: x.d }));
      if (!tokenLower) {
        ['if block ~ ~-1 ~', 'if entity @e[', 'store result score @s '].forEach((v) => items.push({ value: v, label: v, desc: '常用片段' }));
      }
    } else if (name === 'give') {
      ITEM_IDS.filter((v) => v.startsWith(tokenLower) || !tokenLower).slice(0, 8).forEach((v) => items.push({ value: v, label: v, desc: '物品' }));
    } else if (name === 'summon') {
      ENTITY_IDS.filter((v) => v.startsWith(tokenLower) || !tokenLower).slice(0, 8).forEach((v) => items.push({ value: v, label: v, desc: '实体' }));
    } else if (name === 'particle') {
      PARTICLE_IDS.filter((v) => v.startsWith(tokenLower) || !tokenLower).slice(0, 8).forEach((v) => items.push({ value: v, label: v, desc: '粒子' }));
    } else if (!tokenLower) {
      ['~ ~ ~', '~ ~1 ~', '@s', 'minecraft:'].forEach((v) => items.push({ value: v, label: v, desc: '常用片段' }));
    }
    return { start, end, items: items.slice(0, 10) };
  }

  function renderComplexSuggestions() {
    const input = $('#complexInput');
    const panel = $('#complexSuggest');
    if (!input || !panel) return;
    const caret = typeof input.selectionStart === 'number' ? input.selectionStart : input.value.length;
    const result = complexSuggestions(input.value, caret);
    complex.suggestRange = { start: result.start, end: result.end };
    complex.suggestItems = result.items;
    if (!result.items.length) {
      panel.hidden = true;
      panel.innerHTML = '';
      return;
    }
    if (complex.suggestIndex >= result.items.length) complex.suggestIndex = 0;
    panel.hidden = false;
    panel.innerHTML = result.items.map((item, index) => `
      <button class="complex-suggest-item${index === complex.suggestIndex ? ' is-active' : ''}" type="button" data-complex-suggest="${index}">
        <code>${esc(item.label)}</code>
        <span>${esc(item.desc)}</span>
      </button>`).join('');
  }

  function applyComplexSuggestion(index) {
    const item = complex.suggestItems[index];
    const input = $('#complexInput');
    if (!item || !input) return;
    const range = complex.suggestRange;
    const value = item.value;
    const needSpace = /^(\/|@|minecraft:)/.test(value) || /^[a-z_]+$/.test(value);
    const insert = value + (needSpace ? ' ' : '');
    const next = input.value.slice(0, range.start) + insert + input.value.slice(range.end);
    input.value = next;
    state.complexCode = next;
    const caret = range.start + insert.length;
    try { input.setSelectionRange(caret, caret); } catch { /* ignore */ }
    input.focus();
    renderComplexSuggestions();
    runComplexCheck();
  }

  function onComplexKeyDown(e) {
    if (!complex.suggestItems.length) return;
    const panel = $('#complexSuggest');
    if (!panel || panel.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      complex.suggestIndex = (complex.suggestIndex + dir + complex.suggestItems.length) % complex.suggestItems.length;
      Array.from(panel.children).forEach((el, i) => el.classList.toggle('is-active', i === complex.suggestIndex));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      applyComplexSuggestion(complex.suggestIndex);
    } else if (e.key === 'Escape') {
      panel.hidden = true;
      complex.suggestItems = [];
    }
  }

  function formatComplexJson() {
    const input = $('#complexInput');
    const code = input ? input.value : state.complexCode;
    const start = code.search(/[\[{]/);
    if (start < 0) { toast('没有找到可格式化的 JSON 片段', 'warn'); return; }
    try {
      const json = JSON.parse(code.slice(start));
      const next = code.slice(0, start) + JSON.stringify(json, null, 2);
      if (input) input.value = next;
      state.complexCode = next;
      runComplexCheck();
      toast('JSON 已格式化', 'success');
      sfx('success');
    } catch (err) {
      toast('JSON 解析失败：' + err.message, 'error', 4200);
    }
  }

  function complexAction(action) {
    if (action === 'check') {
      const result = runComplexCheck();
      trackTask('complex-check');
      toast(result.summary, result.state === 'error' ? 'error' : result.state === 'warn' ? 'warn' : 'success');
      sfx(result.state === 'error' ? 'error' : 'success');
    } else if (action === 'format') {
      formatComplexJson();
    } else if (action === 'clear') {
      state.complexCode = '';
      state.complexResult = null;
      const input = $('#complexInput');
      if (input) input.value = '';
      renderComplexResult({ state: 'idle', summary: '等待输入', issues: [] });
      renderComplexSuggestions();
      toast('已清空编辑器', 'info');
    } else if (action === 'copy') {
      if (!state.complexCode.trim()) { toast('先输入或载入一条指令', 'warn'); return; }
      copyText(state.complexCode);
    }
  }

  function boxBlocksHTML() {
    return `
      <div class="box-search">
        <div class="input-wrap">
          ${SVG('search')}
          <input id="blockSearch" type="search" value="${esc(state.blockQuery)}" placeholder="搜索方块：中文名 / 英文名 / minecraft:stone / 数字 ID" aria-label="搜索方块" autocomplete="off">
        </div>
        <span class="box-count mono" id="boxBlockCount">${filterBlocks().length} / ${BOX.blocks.length}</span>
      </div>

      <p class="block-note">${SVG('info')}<span>数字 ID 仅存在于 <b>1.12.2 及更早</b>版本；1.13 起官方已扁平化并移除数字 ID，请统一使用命名空间 ID。点击任意一行复制。</span></p>

      <div class="block-table">
        <div class="block-row is-head" aria-hidden="true">
          <span>方块</span><span>命名空间 ID</span><span class="block-num">数字 ID</span>
        </div>
        <div id="blockList">${blockRowsHTML()}</div>
      </div>`;
  }

  function filterBlocks() {
    const q = state.blockQuery.trim().toLowerCase();
    if (!q) return BOX.blocks;
    return BOX.blocks.filter((b) => [b.n, b.en, b.i, b.num === null ? '' : String(b.num)].join(' ').toLowerCase().includes(q));
  }

  function blockRowsHTML() {
    const list = filterBlocks();
    if (!list.length) return `<div class="resource-empty">没有匹配的方块。</div>`;
    return list.map((b) => `
      <button class="block-row" type="button" data-copy="minecraft:${esc(b.i)}" aria-label="复制方块 ID minecraft:${esc(b.i)}">
        <span class="block-name"><b>${esc(b.n)}</b><small>${esc(b.en)}${b.note ? ' · ' + esc(b.note) : ''}</small></span>
        <code class="block-id">minecraft:${esc(b.i)}</code>
        <span class="block-num${b.num === null ? ' is-none' : ''}">${b.num === null ? '—' : b.num}</span>
      </button>`).join('');
  }

  function boxToolsHTML() {
    return `
      <div class="tool-grid">
        ${BOX.tools.map((t) => `
          <button class="tool-card" type="button" data-tool="${esc(t.id)}">
            <span class="tool-ico">${SVG(t.icon)}</span>
            <span class="tool-main"><b>${esc(t.name)}</b><span>${esc(t.desc)}</span></span>
            <span class="tool-en mono">${esc(t.en)}</span>
            ${SVG('chevron')}
          </button>`).join('')}
      </div>`;
  }

  function toolFieldHTML(f) {
    const id = 'tool-' + f.key;
    if (f.type === 'select') {
      let options = f.options || [];
      if (!options.length && f.key === 'color') {
        options = BOX.colorCodes.map((c) => ({ v: c.code, t: `&${c.code} ${c.name}` }));
      }
      return `
        <div class="field">
          <div class="field-label"><span>${esc(f.label)}</span></div>
          <div class="input-wrap tool-select-wrap">
            <select name="${esc(f.key)}" id="${id}" aria-label="${esc(f.label)}">
              ${options.map((o) => `<option value="${esc(o.v)}"${String(o.v) === String(f.value) ? ' selected' : ''}>${esc(o.t)}</option>`).join('')}
            </select>
          </div>
          ${f.hint ? `<p class="field-hint">${esc(f.hint)}</p>` : ''}
        </div>`;
    }
    const inputType = f.type === 'number' ? 'number' : 'text';
    return `
      <div class="field">
        <div class="field-label"><span>${esc(f.label)}</span></div>
        <div class="input-wrap">
          <input type="${inputType}" name="${esc(f.key)}" id="${id}" value="${esc(f.value)}"${f.min !== undefined ? ` min="${f.min}"` : ''}${f.max !== undefined ? ` max="${f.max}"` : ''} placeholder="${esc(f.placeholder || '')}" aria-label="${esc(f.label)}">
        </div>
        ${f.hint ? `<p class="field-hint">${esc(f.hint)}</p>` : ''}
      </div>`;
  }

  function openToolSheet(id) {
    const tool = BOX.tools.find((t) => t.id === id);
    if (!tool) return;
    if (tool.kind === 'pixel-site') { trackTask('pixel-open'); openBrowserLink('https://mcpixelart.com/'); return; }
    if (tool.kind === 'pixel') { trackTask('pixel-open'); openPixelSheet(); return; }
    if (tool.kind === 'projection') { openProjectionSheet(); return; }
    if (tool.kind === 'seed') { openSeedSheet(); return; }
    if (tool.kind === 'music') { trackTask('music-open'); openMusicSheet(); return; }
    if (tool.kind === 'java') { openJavaSheet(); return; }
    if (tool.kind === 'network') { openNetworkSheet(); return; }
    if (tool.kind === 'dot') { trackTask('dot-open'); openDotSheet(); return; }
    if (id === 'color') trackTask('color-open');
    const content = `
      <form class="tool-form" id="toolForm" data-tool-id="${esc(tool.id)}" novalidate>
        ${tool.fields.map(toolFieldHTML).join('')}
      </form>
      <div class="tool-out" id="toolOut" aria-live="polite"></div>
      <p class="download-note">工具全部在本机计算，不会上传任何数据。</p>`;
    openSheet(content, { title: tool.name, sub: tool.desc });
    runToolFromForm($('#toolForm'));
    setTimeout(() => {
      const first = $('#toolForm input');
      if (first) first.focus({ preventScroll: true });
    }, 80);
  }

  function renderToolOut(result) {
    const host = $('#toolOut');
    if (!host) return;
    host.innerHTML = `
      <div class="tool-out-head">
        <span class="mono">RESULT</span>
        <button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(result.code)}">${SVG('copy')}复制</button>
      </div>
      ${result.preview ? `<div class="tool-preview" style="color:${result.preview.hex};font-weight:${result.preview.bold ? 800 : 400}">${esc(result.preview.text)}</div>` : ''}
      <pre class="tool-code mono">${esc(result.code)}</pre>
      ${result.note ? `<p class="field-hint">${esc(result.note)}</p>` : ''}`;
  }

  /* ---------------- 像素画生成器 ---------------- */
  const PIXEL_MIN = 64;
  const PIXEL_MAX = 2048;
  const DOT_MIN = 5;
  const DOT_MAX = 128;
  const DOT_BLOCKS = PIXEL_BLOCKS;

  function pixelActivePalette() {
    return PIXEL_BLOCKS
      .map((c, index) => ({ ...c, index: index + 1 }))
      .filter((c) => pixel.enabled.has(c.index));
  }

  let pixelLut = { key: '', table: null };
  function pixelPaletteKey(active) {
    return active.map((c) => c.index).join(',');
  }

  /* 32×32×32 RGB 查找表：把“每个像素 × 每个方块”的比较从 2048²×N 降到一次建表。
     这样即使启用全部 1094 种方块，2048×2048 也只需一次 32768×N 的预处理。 */
  function buildPixelLut(active) {
    const table = new Uint16Array(32768);
    const palette = active.map((c) => ({ index: c.index, rgb: parseHexColor(c.hex) }));
    for (let r = 0; r < 32; r++) {
      const rr = Math.round(r * 255 / 31);
      for (let g = 0; g < 32; g++) {
        const gg = Math.round(g * 255 / 31);
        for (let b = 0; b < 32; b++) {
          const bb = Math.round(b * 255 / 31);
          let best = palette[0] ? palette[0].index : 0;
          let bestD = Infinity;
          for (let i = 0; i < palette.length; i++) {
            const p = palette[i].rgb;
            const d = (p.r - rr) * (p.r - rr) * 0.30 +
                      (p.g - gg) * (p.g - gg) * 0.59 +
                      (p.b - bb) * (p.b - bb) * 0.11;
            if (d < bestD) { bestD = d; best = palette[i].index; }
          }
          table[(r << 10) | (g << 5) | b] = best;
        }
      }
    }
    return table;
  }

  function pixelEnsureLut() {
    const active = pixelActivePalette();
    if (!active.length) return null;
    const key = pixelPaletteKey(active);
    if (pixelLut.key !== key) {
      pixelLut = { key, table: buildPixelLut(active) };
    }
    return pixelLut.table;
  }

  function pixelPaletteIndexFor(r, g, b) {
    const table = pixelEnsureLut();
    if (!table) return 0;
    return table[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
  }

  function parseHexColor(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return { r: 0, g: 0, b: 0 };
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function pixelGridFromImage(img, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grid = new Uint16Array(size * size);
    if (!ctx || !img || !img.width || !img.height) return grid;
    ctx.imageSmoothingEnabled = true;
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    const data = ctx.getImageData(0, 0, size, size).data;
    const table = pixelEnsureLut();
    if (!table) return grid;
    const indexFor = (r, g, b) => table[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];

    if (pixel.dither && size <= 512) {
      const work = new Float32Array(size * size * 3);
      for (let i = 0; i < size * size; i++) {
        work[i * 3] = data[i * 4];
        work[i * 3 + 1] = data[i * 4 + 1];
        work[i * 3 + 2] = data[i * 4 + 2];
      }
      const clamp = (v) => Math.max(0, Math.min(255, v));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const p = y * size + x;
          if (data[p * 4 + 3] < 40) { grid[p] = 0; continue; }
          const r = clamp(work[p * 3]);
          const g = clamp(work[p * 3 + 1]);
          const b = clamp(work[p * 3 + 2]);
          const idx = indexFor(r, g, b);
          grid[p] = idx;
          const c = parseHexColor(PIXEL_BLOCKS[idx - 1] ? PIXEL_BLOCKS[idx - 1].hex : '#000000');
          const er = r - c.r, eg = g - c.g, eb = b - c.b;
          const spread = (nx, ny, f) => {
            if (nx < 0 || nx >= size || ny < 0 || ny >= size) return;
            const q = ny * size + nx;
            if (data[q * 4 + 3] < 40) return;
            work[q * 3] += er * f;
            work[q * 3 + 1] += eg * f;
            work[q * 3 + 2] += eb * f;
          };
          spread(x + 1, y, 7 / 16);
          spread(x - 1, y + 1, 3 / 16);
          spread(x, y + 1, 5 / 16);
          spread(x + 1, y + 1, 1 / 16);
        }
      }
      return grid;
    }

    for (let i = 0; i < size * size; i++) {
      const alpha = data[i * 4 + 3];
      if (alpha < 40) { grid[i] = 0; continue; }
      grid[i] = indexFor(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
    }
    return grid;
  }

  function pixelBlockName(index) {
    return index > 0 && PIXEL_BLOCKS[index - 1] ? PIXEL_BLOCKS[index - 1].block : null;
  }

  function pixelCount() {
    let count = 0;
    for (let i = 0; i < pixel.grid.length; i++) if (pixel.grid[i]) count += 1;
    return count;
  }

  function regridPixel() {
    pixel.grid = pixel.source ? pixelGridFromImage(pixel.source, pixel.size) : new Uint16Array(pixel.size * pixel.size);
    drawPixelPreview();
  }

  function drawPixelPreview() {
    const canvas = $('#pixelCanvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const size = pixel.size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    if (!octx) return;
    const image = octx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const palette = pixel.grid[i];
      const p = palette > 0 && PIXEL_BLOCKS[palette - 1] ? parseHexColor(PIXEL_BLOCKS[palette - 1].hex) : { r: 16, g: 23, b: 32 };
      image.data[i * 4] = p.r;
      image.data[i * 4 + 1] = p.g;
      image.data[i * 4 + 2] = p.b;
      image.data[i * 4 + 3] = 255;
    }
    octx.putImageData(image, 0, 0);
    canvas.width = 512;
    canvas.height = 512;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(off, 0, 0, 512, 512);
    const count = $('#pixelCount');
    if (count) count.textContent = `${pixelCount()} 格`;
  }

  function pixelPaletteList() {
    const q = String(pixel.paletteQuery || '').trim().toLowerCase();
    let list = PIXEL_BLOCKS.map((c, index) => ({ ...c, index: index + 1 }));
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q) || String(c.en || '').toLowerCase().includes(q) || c.block.toLowerCase().includes(q));
    } else if (pixel.paletteGroup === 'recommended') {
      const recommended = new Set(PIXEL_RECOMMENDED);
      list = list.filter((c) => recommended.has(c.block));
    } else if (pixel.paletteGroup !== 'all') {
      list = list.filter((c) => c.group === pixel.paletteGroup);
    }
    return list;
  }

  function pixelPaletteGroupsHTML() {
    const keys = ['recommended'];
    Object.keys(PIXEL_GROUP_LABELS).forEach((key) => {
      if (key !== 'recommended' && key !== 'all') keys.push(key);
    });
    keys.push('all');
    return keys.map((key) => {
      const label = PIXEL_GROUP_LABELS[key] || key;
      const active = !pixel.paletteQuery && pixel.paletteGroup === key;
      return `<button class="palette-group ${active ? 'is-active' : ''}" type="button" data-pixel-group="${esc(key)}" aria-pressed="${active}">${esc(label)}</button>`;
    }).join('');
  }

  function pixelPaletteChipsHTML(list = pixelPaletteList()) {
    if (!list.length) return `<p class="palette-empty">没有找到方块，换个关键词试试</p>`;
    return list.map((c) => `
      <button class="block-chip ${pixel.enabled.has(c.index) ? 'is-active' : ''}" type="button" data-pixel-block="${c.index}" aria-pressed="${pixel.enabled.has(c.index)}" title="${esc(c.name)} · ${esc(c.block)}">
        <i style="background:${esc(c.hex)}"></i><span>${esc(c.name)}</span>
      </button>`).join('');
  }

  function renderPixelPalette() {
    const host = $('#pixelPalette');
    if (!host) return;
    const all = pixelPaletteList();
    const shown = all.slice(0, pixel.paletteLimit);
    host.innerHTML = pixelPaletteChipsHTML(shown);
    const count = $('#pixelPaletteCount');
    if (count) count.textContent = `已启用 ${pixel.enabled.size} / ${PIXEL_BLOCKS.length} 种 · 当前显示 ${shown.length} / ${all.length}`;
    const more = $('#pixelPaletteMore');
    if (more) more.hidden = all.length <= shown.length;
  }

  function openPixelSheet() {
    if (pixel.source && pixel.grid.length !== pixel.size * pixel.size) pixel.grid = pixelGridFromImage(pixel.source, pixel.size);
    const content = `
      <div class="pixel-toolbar">
        <label class="pixel-field pixel-size-field"><span>尺寸 <output class="mono" id="pixelSizeVal">${pixel.size} × ${pixel.size}</output></span>
          <input id="pixelSize" type="range" min="${PIXEL_MIN}" max="${PIXEL_MAX}" step="1" value="${pixel.size}" aria-label="像素画尺寸">
        </label>
        <button class="btn btn-ghost btn-sm" type="button" data-pixel-action="import">${SVG('download')}导入图片</button>
        <button class="btn btn-ghost btn-sm" type="button" data-pixel-action="clear">${SVG('trash')}清空画布</button>
        <span class="pixel-count mono" id="pixelCount">${pixelCount()} 格</span>
      </div>
      <div class="palette-head">
        <div class="field-label"><span>像素画方块</span><small>Minecraft 1.21.4 · 共 ${PIXEL_BLOCKS.length} 种</small></div>
        <label class="pixel-dither"><input id="pixelDither" type="checkbox" ${pixel.dither ? 'checked' : ''}> 抖动混色 <small>小尺寸更自然</small></label>
      </div>
      <div class="palette-groups" id="pixelPaletteGroups">${pixelPaletteGroupsHTML()}</div>
      <div class="palette-search-row">
        <div class="input-wrap palette-search">
          ${SVG('search')}
          <input id="pixelPaletteSearch" type="search" placeholder="搜索方块，如：混凝土 / wool / 铜" value="${esc(pixel.paletteQuery)}" autocomplete="off" aria-label="搜索 Minecraft 方块">
        </div>
        <button class="mini-link" type="button" data-pixel-bulk="all">全选当前</button>
        <button class="mini-link" type="button" data-pixel-bulk="none">清空</button>
        <button class="mini-link" type="button" data-pixel-bulk="reset">恢复推荐</button>
      </div>
      <div class="block-palette" id="pixelPalette">${pixelPaletteChipsHTML(pixelPaletteList().slice(0, pixel.paletteLimit))}</div>
      <div class="palette-foot">
        <span class="pixel-count mono" id="pixelPaletteCount">已启用 ${pixel.enabled.size} / ${PIXEL_BLOCKS.length} 种</span>
        <button class="mini-link" type="button" id="pixelPaletteMore" data-pixel-bulk="more" ${pixelPaletteList().length <= pixel.paletteLimit ? 'hidden' : ''}>显示更多</button>
      </div>
      <div class="pixel-stage">
        <canvas id="pixelCanvas" width="512" height="512" aria-label="像素画预览"></canvas>
        <p class="pixel-stage-hint">导入图片后按所选 Minecraft 方块量化；尺寸可滑动 64–2048 精准调整</p>
      </div>
      <div class="pixel-export-row">
        <button class="btn btn-primary btn-sm" type="button" data-pixel-action="export">${SVG('download')}导出 .schem 投影文件</button>
        <span class="field-hint">导出到：${esc(exportPathLabel())}</span>
      </div>
      <input type="file" id="pixelFile" accept="image/*" hidden>
      <p class="download-note">图片只在本机处理，不会上传。方块列表覆盖 Minecraft 1.21.4 全部可放置方块；颜色为纹理平均色的近似值，导出前可切换方块微调。尺寸最大 2048×2048，导出大文件时请耐心等待。</p>`;
    openSheet(content, { title: 'MC像素画生成器', sub: '导入图片 → 选择方块 → 导出投影文件' });
    drawPixelPreview();
    renderPixelPalette();
    const file = $('#pixelFile');
    if (file) file.addEventListener('change', () => {
      readPixelFile(file.files && file.files[0]);
      file.value = '';
    });
  }

  function readPixelFile(file) {
    if (!file || typeof FileReader !== 'function') { toast('当前环境不支持读取图片', 'warn'); return; }
    if (!/^image\//.test(file.type)) { toast('请选择图片文件', 'warn'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        pixel.source = img;
        pixel.grid = pixelGridFromImage(img, pixel.size);
        drawPixelPreview();
        recordActivity('generate', { tool: 'MC像素画', title: `${pixel.size} × ${pixel.size}`, detail: `${pixelCount()} 个方块 · 导入图片生成` });
        toast(`图片已转换为 ${pixel.size} × ${pixel.size} 像素画`, 'success', 3200);
        sfx('success');
      };
      img.onerror = () => toast('图片解码失败，换一张试试', 'error');
      img.src = String(reader.result || '');
    };
    reader.onerror = () => toast('图片读取失败', 'error');
    reader.readAsDataURL(file);
  }

  function pixelAction(action) {
    if (action === 'import') {
      const file = $('#pixelFile');
      if (file) file.click();
    } else if (action === 'clear') {
      pixel.source = null;
      pixel.grid = new Uint16Array(pixel.size * pixel.size);
      drawPixelPreview();
      toast('已清空像素画', 'info');
    } else if (action === 'export') {
      exportPixelSchematic();
    }
  }

  function pixelBulk(action) {
    if (action === 'more') {
      pixel.paletteLimit += 160;
      renderPixelPalette();
      return;
    }
    if (action === 'all') {
      pixelPaletteList().forEach((c) => pixel.enabled.add(c.index));
    } else if (action === 'none') {
      pixel.enabled.clear();
      const first = PIXEL_BY_BLOCK['minecraft:white_concrete'] || PIXEL_BY_BLOCK['minecraft:stone'] || 1;
      pixel.enabled.add(first);
    } else if (action === 'reset') {
      pixel.enabled = new Set(PIXEL_CONCRETE_IDS.map((id) => PIXEL_BY_BLOCK[id]).filter(Boolean));
    }
    pixelLut = { key: '', table: null };
    renderPixelPalette();
    if (pixel.source) {
      if (pixelPaletteTimer) clearTimeout(pixelPaletteTimer);
      pixelPaletteTimer = setTimeout(() => { pixelPaletteTimer = null; regridPixel(); }, 80);
    }
    sfx('tap');
  }

  function pixelBlocksForSchematic() {
    const size = pixel.size;
    const blocks = new Array(size * size).fill('minecraft:air');
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const block = pixelBlockName(pixel.grid[row * size + col]);
        if (block) blocks[(size - 1 - row) * size + col] = block;
      }
    }
    return blocks;
  }

  async function exportPixelSchematic() {
    if (!pixelCount()) { toast('先导入一张图片', 'warn'); return; }
    if (!window.WWNBT) { toast('投影文件模块未加载', 'error'); return; }
    if (pixel.grid.length !== pixel.size * pixel.size) regridPixel();
    const size = pixel.size;
    const filename = `worldweave-pixel-${size}.schem`;
    if (size > 1024) toast(`${size}×${size} 文件较大，生成可能需要一会儿`, 'info', 4200);
    showExportProgress('正在生成像素画投影', `${size}×${size} · 准备方块`);
    setExportProgress(8, '正在按所选方块生成网格…');
    await new Promise((r) => setTimeout(r, 40));
    const blocks = pixelBlocksForSchematic();
    setExportProgress(42, '正在写入 Sponge 投影数据…');
    await new Promise((r) => setTimeout(r, 30));
    const built = window.WWNBT.buildSchematic({
      width: size, height: size, length: 1, blocks,
      name: `世界织卷像素画 ${size}x${size}`, author: '世界织卷'
    });
    setExportProgress(68, '正在压缩投影文件…');
    const data = await window.WWNBT.gzip(built.data);
    setExportProgress(86, '正在保存到下载路径…');
    const saved = await saveExportFile(filename, data, 'application/octet-stream');
    if (!saved) { hideExportProgress(); return; }
    setExportProgress(100, '导出成功');
    hideExportProgress(1100);
    const path = exportPathLabel();
    recordActivity('generate', { tool: 'MC像素画', title: `${size}×${size}`, detail: `${pixelCount()} 个方块 · 导入图片生成` });
    recordActivity('export', { tool: 'MC像素画', title: `${size}×${size}`, detail: `${built.blockCount} 个方块 · ${data.length} 字节`, filename, path, bytes: data.length });
    trackTask('pixel-export');
    trackTask('projection-export');
    toast(`导出成功：${path}/${filename}`, 'success', 5200);
    sfx('success');
  }

  /* ---------------- MC点阵字 ---------------- */
  const DOT_FONTS = [
    { id: 'hei', name: '黑体', css: '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif' },
    { id: 'song', name: '宋体', css: '"SimSun", "Songti SC", "Noto Serif SC", serif' },
    { id: 'kai', name: '楷体', css: '"KaiTi", "Kaiti SC", "STKaiti", serif' },
    { id: 'fang', name: '仿宋', css: '"FangSong", "FangSong_GB2312", "STFangsong", serif' }
  ];
  const dot = {
    text: '世界织卷',
    size: 40,
    block: 'minecraft:black_concrete',
    direction: 'horizontal',
    font: 'hei',
    grid: null
  };

  function dotBlockInfo(block) {
    return DOT_BLOCKS.find((b) => b.block === block) || DOT_BLOCKS[0];
  }

  function dotBlockOptionsHTML() {
    const groups = Object.keys(PIXEL_GROUP_LABELS).filter((g) => g !== 'recommended' && g !== 'all');
    return groups.map((group) => {
      const items = DOT_BLOCKS.filter((b) => b.group === group);
      if (!items.length) return '';
      return `<optgroup label="${esc(PIXEL_GROUP_LABELS[group])}">${items.map((b) => `<option value="${esc(b.block)}"${dot.block === b.block ? ' selected' : ''}>${esc(b.name)}</option>`).join('')}</optgroup>`;
    }).join('');
  }

  function buildDotGrid() {
    const size = dot.size;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Uint8Array(size * size);
    ctx.clearRect(0, 0, size, size);
    let font = Math.floor(size * 0.66);
    const fontFamily = (DOT_FONTS.find((f) => f.id === dot.font) || DOT_FONTS[0]).css;
    const fontCss = (px) => `900 ${px}px ${fontFamily}`;
    ctx.font = fontCss(font);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    while (font > 4 && ctx.measureText(dot.text).width > size * 0.9) {
      font -= 1;
      ctx.font = fontCss(font);
    }
    ctx.fillStyle = '#000';
    ctx.fillText(dot.text, size / 2, size / 2 + font * 0.02);
    const data = ctx.getImageData(0, 0, size, size).data;
    const grid = new Uint8Array(size * size);
    for (let i = 0; i < size * size; i++) grid[i] = data[i * 4 + 3] > 110 ? 1 : 0;
    return grid;
  }

  function drawDotPreview() {
    const canvas = $('#dotCanvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    if (!dot.grid) dot.grid = buildDotGrid();
    const size = dot.size;
    const info = dotBlockInfo(dot.block);
    const color = parseHexColor(info.hex);
    const lum = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
    const darkBlock = lum < 92;
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    if (!octx) return;
    octx.fillStyle = darkBlock ? '#c9d0d0' : '#101720';
    octx.fillRect(0, 0, size, size);
    octx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (dot.grid[row * size + col]) octx.fillRect(col, row, 1, 1);
      }
    }
    if (size <= 64) {
      octx.strokeStyle = darkBlock ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.10)';
      octx.lineWidth = 1 / size;
      for (let i = 1; i < size; i++) {
        octx.beginPath();
        octx.moveTo(i, 0);
        octx.lineTo(i, size);
        octx.stroke();
        octx.beginPath();
        octx.moveTo(0, i);
        octx.lineTo(size, i);
        octx.stroke();
      }
    }
    const ctx = canvas.getContext('2d');
    canvas.width = 360;
    canvas.height = 360;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 360, 360);
    if (dot.direction === 'vertical') {
      ctx.save();
      ctx.translate(360, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(off, 0, 0, 360, 360);
      ctx.restore();
    } else {
      ctx.drawImage(off, 0, 0, 360, 360);
    }
    const count = $('#dotCount');
    if (count) count.textContent = `${dot.grid.reduce((sum, v) => sum + v, 0)} 个格子`;
  }

  function openDotSheet() {
    dot.grid = buildDotGrid();
    openSheet(`
      <div class="field">
        <div class="field-label"><span>文字</span><small>支持中文 / 英文</small></div>
        <div class="input-wrap"><input id="dotText" type="text" maxlength="20" value="${esc(dot.text)}" aria-label="点阵字内容" autocomplete="off"></div>
      </div>
      <div class="pixel-toolbar">
        <label class="pixel-field pixel-size-field dot-size-field"><span>网格 <output class="mono" id="dotSizeVal">${dot.size} × ${dot.size}</output></span>
          <input id="dotSize" type="range" min="${DOT_MIN}" max="${DOT_MAX}" step="1" value="${dot.size}" aria-label="点阵字网格大小">
        </label>
        <label class="pixel-field"><span>字体</span>
          <select id="dotFont">${DOT_FONTS.map((f) => `<option value="${f.id}"${dot.font === f.id ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}</select>
        </label>
        <label class="pixel-field"><span>方块</span>
          <select id="dotBlock">${dotBlockOptionsHTML()}</select>
        </label>
        <label class="pixel-field"><span>方向</span>
          <select id="dotDir">
            <option value="horizontal"${dot.direction === 'horizontal' ? ' selected' : ''}>横向</option>
            <option value="vertical"${dot.direction === 'vertical' ? ' selected' : ''}>纵向</option>
          </select>
        </label>
      </div>
      <div class="pixel-stage">
        <canvas id="dotCanvas" width="360" height="360" aria-label="点阵字预览"></canvas>
        <p class="pixel-stage-hint" id="dotCount">${dot.grid.reduce((sum, v) => sum + v, 0)} 个格子</p>
      </div>
      <div class="pixel-export-row">
        <button class="btn btn-primary btn-sm" type="button" data-dot-action="export">${SVG('download')}导出 .schem 投影文件</button>
        <span class="field-hint">导出到：${esc(exportPathLabel())}</span>
      </div>
      <p class="download-note">网格可滑动 5–128 精准调整；点阵字按 1 格 = 1 方块导出，横向为 x/y 平面，纵向为 z/y 平面，每个格子使用你选择的 Minecraft 方块。</p>
    `, { title: 'MC点阵字', sub: '文字 → 点阵 → 投影文件' });
    drawDotPreview();
  }

  function dotAction(action) {
    if (action === 'export') exportDotSchematic();
  }

  function dotBlocksForSchematic() {
    const size = dot.size;
    const vertical = dot.direction === 'vertical';
    const width = vertical ? 1 : size;
    const height = size;
    const length = vertical ? size : 1;
    const blocks = new Array(width * height * length).fill('minecraft:air');
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!dot.grid[row * size + col]) continue;
        const x = vertical ? 0 : col;
        const y = size - 1 - row;
        const z = vertical ? col : 0;
        blocks[x + z * width + y * width * length] = dot.block;
      }
    }
    return { width, height, length, blocks };
  }

  async function exportDotSchematic() {
    if (!dot.grid || !dot.grid.some(Boolean)) { toast('先输入文字生成点阵', 'warn'); return; }
    if (!window.WWNBT) { toast('投影文件模块未加载', 'error'); return; }
    if (dot.grid.length !== dot.size * dot.size) { dot.grid = buildDotGrid(); drawDotPreview(); }
    const dims = dotBlocksForSchematic();
    const filename = `worldweave-dot-${dot.size}.schem`;
    showExportProgress('正在生成点阵字投影', `${dot.size}×${dot.size} · ${dotBlockInfo(dot.block).name}`);
    setExportProgress(20, '正在写入方块数据…');
    await new Promise((r) => setTimeout(r, 30));
    const built = window.WWNBT.buildSchematic({
      width: dims.width, height: dims.height, length: dims.length, blocks: dims.blocks,
      name: `世界织卷点阵字 ${dot.text}`, author: '世界织卷'
    });
    setExportProgress(68, '正在压缩投影文件…');
    const data = await window.WWNBT.gzip(built.data);
    setExportProgress(86, '正在保存到下载路径…');
    const saved = await saveExportFile(filename, data, 'application/octet-stream');
    if (!saved) { hideExportProgress(); return; }
    setExportProgress(100, '导出成功');
    hideExportProgress(1100);
    const path = exportPathLabel();
    recordActivity('generate', { tool: 'MC点阵字', title: dot.text || '点阵字', detail: `${dot.size}×${dot.size} · ${dotBlockInfo(dot.block).name}` });
    recordActivity('export', { tool: 'MC点阵字', title: dot.text || '点阵字', detail: `${dims.width}×${dims.height}×${dims.length} · ${data.length} 字节`, filename, path, bytes: data.length });
    trackTask('dot-export');
    trackTask('projection-export');
    toast(`导出成功：${path}/${filename}`, 'success', 5200);
    sfx('success');
  }

  /* ---------------- MC种子查找器 ---------------- */
  function openSeedSheet() {
    trackTask('seed-open');
    openSheet(`
      <div class="form-intro">
        <b>种子地图</b>
        <p>输入世界种子，选择 Java / 基岩版，然后打开 Chunkbase 种子地图查找村庄、要塞、群系与结构。</p>
      </div>
      <div class="field">
        <div class="field-label"><span>世界种子</span><small>数字或文字</small></div>
        <div class="input-wrap"><input id="seedInput" type="text" placeholder="例如 123456789" aria-label="世界种子" autocomplete="off"></div>
      </div>
      <div class="field">
        <div class="field-label"><span>版本</span></div>
        <div class="input-wrap tool-select-wrap">
          <select id="seedEdition" aria-label="种子版本">
            <option value="java">Java 版</option>
            <option value="bedrock">基岩版</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-block" type="button" data-action="open-seed-map">${SVG('globe')}打开种子地图</button>
      <div class="seed-links">
        <a href="https://www.chunkbase.com/apps/seed-map" target="_blank" rel="noopener noreferrer">Chunkbase 种子地图 ${SVG('external')}</a>
        <a href="https://mcseedmap.net/" target="_blank" rel="noopener noreferrer">MCSeedMap ${SVG('external')}</a>
      </div>
      <p class="download-note">种子地图由第三方网站提供；本应用只负责把种子和版本带到对应页面。</p>
    `, { title: 'MC种子查找器', sub: '输入种子，查找结构与群系' });
  }

  function openSeedMap() {
    const input = $('#seedInput');
    const seed = input ? input.value.trim() : '';
    const edition = $('#seedEdition') ? $('#seedEdition').value : 'java';
    if (!seed) { toast('先输入世界种子', 'warn'); return; }
    const url = `https://www.chunkbase.com/apps/seed-map#seed=${encodeURIComponent(seed)}&platform=${encodeURIComponent(edition)}`;
    trackTask('seed-open');
    toast(`正在用 ${edition === 'java' ? 'Java' : '基岩版'} 打开种子 ${seed}…`, 'info', 3000);
    openBrowserLink(url);
  }

  /* ---------------- MC红石音乐 ---------------- */
  const MUSIC_INSTRUMENTS = [
    { id: 'harp', name: '竖琴 / 钢琴' }, { id: 'bass', name: '贝斯' }, { id: 'snare', name: '小军鼓' },
    { id: 'hat', name: '击鼓沿' }, { id: 'bell', name: '钟' }, { id: 'flute', name: '长笛' },
    { id: 'chime', name: '钟琴' }, { id: 'guitar', name: '吉他' }, { id: 'xylophone', name: '木琴' },
    { id: 'iron_xylophone', name: '铁木琴' }, { id: 'cow_bell', name: '牛铃' }, { id: 'didgeridoo', name: '迪吉里杜管' },
    { id: 'bit', name: '8-bit' }, { id: 'banjo', name: '班卓琴' }, { id: 'pling', name: '电子琴' },
    { id: 'zombie', name: '僵尸' }, { id: 'skeleton', name: '骷髅' }, { id: 'creeper', name: '苦力怕' },
    { id: 'dragon', name: '末影龙' }, { id: 'wither_skeleton', name: '凋灵骷髅' }, { id: 'piglin', name: '猪灵' }
  ];
  let musicInstrument = 'harp';

  function openMusicSheet() {
    openSheet(`
      <p class="projection-intro">${SVG('info')}<span>红石音乐使用 Minecraft 的 <b>音符盒</b> 方块。先选择音色，再到 Note Block Studio / 社区制作或下载作品；点击卡片会复制链接。</span></p>
      <div class="pixel-toolbar">
        <label class="pixel-field"><span>音符盒方块</span><input type="text" value="minecraft:note_block" readonly aria-label="音符盒方块"></label>
        <label class="pixel-field"><span>音色</span>
          <select id="musicInstrument">${MUSIC_INSTRUMENTS.map((m) => `<option value="${m.id}"${musicInstrument === m.id ? ' selected' : ''}>${esc(m.name)}</option>`).join('')}</select>
        </label>
      </div>
      <div class="projection-list">
        <a class="projection-card" href="https://noteblock.studio/" target="_blank" rel="noopener noreferrer">
          <span class="projection-ico">${SVG('sound')}</span>
          <span class="projection-main"><b>Note Block Studio</b><small>NOTEBOOK.STUDIO</small><span>开源音符盒音乐编辑器，可导入 MIDI 并导出 Minecraft 音符盒结构。</span><span class="projection-tags"><i>红石音乐</i><i>MIDI</i><i>开源</i></span></span>
          ${SVG('external')}
        </a>
        <a class="projection-card" href="https://noteblock.world/" target="_blank" rel="noopener noreferrer">
          <span class="projection-ico">${SVG('sound')}</span>
          <span class="projection-main"><b>Note Block World</b><small>NOTEBLOCK.WORLD</small><span>红石音乐作品社区，可浏览、试听与下载音符盒音乐。</span><span class="projection-tags"><i>社区</i><i>作品</i><i>下载</i></span></span>
          ${SVG('external')}
        </a>
        <a class="projection-card" href="https://github.com/OpenNBS/NoteBlockStudio" target="_blank" rel="noopener noreferrer">
          <span class="projection-ico">${SVG('globe')}</span>
          <span class="projection-main"><b>NoteBlockStudio GitHub</b><small>OPENNBS</small><span>源码与历史版本，适合想研究格式或自行编译的用户。</span><span class="projection-tags"><i>源码</i><i>GitHub</i><i>历史版本</i></span></span>
          ${SVG('external')}
        </a>
      </div>
      <p class="download-note">当前音色：${esc((MUSIC_INSTRUMENTS.find((m) => m.id === musicInstrument) || MUSIC_INSTRUMENTS[0]).name)} · 方块：minecraft:note_block。红石音乐通常以 .nbs / .schematic 等形式分享。</p>
    `, { title: 'MC红石音乐', sub: 'Minecraft 音符盒 · 方块 / 音色选择' });
  }

  /* ---------------- Java 下载 ---------------- */
  function openJavaSheet() {
    openSheet(`
      <p class="projection-intro">${SVG('info')}<span>Minecraft Java 版需要 Java 运行环境：1.12.2 及更早常用 Java 8，1.17+ 推荐 Java 17 / 21；Java 26 为较新的预览版本。</span></p>
      <div class="java-list">
        <a class="java-card" href="https://adoptium.net/temurin/releases/?version=8" target="_blank" rel="noopener noreferrer">
          <span class="java-ver">8</span>
          <span class="java-main"><b>Java 8（LTS）</b><small>Eclipse Temurin 8</small><span>适合 1.12.2 及更早版本、老整合包与部分服务端。</span></span>
          ${SVG('external')}
        </a>
        <a class="java-card" href="https://adoptium.net/temurin/releases/?version=17" target="_blank" rel="noopener noreferrer">
          <span class="java-ver">17</span>
          <span class="java-main"><b>Java 17（LTS）</b><small>Eclipse Temurin 17</small><span>适合 1.17–1.20.4 的大量整合包与模组。</span></span>
          ${SVG('external')}
        </a>
        <a class="java-card" href="https://adoptium.net/temurin/releases/?version=21" target="_blank" rel="noopener noreferrer">
          <span class="java-ver">21</span>
          <span class="java-main"><b>Java 21（LTS）</b><small>Eclipse Temurin 21</small><span>适合 1.20.5+、1.21+ 与较新的模组 / 服务端。</span></span>
          ${SVG('external')}
        </a>
        <a class="java-card" href="https://jdk.java.net/26/" target="_blank" rel="noopener noreferrer">
          <span class="java-ver">26</span>
          <span class="java-main"><b>Java 26</b><small>OpenJDK Early Access</small><span>较新的预览版，适合测试新特性；普通游戏建议优先 LTS。</span></span>
          ${SVG('external')}
        </a>
      </div>
      <p class="download-note">下载入口为 Adoptium / OpenJDK 官方页面；点击链接会复制地址并尝试用手机浏览器打开。</p>
    `, { title: 'Java 下载', sub: 'Java 8 / 17 / 21 / 26' });
  }

  /* ---------------- 联网工具 ---------------- */
  function openNetworkSheet() {
    const tools = [
      { name: '樱花内网穿透', en: 'SAKURAFRP', url: 'https://www.natfrp.com/', desc: '国内常用的内网穿透服务，适合把本机 Minecraft 服务端映射到公网联机。', tags: ['内网穿透', '联机', '中文'] },
      { name: '蓝盾（Radmin LAN）', en: 'RADMIN LAN', url: 'https://www.radmin-lan.cn/', desc: '虚拟局域网联机工具，和好友加入同一网络后可直接进局域网游戏。', tags: ['虚拟局域网', '联机', '简单'] },
      { name: 'playit.gg', en: 'PLAYIT.GG', url: 'https://playit.gg/', desc: '免费的 Minecraft 隧道服务，创建隧道后把地址发给朋友即可加入。', tags: ['隧道', '免费', '跨平台'] },
      { name: 'Cloudflare Tunnel', en: 'CLOUDFLARE', url: 'https://www.cloudflare.com/zh-cn/products/tunnel/', desc: 'Cloudflare 官方隧道，适合有域名的服务器安全暴露到公网。', tags: ['隧道', '安全', '域名'] },
      { name: 'ZeroTier', en: 'ZEROTIER', url: 'https://www.zerotier.com/', desc: '成熟的虚拟局域网方案，跨平台组网，适合长期联机的小团队。', tags: ['虚拟局域网', '跨平台', '组网'] },
      { name: '蒲公英', en: 'PGY', url: 'https://pgy.oray.com/', desc: '贝锐蒲公英异地组网，适合多设备、多地点联机。', tags: ['异地组网', '中文', '联机'] }
    ];
    openSheet(`
      <p class="projection-intro">${SVG('info')}<span>联机前请确认游戏版本与模组一致；使用第三方穿透 / 组网服务时，注意账号与网络安全。</span></p>
      <div class="network-list">
        ${tools.map((t) => `
          <a class="network-card" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">
            <span class="network-ico">${SVG('globe')}</span>
            <span class="network-main">
              <b>${esc(t.name)}</b><small>${esc(t.en)}</small>
              <span>${esc(t.desc)}</span>
              <span class="projection-tags">${t.tags.map((tag) => `<i>${esc(tag)}</i>`).join('')}</span>
            </span>
            ${SVG('external')}
          </a>`).join('')}
      </div>
      <p class="download-note">点击卡片会复制链接并尝试用手机浏览器打开；本应用只做导航，不托管任何联机服务。</p>
    `, { title: '联网工具', sub: '樱花内网穿透 / 蓝盾 / 联机隧道' });
  }

  /* ---------------- 投影网站导航 ---------------- */
  function openProjectionSheet() {
    trackTask('projection-open');
    const sites = Array.isArray(BOX.projectionSites) ? BOX.projectionSites : [];
    const content = `
      <p class="projection-intro">${SVG('info')}<span>投影模组通常需要 Fabric / Forge，下载前先确认对应的游戏版本。点击卡片会用系统浏览器打开网站。</span></p>
      <div class="projection-list">
        ${sites.map((s) => `
          <a class="projection-card" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">
            <span class="projection-ico">${SVG('globe')}</span>
            <span class="projection-main">
              <b>${esc(s.name)}</b>
              <small>${esc(s.en)}</small>
              <span>${esc(s.desc)}</span>
              <span class="projection-tags">${(s.tags || []).map((t) => `<i>${esc(t)}</i>`).join('')}</span>
            </span>
            ${SVG('external')}
          </a>`).join('')}
      </div>
      <p class="download-note">本站只做导航，不托管任何蓝图文件；下载后请用 Litematica / Schematica 等模组加载。</p>`;
    openSheet(content, { title: '投影网站导航', sub: 'Litematica / 蓝图 / 建筑投影' });
  }

  function runToolFromForm(form) {
    if (!form) return;
    const id = form.dataset.toolId;
    const runner = TOOL_RUNNERS[id];
    if (!runner) return;
    const values = {};
    Array.from(form.querySelectorAll('[name]')).forEach((el) => { values[el.name] = el.value; });
    let result;
    try {
      result = runner(values);
    } catch (err) {
      result = { code: '生成失败：' + (err && err.message ? err.message : '参数有误'), note: '' };
    }
    renderToolOut(result);
  }

  const TOOL_RUNNERS = {
    color(v) {
      const text = String(v.text == null ? '' : v.text);
      const color = String(v.color || 'f');
      const style = String(v.style || 'none');
      const info = BOX.colorCodes.find((c) => c.code === color);
      const styleCode = style === 'none' ? '' : style;
      const section = `\u00a7${color}${styleCode ? '\u00a7' + styleCode : ''}${text}`;
      const amp = `&${color}${styleCode ? '&' + styleCode : ''}${text}`;
      return {
        code: `命令 / 告示牌：${section}\n插件配置：${amp}`,
        note: '§ 是游戏内格式符，& 常见于插件与服务器配置，两者不能混用。',
        preview: { text, hex: info ? info.hex : '#ffffff', bold: style === 'l' }
      };
    },
    give(v) {
      const target = String(v.target || '@s').trim() || '@s';
      const item = String(v.item || 'minecraft:diamond_sword').trim() || 'minecraft:diamond_sword';
      const count = Math.max(1, Math.floor(Number(v.count) || 1));
      const nbt = String(v.nbt || '').trim();
      return {
        code: `/give ${target} ${item} ${count}${nbt ? ' ' + nbt : ''}`,
        note: '1.20.5+ 的物品组件写法与旧版 NBT 不同；旧版 NBT 请切换到 1.20.4 或更早版本使用。'
      };
    },
    tp(v) {
      const target = String(v.target || '@s').trim() || '@s';
      const n = (value, fallback = 0) => {
        const num = Number(value);
        return Number.isFinite(num) ? Math.floor(num) : fallback;
      };
      return {
        code: `/tp ${target} ${n(v.x)} ${n(v.y, 64)} ${n(v.z)}`,
        note: '坐标可以是整数，也可以在游戏里手动改成 ~ 相对坐标。'
      };
    },
    shape(v) {
      const block = String(v.block || 'minecraft:stone').trim() || 'minecraft:stone';
      const n = (value, fallback = 0) => {
        const num = Number(value);
        return Number.isFinite(num) ? Math.floor(num) : fallback;
      };
      const x1 = n(v.x, 0);
      const y1 = n(v.y, 64);
      const z1 = n(v.z, 0);
      const w = Math.max(1, Math.min(64, n(v.w, 5)));
      const h = Math.max(1, Math.min(64, n(v.h, 5)));
      const l = Math.max(1, Math.min(64, n(v.l, 5)));
      const x2 = x1 + w - 1;
      const y2 = y1 + h - 1;
      const z2 = z1 + l - 1;
      if (v.shape === 'hollow') {
        return {
          code: `/fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${block} outline`,
          note: 'outline 只填充外壳；1.13 以下请改用两条 fill 命令手动挖空。'
        };
      }
      if (v.shape === 'walls') {
        return {
          code: [
            `/fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z1} ${block}`,
            `/fill ${x1} ${y1} ${z2} ${x2} ${y2} ${z2} ${block}`,
            `/fill ${x1} ${y1} ${z1} ${x1} ${y2} ${z2} ${block}`,
            `/fill ${x2} ${y1} ${z1} ${x2} ${y2} ${z2} ${block}`
          ].join('\n'),
          note: '墙壁模式生成四面墙，不包含地板与屋顶。'
        };
      }
      return {
        code: `/fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${block}`,
        note: `区域大小：${w} × ${h} × ${l}，共 ${w * h * l} 个方块。`
      };
    },
    xp(v) {
      const target = String(v.target || '@s').trim() || '@s';
      const amount = Math.max(0, Math.floor(Number(v.amount) || 0));
      const mode = v.mode === 'points' ? 'points' : 'levels';
      return {
        code: `/xp add ${target} ${amount} ${mode}`,
        note: mode === 'levels' ? 'levels 表示等级，points 表示经验值。' : 'points 表示经验点，不是等级。'
      };
    },
    coord(v) {
      const n = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? Math.round(num) : 0;
      };
      const x = n(v.x);
      const z = n(v.z);
      if (v.dimension === 'nether') {
        return {
          code: `下界 (${x}, ${z}) → 主世界 (${x * 8}, ${z * 8})`,
          note: '下界 1 格等于主世界 8 格；Y 坐标不变。'
        };
      }
      return {
        code: `主世界 (${x}, ${z}) → 下界 (${Math.round(x / 8)}, ${Math.round(z / 8)})`,
        note: '主世界 8 格等于下界 1 格；Y 坐标不变。'
      };
    },
    tellraw(v) {
      const target = String(v.target || '@a').trim() || '@a';
      const color = String(v.color || 'gold');
      const payload = JSON.stringify({ text: String(v.text == null ? '' : v.text), color });
      return {
        code: `/tellraw ${target} ${payload}`,
        note: 'JSON 中的双引号会由工具自动转义；颜色使用 Minecraft 颜色名。'
      };
    }
  };

  /* ---------------- 货币 / 商店 / 背包 ---------------- */
  function loadShopState() {
    const raw = store.get(KEY_SHOP, null);
    return {
      stock: raw && raw.stock && typeof raw.stock === 'object' ? raw.stock : {},
      custom: raw && Array.isArray(raw.custom) ? raw.custom.filter((item) => item && item.id && item.name) : []
    };
  }

  function saveShopState() {
    store.set(KEY_SHOP, shopState);
  }

  function loadPlayerShop() {
    const raw = store.get(KEY_PLAYER_SHOP, null);
    return { listings: raw && Array.isArray(raw.listings) ? raw.listings : [] };
  }

  function savePlayerShop() {
    store.set(KEY_PLAYER_SHOP, playerShopState);
  }

  function playerShopListings() {
    return playerShopState.listings.filter((listing) => listing && listing.itemId && listing.count > 0);
  }

  function playerPriceCap(itemId) {
    const item = catalogItem(itemId);
    const base = item && item.priceGold ? item.priceGold : 1000;
    return Math.max(1, Math.floor(base * 1.1));
  }

  function listPlayerShopItem(itemId) {
    if (!state.session) { toast('请先登录账号', 'warn'); return; }
    const item = catalogItem(itemId);
    if (!item || anyItemCount(itemId) <= 0) { toast('背包里没有这件物品', 'warn'); return; }
    const cap = playerPriceCap(itemId);
    openSheet(`
      <div class="command-banner"><span>${SVG('box')}</span><div><b>上架到玩家商店</b><small>${esc(item.name)} · 官方参考价 ${item.priceGold || '无'} 金锭 · 最高 ${cap} 金锭（不超过官方 10%）</small></div></div>
      <form class="role-form" data-role-form="player-list" data-item-id="${esc(itemId)}" novalidate>
        <div class="field"><div class="field-label"><span>上架数量</span><small>背包 ${anyItemCount(itemId)} 件</small></div><div class="input-wrap"><input name="count" type="number" min="1" max="${anyItemCount(itemId)}" value="1" required></div></div>
        <div class="field"><div class="field-label"><span>单价（金锭）</span><small>最高 ${cap}</small></div><div class="input-wrap"><input name="price" type="number" min="1" max="${cap}" value="${Math.min(cap, Math.max(1, Math.floor((item.priceGold || 100) * 0.8)))}" required></div></div>
        <p class="role-form-error" id="roleFormError" role="alert"></p>
        <button class="btn btn-primary login-submit" type="submit">上架商品</button>
      </form>
      <p class="download-note">玩家商店只允许上架背包里的物品；价格不能超过官方参考价的 110%。</p>
    `, { title: '玩家商店 · 上架', sub: item.name });
  }

  function submitPlayerListing(itemId, count, price) {
    const item = catalogItem(itemId);
    const e = currentEconomy();
    if (!item || !e) throw new Error('商品不存在');
    const qty = Math.max(1, Math.floor(Number(count) || 1));
    const unit = Math.max(1, Math.floor(Number(price) || 1));
    const cap = playerPriceCap(itemId);
    if (qty > anyItemCount(itemId)) throw new Error('上架数量超过背包数量');
    if (unit > cap) throw new Error(`价格不能超过 ${cap} 金锭（官方价 110%）`);
    removeAnyItem(itemId, qty);
    playerShopState.listings.push({
      id: 'ps_' + randomHex(5),
      sellerUid: state.session.uid,
      sellerName: (e.name || state.session.id),
      itemId,
      name: item.name,
      priceGold: unit,
      count: qty,
      at: Date.now()
    });
    savePlayerShop();
    renderShopSheet();
    toast('已上架到玩家商店', 'success');
  }

  function buyPlayerListing(id) {
    if (!state.session) { toast('请先登录账号', 'warn'); return; }
    const e = currentEconomy();
    const listing = playerShopState.listings.find((entry) => entry.id === id && entry.count > 0);
    if (!listing || !e) return;
    if (e.gold < listing.priceGold) { toast('金锭不足', 'warn'); return; }
    e.gold -= listing.priceGold;
    addInventory(listing.itemId, 1);
    listing.count -= 1;
    const seller = store.get(economyKeyFor(listing.sellerUid), null);
    if (seller && typeof seller === 'object') {
      seller.gold = Math.max(0, (Number(seller.gold) || 0) + listing.priceGold);
      store.set(economyKeyFor(listing.sellerUid), seller);
    }
    if (listing.count <= 0) playerShopState.listings = playerShopState.listings.filter((entry) => entry.id !== id);
    savePlayerShop();
    saveEconomy();
    refreshMine(true);
    renderShopSheet();
    toast(`已购买「${listing.name}」`, 'success');
  }

  function delistPlayerListing(id) {
    const listing = playerShopState.listings.find((entry) => entry.id === id);
    if (!listing || listing.sellerUid !== (state.session && state.session.uid)) return;
    addInventory(listing.itemId, listing.count);
    playerShopState.listings = playerShopState.listings.filter((entry) => entry.id !== id);
    savePlayerShop();
    renderShopSheet();
    toast('已下架并返还背包', 'success');
  }

  function economyKeyFor(uid) {
    return KEY_ECONOMY_PREFIX + uid;
  }

  function defaultEconomy(uid) {
    return {
      uid,
      gold: 0,
      diamonds: 0,
      inventory: {},
      name: '',
      nameChanges: 0,
      frame: '',
      title: '',
      themes: [],
      checkins: {},
      extract: { capacity: 10, equipment: {}, stash: {}, books: 0, runs: 0, escaped: 0 },
      role: '',
      roleAccountId: '',
      rolePassword: '',
      roleKey: ''
    };
  }

  function ensureEconomy(uid = state.session && state.session.uid) {
    if (!uid) return null;
    if (economyState && economyState.uid === uid) return economyState;
    const raw = store.get(economyKeyFor(uid), null);
    const base = defaultEconomy(uid);
    economyState = raw && typeof raw === 'object'
      ? Object.assign(base, raw, {
        gold: Math.max(0, Math.floor(Number(raw.gold) || 0)),
        diamonds: Math.max(0, Math.floor(Number(raw.diamonds) || 0)),
        inventory: raw.inventory && typeof raw.inventory === 'object' ? raw.inventory : {},
        themes: Array.isArray(raw.themes) ? raw.themes : [],
        checkins: raw.checkins && typeof raw.checkins === 'object' ? raw.checkins : {},
        extract: Object.assign({ capacity: 10, equipment: {}, stash: {}, books: 0, runs: 0, escaped: 0 }, raw.extract && typeof raw.extract === 'object' ? raw.extract : {})
      })
      : base;
    return economyState;
  }

  function saveEconomy() {
    if (!economyState || !economyState.uid) return;
    store.set(economyKeyFor(economyState.uid), economyState);
  }

  function currentEconomy() {
    return ensureEconomy();
  }

  function economyRoleOf(uid) {
    if (!uid) return '';
    const e = ensureEconomy(uid);
    return e ? e.role : '';
  }

  function roleForIdentity(name, uid) {
    const normalized = String(name || '').trim().toLowerCase();
    if (normalized === OWNER.username.toLowerCase()) return 'owner';
    const linked = roleState.data.superAdmins.concat(roleState.data.admins).find((account) =>
      (uid && account.ownerUid === uid) || String(account.username || '').toLowerCase() === normalized);
    return linked ? linked.ownerRole || (roleState.data.superAdmins.includes(linked) ? 'super' : 'admin') : '';
  }

  function roleSuffixText(role) {
    return role === 'owner' ? '【APP主人】' : role === 'super' ? '【超级管理员】' : role === 'admin' ? '【管理员】' : '';
  }

  function decoratedName(name, uid) {
    const base = String(name || '');
    if (!base) return base;
    const role = roleForIdentity(base, uid) || economyRoleOf(uid);
    const suffix = roleSuffixText(role);
    if (!suffix || base.includes(suffix)) return base;
    return base + suffix;
  }

  function profileNameHTML() {
    if (!state.session) return '';
    const e = currentEconomy();
    const base = (e && e.name) || state.session.id;
    const role = roleForIdentity(base, state.session.uid) || (e && e.role) || '';
    const suffix = roleSuffixText(role);
    return suffix ? `${esc(base)}<em class="profile-role">${esc(suffix)}</em>` : esc(base);
  }

  function displayName() {
    if (!state.session) return '';
    const e = currentEconomy();
    return decoratedName((e && e.name) || state.session.id, state.session.uid);
  }

  function levelFromXp(xp) {
    let value = Math.max(0, Math.min(MAX_XP, Number(xp) || 0));
    let level = 0;
    while (level < MAX_LEVEL && value >= XP_TOTALS[level + 1]) level += 1;
    return { xp: value, level };
  }

  function xpForUid(uid) {
    if (!uid) return 0;
    if (state.session && state.session.uid === uid) {
      const daily = ensureDaily();
      return daily ? Number(daily.xp) || 0 : 0;
    }
    const raw = store.get(KEY_DAILY + '.' + uid, null);
    return raw ? Math.max(0, Number(raw.xp) || 0) : 0;
  }

  function setXpForUid(uid, xp) {
    if (!uid) return false;
    const value = Math.max(0, Math.min(MAX_XP, Math.floor(Number(xp) || 0)));
    if (state.session && state.session.uid === uid) {
      const daily = ensureDaily();
      if (!daily) return false;
      daily.xp = value;
      saveDailyState();
    } else {
      const raw = store.get(KEY_DAILY + '.' + uid, null);
      if (raw && typeof raw === 'object') {
        raw.xp = value;
        store.set(KEY_DAILY + '.' + uid, raw);
      } else {
        store.set(KEY_DAILY + '.' + uid, { date: localDateKey(), xp: value, checkin: { date: localDateKey(), done: false, exp: 0 }, tasks: null, quiz: null });
      }
    }
    return true;
  }

  function addCurrency(kind, amount, reason, uid = state.session && state.session.uid) {
    if (!uid) { toast('请先登录账号，货币系统未登录不可使用', 'warn'); return false; }
    const e = ensureEconomy(uid);
    if (!e) return false;
    const delta = Math.floor(Number(amount) || 0);
    if (kind === 'gold') e.gold = Math.max(0, e.gold + delta);
    else if (kind === 'diamond') e.diamonds = Math.max(0, e.diamonds + delta);
    else return false;
    if (state.session && state.session.uid === uid) {
      saveEconomy();
      refreshMine(true);
    } else {
      store.set(economyKeyFor(uid), e);
    }
    if (reason) toast(`${reason} ${delta >= 0 ? '+' : ''}${delta} ${kind === 'gold' ? '金锭' : '钻石'}`, delta >= 0 ? 'success' : 'info', 3200);
    return true;
  }

  function addGold(amount, reason, uid) { return addCurrency('gold', amount, reason, uid); }
  function addDiamond(amount, reason, uid) { return addCurrency('diamond', amount, reason, uid); }

  function currentRoleForCard() {
    const e = currentEconomy();
    return e ? e.role : '';
  }

  function shopStockOf(item) {
    if (Object.prototype.hasOwnProperty.call(shopState.stock, item.id)) return Math.max(0, Number(shopState.stock[item.id]) || 0);
    return Infinity;
  }

  function shopStockLabel(item) {
    const stock = shopStockOf(item);
    return stock === Infinity ? '不限量' : `${stock} 件`;
  }

  function allShopItems() {
    return SHOP_ITEMS.concat(shopState.custom.map((item) => ({
      id: item.id,
      type: 'custom',
      name: item.name,
      desc: item.desc || 'GM 上架商品',
      priceGold: Number(item.priceGold) || 0,
      priceDiamonds: Number(item.priceDiamonds) || 0,
      icon: 'box',
      custom: true
    })));
  }

  function shopItem(id) {
    return allShopItems().find((item) => item.id === id) || null;
  }

  function catalogItem(id) {
    const shop = shopItem(id);
    if (shop) return shop;
    const gear = gearById(id);
    if (gear) return { id: gear.id, name: gear.name, desc: `${gear.slotName} · 战力 +${gear.power}`, type: 'gear', priceGold: gear.price, icon: gear.icon, gear };
    const block = PIXEL_BLOCKS.find((item) => item.block === id);
    if (block) return { id: block.block, name: block.name, desc: '方块撤离物资', type: 'material', priceGold: 20, icon: 'box' };
    return null;
  }

  function anyItemCount(id) {
    const e = currentEconomy();
    if (!e) return 0;
    return (Number(e.inventory && e.inventory[id]) || 0) + (Number(e.extract && e.extract.stash && e.extract.stash[id]) || 0);
  }

  function removeAnyItem(id, count = 1) {
    const e = currentEconomy();
    if (!e || anyItemCount(id) < count) return false;
    let left = count;
    if (e.inventory && e.inventory[id]) {
      const take = Math.min(left, Number(e.inventory[id]) || 0);
      e.inventory[id] -= take;
      if (e.inventory[id] <= 0) delete e.inventory[id];
      left -= take;
    }
    if (left > 0 && e.extract && e.extract.stash && e.extract.stash[id]) {
      const take = Math.min(left, Number(e.extract.stash[id]) || 0);
      e.extract.stash[id] -= take;
      if (e.extract.stash[id] <= 0) delete e.extract.stash[id];
      left -= take;
    }
    if (left <= 0) saveEconomy();
    return left <= 0;
  }

  function equipGearFromBag(id) {
    const gear = gearById(id);
    if (!gear) return;
    const data = extractData();
    if (!data) return;
    if ((Number(data.stash[id]) || 0) <= 0) {
      if (inventoryCount(id) <= 0) { toast('背包里没有这件装备', 'warn'); return; }
      removeInventory(id, 1);
      data.stash[id] = (Number(data.stash[id]) || 0) + 1;
    }
    equipExtractGear(id);
  }

  function inventoryCount(id) {
    const e = currentEconomy();
    return e && e.inventory ? Math.max(0, Number(e.inventory[id]) || 0) : 0;
  }

  function addInventory(id, count = 1) {
    const e = currentEconomy();
    if (!e) return;
    e.inventory[id] = Math.max(0, (Number(e.inventory[id]) || 0) + count);
    saveEconomy();
  }

  function removeInventory(id, count = 1) {
    const e = currentEconomy();
    if (!e || !e.inventory) return false;
    const have = Number(e.inventory[id]) || 0;
    if (have < count) return false;
    e.inventory[id] = have - count;
    if (e.inventory[id] <= 0) delete e.inventory[id];
    saveEconomy();
    return true;
  }

  function premiumTheme(id) {
    return DATA.themes.find((theme) => theme.id === id && theme.premium) || null;
  }

  function themeUnlocked(id) {
    const theme = premiumTheme(id);
    if (!theme) return true;
    const e = currentEconomy();
    return !!(e && e.themes.includes(id));
  }

  function profileFrameClass() {
    const e = currentEconomy();
    return e && e.frame ? 'has-frame frame-' + e.frame : '';
  }

  function profileTitle() {
    const e = currentEconomy();
    return e && e.title ? e.title : '';
  }

  function exchangeGoldForDiamond() {
    if (!state.session) { toast('请先登录账号', 'warn'); return; }
    const e = currentEconomy();
    if (!e) return;
    if (e.gold < 1888) { toast(`金锭不足：需要 1888 金锭，当前 ${e.gold}`, 'warn', 4200); return; }
    e.gold -= 1888;
    e.diamonds += 1;
    saveEconomy();
    refreshMine(true);
    renderShopSheet();
    toast('兑换成功：1888 金锭 → 1 钻石（单向兑换，不可反兑换）', 'success', 5000);
    sfx('success');
  }

  function buyShopItem(id) {
    if (!state.session) { toast('请先登录账号，未登录不可使用商店', 'warn', 4200); return; }
    const item = shopItem(id);
    if (!item) return;
    const e = currentEconomy();
    if (!e) return;
    if (item.role) {
      if (e.role) { toast('你已经有角色权限，不能重复购买权限卡', 'warn', 4200); return; }
      if (levelInfo().level < (item.level || 0)) { toast(`需要 LV.${item.level} 才能购买`, 'warn', 4200); return; }
      if (item.role === 'super' && roleState.data.superAdmins.length >= ROLE_LIMIT.super) { toast('超级管理员名额已满（最多 10 个）', 'warn', 4200); return; }
      if (item.role === 'admin' && roleState.data.admins.length >= ROLE_LIMIT.admin) { toast('管理员名额已满（最多 50 个）', 'warn', 4200); return; }
    }
    if (item.type === 'upgrade') { /* 由专门入口处理 */ }
    const stock = shopStockOf(item);
    if (stock !== Infinity && stock <= 0) { toast('这件商品已经售罄', 'warn'); return; }
    if (item.priceGold && e.gold < item.priceGold) { toast(`金锭不足：需要 ${item.priceGold}`, 'warn', 3600); return; }
    if (item.priceDiamonds && e.diamonds < item.priceDiamonds) { toast(`钻石不足：需要 ${item.priceDiamonds}`, 'warn', 3600); return; }
    if (item.priceGold) e.gold -= item.priceGold;
    if (item.priceDiamonds) e.diamonds -= item.priceDiamonds;
    if (stock !== Infinity) {
      shopState.stock[item.id] = stock - 1;
      saveShopState();
    }
    addInventory(item.id, 1);
    saveEconomy();
    refreshMine(true);
    renderShopSheet();
    toast(`已购买「${item.name}」，已放入背包`, 'success', 3600);
    sfx('success');
  }

  function useInventoryItem(id) {
    if (!state.session) { toast('请先登录账号', 'warn'); return; }
    const item = catalogItem(id);
    const e = currentEconomy();
    if (!item || !e || anyItemCount(id) <= 0) return;
    if (item.type === 'frame') {
      e.frame = item.frame;
      saveEconomy();
      refreshMine(true);
      openBagSheet();
      toast(`已佩戴「${item.name}」`, 'success');
    } else if (item.type === 'theme') {
      e.themes = Array.from(new Set(e.themes.concat(item.theme)));
      saveEconomy();
      if (removeInventory(id, 1)) { /* 主题解锁后保留在 themes */ }
      setTheme(item.theme);
      openBagSheet();
      toast(`已解锁并应用「${item.name}」`, 'success');
    } else if (item.type === 'title') {
      e.title = item.title;
      saveEconomy();
      refreshMine(true);
      openBagSheet();
      toast(`已佩戴称号「${item.title}」`, 'success');
    } else if (item.type === 'namecard') {
      openNameChangeSheet();
    } else if (item.type === 'xp') {
      if (removeInventory(id, 1)) {
        addExp(item.exp || 50, '经验糖果');
        openBagSheet();
      }
    } else if (item.type === 'role') {
      useRoleCard(item.role);
    } else if (item.type === 'gear') {
      equipGearFromBag(id);
    } else if (item.type === 'material') {
      toast(`${item.name} ×${anyItemCount(id)}，可在玩家商店上架`, 'info');
    } else if (item.type === 'custom') {
      toast(`「${item.name}」已使用（GM 商品）`, 'info');
    }
  }

  function useRoleCard(role) {
    if (!state.session) { toast('请先登录账号', 'warn'); return; }
    const e = currentEconomy();
    if (!e) return;
    if (role === 'admin' && e.role) { toast('你已经有管理员或更高权限', 'warn'); return; }
    if (role === 'super' && e.role === 'super') { toast('你已经是超级管理员', 'warn'); return; }
    if (role === 'super' && e.role === 'admin') { upgradeAdminToSuper(); return; }
    if (role === 'super' && roleState.data.superAdmins.length >= ROLE_LIMIT.super) { toast('超级管理员名额已满（最多 10 个）', 'warn', 4200); return; }
    if (role === 'admin' && roleState.data.admins.length >= ROLE_LIMIT.admin) { toast('管理员名额已满（最多 50 个）', 'warn', 4200); return; }
    const requiredLevel = role === 'super' ? 90 : 50;
    if (levelInfo().level < requiredLevel) { toast(`需要 LV.${requiredLevel} 才能使用这张权限卡`, 'warn', 4400); return; }
    const baseName = (e.name || state.session.id).slice(0, 16);
    if (roleUsernameTaken(baseName)) { toast('账号名与已有角色账号冲突，请先改名', 'error', 4400); return; }
    const password = (role === 'super' ? 'SUPER-' : 'ADMIN-') + generateRoleKey().slice(3);
    const account = {
      id: 'r_' + randomHex(8),
      uid: (role === 'super' ? 'SA-' : 'AD-') + randomHex(3).toUpperCase(),
      username: baseName,
      qq: state.session.qq || '',
      salt: randomHex(12),
      hash: '',
      key: role === 'super' ? generateRoleKey() : '',
      ownerUid: state.session.uid,
      ownerRole: role,
      createdAt: Date.now(),
      createdBy: '权限卡'
    };
    localPasswordHash(password, account.salt).then((hash) => {
      account.hash = hash;
      if (role === 'super') roleState.data.superAdmins.push(account);
      else roleState.data.admins.push(account);
      e.role = role;
      e.roleAccountId = account.id;
      e.rolePassword = password;
      e.roleKey = account.key;
      saveRoleData();
      saveEconomy();
      if (removeInventory(role === 'super' ? 'super-card' : 'admin-card', 1)) { /* consumed */ }
      refreshMine(true);
      openRoleCardResult(account, password, role);
      toast(role === 'super' ? '超级管理员权限已激活' : '管理员权限已激活', 'success', 5000);
    }).catch(() => toast('权限卡激活失败', 'error'));
  }

  function upgradeAdminToSuper() {
    if (!state.session) { toast('请先登录账号', 'warn'); return; }
    const e = currentEconomy();
    if (!e || e.role !== 'admin') { toast('只有管理员可以走升级流程', 'warn'); return; }
    if (roleState.data.superAdmins.length >= ROLE_LIMIT.super) { toast('超级管理员名额已满（最多 10 个）', 'warn', 4200); return; }
    const info = levelInfo();
    if (info.level < 10) { toast('升级需要扣除 10 级经验，当前等级不足', 'warn', 4200); return; }
    if (e.diamonds < 20) { toast('需要 20 钻石', 'warn'); return; }
    if (e.gold < 1800) { toast('需要 1800 金锭', 'warn'); return; }
    const lostXp = XP_TOTALS[info.level] - XP_TOTALS[Math.max(0, info.level - 10)];
    if (info.xp < lostXp) { toast('10 级经验不足', 'warn'); return; }
    const account = roleState.data.admins.find((item) => item.id === e.roleAccountId || item.ownerUid === state.session.uid);
    if (!account) { toast('找不到你的管理员角色账号', 'error'); return; }
    e.diamonds -= 20;
    e.gold -= 1800;
    const targetXp = Math.max(0, info.xp - lostXp + 500);
    setXpForUid(state.session.uid, targetXp);
    roleState.data.admins = roleState.data.admins.filter((item) => item.id !== account.id);
    account.ownerRole = 'super';
    account.key = generateRoleKey();
    roleState.data.superAdmins.push(account);
    e.role = 'super';
    e.roleKey = account.key;
    e.diamonds += 5;
    e.gold += 1000;
    saveRoleData();
    saveEconomy();
    refreshMine(true);
    openRoleCardResult(account, e.rolePassword || '使用原管理员密码', 'super');
    toast('已升级为超级管理员：扣除 20 钻石 + 1800 金锭 + 10 级经验，返还 5 钻石 + 500 经验 + 1000 金锭', 'success', 7000);
  }

  function openNameChangeSheet() {
    if (!state.session) { toast('请先登录账号', 'warn'); return; }
    const e = currentEconomy();
    const free = e.nameChanges === 0;
    openSheet(`
      <div class="role-login-intro"><span class="role-login-badge">改名</span><b>${free ? '第一次改名免费' : '使用一张改名卡'}</b><p>${free ? '每个账号第一次改名不消耗改名卡。' : `第二次及以后需要消耗 1 张改名卡（背包现有 ${inventoryCount('name-card')} 张）。`}</p></div>
      <form class="role-form" data-role-form="rename" novalidate>
        <div class="field"><div class="field-label"><span>新名字</span><small>3–16 位</small></div><div class="input-wrap">${SVG('user')}<input name="newname" maxlength="16" value="${esc(e.name || state.session.id)}" required></div></div>
        <p class="role-form-error" id="roleFormError" role="alert"></p>
        <button class="btn btn-primary login-submit" type="submit">${free ? '免费改名' : '使用改名卡改名'}</button>
      </form>
    `, { title: '修改名字', sub: free ? '首次免费' : '改名卡 1 张' });
  }

  async function applyNameChange(newName) {
    const e = currentEconomy();
    if (!e) throw new Error('请先登录账号');
    const name = String(newName || '').trim();
    if (!/^[\u4e00-\u9fa5A-Za-z0-9_]{3,16}$/.test(name)) throw new Error('名字需为 3–16 位中文、字母、数字或下划线');
    const free = e.nameChanges === 0;
    if (!free && inventoryCount('name-card') <= 0) throw new Error('没有改名卡，请先到商店购买（500 金锭）');
    const linked = roleState.data.superAdmins.concat(roleState.data.admins).find((a) => a.ownerUid === state.session.uid);
    if (linked) {
      const sameName = roleState.data.superAdmins.concat(roleState.data.admins).some((a) => a !== linked && String(a.username || '').toLowerCase() === name.toLowerCase());
      if (sameName || name.toLowerCase() === OWNER.username.toLowerCase()) throw new Error('这个名字已被其他角色账号使用');
    }
    if (!free) removeInventory('name-card', 1);
    e.name = name;
    e.nameChanges += 1;
    if (linked) { linked.username = name; saveRoleData(); }
    const localList = localAccounts();
    const local = localList.find((a) => a.uid === state.session.uid);
    if (local) {
      if (localList.some((a) => a !== local && a.key === localAccountKey(name))) throw new Error('这个名字已被本机账号使用');
      local.key = localAccountKey(name);
      local.name = name;
      local.displayId = name;
      saveLocalAccounts(localList);
    }
    saveEconomy();
    renderHomeAccount();
    refreshMine(true);
    toast('改名成功，新名字已生效', 'success');
  }

  function shopFilteredItems() {
    const all = allShopItems().filter((item) => item.type !== 'upgrade');
    if (shopCategory === 'all') return all;
    if (shopCategory === 'item') return all.filter((item) => item.type === 'item' || item.type === 'custom' || item.type === 'namecard' || item.type === 'xp');
    if (shopCategory === 'role') return all.filter((item) => item.type === 'role');
    return all.filter((item) => item.type === shopCategory);
  }

  function shopPriceHTML(item) {
    const parts = [];
    if (item.priceGold) parts.push(`<span class="price-gold">${SVG('sparkle')}${item.priceGold} 金锭</span>`);
    if (item.priceDiamonds) parts.push(`<span class="price-diamond">${SVG('box')}${item.priceDiamonds} 钻石</span>`);
    if (item.level) parts.push(`<span class="price-level">LV.${item.level}+</span>`);
    return parts.join('');
  }

  function shopItemHTML(item) {
    const e = currentEconomy() || defaultEconomy('');
    const stackable = item.type === 'namecard' || item.type === 'xp' || item.type === 'custom';
    const owned = !stackable && (item.type === 'frame' ? e.frame === item.frame
      : item.type === 'title' ? e.title === item.title
        : item.type === 'theme' ? e.themes.includes(item.theme)
          : inventoryCount(item.id) > 0);
    const roleBlocked = !!item.role && !!e.role;
    const levelBlocked = !!item.level && levelInfo().level < item.level;
    const stock = shopStockOf(item);
    const soldOut = stock !== Infinity && stock <= 0;
    const disabled = owned || roleBlocked || levelBlocked || soldOut;
    return `
      <article class="shop-item ${disabled ? 'is-disabled' : ''}">
        <span class="shop-item-ico">${SVG(item.icon || 'box')}</span>
        <div class="shop-item-main">
          <b>${esc(item.name)}</b>
          <small>${esc(item.desc || '')}</small>
          <span class="shop-item-price">${shopPriceHTML(item)}${stock === Infinity ? '' : `<span class="shop-stock">库存 ${stock}</span>`}</span>
          <small class="shop-item-id">编号 ${esc(item.id)}</small>
        </div>
        <button class="mini-act ${disabled ? '' : 'is-buy'}" type="button" data-shop-buy="${esc(item.id)}" ${disabled ? 'disabled' : ''}>${owned ? '已拥有' : roleBlocked ? '已有角色' : levelBlocked ? '等级不足' : soldOut ? '售罄' : '购买'}</button>
      </article>`;
  }

  function renderPlayerShop() {
    const host = $('#shopPlayerList');
    if (!host) return;
    const own = state.session && state.session.uid;
    const listings = playerShopListings();
    host.innerHTML = listings.map((listing) => {
      const mine = listing.sellerUid === own;
      return `
        <article class="shop-item">
          <span class="shop-item-ico">${SVG('box')}</span>
          <div class="shop-item-main">
            <b>${esc(listing.name)} ×${listing.count}</b>
            <small>卖家：${esc(listing.sellerName)} · ${new Date(listing.at).toLocaleDateString('zh-CN')}</small>
            <span class="shop-item-price"><span class="price-gold">${SVG('sparkle')}${listing.priceGold} 金锭 / 件</span></span>
            <small class="shop-item-id">编号 ${esc(listing.id)}</small>
          </div>
          ${mine
            ? `<button class="mini-act is-danger" type="button" data-player-delist="${esc(listing.id)}">下架</button>`
            : `<button class="mini-act is-buy" type="button" data-player-buy="${esc(listing.id)}">购买</button>`}
        </article>`;
    }).join('') || '<p class="shop-empty">玩家商店还没有上架商品。打开背包，点击物品旁的「上架」即可出售。</p>';
  }

  function renderShopSheet() {
    const grid = $('#shopGrid');
    if (!grid) return;
    const e = currentEconomy();
    const wallet = $('#shopWallet');
    if (wallet && e) {
      wallet.innerHTML = `<span class="price-gold">${SVG('sparkle')}<b>${e.gold}</b> 金锭</span><span class="price-diamond">${SVG('box')}<b>${e.diamonds}</b> 钻石</span>`;
    }
    $$('[data-shop-view]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.shopView === shopView));
    const official = $('#shopOfficialView');
    const player = $('#shopPlayerView');
    if (official) official.hidden = shopView !== 'official';
    if (player) player.hidden = shopView !== 'player';
    $$('[data-shop-category]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.shopCategory === shopCategory));
    grid.innerHTML = shopFilteredItems().map(shopItemHTML).join('') || '<p class="shop-empty">这个分类暂时没有商品。</p>';
    renderPlayerShop();
    const upgrade = $('#shopUpgrade');
    if (upgrade) {
      const admin = e && e.role === 'admin';
      upgrade.hidden = !admin;
      if (admin) {
        upgrade.innerHTML = `<div><b>管理员升级超级管理员</b><small>扣除 20 钻石 + 1800 金锭 + 10 级经验；成功后返还 5 钻石 + 500 经验 + 1000 金锭</small></div><button class="btn btn-primary btn-sm" type="button" data-action="upgrade-super">${SVG('shield')}立即升级</button>`;
      }
    }
  }

  function openShopSheet(category = shopCategory) {
    if (!state.session) { toast('请先登录账号，未登录不可使用商店', 'warn', 4200); openLogin(); return; }
    shopCategory = SHOP_CATEGORIES.some((c) => c.id === category) ? category : 'all';
    openSheet(`
      <div class="wallet-shop-head">
        <div id="shopWallet" class="wallet-shop-balance"></div>
        <button class="mini-act" type="button" data-action="exchange-gold">1888 金锭 → 1 钻石</button>
      </div>
      <p class="shop-exchange-note">${SVG('info')}兑换是单向的：1888 金锭可以换 1 钻石，但钻石不能换回金锭。</p>
      <div class="shop-view-tabs">
        <button class="shop-view-tab ${shopView === 'official' ? 'is-active' : ''}" type="button" data-shop-view="official">官方商店</button>
        <button class="shop-view-tab ${shopView === 'player' ? 'is-active' : ''}" type="button" data-shop-view="player">玩家商店</button>
      </div>
      <div id="shopOfficialView">
        <div class="shop-categories">${SHOP_CATEGORIES.map((c) => `<button class="shop-cat ${shopCategory === c.id ? 'is-active' : ''}" type="button" data-shop-category="${c.id}">${c.name}</button>`).join('')}</div>
        <div class="shop-grid" id="shopGrid"></div>
        <div class="shop-upgrade" id="shopUpgrade" hidden></div>
      </div>
      <div id="shopPlayerView" hidden>
        <p class="shop-exchange-note">${SVG('info')}玩家商店只允许上架背包物品；单价不能超过官方参考价的 110%。官方商品只能由 APP主人 / 超级管理员上架或下架。</p>
        <div class="shop-grid" id="shopPlayerList"></div>
      </div>
      <p class="download-note">商店物品会放入背包；头像框、主题、称号可在背包中佩戴 / 解锁。管理员权限卡需要 LV.50 + 10 钻石，超级管理员权限卡需要 LV.90 + 30 钻石；管理员升级超级管理员走独立升级按钮。</p>
    `, { title: '金锭商店', sub: '金锭 / 钻石 / 背包 / 权限卡' });
    renderShopSheet();
  }

  function openBagSheet() {
    if (!state.session) { toast('请先登录账号，未登录不可使用背包', 'warn', 4200); openLogin(); return; }
    const e = currentEconomy();
    const ids = Array.from(new Set(Object.keys(e.inventory || {}).concat(Object.keys(e.extract && e.extract.stash || {})))).filter((id) => anyItemCount(id) > 0);
    const rows = ids.map((id) => {
      const item = catalogItem(id);
      if (!item) return '';
      const count = anyItemCount(id);
      const equipped = item.type === 'frame' ? e.frame === item.frame : item.type === 'title' ? e.title === item.title : false;
      const actionLabel = equipped ? '使用中' : item.type === 'theme' ? '使用解锁' : item.type === 'role' ? '激活权限' : item.type === 'gear' ? '装备' : item.type === 'material' ? '查看' : '使用';
      return `
        <div class="bag-row">
          <span class="bag-item-ico">${SVG(item.icon || 'box')}</span>
          <div class="bag-item-main"><b>${esc(item.name)}${count > 1 ? ' ×' + count : ''}</b><small>${esc(item.desc || '')}</small></div>
          <span class="bag-row-actions">
            <button class="mini-act ${equipped ? '' : 'is-buy'}" type="button" data-bag-use="${esc(item.id)}" ${equipped ? 'disabled' : ''}>${actionLabel}</button>
            ${item.type !== 'role' ? `<button class="mini-act" type="button" data-bag-sell="${esc(item.id)}">上架</button>` : ''}
          </span>
        </div>`;
    }).join('');
    openSheet(`
      <div class="wallet-shop-head">
        <div class="wallet-shop-balance"><span class="price-gold">${SVG('sparkle')}<b>${e.gold}</b> 金锭</span><span class="price-diamond">${SVG('box')}<b>${e.diamonds}</b> 钻石</span></div>
        <span class="bag-head-actions"><button class="mini-act" type="button" data-action="exchange-gold">1888 金锭 → 1 钻石</button><button class="mini-act" type="button" data-action="open-name-change">改名</button></span>
      </div>
      <div class="bag-profile-line"><b>${esc(displayName())}</b><small>${profileTitle() ? '称号：' + esc(profileTitle()) : '还没有佩戴称号'}</small></div>
      <div class="bag-list">${rows || '<p class="shop-empty">背包还是空的，去商店看看头像框、主题和称号吧。</p>'}</div>
      <p class="download-note">首次改名免费；第二次及以后需要改名卡（500 金锭）。管理员 / 超级管理员权限卡使用后会生成角色账号和登录密钥。</p>
    `, { title: '背包', sub: '金锭 / 钻石 / 商品 / 权限卡' });
  }

  function openRoleCardResult(account, password, role) {
    openSheet(`
      <div class="role-key-result">
        <span class="role-key-result-ico">${SVG('shield')}</span>
        <h3>${role === 'super' ? '超级管理员' : '管理员'}权限已激活</h3>
        <p>系统已为你创建角色账号，请保存登录信息。角色登录入口在设置顶部。</p>
        <div class="role-credential"><span>登录账号</span><b class="mono">${esc(account.username)}</b><button class="mini-act" type="button" data-copy="${esc(account.username)}">复制</button></div>
        <div class="role-credential"><span>登录密钥（密码）</span><b class="mono">${esc(password)}</b><button class="mini-act" type="button" data-copy="${esc(password)}">复制</button></div>
        ${role === 'super' ? `<div class="role-credential"><span>安全密钥</span><b class="mono">${esc(account.key)}</b><button class="mini-act" type="button" data-copy="${esc(account.key)}">复制</button></div>` : ''}
        <p class="download-note">权限已生效。请勿把登录密钥发给他人。</p>
        <button class="btn btn-primary btn-block btn-sm" type="button" data-sheet-close>我已保存，关闭</button>
      </div>
    `, { title: '权限已激活', sub: role === 'super' ? '超级管理员权限卡' : '管理员权限卡' });
  }

  /* ---------------- 我的页 ---------------- */
  function settingRowHTML(key, icon, iconClass, title, desc, value, extra = '') {
    return `
      <button class="set-row" type="button" data-setting="${key}" aria-label="${esc(title)}">
        <span class="set-ico ${iconClass}">${SVG(icon)}</span>
        <span class="set-main"><b>${esc(title)}</b><small>${esc(desc)}</small></span>
        <span class="set-value">${value}${extra || SVG('chevron')}</span>
      </button>`;
  }

  function toggleRowHTML(key, icon, iconClass, title, desc) {
    const on = !!state.settings[key];
    return `
      <button class="set-row" type="button" data-set-toggle="${key}" role="switch" aria-checked="${on}" aria-label="${esc(title)}">
        <span class="set-ico ${iconClass}">${SVG(icon)}</span>
        <span class="set-main"><b>${esc(title)}</b><small>${esc(desc)}</small></span>
        <span class="switch ${on ? 'is-on' : ''}" aria-hidden="true"></span>
      </button>`;
  }

  /* ---------------- APP主人 / 超级管理员 / 管理员 ---------------- */
  function loadRoleData() {
    const raw = store.get(KEY_ROLE_DATA, null);
    const list = (value) => (Array.isArray(value) ? value.filter((item) => item && item.id) : []);
    return {
      superAdmins: list(raw && raw.superAdmins),
      admins: list(raw && raw.admins),
      blacklist: Array.isArray(raw && raw.blacklist) ? raw.blacklist.filter((item) => item && item.value) : []
    };
  }

  function backupAccounts() {
    try {
      const local = typeof localAccounts === 'function' ? localAccounts() : [];
      store.set(KEY_ACCOUNT_BACKUP, {
        version: (typeof DATA !== 'undefined' && DATA.version) || '',
        at: Date.now(),
        local: Array.isArray(local) ? local : [],
        roles: {
          superAdmins: roleState.data.superAdmins.slice(),
          admins: roleState.data.admins.slice(),
          blacklist: roleState.data.blacklist.slice()
        }
      });
    } catch { /* ignore */ }
  }

  function restoreAccountsFromBackup() {
    const backup = store.get(KEY_ACCOUNT_BACKUP, null);
    if (!backup || typeof backup !== 'object') return;
    if (!localAccounts().length && Array.isArray(backup.local) && backup.local.length) {
      saveLocalAccounts(backup.local);
      toast(`已从上一个版本恢复 ${backup.local.length} 个本机账号`, 'success', 4200);
    }
    if (!roleState.data.superAdmins.length && !roleState.data.admins.length && backup.roles) {
      roleState.data.superAdmins = Array.isArray(backup.roles.superAdmins) ? backup.roles.superAdmins : [];
      roleState.data.admins = Array.isArray(backup.roles.admins) ? backup.roles.admins : [];
      roleState.data.blacklist = Array.isArray(backup.roles.blacklist) ? backup.roles.blacklist : [];
      store.set(KEY_ROLE_DATA, roleState.data);
    }
    backupAccounts();
  }

  function saveRoleData() {
    store.set(KEY_ROLE_DATA, roleState.data);
    backupAccounts();
  }

  const ROLE_LABEL = { owner: 'APP主人', super: '超级管理员', admin: '管理员' };
  const ROLE_WELCOME = {
    owner: '你回来了，世界的主人。方块与星光都为你让路，今天也请随心所欲地编织属于你的世界。',
    super: '欢迎回来，超级管理员。愿你的每一条指令都准确落点，替世界守住秩序与光亮。',
    admin: '欢迎回来，管理员。你是这片方块世界的守夜人，愿每一次巡查都平安顺遂。'
  };

  function roleAccounts(role) {
    if (role === 'super') return roleState.data.superAdmins;
    if (role === 'admin') return roleState.data.admins;
    return [];
  }

  function roleFind(role, key) {
    const normalized = String(key || '').trim().toLowerCase();
    if (!normalized) return null;
    return roleAccounts(role).find((item) => item.id === key || String(item.username || '').toLowerCase() === normalized || item.uid === key) || null;
  }

  function roleFindAny(key) {
    const normalized = String(key || '').trim().toLowerCase();
    if (!normalized) return null;
    const match = (item) => item.id === key
      || String(item.username || '').toLowerCase() === normalized
      || String(item.uid || '').toLowerCase() === normalized
      || String(item.qq || '').toLowerCase() === normalized;
    const superAccount = roleState.data.superAdmins.find(match);
    if (superAccount) return { role: 'super', account: superAccount };
    const adminAccount = roleState.data.admins.find(match);
    if (adminAccount) return { role: 'admin', account: adminAccount };
    return null;
  }

  function roleSessionAccount() {
    const session = roleState.session;
    if (!session) return null;
    if (session.role === 'owner') return null;
    return roleFind(session.role, session.id);
  }

  function roleBlacklisted(username, qq, uid) {
    const values = [username, qq, uid].filter(Boolean).map((v) => String(v).trim().toLowerCase());
    return roleState.data.blacklist.some((item) => values.includes(String(item.value || '').trim().toLowerCase()));
  }

  function roleValidateSession() {
    const session = roleState.session;
    if (!session || !session.role) return false;
    if (session.role === 'owner') {
      if (String(session.username).toLowerCase() === OWNER.username.toLowerCase()) return true;
      roleState.session = null;
      store.del(KEY_ROLE_SESSION);
      return false;
    }
    const account = roleSessionAccount();
    if (!account || roleBlacklisted(account.username, account.qq, account.uid)) {
      roleState.session = null;
      store.del(KEY_ROLE_SESSION);
      return false;
    }
    return true;
  }

  function roleCanCreate(role) {
    const current = roleState.session && roleState.session.role;
    if (role === 'super') return current === 'owner';
    if (role === 'admin') return current === 'owner' || current === 'super';
    return false;
  }

  function roleCanManageTarget(targetRole) {
    const current = roleState.session && roleState.session.role;
    if (!current || targetRole === 'owner') return false;
    if (current === 'owner') return true;
    if (current === 'super') return targetRole !== 'super';
    if (current === 'admin') return targetRole === 'admin';
    return false;
  }

  function roleCanBlacklistTarget(targetRole) {
    const current = roleState.session && roleState.session.role;
    if (!current) return false;
    if (current === 'owner') return targetRole !== 'owner';
    if (current === 'super') return targetRole === 'admin';
    if (current === 'admin') return targetRole === 'admin';
    return false;
  }

  function roleCanGm() {
    const role = roleState.session && roleState.session.role;
    return role === 'owner' || role === 'super';
  }

  function roleUsernameTaken(username) {
    const key = String(username || '').trim().toLowerCase();
    if (key === OWNER.username.toLowerCase()) return true;
    return roleState.data.superAdmins.concat(roleState.data.admins)
      .some((item) => String(item.username || '').toLowerCase() === key);
  }

  function generateRoleKey() {
    let raw = '';
    try {
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      raw = Array.from(bytes, (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
    } catch {
      raw = Math.random().toString(36).slice(2).toUpperCase().padEnd(12, 'X').slice(0, 12);
    }
    return 'SA-' + raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12);
  }

  function roleMastheadHTML() {
    const session = roleState.session;
    const superCount = roleState.data.superAdmins.length;
    const adminCount = roleState.data.admins.length;
    const card = (role, title, sub, extra, className) => {
      const active = session && session.role === role;
      const current = active ? `已登录 · ${decoratedName(session.username, session.uid)}` : sub;
      return `
        <button class="role-card ${className} ${active ? 'is-active' : ''}" type="button" data-role-card="${role}">
          <span class="role-card-tag">${extra}</span>
          <b>${title}</b>
          <small>${esc(current)}</small>
          ${role === 'owner' ? `<em>${esc(OWNER.username)} · QQ ${esc(OWNER.qq)}</em>` : ''}
        </button>`;
    };
    return `
      <div class="role-masthead">
        ${card('super', '超级管理员', '点击登录', `${superCount} / ${ROLE_LIMIT.super}`, 'role-super')}
        ${card('owner', 'APP主人', '世界的主人', 'CENTER · OWNER', 'role-owner')}
        ${card('admin', '管理员', '点击登录', `${adminCount} / ${ROLE_LIMIT.admin}`, 'role-admin')}
      </div>`;
  }

  function openRoleLogin(role) {
    if (roleState.session && roleState.session.role === role) { openRolePanel(); return; }
    const isOwner = role === 'owner';
    const needsKey = role === 'super';
    openSheet(`
      <div class="role-login-intro">
        <span class="role-login-badge">${ROLE_LABEL[role]}</span>
        <b>${isOwner ? '世界的主人，请确认身份' : needsKey ? '超级管理员需要安全密钥' : '管理员登录'}</b>
        <p>${isOwner ? 'APP主人账号固定为 Rushi_MC · QQ 3335750182，登录后可添加超级管理员、管理员和使用 GM 后台。' : needsKey ? '超级管理员登录必须同时输入账号、密码和 APP 主人发放的安全密钥，缺一不可。' : '管理员可添加黑名单、管理管理员账号，但不能使用 GM 后台或添加管理员。'}</p>
      </div>
      <form id="roleLoginForm" class="role-form" data-role-form="login" data-role-target="${role}" novalidate>
        <div class="field"><div class="field-label"><span>账号</span></div><div class="input-wrap">${SVG('user')}<input name="username" maxlength="32" autocomplete="username" placeholder="${isOwner ? 'Rushi_MC' : '请输入账号'}" required></div></div>
        <div class="field"><div class="field-label"><span>密码</span></div><div class="input-wrap">${SVG('key')}<input name="password" type="password" maxlength="128" autocomplete="current-password" placeholder="请输入密码" required><button class="pwd-toggle" type="button" data-toggle-pwd aria-pressed="false">显示</button></div></div>
        ${needsKey ? `<div class="field"><div class="field-label"><span>安全密钥</span><small>APP主人发放</small></div><div class="input-wrap">${SVG('shield')}<input name="key" maxlength="32" autocomplete="off" placeholder="SA-XXXX-XXXX-XXXX" required></div></div>` : ''}
        <p class="role-form-error" id="roleFormError" role="alert"></p>
        <button class="btn btn-primary login-submit" type="submit">${isOwner ? '以 APP主人身份进入' : needsKey ? '验证密钥并进入' : '以管理员身份进入'}</button>
      </form>
      ${isOwner ? `<p class="role-form-note">${SVG('shield')}APP主人拥有最高权限，可添加 10 位超级管理员与 50 位管理员。</p>` : ''}
    `, { title: `${ROLE_LABEL[role]}登录`, sub: isOwner ? '最高权限 · 世界的主人' : needsKey ? '账号 + 密码 + 安全密钥' : '管理权限登录' });
    setTimeout(() => {
      const input = $('#roleLoginForm [name="username"]');
      if (input) input.focus();
    }, 80);
  }

  function setRoleFormError(form, message) {
    const err = form.querySelector('#roleFormError') || $('#roleFormError');
    if (err) err.textContent = message || '';
    if (form) {
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
    }
    sfx('error');
  }

  async function handleRoleLogin(form) {
    const role = form.dataset.roleTarget;
    const username = String(form.elements.username.value || '').trim();
    const password = String(form.elements.password.value || '');
    const key = form.elements.key ? String(form.elements.key.value || '').trim().toUpperCase() : '';
    if (!username || !password) { setRoleFormError(form, '请输入账号和密码'); return; }
    if (role === 'super' && !key) { setRoleFormError(form, '超级管理员必须输入安全密钥，没有安全密钥无法登录'); return; }
    const btn = form.querySelector('[type="submit"]');
    const old = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '正在验证…'; }
    try {
      let session = null;
      if (role === 'owner') {
        if (username.toLowerCase() !== OWNER.username.toLowerCase()) throw new Error('APP主人账号不正确');
        const hash = await localPasswordHash(password, OWNER.salt);
        if (hash !== OWNER.hash) throw new Error('APP主人密码不正确');
        session = { role: 'owner', id: 'owner', uid: 'OWNER', username: OWNER.username, qq: OWNER.qq, loginAt: Date.now() };
      } else {
        const account = roleFind(role, username);
        if (!account) throw new Error('账号不存在');
        if (roleBlacklisted(account.username, account.qq, account.uid)) throw new Error('该账号已被加入黑名单，无法登录');
        if (await localPasswordHash(password, account.salt) !== account.hash) throw new Error('密码不正确');
        if (role === 'super' && key !== String(account.key || '').toUpperCase()) throw new Error('安全密钥不正确，登录失败');
        session = { role, id: account.id, uid: account.uid, username: account.username, qq: account.qq || '', loginAt: Date.now() };
      }
      roleState.session = session;
      store.set(KEY_ROLE_SESSION, session);
      roleState.tab = role === 'owner' ? 'super' : 'admin';
      roleValidateSession();
      openRolePanel();
      toast(ROLE_WELCOME[role], 'success', 7000);
      sfx('success');
    } catch (err) {
      setRoleFormError(form, err.message || '登录失败');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = old; }
    }
  }

  function rolePanelTabs() {
    const owner = roleState.session.role === 'owner';
    return owner ? ['super', 'admin', 'blacklist'] : ['admin', 'blacklist'];
  }

  function roleEmptyHTML(text) {
    return `<p class="role-empty">${esc(text)}</p>`;
  }

  function roleSuperRowsHTML() {
    const owner = roleState.session.role === 'owner';
    const list = roleState.data.superAdmins;
    if (!list.length) return roleEmptyHTML('还没有超级管理员。APP主人可以添加，最多 10 位。');
    return list.map((account) => `
      <div class="role-row">
        <span class="role-row-avatar is-super">SA</span>
        <div class="role-row-main">
          <b>${esc(account.username)}</b>
          <small>${esc(account.uid)}${account.qq ? ' · QQ ' + esc(account.qq) : ''} · ${account.createdAt ? new Date(account.createdAt).toLocaleDateString('zh-CN') : ''}</small>
          ${owner
            ? `<div class="role-key"><span class="mono">${esc(account.key)}</span><button class="mini-act" type="button" data-copy="${esc(account.key)}">复制密钥</button></div>`
            : '<small class="role-key-locked">安全密钥仅 APP主人可见</small>'}
        </div>
        ${owner ? `<div class="role-row-actions">
          <button class="mini-act" type="button" data-action="role-reset-key" data-role-id="${esc(account.id)}">换密钥</button>
          <button class="mini-act" type="button" data-action="role-reset-password" data-role-target="super" data-role-id="${esc(account.id)}">改密码</button>
          <button class="mini-act is-danger" type="button" data-action="role-delete" data-role-target="super" data-role-id="${esc(account.id)}">删除</button>
        </div>` : ''}
      </div>`).join('');
  }

  function roleAdminRowsHTML() {
    const current = roleState.session;
    const canManage = roleCanManageTarget('admin');
    const list = roleState.data.admins;
    if (!list.length) return roleEmptyHTML('还没有管理员。超级管理员或 APP主人可以添加，最多 50 位。');
    return list.map((account) => {
      const self = current.role === 'admin' && current.id === account.id;
      return `
        <div class="role-row">
          <span class="role-row-avatar is-admin">AD</span>
          <div class="role-row-main">
            <b>${esc(account.username)}${self ? ' <em>当前登录</em>' : ''}</b>
            <small>${esc(account.uid)}${account.qq ? ' · QQ ' + esc(account.qq) : ''} · ${account.createdAt ? new Date(account.createdAt).toLocaleDateString('zh-CN') : ''}</small>
          </div>
          ${canManage && !self ? `<div class="role-row-actions">
            <button class="mini-act" type="button" data-action="role-reset-password" data-role-target="admin" data-role-id="${esc(account.id)}">改密码</button>
            <button class="mini-act is-danger" type="button" data-action="role-delete" data-role-target="admin" data-role-id="${esc(account.id)}">删除</button>
          </div>` : ''}
        </div>`;
    }).join('');
  }

  function roleBlacklistRowsHTML() {
    if (!roleState.data.blacklist.length) return roleEmptyHTML('黑名单为空。可以添加账号名、UID 或 QQ 号。');
    return roleState.data.blacklist.map((entry) => `
      <div class="role-row">
        <span class="role-row-avatar is-black">BL</span>
        <div class="role-row-main"><b>${esc(entry.value)}</b><small>${esc(entry.reason || '未填写原因')} · ${entry.at ? new Date(entry.at).toLocaleDateString('zh-CN') : ''}</small></div>
        <div class="role-row-actions"><button class="mini-act is-danger" type="button" data-action="role-blacklist-remove" data-blacklist-id="${esc(entry.id)}">移除</button></div>
      </div>`).join('');
  }

  function rolePanelHTML() {
    const session = roleState.session;
    if (!session) return '';
    const tabs = rolePanelTabs();
    if (!tabs.includes(roleState.tab)) roleState.tab = tabs[0];
    const tab = roleState.tab;
    const role = session.role;
    const body = tab === 'super' ? roleSuperRowsHTML() : tab === 'admin' ? roleAdminRowsHTML() : roleBlacklistRowsHTML();
    return `
      <div class="role-panel-head">
        <span class="role-panel-avatar is-${role}">${role === 'owner' ? 'OW' : role === 'super' ? 'SA' : 'AD'}</span>
        <div class="role-panel-who"><span>${ROLE_LABEL[role]} · 已登录</span><b>${esc(decoratedName(session.username, session.uid))}</b><small>${esc(session.uid)}${session.qq ? ' · QQ ' + esc(session.qq) : ''}</small></div>
        <button class="mini-act is-danger" type="button" data-action="role-logout">退出角色</button>
      </div>
      <div class="role-quote">${SVG('sparkle')}<p>${esc(ROLE_WELCOME[role])}</p></div>
      <div class="role-actions">
        ${roleCanGm() ? `<button class="btn btn-primary btn-sm" type="button" data-action="role-gm">${SVG('terminal')}GM 后台</button>` : `<span class="role-locked">${SVG('shield')}管理员不能使用 GM 后台</span>`}
        ${roleCanCreate('super') ? `<button class="btn btn-soft btn-sm" type="button" data-action="role-add-super">${SVG('user')}添加超级管理员</button>` : ''}
        ${roleCanCreate('admin') ? `<button class="btn btn-soft btn-sm" type="button" data-action="role-add-admin">${SVG('user')}添加管理员</button>` : ''}
        <button class="btn btn-ghost btn-sm" type="button" data-action="role-add-blacklist">${SVG('shield')}添加黑名单</button>
      </div>
      <div class="role-tabs">
        ${tabs.map((key) => `<button class="role-tab ${tab === key ? 'is-active' : ''}" type="button" data-role-tab="${key}">${key === 'super' ? '超级管理员' : key === 'admin' ? '管理员' : '黑名单'} <span>${key === 'super' ? roleState.data.superAdmins.length : key === 'admin' ? roleState.data.admins.length : roleState.data.blacklist.length}</span></button>`).join('')}
      </div>
      <div class="role-list">${body}</div>
      <p class="role-note">${role === 'owner' ? 'APP主人可以添加 / 删除超级管理员与管理员，并可更换超级管理员密钥。' : role === 'super' ? '超级管理员最多可添加 50 位管理员，可管理管理员与黑名单，但不能删除其他超级管理员。' : '管理员可以管理管理员与黑名单，不能添加管理员、不能使用 GM 后台、不能删除超级管理员。'}</p>`;
  }

  function openRolePanel() {
    if (!roleValidateSession()) {
      toast('请先登录角色账号', 'warn');
      openSettingsSheet();
      return;
    }
    openSheet(rolePanelHTML(), { title: '角色控制台', sub: `${ROLE_LABEL[roleState.session.role]} · 权限与账号管理` });
  }

  function openRoleCreate(role) {
    if (!roleCanCreate(role)) {
      toast(role === 'super' ? '只有 APP主人可以添加超级管理员' : '管理员不能添加管理员', 'error', 4200);
      return;
    }
    const limit = ROLE_LIMIT[role];
    const count = roleAccounts(role).length;
    if (count >= limit) { toast(`${ROLE_LABEL[role]}最多 ${limit} 个账号，已经达到上限`, 'warn', 4200); return; }
    openSheet(`
      <div class="role-login-intro"><span class="role-login-badge">${ROLE_LABEL[role]}</span><b>添加${ROLE_LABEL[role]}</b><p>${role === 'super' ? '创建后会生成随机安全密钥，只有 APP主人可以复制。登录时必须同时输入密码和密钥。' : '管理员可管理管理员与黑名单，不能使用 GM 后台或添加管理员。'}</p></div>
      <form class="role-form" data-role-form="create" data-role-target="${role}" novalidate>
        <div class="field"><div class="field-label"><span>账号名称</span><small>3–16 位</small></div><div class="input-wrap">${SVG('user')}<input name="username" maxlength="16" autocomplete="off" placeholder="例如：星河管理员" required></div></div>
        <div class="field"><div class="field-label"><span>QQ 号</span><small>可选</small></div><div class="input-wrap">${SVG('user')}<input name="qq" maxlength="16" inputmode="numeric" autocomplete="off" placeholder="用于联系与找回"></div></div>
        <div class="field"><div class="field-label"><span>密码</span><small>至少 8 位</small></div><div class="input-wrap">${SVG('key')}<input name="password" type="password" maxlength="128" autocomplete="new-password" required><button class="pwd-toggle" type="button" data-toggle-pwd aria-pressed="false">显示</button></div></div>
        <div class="field"><div class="field-label"><span>确认密码</span></div><div class="input-wrap">${SVG('key')}<input name="password2" type="password" maxlength="128" autocomplete="new-password" required></div></div>
        <p class="role-form-error" id="roleFormError" role="alert"></p>
        <button class="btn btn-primary login-submit" type="submit">创建${ROLE_LABEL[role]}</button>
      </form>
      <p class="role-form-note">当前 ${count} / ${limit} 个${ROLE_LABEL[role]}账号。</p>
    `, { title: `添加${ROLE_LABEL[role]}`, sub: `${count} / ${limit}` });
  }

  async function roleCreateAccount(form) {
    const role = form.dataset.roleTarget;
    if (!roleCanCreate(role)) throw new Error('没有添加该角色的权限');
    if (roleAccounts(role).length >= ROLE_LIMIT[role]) throw new Error(`${ROLE_LABEL[role]}已达到 ${ROLE_LIMIT[role]} 个上限`);
    const username = String(form.elements.username.value || '').trim();
    const qq = String(form.elements.qq.value || '').trim();
    const password = String(form.elements.password.value || '');
    const password2 = String(form.elements.password2.value || '');
    if (!/^[\u4e00-\u9fa5A-Za-z0-9_]{3,16}$/.test(username)) throw new Error('账号需为 3–16 位中文、字母、数字或下划线');
    if (roleUsernameTaken(username)) throw new Error('这个账号名称已被使用');
    if (roleBlacklisted(username, qq, '')) throw new Error('这个账号或 QQ 在黑名单中');
    if (password.length < 8) throw new Error('密码至少 8 位');
    if (password !== password2) throw new Error('两次输入的密码不一致');
    const salt = randomHex(12);
    const account = {
      id: 'r_' + randomHex(8),
      uid: (role === 'super' ? 'SA-' : 'AD-') + randomHex(3).toUpperCase(),
      username,
      qq: qq || '',
      salt,
      hash: await localPasswordHash(password, salt),
      key: role === 'super' ? generateRoleKey() : '',
      createdAt: Date.now(),
      createdBy: roleState.session.username
    };
    roleAccounts(role).push(account);
    saveRoleData();
    return account;
  }

  function openRoleKeyResult(account) {
    if (!roleState.session || roleState.session.role !== 'owner') { toast('只有 APP主人可以复制安全密钥', 'error'); return; }
    openSheet(`
      <div class="role-key-result">
        <span class="role-key-result-ico">${SVG('key')}</span>
        <h3>超级管理员已创建</h3>
        <p>请把下面这串安全密钥交给 <b>${esc(account.username)}</b>。登录超级管理员时必须同时输入该密钥，否则会登录失败。</p>
        <div class="role-key-code"><span class="mono">${esc(account.key)}</span><button class="btn btn-primary btn-sm" type="button" data-copy="${esc(account.key)}">${SVG('copy')}复制密钥</button></div>
        <p class="download-note">安全密钥只在这里和 APP主人的超级管理员列表中显示；超级管理员本人看不到密钥，请不要发到群里。</p>
        <button class="btn btn-ghost btn-block btn-sm" type="button" data-action="role-panel">返回角色控制台</button>
      </div>
    `, { title: '安全密钥', sub: '仅 APP主人可复制' });
  }

  function openRoleBlacklistForm() {
    if (!roleState.session) return;
    openSheet(`
      <div class="role-login-intro"><span class="role-login-badge">黑名单</span><b>添加黑名单</b><p>可以填写账号名、UID 或 QQ 号。被加入黑名单的角色账号将无法登录。</p></div>
      <form class="role-form" data-role-form="blacklist" novalidate>
        <div class="field"><div class="field-label"><span>账号 / UID / QQ</span></div><div class="input-wrap">${SVG('shield')}<input name="value" maxlength="40" autocomplete="off" placeholder="例如：违规账号 / SA-XXXX / 123456789" required></div></div>
        <div class="field"><div class="field-label"><span>原因</span><small>可选</small></div><div class="input-wrap">${SVG('info')}<input name="reason" maxlength="60" autocomplete="off" placeholder="例如：恶意刷屏"></div></div>
        <p class="role-form-error" id="roleFormError" role="alert"></p>
        <button class="btn btn-primary login-submit" type="submit">加入黑名单</button>
      </form>
      <p class="role-form-note">管理员只能拉黑管理员；超级管理员不能拉黑超级管理员；APP主人不能被拉黑。</p>
    `, { title: '添加黑名单', sub: '账号 / UID / QQ' });
  }

  function roleBlacklistAdd(value, reason) {
    const text = String(value || '').trim();
    if (!text) throw new Error('请输入账号、UID 或 QQ');
    if (text.toLowerCase() === OWNER.username.toLowerCase() || text === OWNER.qq) {
      throw new Error('APP主人不能被加入黑名单');
    }
    const matched = roleFindAny(text);
    if (matched && !roleCanBlacklistTarget(matched.role)) {
      throw new Error('你没有拉黑该角色的权限');
    }
    if (roleState.data.blacklist.some((item) => String(item.value).toLowerCase() === text.toLowerCase())) {
      throw new Error('这个账号已经在黑名单中');
    }
    roleState.data.blacklist.push({
      id: 'b_' + randomHex(6),
      value: text,
      reason: String(reason || '').trim(),
      at: Date.now(),
      by: roleState.session.username
    });
    saveRoleData();
  }

  function openRoleResetPassword(role, id) {
    if (!roleCanManageTarget(role)) { toast('没有重置该账号密码的权限', 'error'); return; }
    const account = roleFind(role, id);
    if (!account) return;
    openSheet(`
      <div class="role-login-intro"><span class="role-login-badge">${ROLE_LABEL[role]}</span><b>重置密码 · ${esc(account.username)}</b><p>重置后旧密码立即失效；超级管理员的安全密钥不会改变。</p></div>
      <form class="role-form" data-role-form="reset-password" data-role-target="${role}" data-role-id="${esc(account.id)}" novalidate>
        <div class="field"><div class="field-label"><span>新密码</span><small>至少 8 位</small></div><div class="input-wrap">${SVG('key')}<input name="password" type="password" maxlength="128" autocomplete="new-password" required><button class="pwd-toggle" type="button" data-toggle-pwd aria-pressed="false">显示</button></div></div>
        <p class="role-form-error" id="roleFormError" role="alert"></p>
        <button class="btn btn-primary login-submit" type="submit">确认重置</button>
      </form>
    `, { title: '重置密码', sub: ROLE_LABEL[role] });
  }

  async function handleRoleSubmit(form) {
    const kind = form.dataset.roleForm;
    const btn = form.querySelector('[type="submit"]');
    const old = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '处理中…'; }
    try {
      if (kind === 'login') {
        await handleRoleLogin(form);
      } else if (kind === 'create') {
        const account = await roleCreateAccount(form);
        toast(`${ROLE_LABEL[form.dataset.roleTarget]}「${account.username}」已创建`, 'success', 4000);
        if (form.dataset.roleTarget === 'super') openRoleKeyResult(account);
        else openRolePanel();
      } else if (kind === 'blacklist') {
        roleBlacklistAdd(form.elements.value.value, form.elements.reason.value);
        toast('已加入黑名单', 'success');
        roleState.tab = 'blacklist';
        openRolePanel();
      } else if (kind === 'reset-password') {
        const role = form.dataset.roleTarget;
        const account = roleFind(role, form.dataset.roleId);
        if (!account || !roleCanManageTarget(role)) throw new Error('没有权限');
        const password = String(form.elements.password.value || '');
        if (password.length < 8) throw new Error('密码至少 8 位');
        account.salt = randomHex(12);
        account.hash = await localPasswordHash(password, account.salt);
        if (account.ownerUid) {
          const linked = store.get(economyKeyFor(account.ownerUid), null);
          if (linked && typeof linked === 'object') {
            linked.rolePassword = password;
            store.set(economyKeyFor(account.ownerUid), linked);
            if (economyState && economyState.uid === account.ownerUid) economyState.rolePassword = password;
          }
        }
        saveRoleData();
        toast('密码已重置', 'success');
        openRolePanel();
      } else if (kind === 'rename') {
        await applyNameChange(form.elements.newname.value);
        closeSheet();
        refreshMine(true);
      } else if (kind === 'player-list') {
        submitPlayerListing(form.dataset.itemId, form.elements.count.value, form.elements.price.value);
        openShopSheet();
        shopView = 'player';
        renderShopSheet();
      }
    } catch (err) {
      setRoleFormError(form, err.message || '操作失败');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = old; }
    }
  }

  function roleDelete(role, id) {
    if (!roleCanManageTarget(role)) { toast('没有删除该账号的权限', 'error'); return; }
    const account = roleFind(role, id);
    if (!account) return;
    if (roleState.session.role === 'admin' && roleState.session.id === account.id) { toast('不能删除当前登录账号', 'warn'); return; }
    openSheet(`
      <p class="confirm-copy">确定删除${ROLE_LABEL[role]}「<b>${esc(account.username)}</b>」吗？删除后该账号无法登录，安全密钥也会一并失效。</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" type="button" data-sheet-close>取消</button>
        <button class="btn btn-danger" type="button" data-action="role-delete-confirm" data-role-target="${role}" data-role-id="${esc(account.id)}">${SVG('trash')}确认删除</button>
      </div>
    `, { title: '删除账号', sub: ROLE_LABEL[role] });
  }

  function roleDeleteConfirm(role, id) {
    if (!roleCanManageTarget(role)) { toast('没有删除权限', 'error'); return; }
    const list = roleAccounts(role);
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return;
    const account = list[index];
    if (roleState.session.role === 'admin' && roleState.session.id === account.id) { toast('不能删除当前登录账号', 'warn'); return; }
    list.splice(index, 1);
    if (account.ownerUid) {
      const linked = store.get(economyKeyFor(account.ownerUid), null);
      if (linked && typeof linked === 'object') {
        linked.role = '';
        linked.roleAccountId = '';
        linked.roleKey = '';
        store.set(economyKeyFor(account.ownerUid), linked);
        if (economyState && economyState.uid === account.ownerUid) {
          economyState.role = '';
          economyState.roleAccountId = '';
          economyState.roleKey = '';
        }
      }
    }
    saveRoleData();
    toast(`${ROLE_LABEL[role]}「${account.username}」已删除`, 'success');
    openRolePanel();
  }

  function roleResetKey(id) {
    if (!roleState.session || roleState.session.role !== 'owner') { toast('只有 APP主人可以更换安全密钥', 'error'); return; }
    const account = roleFind('super', id);
    if (!account) return;
    account.key = generateRoleKey();
    if (account.ownerUid) {
      const linked = store.get(economyKeyFor(account.ownerUid), null);
      if (linked && typeof linked === 'object') {
        linked.roleKey = account.key;
        store.set(economyKeyFor(account.ownerUid), linked);
        if (economyState && economyState.uid === account.ownerUid) economyState.roleKey = account.key;
      }
    }
    saveRoleData();
    openRoleKeyResult(account);
  }

  function roleLogout() {
    roleState.session = null;
    store.del(KEY_ROLE_SESSION);
    closeSheet();
    openSettingsSheet();
    toast('已退出角色账号，世界仍在等你', 'success', 3200);
  }

  /* ---------------- GM 命令台 ---------------- */
  const GM_TABS = { item: '刷物品', entity: '刷实体', status: '刷状态', currency: '货币', level: '经验', shop: '商店', custom: '自定义' };
  const GM_QUICK_ITEMS = [
    ['钻石剑', 'minecraft:diamond_sword'], ['下界合金剑', 'minecraft:netherite_sword'],
    ['金苹果', 'minecraft:golden_apple'], ['附魔金苹果', 'minecraft:enchanted_golden_apple'],
    ['鞘翅', 'minecraft:elytra'], ['钻石块', 'minecraft:diamond_block'],
    ['命令方块', 'minecraft:command_block'], ['屏障', 'minecraft:barrier']
  ];
  const GM_QUICK_ENTITIES = [
    ['末影龙', 'minecraft:ender_dragon'], ['凋灵', 'minecraft:wither'],
    ['监守者', 'minecraft:warden'], ['铁傀儡', 'minecraft:iron_golem'],
    ['村民', 'minecraft:villager'], ['苦力怕', 'minecraft:creeper']
  ];
  const GM_EFFECTS = [
    ['夜视', 'minecraft:night_vision'], ['抗性提升', 'minecraft:resistance'],
    ['生命恢复', 'minecraft:regeneration'], ['力量', 'minecraft:strength'],
    ['速度', 'minecraft:speed'], ['防火', 'minecraft:fire_resistance']
  ];

  function gmAllowed() {
    if (!roleCanGm()) { toast('管理员不能使用 GM 后台', 'error', 4200); return false; }
    return true;
  }

  function gmTabHTML() {
    return Object.keys(GM_TABS).map((key) => `<button class="gm-tab ${gmState.tab === key ? 'is-active' : ''}" type="button" data-gm-tab="${key}">${GM_TABS[key]}</button>`).join('');
  }

  function gmQuickHTML(items, attr) {
    return items.map(([label, value]) => `<button class="gm-quick" type="button" ${attr}="${esc(value)}">${esc(label)}</button>`).join('');
  }

  function gmPanelHTML() {
    if (gmState.tab === 'entity') {
      return `
        <div class="gm-grid">
          <label class="gm-field"><span>目标 / 坐标</span><input id="gmTarget" value="@s" placeholder="@s 或 ~ ~ ~"></label>
          <label class="gm-field"><span>实体 ID</span><input id="gmEntity" value="minecraft:zombie" placeholder="minecraft:zombie"></label>
          <label class="gm-field"><span>数量</span><input id="gmEntityCount" type="number" min="1" max="64" value="1"></label>
          <label class="gm-field full"><span>NBT（可选）</span><input id="gmEntityNbt" placeholder='{NoAI:1b,CustomName:"GM"}'></label>
        </div>
        <div class="gm-actions"><button class="btn btn-primary btn-sm" type="button" data-gm-run="summon">${SVG('sparkle')}刷实体 /summon</button><button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="kill">${SVG('trash')}删除 /kill</button></div>
        <div class="gm-quick-row">${gmQuickHTML(GM_QUICK_ENTITIES, 'data-gm-entity')}</div>
        <p class="gm-hint">删除会执行 <span class="mono">/kill @e[type=实体]</span>，只清除对应实体。</p>`;
    }
    if (gmState.tab === 'status') {
      return `
        <div class="gm-grid">
          <label class="gm-field"><span>目标</span><input id="gmTarget" value="@s" placeholder="@s"></label>
          <label class="gm-field"><span>效果 ID</span><input id="gmEffect" value="minecraft:night_vision"></label>
          <label class="gm-field"><span>持续时间（秒）</span><input id="gmDuration" type="number" min="1" value="300"></label>
          <label class="gm-field"><span>等级</span><input id="gmAmplifier" type="number" min="0" max="255" value="1"></label>
          <label class="gm-field"><span>游戏模式</span><select id="gmGamemode"><option value="creative">创造</option><option value="survival">生存</option><option value="adventure">冒险</option><option value="spectator">旁观</option></select></label>
          <label class="gm-field"><span>经验等级</span><input id="gmXp" type="number" min="0" value="30"></label>
        </div>
        <div class="gm-actions">
          <button class="btn btn-primary btn-sm" type="button" data-gm-run="effect">${SVG('sparkle')}刷效果</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="effect-clear">${SVG('trash')}清效果</button>
          <button class="btn btn-soft btn-sm" type="button" data-gm-run="gamemode">切换模式</button>
          <button class="btn btn-ghost btn-sm" type="button" data-gm-run="xp">加经验</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="xp-clear">清经验</button>
        </div>
        <div class="gm-quick-row">${gmQuickHTML(GM_EFFECTS, 'data-gm-effect')}</div>`;
    }
    if (gmState.tab === 'currency') {
      return `
        <div class="gm-grid">
          <label class="gm-field full"><span>目标账号</span><input id="gmTargetUid" value="@self" placeholder="@self 或 UID / 本机账号名"></label>
          <label class="gm-field"><span>金锭数量</span><input id="gmGoldAmount" type="number" min="1" value="1000"></label>
          <label class="gm-field"><span>钻石数量</span><input id="gmDiamondAmount" type="number" min="1" value="10"></label>
        </div>
        <div class="gm-actions">
          <button class="btn btn-primary btn-sm" type="button" data-gm-run="gold-add">加金锭</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="gold-sub">减金锭</button>
          <button class="btn btn-primary btn-sm" type="button" data-gm-run="diamond-add">加钻石</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="diamond-sub">减钻石</button>
        </div>
        <p class="gm-hint">目标支持 @self、UID 或本机账号名。金锭 / 钻石保存在目标账号的货币背包中。</p>`;
    }
    if (gmState.tab === 'level') {
      return `
        <div class="gm-grid">
          <label class="gm-field full"><span>目标账号</span><input id="gmTargetUid" value="@self" placeholder="@self 或 UID / 本机账号名"></label>
          <label class="gm-field"><span>等级数量</span><input id="gmLevelAmount" type="number" min="1" value="1"></label>
          <label class="gm-field"><span>经验值数量</span><input id="gmXpAmount" type="number" min="1" value="500"></label>
        </div>
        <div class="gm-actions">
          <button class="btn btn-primary btn-sm" type="button" data-gm-run="level-add">加等级</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="level-sub">减等级</button>
          <button class="btn btn-primary btn-sm" type="button" data-gm-run="xp-add">加经验值</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="xp-sub">减经验值</button>
        </div>
        <p class="gm-hint">等级加减会按等级经验表移动；经验值直接增减 EXP，最高 LV.100。</p>`;
    }
    if (gmState.tab === 'shop') {
      return `
        <div class="gm-grid">
          <label class="gm-field"><span>商品编号 / ID</span><input id="gmShopId" placeholder="例如 frame-gold 或 custom_xxx"></label>
          <label class="gm-field"><span>数量</span><input id="gmShopQty" type="number" min="1" value="10"></label>
          <label class="gm-field"><span>价格（金锭）</span><input id="gmShopPrice" type="number" min="0" value="100"></label>
          <label class="gm-field"><span>商品名称（上架用）</span><input id="gmShopName" placeholder="例如 限定头像框"></label>
        </div>
        <div class="gm-actions">
          <button class="btn btn-primary btn-sm" type="button" data-gm-run="shop-stock-add">加货物</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="shop-stock-sub">减货物</button>
          <button class="btn btn-primary btn-sm" type="button" data-gm-run="shop-list">上架</button>
          <button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="shop-delist">下架</button>
        </div>
        <p class="gm-hint">上架会创建自定义商品；下架会按编号减少库存，库存为 0 时移除。商店会立即刷新。</p>`;
    }
    if (gmState.tab === 'custom') {
      return `
        <label class="gm-field"><span>自定义命令</span><textarea id="gmCustom" rows="5" placeholder="/give @s minecraft:diamond 64"></textarea></label>
        <div class="gm-actions"><button class="btn btn-primary btn-sm" type="button" data-gm-run="custom">${SVG('terminal')}生成命令</button></div>
        <p class="gm-hint">GM 后台负责生成命令，复制到游戏或服务器执行；不会直接连接你的服务器。</p>`;
    }
    return `
      <div class="gm-grid">
        <label class="gm-field"><span>目标</span><input id="gmTarget" value="@s" placeholder="@s 或 玩家名"></label>
        <label class="gm-field"><span>物品 ID</span><input id="gmItem" value="minecraft:diamond_sword" placeholder="minecraft:diamond_sword"></label>
        <label class="gm-field"><span>数量</span><input id="gmCount" type="number" min="1" max="64" value="1"></label>
        <label class="gm-field full"><span>NBT（可选）</span><input id="gmItemNbt" placeholder='{Enchantments:[{id:"minecraft:sharpness",lvl:5s}]}'></label>
      </div>
      <div class="gm-actions"><button class="btn btn-primary btn-sm" type="button" data-gm-run="give">${SVG('sparkle')}刷物品 /give</button><button class="btn btn-danger-soft btn-sm" type="button" data-gm-run="clear-item">${SVG('trash')}删除 /clear</button><button class="btn btn-ghost btn-sm" type="button" data-gm-run="clear-inventory">${SVG('trash')}清空背包</button></div>
      <div class="gm-quick-row">${gmQuickHTML(GM_QUICK_ITEMS, 'data-gm-item')}</div>
      <p class="gm-hint">有刷就有删：/give 对应 /clear；清空背包会清除目标玩家的全部物品。</p>`;
  }

  function openGmSheet(tab = gmState.tab) {
    if (!gmAllowed()) return;
    gmState.tab = GM_TABS[tab] ? tab : 'item';
    openSheet(`
      <div class="gm-head">
        <div><span class="mono">GM CONSOLE</span><b>${ROLE_LABEL[roleState.session.role]} · ${esc(roleState.session.username)}</b><small>生成命令并复制到游戏执行 · 有刷就有删</small></div>
        <span class="gm-badge">${roleState.session.role === 'owner' ? 'OWNER' : 'SUPER'}</span>
      </div>
      <div class="gm-tabs">${gmTabHTML()}</div>
      <div class="gm-panel" id="gmPanel">${gmPanelHTML()}</div>
      <div id="gmOutput"></div>
      <p class="gm-foot">${SVG('shield')}GM 后台仅对 APP主人 / 超级管理员开放，管理员不可使用。</p>
    `, { title: 'GM 命令台', sub: '刷物品 / 刷实体 / 刷状态 / 删除' });
  }

  function gmSetOutput(command, note) {
    const host = $('#gmOutput');
    if (!host) return;
    host.innerHTML = `
      <div class="gm-output-head"><span class="mono">RESULT</span><button class="mini-act" type="button" data-copy="${esc(command)}">复制命令</button></div>
      <pre class="gm-output-code">${esc(command)}</pre>
      ${note ? `<p class="gm-hint">${esc(note)}</p>` : ''}`;
    sfx('success');
  }

  function gmNormalizeId(value, fallback) {
    const raw = String(value || '').trim() || fallback;
    if (!raw) return '';
    return raw.includes(':') ? raw : 'minecraft:' + raw;
  }

  function gmResolveUid(value) {
    const text = String(value || '').trim();
    if (!text || text === '@self' || text === '@s') return state.session ? state.session.uid : '';
    const local = localAccounts().find((account) =>
      account.uid === text || String(account.displayId || '').toLowerCase() === text.toLowerCase() || String(account.key || '') === text);
    return local ? local.uid : text;
  }

  function gmLevelChange(uid, delta) {
    const xp = xpForUid(uid);
    const info = levelFromXp(xp);
    const into = xp - XP_TOTALS[info.level];
    const nextLevel = Math.max(0, Math.min(MAX_LEVEL, info.level + delta));
    return XP_TOTALS[nextLevel] + (nextLevel === 0 ? 0 : into);
  }

  function gmShopAction(action) {
    const id = String(($('#gmShopId') && $('#gmShopId').value) || '').trim();
    const qty = Math.max(1, Number(($('#gmShopQty') && $('#gmShopQty').value) || 1));
    const price = Math.max(0, Number(($('#gmShopPrice') && $('#gmShopPrice').value) || 0));
    const name = String(($('#gmShopName') && $('#gmShopName').value) || '').trim();
    if (action === 'shop-list') {
      if (!name) { toast('请填写要上架的商品名称', 'warn'); return; }
      const newId = 'custom_' + randomHex(5);
      shopState.custom.push({ id: newId, name, desc: 'GM 上架商品', priceGold: price, priceDiamonds: 0, stock: qty });
      shopState.stock[newId] = qty;
      saveShopState();
      gmSetOutput(`已上架：${newId}\n商品：${name}\n库存：${qty}\n价格：${price} 金锭`, '自定商品编号可在商店中查看；GM 可用编号下架。');
      renderShopSheet();
      return;
    }
    if (!id) { toast('请填写商品编号 / ID', 'warn'); return; }
    const item = shopItem(id);
    if (!item) { toast('找不到这个商品编号', 'warn'); return; }
    const current = shopStockOf(item);
    if (action === 'shop-stock-add') {
      shopState.stock[id] = current === Infinity ? qty : current + qty;
      saveShopState();
      gmSetOutput(`已增加货物：${id}\n库存：${shopState.stock[id]}`, '商店库存已更新。');
    } else if (action === 'shop-stock-sub') {
      shopState.stock[id] = current === Infinity ? 0 : Math.max(0, current - qty);
      saveShopState();
      gmSetOutput(`已减少货物：${id}\n库存：${shopState.stock[id]}`, '商店库存已更新。');
    } else if (action === 'shop-delist') {
      const next = current === Infinity ? 0 : Math.max(0, current - qty);
      if (next <= 0) {
        if (shopState.custom.some((entry) => entry.id === id)) {
          shopState.custom = shopState.custom.filter((entry) => entry.id !== id);
          delete shopState.stock[id];
          gmSetOutput(`已下架：${id}\n该商品库存已清零并移除。`, '商品已从商店移除。');
        } else {
          shopState.stock[id] = 0;
          gmSetOutput(`已下架：${id}\n官方商品已标记售罄。`, '官方商品库存为 0，不会恢复不限量。');
        }
      } else {
        shopState.stock[id] = next;
        gmSetOutput(`已下架 ${qty} 件：${id}\n剩余库存：${next}`, '商品仍在商店，库存减少。');
      }
      saveShopState();
    }
    renderShopSheet();
  }

  function runGm(action) {
    if (!gmAllowed()) return;
    const target = String(($('#gmTarget') && $('#gmTarget').value) || '@s').trim() || '@s';
    let command = '';
    let note = '';
    if (action.startsWith('shop-')) {
      gmShopAction(action);
      return;
    }
    if (action === 'gold-add' || action === 'gold-sub' || action === 'diamond-add' || action === 'diamond-sub') {
      const uid = gmResolveUid($('#gmTargetUid').value);
      if (!uid) { toast('请先登录账号', 'warn'); return; }
      const amount = Math.max(1, Number($('#gmGoldAmount').value || $('#gmDiamondAmount').value) || 1);
      const kind = action.startsWith('gold') ? 'gold' : 'diamond';
      const delta = action.endsWith('-add') ? amount : -amount;
      addCurrency(kind, delta, 'GM', uid);
      gmSetOutput(`目标：${uid}\n${kind === 'gold' ? '金锭' : '钻石'} ${delta >= 0 ? '+' : ''}${delta}`, '货币已写入目标账号的背包。');
      return;
    }
    if (['level-add', 'level-sub', 'xp-add', 'xp-sub'].includes(action)) {
      const uid = gmResolveUid($('#gmTargetUid').value);
      if (!uid) { toast('请先登录账号', 'warn'); return; }
      const isLevel = action.startsWith('level');
      const amount = Math.max(1, Number(isLevel ? $('#gmLevelAmount').value : $('#gmXpAmount').value) || 1);
      const delta = action.endsWith('-add') ? amount : -amount;
      const currentXp = xpForUid(uid);
      const finalXp = isLevel ? gmLevelChange(uid, delta) : Math.max(0, Math.min(MAX_XP, currentXp + delta));
      setXpForUid(uid, finalXp);
      refreshMine(true);
      gmSetOutput(`目标：${uid}\n${isLevel ? '等级' : '经验值'} ${action.endsWith('-add') ? '+' : '-'}${amount}`, `当前经验值：${finalXp} EXP · LV.${levelFromXp(finalXp).level}`);
      return;
    }
    if (action === 'give') {
      const item = gmNormalizeId($('#gmItem').value, 'minecraft:diamond');
      const count = Math.max(1, Math.min(64, Number($('#gmCount').value) || 1));
      const nbt = String($('#gmItemNbt').value || '').trim();
      command = `/give ${target} ${item}${nbt ? nbt : ''} ${count}`;
      note = `删除：/clear ${target} ${item} 0`;
    } else if (action === 'clear-item') {
      const item = gmNormalizeId($('#gmItem').value, 'minecraft:diamond');
      command = `/clear ${target} ${item} 0`;
      note = '只清除该物品；清空背包请用「清空背包」。';
    } else if (action === 'clear-inventory') {
      command = `/clear ${target}`;
      note = '清空目标玩家的全部物品。';
    } else if (action === 'summon') {
      const entity = gmNormalizeId($('#gmEntity').value, 'minecraft:zombie');
      const count = Math.max(1, Math.min(64, Number($('#gmEntityCount').value) || 1));
      const nbt = String($('#gmEntityNbt').value || '').trim();
      command = count > 1
        ? `/execute at ${target} run summon ${entity} ~ ~ ~${nbt ? nbt : ''}`
        : `/summon ${entity} ~ ~ ~${nbt ? nbt : ''}`;
      note = `删除：/kill @e[type=${entity}]（一次召唤 ${count} 个时请重复执行或使用循环命令方块）`;
    } else if (action === 'kill') {
      const entity = gmNormalizeId($('#gmEntity').value, 'minecraft:zombie');
      command = `/kill @e[type=${entity}]`;
      note = '删除对应类型的全部实体。';
    } else if (action === 'effect') {
      const effect = gmNormalizeId($('#gmEffect').value, 'minecraft:night_vision');
      const seconds = Math.max(1, Number($('#gmDuration').value) || 300);
      const amp = Math.max(0, Number($('#gmAmplifier').value) || 0);
      command = `/effect give ${target} ${effect} ${seconds} ${amp} true`;
      note = `删除：/effect clear ${target} ${effect}`;
    } else if (action === 'effect-clear') {
      const effect = gmNormalizeId($('#gmEffect').value, 'minecraft:night_vision');
      command = `/effect clear ${target} ${effect}`;
      note = '移除目标身上的指定效果。';
    } else if (action === 'gamemode') {
      const mode = $('#gmGamemode').value;
      command = `/gamemode ${mode} ${target}`;
      note = `切换回生存：/gamemode survival ${target}`;
    } else if (action === 'xp') {
      const amount = Math.max(0, Number($('#gmXp').value) || 30);
      command = `/xp add ${target} ${amount} levels`;
      note = `清空等级：/xp set ${target} 0 levels`;
    } else if (action === 'xp-clear') {
      command = `/xp set ${target} 0 levels`;
      note = '把目标玩家的经验等级清零。';
    } else if (action === 'custom') {
      command = String($('#gmCustom').value || '').trim();
      note = '自定义命令由你自行确认语法与权限。';
      if (!command) { toast('请先输入自定义命令', 'warn'); return; }
    }
    if (!command) return;
    gmSetOutput(command, note);
  }

  function settingsSheetHTML() {
    const theme = themeById(state.settings.theme);
    return `
      ${roleMastheadHTML()}
      <div class="settings-card settings-sheet-card">
        ${settingRowHTML('theme', 'palette', 'c-green', '外观主题', '草方块 / 下界 / 末地 / 海洋', esc(theme.name))}
        ${toggleRowHTML('sound', 'sound', 'c-blue', '音效与反馈', '按钮与操作提示音')}
        ${settingRowHTML('bgm', 'sound', 'c-green', '背景音乐', '开启 / 关闭 / 切换 / 导入音乐', esc(bgmTrackLabel()))}
        ${toggleRowHTML('motion', 'motion', 'c-purple', '界面动画', '页面切换与进入动画')}
        ${toggleRowHTML('notify', 'bell', 'c-amber', '消息通知', '版本更新与活动提醒')}
        ${settingRowHTML('clear-search', 'search', 'c-blue', '清除搜索历史', '删除本机保存的搜索记录', '清空')}
        ${settingRowHTML('history', 'info', 'c-purple', '历史记录', '生成历史 / 导出历史 / 检测文件', `${activityEntries().length} 条`)}
        ${settingRowHTML('command-box', 'terminal', 'c-green', '指令盒', 'APP主人 / 超级管理员 / 管理员专用', '进入')}
        ${settingRowHTML('other-apps', 'box', 'c-purple', '其他APP', '云析 / 极客猫 / 一叶知音', '查看')}
        ${settingRowHTML('about-us', 'user', 'c-blue', '关于我们', '作者、赞助商与官方群 · ' + QQ_GROUP, '查看')}
        ${settingRowHTML('sponsor-us', 'sparkle', 'c-amber', '赞助我们', '微信扫码赞赏 · 支持持续更新', '查看')}
        ${settingRowHTML('about-app', 'info', 'c-green', '关于软件 / 更新', '内置更新 · 下载进度 · 下载路径', 'v' + DATA.version)}
        ${/^https?:$/.test(location.protocol) ? settingRowHTML('admin-console', 'shield', 'c-blue', '管理后台', '管理员账号密码 · 账号 / 消息 / 更新', '进入') : ''}
      </div>
      <p class="settings-final">最终解释权归作者所有</p>`;
  }

  function openSettingsSheet() {
    trackTask('settings-open');
    openSheet(settingsSheetHTML(), { title: '设置', sub: '所有偏好、导出与关于信息' });
  }

  /* ---------------- 生成 / 导出历史 ---------------- */
  function activityEntries() {
    const list = store.get(KEY_ACTIVITY, []);
    return Array.isArray(list) ? list : [];
  }

  function saveActivity(list) {
    store.set(KEY_ACTIVITY, list.slice(0, 80));
  }

  function recordActivity(kind, data) {
    const list = activityEntries();
    list.unshift(Object.assign({
      id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      kind,
      at: Date.now()
    }, data || {}));
    saveActivity(list);
  }

  function activityTime(at) {
    try { return new Date(at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  }

  function activityListHTML(kind) {
    const list = activityEntries().filter((e) => e.kind === kind);
    if (!list.length) return `<div class="history-empty">${kind === 'export' ? '还没有导出记录' : '还没有生成记录'}</div>`;
    return list.map((e) => `
      <div class="history-row">
        <span class="history-ico">${SVG(kind === 'export' ? 'download' : 'sparkle')}</span>
        <span class="history-main"><b>${esc(e.tool || '工具')} · ${esc(e.title || '')}</b><small>${esc(e.detail || '')}</small><small class="mono">${esc(activityTime(e.at))}${e.path ? ' · ' + esc(e.path) : ''}</small></span>
        ${kind === 'export' && e.filename ? `<button class="mini-link" type="button" data-history-open="${esc(e.id)}">检测 / 打开</button>` : ''}
      </div>`).join('');
  }

  function openHistorySheet(tab = historyTab) {
    historyTab = tab === 'export' ? 'export' : 'generate';
    openSheet(`
      <div class="history-tabs">
        <button class="history-tab ${historyTab === 'generate' ? 'is-active' : ''}" type="button" data-history-tab="generate">生成历史 <span>${activityEntries().filter((e) => e.kind === 'generate').length}</span></button>
        <button class="history-tab ${historyTab === 'export' ? 'is-active' : ''}" type="button" data-history-tab="export">导出历史 <span>${activityEntries().filter((e) => e.kind === 'export').length}</span></button>
      </div>
      <div class="history-list" id="historyList">${activityListHTML(historyTab)}</div>
      <div class="history-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-history-clear="${historyTab}">${SVG('trash')}清空${historyTab === 'export' ? '导出' : '生成'}历史</button>
      </div>
      <p class="download-note">导出记录会保存路径；点「检测 / 打开」会检查存储设备中是否存在该文件：存在则尝试打开，不存在会提示重新导出或复制下载。</p>
    `, { title: '历史记录', sub: '生成历史 / 导出历史' });
  }

  async function checkHistoryFile(id) {
    const entry = activityEntries().find((e) => e.id === id);
    if (!entry) return;
    const path = entry.path || exportPathLabel();
    const full = path.replace(/\/$/, '') + '/' + entry.filename;
    if (window.WWShell && typeof window.WWShell.fileExists === 'function') {
      try {
        const exists = await window.WWShell.fileExists(full);
        if (!exists) {
          copyText(full, false);
          toast('存储设备中没有找到该文件；路径已复制，请重新导出或到下载目录查看', 'warn', 4800);
          return;
        }
        if (typeof window.WWShell.openFile === 'function' && await window.WWShell.openFile(full)) {
          toast('已打开导出的文件', 'success');
          return;
        }
        toast('文件存在，但当前壳不支持直接打开，请到文件管理器查看', 'info', 4200);
        return;
      } catch { /* 继续本地检测 */ }
    }
    if (exportDirHandle) {
      try {
        await exportDirHandle.getFileHandle(entry.filename);
        toast('文件在已选择的下载文件夹中，请到文件管理器打开', 'success', 3600);
        return;
      } catch { /* 不存在 */ }
    }
    copyText(full, false);
    toast('未检测到存储设备中的文件；路径已复制，请重新导出或复制到手机下载', 'warn', 4800);
  }

  /* ---------------- 导出路径 / 文件保存 ---------------- */
  function exportPathLabel() {
    return state.exportPath || EXPORT_PATH_DEFAULT;
  }

  function rememberExportPath(label) {
    state.exportPath = label || EXPORT_PATH_DEFAULT;
    try { localStorage.setItem(KEY_EXPORT_PATH, state.exportPath); } catch { /* ignore */ }
  }

  function updatePathDisplays() {
    const path = exportPathLabel();
    $$('#storagePathText, #exportPathText').forEach((el) => { el.textContent = path; });
    const box = $('.export-path-box .mono');
    if (box) box.textContent = path;
  }

  function openExportPathSheet() {
    openSheet(`
      <div class="export-path-box">
        <span class="mono" id="exportPathText">${esc(exportPathLabel())}</span>
      </div>
      <p class="field-hint">APP 会自动读取系统的「下载」路径。像素画、点阵字、更新包以及所有导出文件都统一写入这里，不再提供自定义文件夹，避免文件散落到其他目录。</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" type="button" data-action="open-storage">${SVG('search')}存储与 APK</button>
        <button class="btn btn-primary" type="button" data-action="refresh-download-path">${SVG('download')}重新读取下载路径</button>
      </div>
      <p class="download-note">原生壳通过 WWShell.getDownloadPath() 读取路径、WWShell.saveFile() 写入文件；浏览器受系统限制，会使用浏览器默认下载目录。首次使用需在权限页允许存储权限。</p>
    `, { title: '下载路径', sub: '所有导出文件统一保存位置' });
    refreshDownloadPath(false).then(updatePathDisplays);
  }

  function idbOpen() {
    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') { resolve(null); return; }
      let req;
      try { req = indexedDB.open('ww-fs', 1); } catch { resolve(null); return; }
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('handles')) db.createObjectStore('handles');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  async function idbSet(key, value) {
    const db = await idbOpen();
    if (!db) return;
    await new Promise((resolve) => {
      try {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch { resolve(); }
    });
  }

  async function idbGet(key) {
    const db = await idbOpen();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('handles', 'readonly');
        const req = tx.objectStore('handles').get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }

  async function idbDelete(key) {
    const db = await idbOpen();
    if (!db) return;
    await new Promise((resolve) => {
      try {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch { resolve(); }
    });
  }

  async function restoreExportDir() {
    const handle = await idbGet('exportDir');
    if (!handle) return;
    exportDirHandle = handle;
    if (handle.name) rememberExportPath(handle.name);
  }

  async function chooseExportPath() {
    const path = await refreshDownloadPath(true);
    updatePathDisplays();
    refreshMine(true);
    if (!path) toast('未能读取下载路径，将使用默认目录', 'warn');
  }

  async function resetExportPath() {
    await refreshDownloadPath(true);
    updatePathDisplays();
    refreshMine(true);
  }

  async function ensureDirPermission(handle) {
    if (!handle) return false;
    try {
      if (typeof handle.queryPermission === 'function') {
        const stateNow = await handle.queryPermission({ mode: 'readwrite' });
        if (stateNow === 'granted') return true;
        if (typeof handle.requestPermission === 'function') {
          return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted';
        }
      }
      return true;
    } catch { return false; }
  }

  /** 保存导出文件：优先写入已选文件夹，其次原生壳，最后浏览器下载 */
  function bytesToBase64(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function showExportProgress(title, sub) {
    let el = $('#exportProgress');
    if (el) el.remove();
    el = document.createElement('div');
    el.id = 'exportProgress';
    el.className = 'export-progress';
    el.innerHTML = `<div class="export-progress-card"><span class="mono">EXPORT</span><h3>${esc(title)}</h3><p>${esc(sub || '正在准备文件…')}</p><div class="export-progress-bar"><i></i></div><b class="mono">0%</b></div>`;
    document.body.appendChild(el);
    return el;
  }

  function setExportProgress(pct, text) {
    const el = $('#exportProgress');
    if (!el) return;
    const value = Math.max(0, Math.min(100, Math.round(pct)));
    const bar = el.querySelector('.export-progress-bar i');
    if (bar) bar.style.width = `${value}%`;
    const label = el.querySelector('.export-progress-card > b');
    if (label) label.textContent = `${value}%`;
    const p = el.querySelector('p');
    if (p && text) p.textContent = text;
  }

  function hideExportProgress(delay = 320) {
    setTimeout(() => {
      const el = $('#exportProgress');
      if (el) {
        el.classList.add('is-out');
        setTimeout(() => el.remove(), 260);
      }
    }, delay);
  }

  async function requestStoragePermission() {
    if (!window.WWShell) return true;
    const fn = window.WWShell.requestStoragePermission || window.WWShell.ensureStoragePermission;
    if (typeof fn !== 'function') return true;
    try { return await fn() !== false; } catch { return false; }
  }

  async function saveExportFile(filename, data, mime = 'application/octet-stream') {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
    if (window.WWShell && typeof window.WWShell.saveFile === 'function') {
      try {
        await requestStoragePermission();
        const buffer = await blob.arrayBuffer();
        const base64 = bytesToBase64(new Uint8Array(buffer));
        const targetPath = await refreshDownloadPath(false);
        const saved = await window.WWShell.saveFile(filename, base64, mime, targetPath);
        if (saved) {
          toast(`已保存到 ${targetPath}/${filename}`, 'success', 4200);
          return true;
        }
      } catch { /* 回退下载 */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast(`已导出 ${filename}，请到下载目录查看`, 'success', 3800);
    return true;
  }

  async function saveExportPathName() {
    const input = $('#exportPathInput');
    rememberExportPath(input ? input.value.trim() || EXPORT_PATH_DEFAULT : EXPORT_PATH_DEFAULT);
    closeSheet();
    refreshMine(true);
    toast('导出路径名称已保存', 'success');
  }

  function deviceLauncherApps() {
    const list = [];
    (DATA.androidLaunchers || []).forEach((app) => list.push(app));
    if (DATA.bedrockLauncher) list.push(DATA.bedrockLauncher);
    if (DATA.neteaseBedrock) list.push(DATA.neteaseBedrock);
    return list.filter((app) => app && app.package).slice(0, 8);
  }

  function deviceInstalledSet() {
    if (!Array.isArray(state.deviceApps)) return null;
    return new Set(state.deviceApps.map((item) => {
      if (typeof item === 'string') return item;
      return item && (item.packageName || item.package || item.id);
    }).filter(Boolean));
  }

  function storageCardHTML() {
    const apks = (state.storageFiles || []).filter((f) => /\.apk$/i.test(f.name || f.path || '')).length;
    return `
      <section class="storage-card" aria-label="存储与 APK">
        <span class="storage-card-ico">${SVG('download')}</span>
        <div class="storage-card-main">
          <span class="kicker"><span class="kicker-block"></span>STORAGE · 存储与 APK</span>
          <b>下载路径</b>
          <small class="mono">${esc(state.storagePath || exportPathLabel())}</small>
          <em>${state.storageFiles.length ? `${apks} 个 APK · ${state.storageFiles.length} 个文件` : '读取本机 APK 文件与下载目录'}</em>
        </div>
        <button class="btn btn-soft btn-sm" type="button" data-action="open-storage">${SVG('search')}管理</button>
      </section>`;
  }

  function deviceLauncherHTML() {
    const apps = deviceLauncherApps();
    const installed = deviceInstalledSet();
    const scanned = installed !== null;
    return `
      <section class="device-launcher" aria-label="设备启动器">
        <div class="device-launcher-head">
          <span class="device-launcher-ico">${SVG('rocket')}</span>
          <div class="device-launcher-title">
            <span class="kicker"><span class="kicker-block"></span>DEVICE · 设备启动器</span>
            <b>本机启动器</b>
            <small>${scanned ? `已扫描到 ${installed.size} 个已安装应用` : '扫描本机已安装的启动器与游戏，需要存储权限'}</small>
          </div>
          <button class="btn btn-soft btn-sm" type="button" data-scan-device ${state.deviceScanning ? 'disabled' : ''}>${SVG(state.deviceScanning ? 'motion' : 'search')}${state.deviceScanning ? '扫描中…' : scanned ? '重新扫描' : '扫描设备'}</button>
        </div>
        <div class="device-app-grid">
          ${apps.map((app) => {
            const isOn = !!(installed && installed.has(app.package));
            return `
              <article class="device-app ${isOn ? 'is-installed' : ''}">
                <span class="device-app-ico">${app.image ? `<img src="${esc(app.image)}" alt="${esc(app.name)}" loading="lazy" decoding="async">` : esc((app.name || 'A').slice(0, 1))}</span>
                <div class="device-app-main"><b>${esc(app.name)}</b><small>${isOn ? '已安装 · ' + esc(app.package) : scanned ? '未安装' : esc(app.package || '')}</small></div>
                ${isOn
                  ? `<button class="mini-link is-primary" type="button" data-device-open="${esc(app.package)}" data-device-name="${esc(app.name)}">打开</button>`
                  : `<button class="mini-link" type="button" data-device-download="${esc(app.id)}">获取</button>`}
              </article>`;
          }).join('')}
        </div>
        <p class="device-launcher-note">${SVG('shield')}<span>扫描与启动调用原生壳的 <b>listInstalledApps / launchApp</b>，会申请存储权限；普通浏览器无法读取已安装列表，可点「获取」前往官方下载页。只展示本 APP 收录的启动器与 Minecraft 客户端。</span></p>
      </section>`;
  }

  async function scanDeviceApps() {
    if (state.deviceScanning) return;
    if (!window.WWShell) {
      toast('当前为浏览器环境，无法读取设备已安装应用；请使用带存储权限的原生壳', 'warn', 5200);
      return;
    }
    const fn = window.WWShell.listInstalledApps || window.WWShell.getInstalledApps || window.WWShell.listApps;
    if (typeof fn !== 'function') {
      toast('当前原生壳未提供 listInstalledApps，请更新壳或使用下载入口', 'warn', 5200);
      return;
    }
    state.deviceScanning = true;
    refreshMine(true);
    try {
      await requestStoragePermission();
      const list = await fn();
      state.deviceApps = Array.isArray(list) ? list : [];
      const count = deviceInstalledSet().size;
      toast(`扫描完成：发现 ${count} 个已安装的启动器 / 游戏`, 'success', 4200);
      sfx('success');
    } catch (err) {
      toast('扫描设备失败：' + ((err && err.message) || '请检查存储权限'), 'error', 4600);
    } finally {
      state.deviceScanning = false;
      refreshMine(true);
    }
  }

  async function launchDeviceApp(packageName, name) {
    if (!packageName) return;
    if (!window.WWShell) { toast('请在原生壳中使用启动功能', 'warn'); return; }
    const fn = window.WWShell.launchApp || window.WWShell.openApp || window.WWShell.startApp;
    if (typeof fn !== 'function') {
      toast('当前原生壳未提供 launchApp，无法直接启动', 'warn', 4200);
      return;
    }
    try {
      await requestStoragePermission();
      const ok = await fn(packageName);
      if (ok === false) toast('启动失败，可能未安装或包名不匹配', 'error', 4200);
      else toast(`正在打开 ${name || packageName}…`, 'success', 2400);
    } catch (err) {
      toast('启动失败：' + ((err && err.message) || packageName), 'error', 4200);
    }
  }

  function openDeviceDownload(id) {
    const app = deviceLauncherApps().find((a) => a.id === id);
    if (!app) return;
    openBrowserLink(app.download || app.link, true);
    sfx('open');
  }

  let extractRun = null;
  let extractTab = 'armory';

  function extractData() {
    const e = currentEconomy();
    if (!e) return null;
    if (!e.extract || typeof e.extract !== 'object') e.extract = { capacity: 10, equipment: {}, stash: {}, books: 0, runs: 0, escaped: 0 };
    if (!e.extract.equipment) e.extract.equipment = {};
    if (!e.extract.stash) e.extract.stash = {};
    return e.extract;
  }

  function gearById(id) {
    return EXTRACT_GEAR.find((item) => item.id === id) || null;
  }

  function extractPower() {
    const data = extractData();
    if (!data) return 0;
    let power = 5;
    Object.values(data.equipment).forEach((gear) => {
      const base = gearById(gear.id);
      if (base) power += base.power + (Number(gear.ench) || 0) * 3;
    });
    return power;
  }

  function extractionEntryHTML() {
    if (!state.session) {
      return `<section class="extract-entry is-locked"><span class="extract-entry-ico">${SVG('globe')}</span><div class="extract-entry-main"><span class="kicker"><span class="kicker-block"></span>EXTRACT · 搜打撤</span><b>方块撤离</b><small>登录后开启三张随机地图，搜物资、打怪、撤离</small></div><button class="btn btn-soft btn-sm" type="button" data-action="login">登录</button></section>`;
    }
    const data = extractData();
    return `
      <section class="extract-entry">
        <span class="extract-entry-ico">${SVG('globe')}</span>
        <div class="extract-entry-main">
          <span class="kicker"><span class="kicker-block"></span>EXTRACT · 搜打撤</span>
          <b>方块撤离</b>
          <small>战力 ${extractPower()} · 背包 ${data.capacity} 格 · 已撤离 ${data.escaped || 0} 次</small>
        </div>
        <button class="btn btn-primary btn-sm" type="button" data-action="open-extraction">进入</button>
      </section>`;
  }

  function extractGearCardHTML(item, mode = 'shop') {
    if (!item) return '';
    const data = extractData();
    return `
      <article class="extract-card">
        <span class="extract-card-ico" style="color:${item.color}">${SVG(item.icon || 'box')}</span>
        <div class="extract-card-main"><b>${esc(item.name)}</b><small>${esc(item.slotName)} · 战力 +${item.power}</small></div>
        ${mode === 'shop'
          ? `<button class="mini-act is-buy" type="button" data-extract-buy="${item.id}">${Math.round(item.price * 1.35)} 金锭</button>`
          : `<span class="extract-card-acts"><button class="mini-act is-buy" type="button" data-extract-equip="${item.id}">装备</button><button class="mini-act" type="button" data-extract-sell="${item.id}">出售</button></span>`}
      </article>`;
  }

  function extractArmoryHTML() {
    const data = extractData();
    const slots = [
      ['helmet', '头盔'], ['chest', '胸甲'], ['legs', '护腿'], ['boots', '靴子'],
      ['sword', '剑'], ['bow', '弓'], ['axe', '斧头'], ['totem', '图腾']
    ];
    const equipped = slots.map(([slot, label]) => {
      const gear = data.equipment[slot];
      const item = gear ? gearById(gear.id) : null;
      return item
        ? `<div class="equip-slot"><span class="equip-slot-ico" style="color:${item.color}">${SVG(item.icon)}</span><div><b>${esc(item.name)} +${gear.ench || 0}</b><small>${label} · ${item.power + (gear.ench || 0) * 3} 战力</small></div><span class="equip-slot-acts"><button class="mini-act" type="button" data-extract-enchant="${slot}">附魔</button><button class="mini-act is-danger" type="button" data-extract-unequip="${slot}">卸下</button></span></div>`
        : `<div class="equip-slot is-empty"><span class="equip-slot-ico">${SVG('shield')}</span><div><b>${label}</b><small>未装备</small></div></div>`;
    }).join('');
    const stash = Object.keys(data.stash).filter((id) => gearById(id) && data.stash[id] > 0);
    const stashRows = stash.map((id) => extractGearCardHTML(gearById(id), 'stash')).join('');
    const materials = Object.keys(data.stash).filter((id) => !gearById(id) && data.stash[id] > 0).slice(0, 40);
    const materialRows = materials.map((id) => {
      const block = PIXEL_BLOCKS.find((item) => item.block === id);
      const count = data.stash[id];
      return `<div class="extract-card"><span class="extract-card-ico">${SVG('box')}</span><div class="extract-card-main"><b>${esc(block ? block.name : id)} ×${count}</b><small>物资 · 出售单价 20 金锭</small></div><button class="mini-act" type="button" data-extract-sell="${esc(id)}">出售</button></div>`;
    }).join('');
    return `
      <div class="extract-hud"><span>战力 <b>${extractPower()}</b></span><span>容量 <b>${data.capacity}/50</b></span><span>附魔书 <b>${data.books || 0}</b></span><span>撤离 <b>${data.escaped || 0}</b></span></div>
      <div class="equip-grid">${equipped}</div>
      <h4 class="extract-subtitle">仓库装备 <span>${stash.length} 种</span></h4>
      <div class="extract-card-list">${stashRows || '<p class="shop-empty">仓库没有装备。去地图搜箱子，或在商店购买。</p>'}</div>
      <h4 class="extract-subtitle">物资仓库 <span>搜到的方块物品</span></h4>
      <div class="extract-card-list">${materialRows || '<p class="shop-empty">还没有搜到方块物资。</p>'}</div>
      <p class="download-note">附魔消耗 100 EXP + 1 本附魔书，最高 +10；附魔等级到 10 后不能继续。</p>`;
  }

  function extractShopHTML() {
    const data = extractData();
    const gear = EXTRACT_GEAR;
    return `
      <div class="extract-hud"><span>金锭 <b>${currentEconomy().gold}</b></span><span>容量 <b>${data.capacity}/50</b></span><span>附魔书 <b>${data.books || 0}</b></span></div>
      <div class="extract-shop-row"><div><b>扩充背包</b><small>每次 +5 格，最多 50 格</small></div><button class="btn btn-primary btn-sm" type="button" data-extract-capacity ${data.capacity >= 50 ? 'disabled' : ''}>${data.capacity >= 50 ? '已满级' : `${500 + data.capacity * 100} 金锭`}</button></div>
      <div class="extract-shop-row"><div><b>附魔书</b><small>附魔时消耗 1 本</small></div><button class="btn btn-soft btn-sm" type="button" data-extract-book>300 金锭</button></div>
      <h4 class="extract-subtitle">装备商店 <span>买入价 = 基础价 +35%</span></h4>
      <div class="extract-card-list">${gear.map((item) => extractGearCardHTML(item, 'shop')).join('')}</div>
      <p class="download-note">装备买入后进入仓库；同一部位只能装备一件。所有装备都可以附魔。</p>`;
  }

  function extractMapsHTML() {
    return `<div class="extract-map-cards">${Object.entries(EXTRACT_MAPS).map(([id, map]) => `
      <article class="extract-map-card" style="--map-color:${map.color}">
        <span class="extract-map-ico">${SVG(id === 'hard' ? 'sparkle' : id === 'advanced' ? 'shield' : 'globe')}</span>
        <b>${map.name}</b><small>${map.desc}</small>
        <em>战力 ≥ ${map.power} · BOSS ${Math.round(map.boss * 100)}% · 小BOSS ${Math.round(map.mini * 100)}%</em>
        <button class="btn btn-primary btn-sm" type="button" data-extract-start="${id}" ${extractPower() < map.power ? 'disabled' : ''}>${extractPower() < map.power ? '战力不足' : '进入地图'}</button>
      </article>`).join('')}</div>
      <p class="download-note">每张地图每次进入都会重新生成地形、箱子、岩浆、刷怪笼与怪物；走到撤离点即可带走全部战利品。</p>`;
  }

  function extractRunHTML() {
    if (!extractRun) return '';
    const run = extractRun;
    const exitHere = run.grid[run.pos.y][run.pos.x].type === 'exit';
    const rows = run.grid.map((row, y) => row.map((tile, x) => {
      const player = run.pos.x === x && run.pos.y === y;
      const glyph = tile.type === 'wall' ? '' : tile.type === 'lava' ? '' : tile.type === 'chest' ? '▣' : tile.type === 'spawner' ? '✦' : tile.type === 'exit' ? '⇱' : tile.type === 'mob' ? '☠' : '';
      return `<span class="extract-tile is-${tile.type} ${player ? 'is-player' : ''}" title="${tile.type}">${player ? '◆' : glyph}</span>`;
    }).join('')).join('');
    return `
      <div class="extract-run-hud"><span>${EXTRACT_MAPS[run.type].name}</span><span>生命 <b>${run.hp}/${run.maxHp}</b></span><span>战力 <b>${extractPower()}</b></span><span>战利品 <b>${run.loot.length}/${extractData().capacity}</b></span></div>
      <div class="extract-board">${rows}</div>
      <div class="extract-controls">
        <button type="button" data-extract-move="0,-1">↑</button>
        <button type="button" data-extract-move="-1,0">←</button>
        <button type="button" data-extract-move="0,1">↓</button>
        <button type="button" data-extract-move="1,0">→</button>
        ${exitHere ? '<button class="is-exit" type="button" data-extract-finish="1">撤离</button>' : ''}
      </div>
      <div class="extract-loot">${run.loot.map((loot) => `<span>${esc(loot.name)}</span>`).join('') || '还没有搜到战利品'}</div>
      ${run.encounter ? renderExtractEncounter() : ''}
      <p class="download-note">◆ 是你，☠ 是怪物，▣ 是箱子，✦ 是刷怪笼，⇱ 是撤离点。岩浆会扣血。</p>`;
  }

  function renderExtractEncounter() {
    const enc = extractRun && extractRun.encounter;
    if (!enc) return '';
    return `<div class="extract-encounter"><div><b>${esc(enc.name)}</b><small>战力 ${enc.power}${enc.boss ? ' · BOSS' : enc.mini ? ' · 小BOSS' : ''}</small></div><span class="extract-encounter-actions"><button class="btn btn-primary btn-sm" type="button" data-extract-fight>战斗</button><button class="btn btn-ghost btn-sm" type="button" data-extract-flee>逃跑</button></span></div>`;
  }

  function renderExtractionSheet() {
    if (!state.session) { openLogin(); return; }
    const content = extractTab === 'run' ? extractRunHTML()
      : extractTab === 'shop' ? extractShopHTML()
        : extractTab === 'maps' ? extractMapsHTML()
          : extractArmoryHTML();
    openSheet(`
      ${extractTab !== 'run' ? `<div class="extract-tabs">
        <button class="extract-tab ${extractTab === 'armory' ? 'is-active' : ''}" type="button" data-extract-tab="armory">仓库</button>
        <button class="extract-tab ${extractTab === 'shop' ? 'is-active' : ''}" type="button" data-extract-tab="shop">商店</button>
        <button class="extract-tab ${extractTab === 'maps' ? 'is-active' : ''}" type="button" data-extract-tab="maps">地图</button>
      </div>` : ''}
      ${content}
    `, { title: extractTab === 'run' ? '搜打撤 · 行动中' : '搜打撤', sub: extractTab === 'run' ? '搜物资 / 打怪 / 撤离' : '装备、背包、地图与撤离' });
  }

  function openExtractionSheet(tab = 'armory') {
    if (!state.session) { toast('请先登录账号', 'warn'); openLogin(); return; }
    extractTab = extractRun && tab === 'armory' ? 'run' : tab;
    if (extractTab === 'run' && !extractRun) extractTab = 'maps';
    renderExtractionSheet();
  }

  function randomLoot(type = 'normal') {
    const pool = PIXEL_BLOCKS.filter((block) => block && block.name);
    const block = pool[randomInt(0, Math.min(pool.length - 1, 260))];
    const gearChance = Math.random();
    const gearRate = type === 'hard' ? 0.48 : type === 'advanced' ? 0.3 : 0.16;
    if (gearChance < gearRate) {
      const gear = EXTRACT_GEAR[randomInt(0, EXTRACT_GEAR.length - 1)];
      return { kind: 'gear', id: gear.id, name: gear.name, gear: true };
    }
    if (gearChance < gearRate + 0.08) return { kind: 'book', id: 'enchant-book', name: '附魔书', book: true };
    return { kind: 'block', id: block ? block.block : 'minecraft:stone', name: block ? block.name : '石头' };
  }

  function addRunLoot(item) {
    if (!extractRun) return;
    const cap = extractData().capacity;
    if (extractRun.loot.length >= cap) { toast('背包已满，无法再拾取', 'warn'); return; }
    extractRun.loot.push(item);
    toast(`搜到「${item.name}」`, 'success');
  }

  function buildExtractMap(type) {
    const map = EXTRACT_MAPS[type] || EXTRACT_MAPS.normal;
    const size = 9;
    const grid = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        let tile = { type: 'floor' };
        if (x === 0 && y === 0) tile = { type: 'floor' };
        else if (x === 8 && y === 8) tile = { type: 'exit' };
        else if (Math.random() < 0.2) tile = { type: 'wall' };
        else if (Math.random() < 0.08) tile = { type: 'lava' };
        else if (Math.random() < 0.11) tile = { type: 'chest' };
        else if (Math.random() < 0.07) tile = { type: 'spawner' };
        row.push(tile);
      }
      grid.push(row);
    }
    const spots = [];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (grid[y][x].type === 'floor' && !(x === 0 && y === 0) && !(x === 8 && y === 8)) spots.push([x, y]);
    const shuffled = shuffleArray(spots);
    const bossRoll = Math.random();
    let placedBoss = false;
    shuffled.forEach(([x, y], index) => {
      if (index > 15) return;
      let kind = null;
      if (!placedBoss && bossRoll < map.boss && index === 0) { kind = 'boss'; placedBoss = true; }
      else if (Math.random() < map.mini * 0.35) kind = 'mini';
      else if (Math.random() < 0.5) kind = 'normal';
      if (kind) grid[y][x] = { type: 'mob', mob: makeMob(kind, map.mult) };
    });
    return grid;
  }

  function makeMob(kind, mult) {
    const normal = [
      { name: '僵尸', power: 10 }, { name: '骷髅', power: 12 }, { name: '蜘蛛', power: 9 },
      { name: '苦力怕', power: 14 }, { name: '末影人', power: 16 }
    ];
    const mini = [
      { name: '凋零骷髅', power: 28 }, { name: '恶魂', power: 25 },
      { name: '大史莱姆', power: 22 }, { name: '大岩浆怪', power: 30 }
    ];
    const boss = [{ name: '监守者', power: 90 }, { name: '凋零', power: 75 }, { name: '末影龙', power: 100 }];
    const pool = kind === 'boss' ? boss : kind === 'mini' ? mini : normal;
    const pick = pool[randomInt(0, pool.length - 1)];
    return { name: pick.name, power: Math.round(pick.power * mult), boss: kind === 'boss', mini: kind === 'mini' };
  }

  function startExtraction(type) {
    const data = extractData();
    if (!data) return;
    const map = EXTRACT_MAPS[type] || EXTRACT_MAPS.normal;
    if (extractPower() < map.power) { toast(`战力不足，需要 ${map.power} 战力`, 'warn', 4200); return; }
    if (!data.capacity) data.capacity = 10;
    extractRun = { type, grid: buildExtractMap(type), pos: { x: 0, y: 0 }, hp: 100, maxHp: 100, loot: [], encounter: null };
    data.runs = (data.runs || 0) + 1;
    saveEconomy();
    extractTab = 'run';
    renderExtractionSheet();
  }

  function extractMove(dx, dy) {
    if (!extractRun) return;
    if (extractRun.encounter) { toast('先处理眼前的怪物', 'warn'); return; }
    const x = extractRun.pos.x + dx;
    const y = extractRun.pos.y + dy;
    if (x < 0 || y < 0 || x > 8 || y > 8) return;
    const tile = extractRun.grid[y][x];
    if (tile.type === 'wall') { toast('前面是墙', 'info'); return; }
    extractRun.pos = { x, y };
    if (tile.type === 'lava') {
      extractRun.hp -= 15;
      tile.type = 'floor';
      toast('踩到岩浆，损失 15 生命', 'warn');
    } else if (tile.type === 'chest') {
      tile.type = 'floor';
      const count = randomInt(1, extractRun.type === 'hard' ? 3 : 2);
      for (let i = 0; i < count; i++) addRunLoot(randomLoot(extractRun.type));
    } else if (tile.type === 'spawner') {
      tile.type = 'floor';
      extractRun.encounter = makeMob('normal', EXTRACT_MAPS[extractRun.type].mult);
      toast('刷怪笼启动！', 'warn');
    } else if (tile.type === 'mob') {
      extractRun.encounter = tile.mob;
      tile.type = 'floor';
    }
    if (extractRun.hp <= 0) return finishExtraction(false);
    renderExtractionSheet();
  }

  function fightExtraction() {
    if (!extractRun || !extractRun.encounter) return;
    const enc = extractRun.encounter;
    const roll = extractPower() + randomInt(0, 12);
    if (roll >= enc.power) {
      toast(`击败「${enc.name}」`, 'success');
      if (enc.boss) { addRunLoot(randomLoot(extractRun.type)); addRunLoot(randomLoot(extractRun.type)); }
      if (enc.mini || enc.boss) addRunLoot(randomLoot(extractRun.type));
      extractRun.encounter = null;
    } else {
      const damage = Math.max(8, Math.round(enc.power * 0.35));
      extractRun.hp -= damage;
      toast(`受到 ${damage} 伤害`, 'warn');
      if (extractRun.hp <= 0) return finishExtraction(false);
    }
    renderExtractionSheet();
  }

  function fleeExtraction() {
    if (!extractRun || !extractRun.encounter) return;
    extractRun.hp -= 12;
    extractRun.encounter = null;
    if (extractRun.hp <= 0) return finishExtraction(false);
    renderExtractionSheet();
  }

  function finishExtraction(success) {
    if (!extractRun) return;
    const data = extractData();
    const run = extractRun;
    if (success) {
      run.loot.forEach((loot) => {
        if (loot.gear) data.stash[loot.id] = (data.stash[loot.id] || 0) + 1;
        else if (loot.book) data.books = (data.books || 0) + 1;
        else data.stash[loot.id] = (data.stash[loot.id] || 0) + 1;
      });
      data.escaped = (data.escaped || 0) + 1;
      toast(`撤离成功，带走 ${run.loot.length} 件战利品`, 'success', 4600);
    } else {
      if (run.type === 'advanced') {
        const slots = Object.keys(data.equipment);
        if (slots.length && Math.random() < 0.5) {
          const slot = slots[randomInt(0, slots.length - 1)];
          delete data.equipment[slot];
          toast('进阶地图阵亡：随机掉落一件装备', 'error', 4600);
        } else toast('进阶地图阵亡：背包战利品丢失', 'error', 4600);
      } else if (run.type === 'hard') {
        data.equipment = {};
        toast('困难地图阵亡：装备与背包物品全部掉落', 'error', 4600);
      } else {
        toast('普通地图阵亡：背包战利品丢失，装备保留', 'error', 4600);
      }
    }
    saveEconomy();
    extractRun = null;
    extractTab = 'armory';
    refreshMine(true);
    renderExtractionSheet();
  }

  function enchantExtractSlot(slot) {
    const data = extractData();
    const gear = data.equipment[slot];
    if (!gear) { toast('这个部位没有装备', 'warn'); return; }
    if ((gear.ench || 0) >= 10) { toast('附魔等级已到 10，无法继续附魔', 'warn'); return; }
    if ((data.books || 0) <= 0) { toast('需要 1 本附魔书', 'warn'); return; }
    if (xpForUid(state.session.uid) < 100) { toast('需要 100 EXP', 'warn'); return; }
    data.books -= 1;
    gear.ench = (gear.ench || 0) + 1;
    setXpForUid(state.session.uid, xpForUid(state.session.uid) - 100);
    saveEconomy();
    renderExtractionSheet();
    toast(`附魔成功：+${gear.ench}`, 'success');
  }

  function equipExtractGear(id) {
    const data = extractData();
    if (!data.stash[id] || data.stash[id] <= 0) return;
    const item = gearById(id);
    if (!item) return;
    if (data.equipment[item.slot]) {
      const old = data.equipment[item.slot];
      data.stash[old.id] = (data.stash[old.id] || 0) + 1;
    }
    data.stash[id] -= 1;
    if (data.stash[id] <= 0) delete data.stash[id];
    data.equipment[item.slot] = { id, ench: 0 };
    saveEconomy();
    renderExtractionSheet();
    toast(`已装备「${item.name}」`, 'success');
  }

  function buyExtractGear(id) {
    const item = gearById(id);
    const e = currentEconomy();
    if (!item || !e) return;
    const price = Math.round(item.price * 1.35);
    if (e.gold < price) { toast('金锭不足', 'warn'); return; }
    e.gold -= price;
    const data = extractData();
    data.stash[id] = (data.stash[id] || 0) + 1;
    saveEconomy();
    refreshMine(true);
    renderExtractionSheet();
    toast(`已购买「${item.name}」`, 'success');
  }

  function walletStripHTML() {
    if (!state.session) {
      return `<div class="wallet-strip is-locked">${SVG('key')}<span>登录后开启金锭、钻石、背包与商店</span><button class="mini-link" type="button" data-action="login">登录</button></div>`;
    }
    const e = currentEconomy() || defaultEconomy(state.session.uid);
    return `
      <div class="wallet-strip">
        <span class="wallet-currency is-gold" title="金锭">${SVG('sparkle')}<b>${e.gold}</b><small>金锭</small></span>
        <span class="wallet-currency is-diamond" title="钻石">${SVG('box')}<b>${e.diamonds}</b><small>钻石</small></span>
        <button class="mini-link" type="button" data-action="open-shop">${SVG('sparkle')}商店</button>
        <button class="mini-link" type="button" data-action="open-bag">${SVG('box')}背包</button>
      </div>`;
  }

  function economyEntriesHTML() {
    if (!state.session) {
      return `<section class="economy-entry-grid is-locked">
        <button type="button" class="economy-entry" data-action="login">${SVG('box')}<b>背包</b><small>登录后可用</small></button>
        <button type="button" class="economy-entry" data-action="login">${SVG('sparkle')}<b>商店</b><small>登录后可用</small></button>
      </section>`;
    }
    const e = currentEconomy() || defaultEconomy(state.session.uid);
    const bagCount = Object.values(e.inventory || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);
    return `
      <section class="economy-entry-grid">
        <button type="button" class="economy-entry" data-action="open-bag">
          <span class="economy-entry-ico is-gold">${SVG('box')}</span><span class="economy-entry-main"><b>背包</b><small>${bagCount} 件物品 · 金锭 ${e.gold} · 钻石 ${e.diamonds}</small></span>
        </button>
        <button type="button" class="economy-entry" data-action="open-shop">
          <span class="economy-entry-ico is-green">${SVG('sparkle')}</span><span class="economy-entry-main"><b>商店</b><small>头像框 / 主题 / 称号 / 权限卡</small></span>
        </button>
      </section>`;
  }

  function renderMine() {
    const host = $('#minePage');
    if (!host) return;
    if (state.session) ensureDaily();
    if (state.session) syncCheckinHistory();
    const s = state.session;
    const profile = s ? `
      <section class="profile-card" aria-label="我的账号">
        <div class="profile-top">
          <span class="profile-status is-online"><i></i>ONLINE · ${esc(METHOD_EN[s.method] || 'PLAYER')}</span>
          <span class="badge badge-soft">${esc(methodLabel(s.method))}</span>
        </div>
        ${walletStripHTML()}
        <div class="profile-main">
          <div class="profile-info">
            <span class="hi">WELCOME BACK · 欢迎回来</span>
            <div class="profile-id">
              <span title="${esc(displayName())}">${profileNameHTML()}</span>
              <button class="copy-inline" type="button" data-copy="${esc(displayName())}" aria-label="复制账号名字">${SVG('copy')}</button>
            </div>
            ${profileTitle() ? `<span class="player-title">${SVG('sparkle')}${esc(profileTitle())}</span>` : ''}
            <div class="profile-meta">
              <span class="tag-mini">UID ${esc(s.uid)}</span>
              <span class="profile-uid">${s.loginAt ? '加入于 ' + new Date(s.loginAt).toLocaleDateString('zh-CN') : '世界旅人'}</span>
            </div>
          </div>
          <div class="skin-stage ${profileFrameClass()}" title="当前皮肤">
            <canvas data-skin-body="${s.skinId}" width="16" height="32"></canvas>
            <div class="skin-floor"></div>
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn btn-soft btn-sm" type="button" data-action="switch-account">${SVG('user')}切换账号</button>
          <button class="btn btn-ghost btn-sm" type="button" data-action="open-name-change">${SVG('key')}改名</button>
          <button class="btn btn-ghost btn-sm" type="button" data-action="logout">${SVG('logout')}退出登录</button>
        </div>
        <p class="profile-account-note">${s.method === 'offline' ? '当前为账号密码登录，可在「切换账号」中使用微软 / Xbox 官方登录。' : '当前为官方账号登录，可随时切换其他账号。'}</p>
      </section>
      <div class="my-skin-card">
        <span class="my-skin-head"><canvas data-skin-head="${s.skinId}" width="8" height="8"></canvas></span>
        <span class="my-skin-info"><b>${esc(skinById(s.skinId).name)}</b><span>${esc(skinById(s.skinId).tag)}皮肤 · 可在本地更换</span></span>
        <button class="btn btn-ghost btn-sm" type="button" data-action="change-skin">更换皮肤</button>
      </div>` : `
      <section class="profile-card profile-guest" aria-label="未登录账号">
        <div class="profile-top">
          <span class="profile-status"><i></i>GUEST · 未登录</span>
          <span class="badge badge-soft">未连接</span>
        </div>
        ${walletStripHTML()}
        <div class="profile-main">
          <div class="profile-info">
            <div class="profile-id"><span>还没有登录</span></div>
            <p class="profile-desc">登录后在这里展示账号 ID 与专属皮肤；支持账号密码注册登录、微软官方与 Xbox 官方登录。</p>
          </div>
          <div class="skin-stage">
            <div class="skin-placeholder">${SVG('user')}<span>SKIN</span></div>
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn btn-primary btn-sm" type="button" data-action="login">${SVG('key')}登录</button>
          <button class="btn btn-soft btn-sm" type="button" data-action="register">${SVG('user')}注册</button>
          <button class="btn btn-ghost btn-sm" type="button" data-action="login-offline">${SVG('key')}账号密码</button>
        </div>
      </section>`;

    host.innerHTML = `
      <header class="mine-head">
        ${calendarHTML()}
        <div class="page-head">
          <p class="kicker"><span class="kicker-block"></span>MY WORLD · 04</p>
          <div class="page-head-row">
            <div>
              <h1>我的</h1>
              <p class="page-sub">账号、皮肤与偏好，都收进这一格。</p>
            </div>
          </div>
        </div>
        <div class="mine-head-actions">
          <button class="btn-icon" type="button" data-action="open-settings" aria-label="打开设置">${SVG('settings')}</button>
        </div>
      </header>

      ${profile}

      ${economyEntriesHTML()}

      ${dailyPanelHTML()}

      ${extractionEntryHTML()}

      <button class="settings-entry" type="button" data-action="open-settings" aria-label="打开设置">
        <span class="settings-entry-ico">${SVG('settings')}</span>
        <span class="settings-entry-main"><b>设置</b><small>角色、指令盒、主题、音效与关于软件</small></span>
        <span class="settings-entry-value mono">v${esc(DATA.version)}</span>
        ${SVG('chevron')}
      </button>

      <footer class="mine-foot">
        <div class="mini-brand">${GRASS()}<span>WORLD WEAVE · 世界织卷</span></div>
        <p>一个APP解决你的所有困难 · v${DATA.version}</p>
      </footer>`;

    paintSkins(host);
  }

  function refreshMine(preserveScroll = true) {
    const panel = document.querySelector('[data-panel="mine"]');
    const top = panel ? panel.scrollTop : 0;
    renderMine();
    if (preserveScroll && panel) panel.scrollTop = top;
  }

  /* ---------------- 签到 / 经验 / 每日任务 / 每日答题 ---------------- */
  let quizCurrent = null;

  function localDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function beijingNow() {
    return new Date(Date.now() + (480 + new Date().getTimezoneOffset()) * 60000);
  }

  function beijingDateKey(date = beijingNow()) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function dateKeyShift(key, delta) {
    const parts = String(key).split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + delta));
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }

  function checkinStreak() {
    const e = currentEconomy();
    if (!e) return 0;
    let key = beijingDateKey();
    if (!e.checkins[key]) key = dateKeyShift(key, -1);
    let count = 0;
    while (e.checkins[key] && count < 3660) {
      count += 1;
      key = dateKeyShift(key, -1);
    }
    return count;
  }

  function syncCheckinHistory() {
    if (!state.session) return;
    const e = currentEconomy();
    const daily = ensureDaily();
    if (!e || !daily || !daily.checkin || !daily.checkin.done) return;
    const key = beijingDateKey();
    if (!e.checkins[key]) {
      e.checkins[key] = { exp: daily.checkin.exp || 0, gold: 0, at: Date.now() };
      saveEconomy();
    }
  }

  function calendarHTML() {
    if (!state.session) return '';
    const e = currentEconomy();
    if (!e) return '';
    const now = beijingNow();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const todayKey = beijingDateKey(now);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push('<i class="cal-blank"></i>');
    for (let day = 1; day <= days; day++) {
      const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const signed = !!e.checkins[key];
      const future = key > todayKey;
      cells.push(`<i class="cal-day ${signed ? 'is-signed' : future ? 'is-future' : 'is-missed'} ${day === today ? 'is-today' : ''}" title="${key}${signed ? ' 已签到' : future ? '' : ' 未签到'}">${day}${signed ? '<span>✓</span>' : ''}</i>`);
    }
    return `
      <section class="mine-calendar" aria-label="签到日历">
        <div class="cal-head"><b>${year} 年 ${month + 1} 月</b><span>连续签到 <strong>${checkinStreak()}</strong> 天</span></div>
        <div class="cal-week">${['日','一','二','三','四','五','六'].map((d) => `<span>${d}</span>`).join('')}</div>
        <div class="cal-grid">${cells.join('')}</div>
      </section>`;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function dailyStoreKey() {
    return state.session ? KEY_DAILY + '.' + state.session.uid : '';
  }

  function loadDailyState() {
    if (!state.session) { state.daily = null; return null; }
    const today = localDateKey();
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(dailyStoreKey()) || 'null'); } catch { raw = null; }
    const data = raw && typeof raw === 'object' ? raw : {};
    const daily = {
      date: today,
      xp: Math.max(0, Math.min(1000000, Number(data.xp) || 0)),
      checkin: data.checkin && data.checkin.date === today ? data.checkin : { date: today, done: false, exp: 0 },
      tasks: data.tasks && data.tasks.date === today && Array.isArray(data.tasks.items) ? data.tasks : { date: today, items: createDailyTasks() },
      quiz: data.quiz && data.quiz.date === today ? data.quiz : { date: today, done: false, score: 0, exp: 0, answers: [] }
    };
    if (!daily.tasks.items.length) daily.tasks = { date: today, items: createDailyTasks() };
    state.daily = daily;
    saveDailyState();
    return daily;
  }

  function saveDailyState() {
    if (!state.session || !state.daily) return;
    try { localStorage.setItem(dailyStoreKey(), JSON.stringify(state.daily)); } catch { /* ignore */ }
  }

  function ensureDaily() {
    if (!state.session) return null;
    if (!state.daily || state.daily.date !== localDateKey()) loadDailyState();
    return state.daily;
  }

  function createDailyTasks() {
    const pick = (pool, count) => shuffleArray(pool || []).slice(0, count);
    const chosen = [
      ...pick(GAME.taskPool.easy, 2).map((t) => Object.assign({ difficulty: '简单' }, t)),
      ...pick(GAME.taskPool.normal, 1).map((t) => Object.assign({ difficulty: '普通' }, t)),
      ...pick(GAME.taskPool.hard, 1).map((t) => Object.assign({ difficulty: '困难' }, t))
    ];
    const ranges = { '简单': [1, 6], '普通': [7, 13], '困难': [14, 20] };
    return chosen.map((t) => {
      const range = ranges[t.difficulty] || [1, 20];
      return {
        id: t.id, title: t.title, desc: t.desc, action: t.action, target: t.target || 1,
        difficulty: t.difficulty, reward: randomInt(range[0], range[1]), progress: 0, claimed: false
      };
    });
  }

  function refreshDailyTasks() {
    const daily = ensureDaily();
    if (!daily) { toast('请先登录', 'warn'); return; }
    if (daily.tasks.refreshed) { toast('今天已经刷新过一次了，明天再来吧', 'info'); return; }
    const claimed = daily.tasks.items.filter((t) => t.claimed);
    if (claimed.length >= 4) { toast('4 个任务都已经领取，不需要刷新', 'info'); return; }
    const fresh = createDailyTasks().filter((t) => !claimed.some((c) => c.id === t.id));
    daily.tasks = {
      date: localDateKey(),
      refreshed: true,
      goldAwarded: daily.tasks.goldAwarded || 0,
      items: claimed.concat(fresh.slice(0, 4 - claimed.length))
    };
    saveDailyState();
    openDailyTasksSheet();
    toast('任务已刷新，今日刷新次数已用完', 'success', 3600);
    sfx('success');
  }

  const MAX_LEVEL = 100;
  const LEVEL_STEP = 25;
  const LEVEL_CHEERS = [
    '第一格方块已经点亮，继续往前走吧！',
    '你比昨天更熟悉这个世界了。',
    '每一次点击，都在给世界添一块砖。',
    '指令、像素画、种子，都已经在你手里。',
    '这一级拿得很稳，下一级也不会太远。',
    '你的世界正在一点点变大。',
    '能把工具用起来，本身就是一种实力。',
    '别急，方块是一格一格搭起来的。',
    '今天的努力，会在某个存档里发光。',
    '你已经超过了昨天的自己。',
    '工具箱又多了一层熟练度。',
    '保持这个节奏，世界会回应你。',
    '每一次签到和答题，都算数。',
    '你正在成为更熟练的世界织卷者。',
    '这一级，值得给自己放一首红石音乐。',
    '路还长，但你已经在路上了。',
    '把复杂的事拆成方块，就没那么难了。',
    '继续探索，下一处群系会有惊喜。',
    '你的坚持，正在变成看得见的等级。',
    '世界织卷因为你，多了一点光。',
    '升级不是终点，是新地图的入口。',
    '很好，又解锁了一段新的旅程。',
    '稳住，我们能赢下这一级。',
    '你已经比大多数冒险者更耐心了。',
    '这一级，送给还在坚持的你。'
  ];

  function xpNeedForLevel(level) {
    // 1 级需要 100 EXP，之后每级递增 25 EXP
    return 100 + (Math.max(1, level) - 1) * LEVEL_STEP;
  }

  const XP_TOTALS = (() => {
    const totals = [0];
    for (let level = 1; level <= MAX_LEVEL; level++) totals[level] = totals[level - 1] + xpNeedForLevel(level);
    return totals;
  })();
  const MAX_XP = XP_TOTALS[MAX_LEVEL];

  function levelInfo() {
    let xp = state.daily ? Number(state.daily.xp) || 0 : 0;
    xp = Math.max(0, Math.min(MAX_XP, xp));
    let level = 0;
    while (level < MAX_LEVEL && xp >= XP_TOTALS[level + 1]) level += 1;
    const base = XP_TOTALS[level];
    const need = level >= MAX_LEVEL ? 0 : xpNeedForLevel(level + 1);
    const into = level >= MAX_LEVEL ? 0 : xp - base;
    return {
      xp,
      level,
      max: level >= MAX_LEVEL,
      maxXp: MAX_XP,
      need,
      into,
      progress: level >= MAX_LEVEL ? 100 : Math.min(100, Math.round((into / need) * 100)),
      next: level >= MAX_LEVEL ? 0 : Math.max(0, need - into)
    };
  }

  function addExp(amount, reason) {
    const daily = ensureDaily();
    if (!daily || !amount) return;
    const before = levelInfo().level;
    daily.xp = Math.max(0, Math.min(MAX_XP, (Number(daily.xp) || 0) + amount));
    saveDailyState();
    const after = levelInfo().level;
    refreshMine(true);
    if (after > before) {
      const cheer = LEVEL_CHEERS[(Math.max(1, after) - 1) % LEVEL_CHEERS.length];
      toast(`LV.${after} 达成！${cheer}`, 'success', 5200);
      sfx('success');
    } else if (reason) {
      toast(`${reason} +${amount} EXP`, 'success', 2600);
    }
  }

  function trackTask(action) {
    if (!state.session) return;
    const daily = ensureDaily();
    if (!daily) return;
    let changed = false;
    daily.tasks.items.forEach((task) => {
      if (task.claimed || task.action !== action || task.progress >= task.target) return;
      task.progress = Math.min(task.target, task.progress + 1);
      changed = true;
      if (task.progress >= task.target) toast(`任务完成：${task.title}`, 'success', 2800);
    });
    if (changed) {
      saveDailyState();
      maybeAwardTaskGold();
      if (state.session) refreshMine(true);
    }
  }

  function maybeAwardTaskGold() {
    if (!state.session) return;
    const daily = ensureDaily();
    if (!daily || !daily.tasks || daily.tasks.items.length !== 4) return;
    if (daily.tasks.goldAwarded) return;
    if (!daily.tasks.items.every((task) => task.progress >= task.target)) return;
    const amount = randomInt(100, 200);
    daily.tasks.goldAwarded = amount;
    saveDailyState();
    addGold(amount, '每日任务全部完成');
    sfx('success');
  }

  function claimTask(id) {
    const daily = ensureDaily();
    if (!daily) { toast('请先登录', 'warn'); return; }
    const task = daily.tasks.items.find((t) => t.id === id);
    if (!task) return;
    if (task.progress < task.target) { toast('任务还没有完成', 'warn'); return; }
    if (task.claimed) { toast('这个任务已经领取过了', 'info'); return; }
    task.claimed = true;
    saveDailyState();
    addExp(task.reward, `任务「${task.title}」奖励`);
    maybeAwardTaskGold();
    openDailyTasksSheet();
    sfx('success');
  }

  function checkIn() {
    if (!state.session) { toast('请先登录账号', 'warn'); openLogin(); return; }
    const daily = ensureDaily();
    if (!daily) return;
    if (daily.checkin.done) { toast('今天已经签到过了，明天再来吧', 'info'); return; }
    const exp = randomInt(1, 20);
    const gold = randomInt(10, 50);
    const key = beijingDateKey();
    daily.checkin = { date: key, done: true, exp, gold };
    saveDailyState();
    const e = currentEconomy();
    if (e) {
      e.checkins[key] = { exp, gold, at: Date.now() };
      saveEconomy();
    }
    addExp(exp);
    addGold(gold, '', state.session.uid);
    refreshMine(true);
    toast(`签到成功：+${exp} EXP · +${gold} 金锭 · 连续 ${checkinStreak()} 天`, 'success', 4600);
    sfx('success');
  }

  function dailyPanelHTML() {
    const info = levelInfo();
    const daily = state.daily;
    const logged = !!state.session;
    const checked = logged && daily && daily.checkin && daily.checkin.done;
    const taskDone = logged && daily ? daily.tasks.items.filter((t) => t.progress >= t.target).length : 0;
    const quizDone = logged && daily && daily.quiz && daily.quiz.done;
    const disabled = logged ? '' : ' disabled';
    return `
      <section class="daily-panel" aria-label="每日中心">
        <div class="daily-head">
          <div>
            <span class="kicker"><span class="kicker-block"></span>DAILY · 每日中心</span>
            <h2>LV.${info.level}${info.max ? ' <span class="daily-max">MAX</span>' : ''}</h2>
          </div>
          <span class="daily-xp mono">${info.xp} / ${info.maxXp} EXP</span>
        </div>
        <div class="daily-progress" role="progressbar" aria-label="等级经验" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${info.progress}">
          <i style="width:${info.progress}%"></i>
        </div>
        <p class="daily-next">${info.max ? '已达到最高等级 LV.100' : `再获得 ${info.next} EXP 升到 LV.${info.level + 1} · 本级 ${info.into} / ${info.need}`} · 升级所需经验逐级递增</p>
        <div class="daily-actions">
          <button class="daily-btn ${checked ? 'is-done' : ''}" type="button" data-action="checkin" ${checked ? 'disabled' : disabled}>
            <span class="daily-btn-ico">${SVG('check')}</span>
            <b>${checked ? '已签到' : '签到'}</b>
            <small>${checked ? `+${daily.checkin.exp} EXP · +${daily.checkin.gold || 0} 金锭` : logged ? '1–20 EXP · 10–50 金锭' : '登录后开启'}</small>
          </button>
          <button class="daily-btn" type="button" data-action="daily-tasks"${disabled}>
            <span class="daily-btn-ico">${SVG('sparkle')}</span>
            <b>每日任务</b>
            <small>${logged ? `${taskDone} / 4 已完成` : '登录后开启'}</small>
          </button>
          <button class="daily-btn" type="button" data-action="friends"${disabled}>
            <span class="daily-btn-ico">${SVG('user')}</span>
            <b>好友</b>
            <small>${logged ? '添加 / 聊天' : '登录后开启'}</small>
          </button>
        </div>
        <p class="daily-note">${logged ? '签到、每日任务与好友系统已开启；任务每天刷新，做不了可刷新一次。' : '登录后开启签到、每日任务与好友系统；未登录时不能运行。'}</p>
      </section>
      ${quizEntryHTML()}`;
  }

  function quizEntryHTML() {
    const logged = !!state.session;
    const daily = state.daily;
    const quizDone = logged && daily && daily.quiz && daily.quiz.done;
    return `
      <section class="quiz-entry-card" aria-label="每日答题">
        <span class="quiz-entry-ico">${SVG('info')}</span>
        <div class="quiz-entry-main">
          <span class="kicker"><span class="kicker-block"></span>DAILY QUIZ · 每日答题</span>
          <b>MC 知识挑战</b>
          <small>${quizDone ? `今日已答 · ${daily.quiz.score} / 10 · +${daily.quiz.exp} EXP · +${daily.quiz.gold || 0} 金锭` : '满分 250 金锭 · 错 1 题 200 · 错 2 题 50 · 满分 100 EXP'}</small>
        </div>
        <button class="btn ${quizDone ? 'btn-ghost' : 'btn-primary'} btn-sm" type="button" data-action="daily-quiz" ${logged ? '' : 'disabled'}>${quizDone ? '查看结果' : '开始答题'}</button>
      </section>`;
  }

  function openDailyTasksSheet() {
    const daily = ensureDaily();
    if (!daily) { toast('请先登录账号', 'warn'); openLogin(); return; }
    const info = levelInfo();
    const rows = daily.tasks.items.map((task) => {
      const done = task.progress >= task.target;
      const pct = Math.min(100, Math.round((task.progress / task.target) * 100));
      return `
        <div class="daily-task ${done ? 'is-done' : ''} ${task.claimed ? 'is-claimed' : ''}">
          <span class="task-diff is-${task.difficulty === '简单' ? 'easy' : task.difficulty === '普通' ? 'normal' : 'hard'}">${esc(task.difficulty)}</span>
          <div class="task-main">
            <b>${esc(task.title)}</b>
            <small>${esc(task.desc)}</small>
            <div class="task-bar"><i style="width:${pct}%"></i></div>
          </div>
          <span class="task-reward mono">+${task.reward} EXP</span>
          <button class="btn btn-sm ${task.claimed ? 'btn-ghost' : done ? 'btn-primary' : 'btn-ghost'}" type="button" data-action="claim-task" data-task-id="${esc(task.id)}" ${(!done || task.claimed) ? 'disabled' : ''}>${task.claimed ? '已领取' : done ? '领取' : `${task.progress}/${task.target}`}</button>
        </div>`;
    }).join('');
    const claimedCount = daily.tasks.items.filter((t) => t.claimed).length;
    const canRefresh = !daily.tasks.refreshed && claimedCount < 4;
    openSheet(`
      <div class="daily-sheet-top">
        <span class="mono">LV.${info.level}</span>
        <span>${info.xp} / ${info.maxXp} EXP</span>
      </div>
      <p class="daily-sheet-note">每天 0 点刷新 4 个随机任务：2 个简单、1 个普通、1 个困难。任务奖励 1–20 EXP；4 个任务全部完成额外奖励 100–200 金锭。遇到无法完成的任务，每天可以刷新一次（已领取的任务不会丢失）。</p>
      <div class="daily-task-list">${rows}</div>
      <div class="daily-refresh-row">
        <span>${daily.tasks.refreshed ? '今日刷新次数已用完' : '任务做不了？可刷新一次'}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-action="refresh-tasks" ${canRefresh ? '' : 'disabled'}>${SVG('motion')}${daily.tasks.refreshed ? '已刷新' : '刷新任务'}</button>
      </div>
    `, { title: '每日任务', sub: '完成 4 个随机任务领经验与额外金锭' });
  }

  function quizResultHTML(quiz) {
    const rows = (quiz.questions || []).map((q, index) => {
      const ok = q.selected === q.correctIndex;
      return `
        <div class="quiz-review ${ok ? 'is-ok' : 'is-bad'}">
          <span class="quiz-review-no">${index + 1}</span>
          <div><b>${esc(q.q)}</b><small>你的答案：${esc(q.options[q.selected] || '未作答')}${ok ? '' : ' · 正确答案：' + esc(q.options[q.correctIndex])}</small></div>
          <span class="quiz-review-mark">${SVG(ok ? 'check' : 'close')}</span>
        </div>`;
    }).join('');
    return `
      <div class="quiz-result-head">
        <span class="quiz-result-score">${quiz.score} / 10</span>
        <h3>${quiz.score === 10 ? '全部答对！' : quiz.score >= 9 ? '很接近了！' : '明天再来挑战'}</h3>
        <p>${quiz.exp > 0 ? `获得 ${quiz.exp} EXP` : '本次没有获得经验（错 2 题及以上）'}${quiz.gold > 0 ? ` · +${quiz.gold} 金锭` : ''}</p>
      </div>
      <div class="quiz-review-list">${rows}</div>`;
  }

  function openQuizSheet() {
    if (!state.session) { toast('请先登录账号', 'warn'); openLogin(); return; }
    const daily = ensureDaily();
    if (!daily) return;
    trackTask('quiz-open');
    if (daily.quiz.done) {
      openSheet(quizResultHTML(daily.quiz), { title: '每日答题 · 今日结果', sub: '3 简单 · 3 普通 · 4 困难' });
      return;
    }
    const pools = { 简单: [], 普通: [], 困难: [] };
    GAME.quiz.forEach((q) => { (pools[q.difficulty] || pools.普通).push(q); });
    const pickBy = (level, count) => shuffleArray(pools[level]).slice(0, count);
    const bank = shuffleArray([
      ...pickBy('简单', 3),
      ...pickBy('普通', 3),
      ...pickBy('困难', 4)
    ]);
    quizCurrent = {
      questions: bank.map((item) => {
        const correctIndex = item.a;
        const options = item.o.map((text, idx) => ({ text, correct: idx === correctIndex }));
        return { q: item.q, difficulty: item.difficulty || '普通', options: shuffleArray(options), selected: -1 };
      })
    };
    const questionsHtml = quizCurrent.questions.map((q, qi) => `
      <article class="quiz-card" data-quiz-card="${qi}">
        <div class="quiz-q"><span class="quiz-no mono">${pad2(qi + 1)}</span><b>${esc(q.q)}</b><span class="quiz-diff is-${q.difficulty === '简单' ? 'easy' : q.difficulty === '普通' ? 'normal' : 'hard'}">${esc(q.difficulty)}</span></div>
        <div class="quiz-options">
          ${q.options.map((o, oi) => `<button class="quiz-option" type="button" data-quiz-option="${qi}" data-quiz-opt="${oi}" aria-pressed="false"><span class="quiz-opt-letter">${String.fromCharCode(65 + oi)}</span><span>${esc(o.text)}</span></button>`).join('')}
        </div>
      </article>`).join('');
    openSheet(`
      <p class="daily-sheet-note">10 题 = 3 简单 + 3 普通 + 4 困难。全部答对 +100 EXP；只错 1 题 +50 EXP；错 2 题及以上没有经验。每天只能提交一次。</p>
      <div class="quiz-list" id="quizList">${questionsHtml}</div>
      <button class="btn btn-primary btn-block" type="button" data-action="submit-quiz">提交答案</button>
    `, { title: '每日答题', sub: '3 简单 · 3 普通 · 4 困难' });
  }

  function selectQuizOption(qi, oi) {
    if (!quizCurrent) return;
    const q = quizCurrent.questions[qi];
    if (!q) return;
    q.selected = oi;
    const card = document.querySelector(`[data-quiz-card="${qi}"]`);
    if (card) {
      card.querySelectorAll('[data-quiz-opt]').forEach((btn) => {
        const active = Number(btn.dataset.quizOpt) === oi;
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }
    sfx('tap');
  }

  function submitQuiz() {
    if (!quizCurrent) return;
    const unanswered = quizCurrent.questions.filter((q) => q.selected < 0).length;
    if (unanswered) { toast(`还有 ${unanswered} 题没有作答`, 'warn'); return; }
    const daily = ensureDaily();
    if (!daily) return;
    let score = 0;
    const questions = quizCurrent.questions.map((q) => {
      const correctIndex = q.options.findIndex((o) => o.correct);
      if (q.selected === correctIndex) score += 1;
      return { q: q.q, difficulty: q.difficulty || '普通', options: q.options.map((o) => o.text), selected: q.selected, correctIndex };
    });
    const rules = GAME.quizRules || {};
    const exp = score === 10 ? (rules.perfectExp || 100) : score === 9 ? (rules.oneWrongExp || 50) : 0;
    const gold = score === 10 ? 250 : score === 9 ? 200 : score === 8 ? 50 : 0;
    daily.quiz = { date: localDateKey(), done: true, score, exp, gold, questions };
    saveDailyState();
    if (score === 10) trackTask('quiz-perfect');
    if (exp) addExp(exp, '每日答题');
    if (gold) addGold(gold, '每日答题');
    quizCurrent = null;
    openSheet(quizResultHTML(daily.quiz), { title: '每日答题 · 今日结果', sub: '3 简单 · 3 普通 · 4 困难' });
    sfx(score >= 9 ? 'success' : 'error');
  }

  /* ---------------- 好友 / 聊天 ---------------- */
  function stopChatPoll() {
    if (friendState.timer) {
      clearInterval(friendState.timer);
      friendState.timer = null;
    }
  }

  function startChatPoll() {
    stopChatPoll();
    friendState.timer = setInterval(() => {
      if (friendState.active) loadChat(friendState.active.uid, true);
    }, 3200);
  }

  function friendAvatarHTML(friend) {
    return `<span class="friend-avatar">${esc(String(friend.id || '?').slice(0, 1).toUpperCase())}</span>`;
  }

  function chatMessagesHTML() {
    if (!friendState.messages.length) {
      return '<div class="chat-empty">还没有消息，发一句「你好」打个招呼吧。</div>';
    }
    return friendState.messages.map((m) => {
      const mine = state.session && m.from === state.session.uid;
      const time = new Date(m.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return `<div class="chat-bubble ${mine ? 'is-mine' : 'is-other'}"><span>${esc(m.text)}</span><small>${esc(time)}</small></div>`;
    }).join('');
  }

  function chatPanelHTML() {
    if (!friendState.active) {
      return '<div class="friend-empty">选择左侧好友开始聊天</div>';
    }
    const f = friendState.active;
    return `
      <div class="friend-chat-head">
        ${friendAvatarHTML(f)}
        <div><b>${esc(decoratedName(f.id, f.uid))}</b><small class="mono">${esc(f.uid)} · ${f.premium ? '微软 / Xbox 账号' : '账号密码'}</small></div>
        <button class="mini-link is-danger" type="button" data-action="remove-friend" data-friend-uid="${esc(f.uid)}">删除</button>
      </div>
      <div class="chat-messages" id="chatMessages">${chatMessagesHTML()}</div>
      <div class="chat-compose">
        <input id="chatInput" type="text" maxlength="500" placeholder="输入消息…" aria-label="聊天消息" autocomplete="off">
        <button class="btn btn-primary btn-sm" type="button" data-action="send-chat">发送</button>
      </div>`;
  }

  function friendListHTML() {
    if (!friendState.list.length) {
      return '<div class="friend-empty">还没有好友，输入对方的 UID 或账号 ID 添加。</div>';
    }
    return friendState.list.map((f) => `
      <button class="friend-row ${friendState.active && friendState.active.uid === f.uid ? 'is-active' : ''}" type="button" data-friend-uid="${esc(f.uid)}">
        ${friendAvatarHTML(f)}
        <span class="friend-main"><b>${esc(decoratedName(f.id, f.uid))}</b><small>${esc(f.uid)}</small></span>
        <span class="friend-flag">${f.premium ? '正版' : '账密'}</span>
      </button>`).join('');
  }

  function renderFriendsBody() {
    const host = $('#friendsBody');
    if (!host) return;
    host.innerHTML = `
      <div class="friend-add">
        <input id="friendQuery" type="text" placeholder="输入对方 UID / 账号 ID" aria-label="好友 UID 或账号 ID" autocomplete="off">
        <button class="btn btn-primary btn-sm" type="button" data-action="add-friend">${SVG('user')}添加</button>
      </div>
      <p class="friend-hint">只能添加本应用已注册账号；对方不是本应用用户时无法添加。</p>
      <div class="friend-layout">
        <div class="friend-list">${friendListHTML()}</div>
        <div class="friend-chat" id="friendChat">${chatPanelHTML()}</div>
      </div>`;
    const box = $('#chatMessages');
    if (box) box.scrollTop = box.scrollHeight;
  }

  const KEY_LOCAL_SOCIAL = 'szyj.localSocial.v1';

  function localSocialAll() {
    const data = store.get(KEY_LOCAL_SOCIAL, {});
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  }

  function saveLocalSocial(data) {
    store.set(KEY_LOCAL_SOCIAL, data);
  }

  function localBucket(all, uid) {
    if (!all[uid] || typeof all[uid] !== 'object') all[uid] = { friends: [], messages: {} };
    if (!Array.isArray(all[uid].friends)) all[uid].friends = [];
    if (!all[uid].messages || typeof all[uid].messages !== 'object') all[uid].messages = {};
    return all[uid];
  }

  function localSocialBucket(uid) {
    const all = localSocialAll();
    return { all, bucket: localBucket(all, uid) };
  }

  function localFriendList() {
    if (!state.session || !state.session.local) return [];
    const { bucket } = localSocialBucket(state.session.uid);
    const accounts = localAccounts();
    return bucket.friends.map((uid) => accounts.find((a) => a.uid === uid)).filter(Boolean).map((a) => ({
      uid: a.uid, id: a.name, premium: false, local: true, skinId: a.skinId
    }));
  }

  function localAddFriend(query) {
    const target = localAccounts().find((a) => a.uid === query || a.key === localAccountKey(query));
    if (!target) {
      const err = new Error('对方不是本应用注册账号，无法添加');
      err.code = 'user_not_found';
      throw err;
    }
    if (target.uid === state.session.uid) {
      const err = new Error('不能添加自己为好友');
      err.code = 'self';
      throw err;
    }
    const all = localSocialAll();
    const mine = localBucket(all, state.session.uid);
    const theirs = localBucket(all, target.uid);
    if (!mine.friends.includes(target.uid)) mine.friends.push(target.uid);
    if (!theirs.friends.includes(state.session.uid)) theirs.friends.push(state.session.uid);
    saveLocalSocial(all);
    return { uid: target.uid, id: target.name, premium: false, local: true, skinId: target.skinId };
  }

  function localRemoveFriend(uid) {
    const all = localSocialAll();
    const mine = localBucket(all, state.session.uid);
    const theirs = localBucket(all, uid);
    mine.friends = mine.friends.filter((id) => id !== uid);
    theirs.friends = theirs.friends.filter((id) => id !== state.session.uid);
    saveLocalSocial(all);
  }

  function localLoadMessages(uid) {
    const { bucket } = localSocialBucket(state.session.uid);
    return Array.isArray(bucket.messages[uid]) ? bucket.messages[uid].slice() : [];
  }

  function localSendMessage(uid, text) {
    const all = localSocialAll();
    const mine = localBucket(all, state.session.uid);
    const theirs = localBucket(all, uid);
    const message = {
      id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      from: state.session.uid,
      to: uid,
      text,
      at: Date.now()
    };
    if (!Array.isArray(mine.messages[uid])) mine.messages[uid] = [];
    if (!Array.isArray(theirs.messages[state.session.uid])) theirs.messages[state.session.uid] = [];
    mine.messages[uid].push(message);
    theirs.messages[state.session.uid].push(message);
    saveLocalSocial(all);
    return message;
  }

  async function refreshFriends() {
    if (!state.session) return;
    if (state.session.local) {
      friendState.list = localFriendList();
      if (friendState.active && !friendState.list.some((f) => f.uid === friendState.active.uid)) {
        friendState.active = null;
        friendState.messages = [];
      }
      renderFriendsBody();
      if (friendState.active) loadChat(friendState.active.uid, true);
      return;
    }
    try {
      const data = await WW.api('/api/social/friends', { method: 'GET' });
      friendState.list = data.friends || [];
      if (friendState.active && !friendState.list.some((f) => f.uid === friendState.active.uid)) {
        friendState.active = null;
        friendState.messages = [];
      }
      renderFriendsBody();
      if (friendState.active) loadChat(friendState.active.uid, true);
    } catch (err) {
      toast(apiErrorMessage(err), 'error', 4200);
      renderFriendsBody();
    }
  }

  function openFriendsSheet() {
    if (!state.session) { toast('请先登录账号', 'warn'); openLogin(); return; }
    trackTask('friends-open');
    openSheet('<div class="friend-body" id="friendsBody"><div class="friend-loading">正在加载好友列表…</div></div>', {
      title: '好友',
      sub: '只能添加本应用用户 · 好友之间可聊天'
    });
    refreshFriends();
    startChatPoll();
  }

  async function addFriend() {
    const input = $('#friendQuery');
    const query = input ? input.value.trim() : '';
    if (!query) { toast('请输入对方的 UID 或账号 ID', 'warn'); return; }
    if (state.session.local) {
      try {
        const friend = localAddFriend(query);
        friendState.list = localFriendList();
        friendState.active = friend;
        friendState.messages = [];
        renderFriendsBody();
        loadChat(friend.uid, true);
        toast(`已添加好友 ${friend.id}`, 'success');
        sfx('success');
      } catch (err) {
        toast(err.code === 'user_not_found' ? '对方不是本应用注册账号，无法添加' : err.message, 'error', 4600);
      }
      return;
    }
    try {
      const data = await WW.api('/api/social/friends/add', { body: { query } });
      friendState.list = data.friends || friendState.list;
      friendState.active = data.friend || null;
      friendState.messages = [];
      renderFriendsBody();
      if (friendState.active) loadChat(friendState.active.uid, true);
      toast(`已添加好友 ${data.friend ? data.friend.id : ''}`, 'success');
      sfx('success');
    } catch (err) {
      toast(err.code === 'user_not_found' ? '对方不是本应用用户，无法添加' : apiErrorMessage(err), 'error', 4600);
    }
  }

  async function removeFriend(uid) {
    if (!uid) return;
    if (state.session.local) {
      localRemoveFriend(uid);
      friendState.list = localFriendList();
      if (friendState.active && friendState.active.uid === uid) {
        friendState.active = null;
        friendState.messages = [];
      }
      renderFriendsBody();
      toast('已删除好友', 'success');
      return;
    }
    try {
      await WW.api('/api/social/friends/remove', { body: { uid } });
      friendState.list = friendState.list.filter((f) => f.uid !== uid);
      if (friendState.active && friendState.active.uid === uid) {
        friendState.active = null;
        friendState.messages = [];
      }
      renderFriendsBody();
      toast('已删除好友', 'success');
    } catch (err) { toast(apiErrorMessage(err), 'error', 4200); }
  }

  async function selectFriend(uid) {
    const friend = friendState.list.find((f) => f.uid === uid);
    if (!friend) return;
    friendState.active = friend;
    friendState.messages = [];
    renderFriendsBody();
    await loadChat(uid);
    const input = $('#chatInput');
    if (input) input.focus({ preventScroll: true });
  }

  async function loadChat(uid, silent = false) {
    if (!state.session || !uid) return;
    if (state.session.local) {
      if (!friendState.active || friendState.active.uid !== uid) return;
      friendState.messages = localLoadMessages(uid);
      const box = $('#chatMessages');
      if (box) {
        box.innerHTML = chatMessagesHTML();
        if (!silent) box.scrollTop = box.scrollHeight;
      }
      return;
    }
    try {
      const data = await WW.api('/api/social/chat?friend=' + encodeURIComponent(uid), { method: 'GET' });
      if (!friendState.active || friendState.active.uid !== uid) return;
      friendState.messages = data.messages || [];
      const box = $('#chatMessages');
      if (box) {
        const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
        box.innerHTML = chatMessagesHTML();
        if (nearBottom || !silent) box.scrollTop = box.scrollHeight;
      }
    } catch (err) {
      if (!silent || err.status === 401) toast(apiErrorMessage(err), 'error', 4200);
      if (err.status === 401) stopChatPoll();
    }
  }

  async function sendChat() {
    if (!friendState.active) { toast('先选择一个好友', 'warn'); return; }
    const input = $('#chatInput');
    const text = input ? input.value.trim() : '';
    if (!text) { toast('消息不能为空', 'warn'); return; }
    if (state.session.local) {
      localSendMessage(friendState.active.uid, text);
      if (input) input.value = '';
      friendState.messages = localLoadMessages(friendState.active.uid);
      const box = $('#chatMessages');
      if (box) {
        box.innerHTML = chatMessagesHTML();
        box.scrollTop = box.scrollHeight;
      }
      sfx('tap');
      return;
    }
    try {
      await WW.api('/api/social/chat/send', { body: { friend: friendState.active.uid, text } });
      if (input) input.value = '';
      await loadChat(friendState.active.uid, true);
      const box = $('#chatMessages');
      if (box) box.scrollTop = box.scrollHeight;
      sfx('tap');
    } catch (err) { toast(apiErrorMessage(err), 'error', 4200); }
  }

  /* ---------------- 搜索 ---------------- */
  const EXTRA_KEYWORDS = {
    netease: '网易 网易版 网易我的世界 我的世界 中国版 官方 mc 下载 wangyi',
    pojav: 'pojav launcher 安卓 手机 java 启动器 qidongqi pojavlauncher',
    fcl: 'fold craft launcher fcl 安卓 java 启动器 qidongqi',
    zalith: 'zalith launcher 安卓 java 启动器 qidongqi',
    amethyst: 'amethyst 安卓 java 启动器 低配 qidongqi',
    pcl2: 'pcl pcl2 plain craft launcher 电脑 启动器 qidongqi windows',
    hmcl: 'hmcl hello minecraft launcher 电脑 启动器 qidongqi',
    bakaxl: 'bakaxl 电脑 启动器 qidongqi',
    prism: 'prism launcher 电脑 启动器 qidongqi',
    multimc: 'multimc 电脑 启动器 qidongqi',
    official: '官方 启动器 minecraft launcher mojang qidongqi',
    bedrock: '基岩版 bedrock 手机 平板 官方 我的世界 版本 选择',
    atlauncher: 'atlauncher atl 启动器 整合包 电脑 qidongqi',
    technic: 'technic 整合包 启动器 电脑 qidongqi',
    gdlauncher: 'gdlauncher gd 启动器 电脑 qidongqi',
    modrinthapp: 'modrinth app 启动器 官方 模组 qidongqi',
    mcmod: 'mc百科 mcmod 百科 模组 wiki ziyuan',
    modrinth: 'modrinth 模组 整合包 光影 ziyuan',
    curseforge: 'curseforge 模组 整合包 ziyuan',
    minecraftwiki: 'wiki 百科 合成表 ziyuan',
    planetminecraft: 'planet minecraft 地图 皮肤 建筑 ziyuan',
    klpbbs: '苦力怕论坛 klpbbs 社区 整合包 ziyuan',
    minecraftnet: 'minecraft 官网 官方 ziyuan',
    optifine: 'optifine 光影 优化 ziyuan',
    fabric: 'fabric 模组 加载器 ziyuan',
    forge: 'forge 模组 加载器 ziyuan',
    namemc: 'namemc 皮肤 id 查询 ziyuan',
    '9minecraft': '9minecraft 模组 地图 ziyuan'
  };

  const SETTING_INDEX = [
    { id: 'theme', title: '外观主题', desc: '草方块 / 下界 / 末地 / 海洋', icon: 'palette' },
    { id: 'sound', title: '音效与反馈', desc: '按钮与操作提示音', icon: 'sound' },
    { id: 'bgm', title: '背景音乐', desc: 'Minecraft 风格 BGM / 自定义 MP3', icon: 'sound' },
    { id: 'motion', title: '界面动画', desc: '页面切换与进入动画', icon: 'motion' },
    { id: 'notify', title: '消息通知', desc: '版本更新与活动提醒', icon: 'bell' },
    { id: 'history', title: '历史记录', desc: '生成历史 / 导出历史 / 检测文件', icon: 'info' },
    { id: 'clear-search', title: '清除搜索历史', desc: '删除本机保存的搜索记录', icon: 'search' },
    { id: 'export-path', title: '导出路径', desc: '所有导出文件保存到系统下载路径', icon: 'download' },
    { id: 'storage', title: '存储与 APK', desc: '下载路径 / APK 文件 / 全部文件', icon: 'download' },
    { id: 'permissions', title: '权限管理', desc: '存储 / 通知 / 相机 / 麦克风 / 应用', icon: 'shield' },
    { id: 'other-apps', title: '其他APP', desc: '云析 / 极客猫 / 一叶知音', icon: 'box' },
    { id: 'about-us', title: '关于我们', desc: '作者、赞助商与官方群 ' + QQ_GROUP, icon: 'user' },
    { id: 'sponsor-us', title: '赞助我们', desc: '微信扫码赞赏 · 支持持续更新', icon: 'sparkle' },
    { id: 'about-app', title: '关于软件 / 更新', desc: '内置更新 · 下载进度 · 下载路径', icon: 'info' }
  ];

  const LOGIN_INDEX = [
    { id: 'offline', title: '账号密码登录 / 注册', sub: '账号保存在本机，注册即登录，下次可直接账密登录', icon: 'key', options: { method: 'account', account: 'offline' }, extra: '账号 密码 注册 登录 本地 account password' },
    { id: 'microsoft', title: '微软官方登录', sub: '使用 Microsoft 官方账号关联 Minecraft 档案', icon: 'microsoft', options: { method: 'account', account: 'microsoft' }, extra: '微软账号 microsoft 官方 账号' },
    { id: 'xbox', title: 'Xbox 官方登录', sub: '使用 Xbox Live 玩家代号完成官方授权', icon: 'xbox', options: { method: 'account', account: 'xbox' }, extra: 'xbox 玩家代号 微软 官方' }
  ];

  let sheetCloseTimer = null;
  let searchIndex = [];
  function buildSearchIndex() {
    searchIndex = [];
    Object.keys(PAGE_META).forEach(key => {
      const meta = PAGE_META[key];
      searchIndex.push({
        type: 'page', id: key, title: meta.title, sub: meta.desc,
        icon: meta.icon, haystack: `${meta.title} ${meta.desc} 页面 ${key}`.toLowerCase()
      });
    });
    const launchers = [DATA.featuredLauncher, ...(DATA.bedrockLauncher ? [DATA.bedrockLauncher] : []), ...(DATA.neteaseBedrock ? [DATA.neteaseBedrock] : []), ...DATA.androidLaunchers, ...DATA.javaLaunchers];
    launchers.forEach(l => {
      const platform = DATA.bedrockLauncher && DATA.bedrockLauncher.id === l.id
        ? '基岩版 手机 平板 官方 版本 bedrock'
        : DATA.neteaseBedrock && DATA.neteaseBedrock.id === l.id
          ? '网易 我的世界 中国版 基岩版 手机 电脑 联机 bedrock netease'
        : DATA.featuredLauncher.id === l.id
          ? '电脑版 电脑 java版 启动器 windows pc 推荐 龙腾猫跃 PCL2'
          : DATA.androidLaunchers.includes(l)
            ? '安卓启动器 安卓 手机 android'
            : DATA.javaLaunchers.includes(l)
              ? '电脑版 电脑 java版 启动器 windows pc'
              : '其他启动器';
      searchIndex.push({
        type: 'launcher', id: l.id, title: l.name, sub: l.desc,
        mono: l.mono, color: l.color,
        haystack: [l.name, l.en, l.desc, l.long, (l.tags || []).join(' '), l.mono, EXTRA_KEYWORDS[l.id] || '', '启动器 qidongqi launcher', platform].join(' ').toLowerCase()
      });
    });
    DATA.resources.forEach(r => {
      searchIndex.push({
        type: 'resource', id: r.id, title: r.name, sub: r.desc,
        mono: r.mono, color: r.color,
        haystack: [r.name, r.en, r.desc, r.domain, (r.tags || []).join(' '), r.mono, EXTRA_KEYWORDS[r.id] || '', '资源 网站 ziyuan resource'].join(' ').toLowerCase()
      });
    });
    SETTING_INDEX.forEach(s => {
      searchIndex.push({
        type: 'setting', id: s.id, title: s.title, sub: s.desc,
        icon: s.icon, haystack: `${s.title} ${s.desc} 设置 shezhi setting`.toLowerCase()
      });
    });
    LOGIN_INDEX.forEach(l => {
      searchIndex.push({
        type: 'login', id: l.id, title: l.title, sub: l.sub, icon: l.icon,
        haystack: `${l.title} ${l.sub} ${l.extra} 登录 账号 account login`.toLowerCase()
      });
    });
    BOX.tools.forEach(t => {
      searchIndex.push({
        type: 'tool', id: t.id, title: t.name, sub: t.desc, icon: t.icon,
        haystack: `${t.name} ${t.desc} ${t.en} 百宝箱 工具 指令 方块 像素画 投影 baibaoxiang tool`.toLowerCase()
      });
    });
    COMPLEX.forEach(c => {
      searchIndex.push({
        type: 'complex', id: c.id, title: c.name, sub: c.desc, icon: 'terminal',
        haystack: `${c.name} ${c.desc} ${c.code} ${c.hint} ${c.cat} ${c.edition === 'java' ? 'Java' : '基岩版'} 复杂指令 百宝箱 command`.toLowerCase()
      });
    });
    searchIndex.forEach(item => {
      item.haystackCompact = item.haystack.replace(/\s+/g, '');
    });
  }

  function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function highlight(text, query) {
    const safe = esc(text);
    if (!query) return safe;
    const q = query.trim();
    if (!q) return safe;
    return safe.replace(new RegExp('(' + escapeRegex(esc(q)) + ')', 'ig'), '<mark>$1</mark>');
  }
  function searchAll(query) {
    const q = query.trim().toLowerCase();
    const qCompact = q.replace(/\s+/g, '');
    if (!q) return [];
    return searchIndex.map(item => {
      const title = item.title.toLowerCase();
      const titleCompact = title.replace(/\s+/g, '');
      const idx = item.haystack.indexOf(q);
      const compactIdx = qCompact ? item.haystackCompact.indexOf(qCompact) : -1;
      if (idx < 0 && compactIdx < 0) return null;
      let score = 10;
      if (title === q || titleCompact === qCompact) score = 100;
      else if (title.startsWith(q) || (qCompact && titleCompact.startsWith(qCompact))) score = 80;
      else if (title.includes(q) || (qCompact && titleCompact.includes(qCompact))) score = 60;
      else if (item.sub && item.sub.toLowerCase().replace(/\s+/g, '').includes(qCompact)) score = 30;
      if (item.type === 'page') score += 6;
      score -= Math.min(idx >= 0 ? idx : compactIdx, 20) * 0.04;
      return { ...item, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'zh-CN'));
  }

  function renderSearchPanel() {
    const panel = $('#searchPanel');
    const input = $('#searchInput');
    if (!panel || !input) return;
    const query = input.value.trim();
    if (!query) {
      const recent = state.history.slice(0, 5);
      panel.innerHTML = `
        ${recent.length ? `<div class="search-block">
          <div class="search-block-title"><span>最近搜索</span><button type="button" data-clear-history>清空</button></div>
          <div class="search-tag-row">${recent.map(h => `<button class="tag" type="button" data-search-term="${esc(h)}">${esc(h)}</button>`).join('')}</div>
        </div>` : ''}
        <div class="search-block">
          <div class="search-block-title"><span>热门搜索</span><span class="mono">HOT</span></div>
          <div class="search-tag-row">
            ${['PCL2', '安卓启动器', 'HMCL', '光影', 'MC百科', '皮肤'].map(h => `<button class="tag" type="button" data-search-term="${esc(h)}">${esc(h)}</button>`).join('')}
          </div>
        </div>
        <div class="search-block">
          <div class="search-block-title"><span>可以搜索</span><span class="mono">ALL</span></div>
          <div class="search-tag-row">
            ${['启动器', '资源站', '设置', '主题', '微软账号'].map(h => `<button class="tag" type="button" data-search-term="${esc(h)}">${esc(h)}</button>`).join('')}
          </div>
        </div>`;
      state.searchResults = [];
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      return;
    }

    const results = searchAll(query).slice(0, 12);
    state.searchResults = results;
    state.searchCursor = -1;
    const typeName = { launcher: '启动器', resource: '资源站', page: '页面', setting: '设置', login: '登录', tool: '工具', complex: '复杂指令' };
    if (!results.length) {
      panel.innerHTML = `
        <div class="search-empty">
          <div class="empty-art">${SVG('search')}</div>
          <b>没有找到「${esc(query)}」</b>
          <span>试试「启动器」「光影」「MC百科」或「微软账号」。</span>
        </div>`;
    } else {
      panel.innerHTML = `
        <div class="search-block">
          <div class="search-block-title"><span>搜索结果</span><span class="mono">${results.length} MATCH${results.length > 1 ? 'ES' : ''}</span></div>
          ${results.map((r, i) => {
            const isIcon = ['page', 'setting', 'login', 'tool', 'complex'].includes(r.type);
            const iconHtml = isIcon
              ? `<span class="sr-ico is-page">${SVG(r.icon)}</span>`
              : `<span class="sr-ico" style="--sr-color:${r.color}">${esc(r.mono)}</span>`;
            return `<button class="sr-item" type="button" role="option" aria-selected="false" data-sr-type="${r.type}" data-sr-id="${r.id}" data-sr-index="${i}">
              ${iconHtml}
              <span class="sr-main"><b>${highlight(r.title, query)}</b><span>${highlight(r.sub || '', query)}</span></span>
              <span class="sr-type">${typeName[r.type]}</span>
            </button>`;
          }).join('')}
        </div>`;
    }
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function openSearchPanel() {
    renderSearchPanel();
  }
  function closeSearchPanel() {
    const panel = $('#searchPanel');
    const input = $('#searchInput');
    if (!panel || !input) return;
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    state.searchCursor = -1;
  }
  function addSearchHistory(term) {
    const t = String(term).trim();
    if (!t) return;
    state.history = [t, ...state.history.filter(x => x !== t)].slice(0, 8);
    store.set(KEY_HISTORY, state.history);
  }
  function setSearchTerm(term, focus = true) {
    const input = $('#searchInput');
    if (!input) return;
    input.value = term;
    if (focus) input.focus();
    renderSearchPanel();
  }
  function clearSearchInput() {
    const input = $('#searchInput');
    if (input) input.value = '';
    closeSearchPanel();
  }

  function navigateSearchResult(type, id) {
    const query = $('#searchInput') ? $('#searchInput').value.trim() : '';
    if (query) addSearchHistory(query);
    clearSearchInput();
    if (type === 'launcher') {
      setTab('launchers');
      setTimeout(() => openLauncherDetail(id), 260);
    } else if (type === 'resource') {
      const r = DATA.resources.find(x => x.id === id);
      setTab('resources');
      if (r) {
        state.resourceFilter = 'all';
        renderResources();
        setTimeout(() => {
          const card = document.querySelector(`.res-card[data-res-id="${id}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.classList.add('is-flash');
            setTimeout(() => card.classList.remove('is-flash'), 1700);
          }
        }, 340);
      }
    } else if (type === 'page') {
      setTab(id === 'home' ? 'home' : id);
      if (id === 'mine') {
        setTimeout(() => {
          const panel = document.querySelector('[data-panel="mine"]');
          if (panel) panel.scrollTo({ top: 0, behavior: 'smooth' });
        }, 260);
      }
    } else if (type === 'setting') {
      setTab('mine');
      setTimeout(() => focusSetting(id), 360);
    } else if (type === 'login') {
      const entry = LOGIN_INDEX.find(l => l.id === id);
      setTab('mine');
      setTimeout(() => openLogin(entry ? entry.options : {}), 280);
    } else if (type === 'tool') {
      state.boxMode = 'tools';
      renderBox();
      setTab('box');
      setTimeout(() => openToolSheet(id), 320);
    } else if (type === 'complex') {
      const item = COMPLEX.find((c) => c.id === id);
      if (item) state.boxEdition = item.edition;
      state.boxMode = 'complex';
      state.complexCat = '全部';
      state.complexQuery = '';
      renderBox();
      setTab('box');
      setTimeout(() => loadComplexTemplate(id), 320);
    }
  }

  function focusSetting(key) {
    if (!document.querySelector('#layerRoot .settings-sheet-card')) openSettingsSheet();
    setTimeout(() => {
      const row = document.querySelector(`[data-setting="${key}"], [data-set-toggle="${key}"]`);
      if (!row) return;
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('is-flash');
      setTimeout(() => row.classList.remove('is-flash'), 1800);
    }, 60);
  }

  /* ---------------- 标签页 ---------------- */
  function setTab(tab) {
    if (!PAGE_META[tab]) tab = 'home';
    const first = state.tab !== tab;
    state.tab = tab;
    if (tab === 'box') trackTask('box-tab');
    $$('.tab-panel').forEach(panel => {
      const active = panel.dataset.panel === tab;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
      if (active) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
        setTimeout(() => panel.classList.remove('is-entering'), 500);
      }
    });
    $$('.tab[data-tab]').forEach(btn => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    if (PAGE_META[tab]) document.title = `${PAGE_META[tab].title} · 世界织卷工具箱`;
    if (first) sfx('tab');
    closeSearchPanel();
  }

  function goToAccount() {
    if (state.session) {
      setTab('mine');
    } else {
      setTab('mine');
      setTimeout(() => openLogin(), 200);
    }
  }

  function focusLauncherSection(focus) {
    setTab('launchers');
    setTimeout(() => {
      const target = document.getElementById(focus === 'java' ? 'launcherJava' : 'launcherAndroid');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const card = target.querySelector('.launcher-card');
        if (card) {
          card.classList.add('is-flash');
          setTimeout(() => card.classList.remove('is-flash'), 1600);
        }
      }
    }, 320);
  }

  /* ---------------- 弹层 ---------------- */
  function syncInert() {
    const loginLayer = $('#loginLayer');
    const blocked = (loginLayer && !loginLayer.hidden) || state.sheetOpen;
    ['#screens', '#tabbar'].forEach(sel => {
      const el = $(sel);
      if (!el) return;
      if (blocked) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  function openSheet(inner, options = {}) {
    const root = $('#layerRoot');
    if (!root) return;
    if (!String(inner).includes('friendsBody')) stopChatPoll();
    if (sheetCloseTimer) {
      clearTimeout(sheetCloseTimer);
      sheetCloseTimer = null;
    }
    state.sheetClosing = false;
    root.classList.remove('is-closing');
    const header = options.title ? `
      <div class="sheet-head">
        <div class="sheet-head-main">
          <h2>${esc(options.title)}</h2>
          ${options.sub ? `<p>${esc(options.sub)}</p>` : ''}
        </div>
        <button class="sheet-close" type="button" data-sheet-close aria-label="关闭">${SVG('close')}</button>
      </div>` : '';
    const floatClose = options.title ? '' : `<button class="sheet-close sheet-close-float" type="button" data-sheet-close aria-label="关闭">${SVG('close')}</button>`;
    root.innerHTML = `
      <div class="sheet-backdrop" data-sheet-close></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(options.title || '详情')}">
        <div class="sheet-handle"></div>
        ${header}
        ${floatClose}
        ${inner}
      </div>`;
    state.sheetOpen = true;
    state.sheetReturnFocus = document.activeElement;
    const app = $('#app');
    if (app) app.classList.add('has-sheet');
    syncInert();
    paintSkins(root);
    sfx('open');
    const sheet = $('.sheet', root);
    if (sheet) {
      sheet.setAttribute('tabindex', '-1');
      sheet.scrollTop = 0;
      try { sheet.focus({ preventScroll: true }); } catch { /* ignore */ }
    }
  }

  function closeSheet() {
    const root = $('#layerRoot');
    if (!root || !root.innerHTML || state.sheetClosing) return;
    stopChatPoll();
    state.sheetClosing = true;
    root.classList.add('is-closing');
    sheetCloseTimer = setTimeout(() => {
      root.classList.remove('is-closing');
      root.innerHTML = '';
      state.sheetOpen = false;
      state.sheetClosing = false;
      sheetCloseTimer = null;
      const app = $('#app');
      if (app) app.classList.remove('has-sheet');
      syncInert();
      const back = state.sheetReturnFocus;
      state.sheetReturnFocus = null;
      if (back && typeof back.focus === 'function' && document.contains(back)) {
        try { back.focus({ preventScroll: true }); } catch { /* ignore */ }
      }
    }, 220);
  }

  function openLauncherDetail(id) {
    const l = findLauncher(id);
    if (!l) return;
    const image = launcherImage(l);
    const context = launcherMeta(l);
    const highlights = l.highlights || [
      '官方渠道获取，安装更放心',
      '支持完整的游戏版本与资源',
      '账号权益与社区功能互通'
    ];
    const host = hostOf(l.link);
    const versionBlock = context === 'bedrock' && Array.isArray(l.versions) ? `
      <div class="version-pick-block">
        <div class="field-label"><span>选择基岩版版本</span><small>${esc(state.bedrockVersion)}</small></div>
        <div class="version-pick-list">
          ${l.versions.map((v) => `<button class="chip version-chip ${state.bedrockVersion === v.id ? 'is-active' : ''}" type="button" data-bedrock-version="${esc(v.id)}">${esc(v.name)}</button>`).join('')}
        </div>
        <p class="field-hint">版本仅用于记录你想玩的版本；官方下载页会提供当前最新版，历史版本请自行备份存档。</p>
      </div>` : '';
    const content = `
      <div class="detail-head">
        <span class="detail-icon ${String(l.mono).length > 2 ? 'long' : ''}" style="--c:${l.color}">
          ${image ? `<img src="${esc(image)}" alt="${esc(l.name)}" loading="lazy" decoding="async">` : esc(l.mono)}
        </span>
        <div class="detail-title">
          <h2>${esc(l.name)}</h2>
          <p>${l.author ? '作者：' + esc(l.author) : esc(l.en || l.kicker || 'OFFICIAL LAUNCHER')}</p>
          <div class="tag-row" style="margin-top:7px">${(l.tags || []).map(t => `<span class="tag-mini">${esc(t)}</span>`).join('')}</div>
        </div>
      </div>
      <p class="detail-desc">${esc(l.long || l.desc)}</p>
      ${versionBlock}
      <ul class="detail-highlights">
        ${highlights.map(h => `<li>${SVG('check')}<span>${esc(h)}</span></li>`).join('')}
      </ul>
      <div class="detail-actions">
        <a class="btn btn-primary" href="${esc(l.download || l.link)}" target="_blank" rel="noopener noreferrer">${SVG('download')}下载 / 获取</a>
        <a class="btn btn-ghost" href="${esc(l.link)}" target="_blank" rel="noopener noreferrer">${SVG('external')}官网</a>
      </div>
      <div class="detail-link">${SVG('globe')}<span>${esc(host)}</span><button type="button" data-copy="${esc(l.link)}" aria-label="复制链接">${SVG('copy')}</button></div>
      <p class="download-note">${context === 'android' ? '安卓版启动器通常以 APK 形式发布，请从官方仓库下载并允许安装未知来源应用。' : context === 'netease-bedrock' ? '网易我的世界中国版由网易官方分发，账号与国际版相互独立，请前往官网下载。' : context === 'bedrock' ? '基岩版由微软官方分发，Android 可前往 Google Play 或官网，iOS 前往 App Store，Windows 使用官方启动器。' : '电脑版启动器下载后请核对文件来源与版本，安装过程可能需要 Java 运行环境。'}</p>`;
    openSheet(content);
  }

  function openDownloadSheet() {
    const f = DATA.featuredLauncher;
    const image = launcherImage(f);
    const content = `
      <div class="detail-head">
        <span class="detail-icon long" style="--c:${f.color}">${image ? `<img src="${esc(image)}" alt="${esc(f.name)}" loading="lazy" decoding="async">` : esc(f.mono)}</span>
        <div class="detail-title">
          <h2>${esc(f.name)}</h2>
          <p>作者：${esc(f.author || '龙腾猫跃')} · PCL2</p>
          <div class="tag-row" style="margin-top:7px">${f.tags.map(t => `<span class="tag-mini">${esc(t)}</span>`).join('')}</div>
        </div>
      </div>
      <p class="detail-desc">PCL2 是龙腾猫跃开发的免费 Windows 启动器，支持一键安装游戏、Java、整合包、模组与光影。请前往官方 GitHub 仓库获取最新版本。</p>
      <div class="download-list">
        <a class="download-card" href="${esc(f.download)}" target="_blank" rel="noopener noreferrer">
          <span class="download-ico">${SVG('download')}</span>
          <span class="download-main"><b>GitHub Releases</b><span>官方发布页 · 下载最新 PCL2</span></span>
          ${SVG('external')}
        </a>
        <a class="download-card" href="${esc(f.link)}" target="_blank" rel="noopener noreferrer">
          <span class="download-ico">${SVG('globe')}</span>
          <span class="download-main"><b>GitHub 仓库</b><span>Hex-Dragon/PCL2 · 源码与说明</span></span>
          ${SVG('external')}
        </a>
      </div>
      <p class="download-note">点击后会复制链接并尝试用手机浏览器打开；本应用不托管安装包。</p>
      <div class="detail-link">${SVG('globe')}<span>${esc(hostOf(f.link))}</span><button type="button" data-copy="${esc(f.link)}" aria-label="复制链接">${SVG('copy')}</button></div>`;
    openSheet(content, { title: '下载 PCL2', sub: '作者：龙腾猫跃 · 免费开源' });
  }

  function openThemeSheet() {
    const content = `<div class="theme-grid">
      ${DATA.themes.map(t => {
        const locked = t.premium && !themeUnlocked(t.id);
        return `
        <button class="theme-option ${state.settings.theme === t.id ? 'is-active' : ''} ${locked ? 'is-locked' : ''}" type="button" data-theme-choice="${t.id}">
          <span class="theme-swatch">${t.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span>
          <span><b>${esc(t.name)}${t.premium ? ' · 商店' : ''}</b><span>${locked ? '未解锁 · 商店购买主题道具' : esc(t.desc)}</span></span>
          <span class="theme-check">${locked ? SVG('shield') : SVG('check')}</span>
        </button>`;
      }).join('')}
    </div>
    <p class="download-note">主题会立即应用，并保存在本机。</p>`;
    openSheet(content, { title: '外观主题', sub: '给世界换一种方块色调' });
  }

  function openSkinSheet() {
    if (!state.session) { openLogin(); return; }
    const content = `<div class="skin-sheet-grid">
      ${DATA.skins.map(s => `
        <button class="skin-option ${state.session.skinId === s.id ? 'is-selected' : ''}" type="button" data-skin-choice="${s.id}">
          <canvas data-skin-head="${s.id}" width="8" height="8"></canvas>
          <b>${esc(s.name)}</b>
          <span class="sp-check">${SVG('check')}</span>
        </button>`).join('')}
    </div>
    <p class="download-note">皮肤仅在本地演示环境生效，更换后会同步显示在首页与我的页面。</p>`;
    openSheet(content, { title: '更换皮肤', sub: '选择一款属于你的方块形象' });
  }

  function aboutAvatarHTML(person, cls = 'about-avatar') {
    if (person && person.avatar) {
      return `<img class="${cls}" src="${esc(person.avatar)}" alt="${esc(person.name || '成员')}头像" loading="lazy" decoding="async">`;
    }
    return `<span class="${cls}">${esc(String((person && person.name) || '?').slice(0, 1))}</span>`;
  }

  function aboutPersonHTML(person) {
    const qq = String(person.qq || '').replace(/\D/g, '');
    return `
      <button class="about-person" type="button"${qq ? ` data-qq="${esc(qq)}" data-qq-name="${esc(person.name)}"` : ' disabled aria-disabled="true"'} aria-label="${esc(person.name)}${qq ? '，QQ ' + esc(qq) + '，点击加好友' : '，QQ 号待补充'}">
        ${aboutAvatarHTML(person)}
        <span class="about-person-main"><b>${esc(person.name)}</b><small>${esc(person.role || '成员')}</small></span>
        <span class="about-person-qq mono">${qq ? 'QQ ' + esc(qq) : 'QQ 号待补充'}</span>
        ${qq ? SVG('chevron') : ''}
      </button>`;
  }

  function partnerAppHTML(app, partner) {
    const group = String(app.group || '').replace(/\D/g, '');
    const showGroup = group && group !== String(partner.group || '');
    return `
      <div class="partner-app">
        ${app.image ? `<img class="partner-app-ico" src="${esc(app.image)}" alt="${esc(app.name)}" loading="lazy" decoding="async">` : `<span class="partner-app-ico">${esc((app.name || 'A').slice(0, 1))}</span>`}
        <div class="partner-app-main"><b>${esc(app.name)}</b><small>作者 ${esc(partner.name)}${app.pwd ? ' · 提取码 ' + esc(app.pwd) : ''}</small></div>
        <div class="partner-app-actions">
          ${showGroup ? `<button class="mini-link" type="button" data-qq-group="${esc(group)}" data-qq-group-name="${esc(app.name)}">群 ${esc(group)}</button>` : ''}
          <a class="mini-link is-primary" href="${esc(app.link || QUARK.url)}" target="_blank" rel="noopener noreferrer">夸克下载</a>
        </div>
      </div>`;
  }

  function partnerHTML(partner) {
    const qq = String(partner.qq || '').replace(/\D/g, '');
    const group = String(partner.group || '').replace(/\D/g, '');
    return `
      <article class="partner-card">
        <div class="partner-head">
          ${aboutAvatarHTML(partner, 'partner-avatar')}
          <div class="partner-main"><b>${esc(partner.name)}</b><small>${esc(partner.role || '合作作者')}</small></div>
          ${qq ? `<button class="partner-qq mono" type="button" data-qq="${esc(qq)}" data-qq-name="${esc(partner.name)}">QQ ${esc(qq)}</button>` : ''}
        </div>
        ${group ? `<button class="partner-group" type="button" data-qq-group="${esc(group)}" data-qq-group-name="${esc(partner.name)}">点击加入 ${esc(partner.name)} 的 QQ 群 ${esc(group)}</button>` : ''}
        <div class="partner-apps">${(partner.apps || []).map((app) => partnerAppHTML(app, partner)).join('')}</div>
      </article>`;
  }

  function otherAppsHTML() {
    const about = DATA.about || {};
    const apps = about.otherApps || [];
    return `
      <p class="other-apps-note">${SVG('info')}<span>这几个 APP 与「世界织卷」互相独立，点击群号加入对应交流群；下载链接以各卡片为准，夸克网盘会直接打开。</span></p>
      <div class="other-apps-list">
        ${apps.map((app) => `
          <article class="other-app-card">
            ${app.image ? `<img class="other-app-ico" src="${esc(app.image)}" alt="${esc(app.name)}" loading="lazy" decoding="async">` : `<span class="other-app-ico">${esc((app.name || 'A').slice(0, 1))}</span>`}
            <div class="other-app-main"><b>${esc(app.name)}</b><small>作者 ${esc(app.author || '')}${app.pwd ? ' · 提取码 ' + esc(app.pwd) : ''}</small></div>
            <div class="other-app-actions">
              ${app.group ? `<button class="mini-link" type="button" data-qq-group="${esc(app.group)}" data-qq-group-name="${esc(app.name)}">群 ${esc(app.group)}</button>` : ''}
              <a class="mini-link is-primary" href="${esc(app.link || QUARK.url)}" target="_blank" rel="noopener noreferrer">夸克下载</a>
            </div>
          </article>`).join('')}
      </div>
      <p class="download-note">云析网盘提取码：<span class="mono">qshu</span>；其他应用链接以卡片为准。</p>`;
  }

  function supportHTML() {
    const support = (DATA.about && DATA.about.support) || {
      image: 'assets/sponsor-qr.png',
      title: '赞助我们',
      text: '谢谢您的赞赏，我会努力做好APP的，您的赞赏，我的动力！',
      note: '微信扫码赞赏 · 完全自愿'
    };
    return `
      <div class="support-panel">
        <img class="support-qr" src="${esc(support.image)}" alt="赞助我们赞赏码" loading="lazy" decoding="async">
        <h3>${esc(support.title || '赞助我们')}</h3>
        <p>${esc(support.text || '')}</p>
        <small>${esc(support.note || '')}</small>
      </div>`;
  }

  function aboutUsHTML() {
    const about = DATA.about || { authors: [], sponsors: [], partners: [], qqGroup: QQ_GROUP };
    return `
      <div class="about-hero">
        <div class="about-logo">${GRASS()}</div>
        <h3>世界织卷</h3>
        <p class="about-name">MC 指令与资源工具箱</p>
        <p class="about-ver">VERSION ${esc(DATA.version)} · WORLD WEAVE TOOLBOX</p>
        <p>把启动器、资源站与账号收进同一个世界。<br>一个APP解决你的所有困难。</p>
        <div class="about-meta">
          <span class="tag-mini">Minecraft 工具箱</span>
          <span class="tag-mini">v${esc(DATA.version)}</span>
          <span class="tag-mini">本地运行</span>
        </div>
      </div>

      <h4 class="about-section-title"><span>AUTHORS</span>作者</h4>
      <div class="about-list">${(about.authors || []).map(aboutPersonHTML).join('')}</div>

      <h4 class="about-section-title"><span>SPONSORS</span>赞助商</h4>
      <div class="about-list">${(about.sponsors || []).map(aboutPersonHTML).join('')}</div>

      <h4 class="about-section-title"><span>PARTNERS</span>合作作者</h4>
      <div class="partner-list">${(about.partners || []).map(partnerHTML).join('')}</div>

      <div class="about-group">
        <div class="about-group-main">
          <span class="mono">OFFICIAL GROUP</span>
          <b>官方 QQ 群</b>
          <small>点击群号加入，或在 QQ 中搜索</small>
        </div>
        <button class="about-group-qq mono" type="button" data-qq-group="${esc(about.qqGroup || QQ_GROUP)}" data-qq-group-name="官方 QQ 群">${esc(about.qqGroup || QQ_GROUP)}</button>
      </div>

      <h4 class="about-section-title"><span>SUPPORT US</span>赞助我们</h4>
      ${supportHTML()}

      <div class="about-actions">
        <button class="btn btn-primary btn-block" type="button" data-action="check-update">${SVG('sparkle')}内置更新</button>
        <button class="btn btn-ghost btn-block" type="button" data-setting="history">${SVG('info')}更新与导出历史</button>
      </div>`;
  }

  function openAboutUsSheet() {
    trackTask('about-open');
    openSheet(aboutUsHTML(), { title: '关于我们', sub: '作者 / 赞助商 / 合作作者 / 官方群' });
  }

  function openAdminConsole() {
    if (!/^https?:$/.test(location.protocol)) {
      toast('管理后台需要先启动 node server/server.js，再通过 http 地址打开', 'warn', 4600);
      return;
    }
    let url;
    try { url = new URL('admin/', location.href).href; } catch { url = '/admin/'; }
    if (window.WWShell && typeof window.WWShell.openExternal === 'function') {
      window.WWShell.openExternal(url);
    } else if (!window.open(url, '_blank', 'noopener')) {
      location.href = url;
    }
    sfx('open');
  }

  function openOtherAppsSheet() {
    openSheet(otherAppsHTML(), { title: '其他APP', sub: '云析 / 极客猫 / 一叶知音' });
  }

  function openSponsorSheet() {
    openSheet(supportHTML(), { title: '赞助我们', sub: '感谢每一份支持' });
  }

  /* ---------------- 内置更新 ---------------- */
  const updateState = {
    checking: false,
    downloading: false,
    manifest: null,
    error: '',
    downloaded: null
  };

  function versionParts(version) {
    return String(version || '0').replace(/^v/i, '').split(/[.+-]/).map((n) => parseInt(n, 10) || 0);
  }

  function isNewerVersion(latest, current) {
    const a = versionParts(latest);
    const b = versionParts(current);
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const x = a[i] || 0;
      const y = b[i] || 0;
      if (x !== y) return x > y;
    }
    return false;
  }

  function updateManifestUrl() {
    const custom = DATA.about && DATA.about.update && DATA.about.update.manifest;
    try { return new URL(custom || 'update.json', location.href).href; } catch { return 'update.json'; }
  }

  async function fetchUpdateManifest() {
    if (window.WWShell && typeof window.WWShell.checkUpdate === 'function') {
      try {
        const native = await window.WWShell.checkUpdate();
        if (typeof native === 'string') return { version: native, notes: [] };
        if (native && typeof native === 'object') return native;
      } catch { /* 回退 HTTP */ }
    }
    if (location.protocol === 'file:') {
      return { version: DATA.version, releasedAt: '', notes: ['离线打开：当前为随包版本'], packageUrl: '', offline: true };
    }
    const manifestUrl = new URL(updateManifestUrl());
    manifestUrl.searchParams.set('t', String(Date.now()));
    const res = await fetch(manifestUrl.href, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data || !data.version) throw new Error('更新信息格式错误');
    return data;
  }

  function updateNotesHTML(notes) {
    const list = Array.isArray(notes) ? notes : String(notes || '').split('\n').filter(Boolean);
    return list.length ? `<ul class="update-notes">${list.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
  }

  function updatePaneHTML() {
    if (updateState.checking) {
      return `
        <div class="update-checking">
          <span class="spinner"></span>
          <b>正在检查更新…</b>
          <div class="update-bar"><i id="updateCheckBar" style="width:12%"></i></div>
          <small>正在读取最新版本信息</small>
        </div>`;
    }
    if (updateState.error) {
      return `
        <div class="update-result is-error">
          ${SVG('info')}
          <b>检查更新失败</b>
          <p>${esc(updateState.error)}</p>
          <button class="btn btn-ghost btn-sm" type="button" data-action="check-update">重试</button>
        </div>`;
    }
    const m = updateState.manifest;
    if (!m) return '';
    const newer = isNewerVersion(m.version, DATA.version);
    if (!newer) {
      return `
        <div class="update-result is-latest">
          <span class="update-result-ico">${SVG('check')}</span>
          <b>当前已是最新版本</b>
          <p>v${esc(DATA.version)} · 无需更新</p>
          ${m.offline ? '<small>离线模式下无法连接更新服务器</small>' : ''}
          <button class="btn btn-ghost btn-sm" type="button" data-action="check-update">重新检查</button>
        </div>`;
    }
    if (updateState.downloading) {
      return `
        <div class="update-downloading">
          <b>正在下载 v${esc(m.version)}</b>
          <div class="update-bar"><i id="updateDownloadBar" style="width:0%"></i></div>
          <div class="update-download-meta"><span id="updateDownloadText">准备下载…</span><b class="mono" id="updateDownloadPct">0%</b></div>
        </div>`;
    }
    if (updateState.downloaded) {
      return `
        <div class="update-result is-downloaded">
          <span class="update-result-ico">${SVG('download')}</span>
          <b>更新包已下载</b>
          <p>${esc(updateState.downloaded.filename)}</p>
          <small>${esc(updateState.downloaded.path)}</small>
          <button class="btn btn-primary btn-block" type="button" data-action="install-update">${SVG('arrow-right')}安装更新</button>
          <button class="btn btn-ghost btn-block btn-sm" type="button" data-action="check-update">重新检查</button>
        </div>`;
    }
    return `
      <div class="update-version-row">
        <span class="update-version-badge">NEW</span>
        <div><b>v${esc(m.version)}</b><small>${esc(m.releasedAt || '')}${m.size ? ' · ' + (Math.round(Number(m.size) / 1024 / 1024 * 10) / 10) + ' MB' : ''}</small></div>
      </div>
      ${updateNotesHTML(m.notes)}
      ${m.packageUrl
        ? `<button class="btn btn-primary btn-block" type="button" data-action="download-update">${SVG('download')}下载并安装更新</button>`
        : `<p class="download-note">更新包地址尚未配置。发布新版本时，在 update.json 中填写 packageUrl 与 sha256 即可启用内置下载。</p>`}
      <button class="btn btn-ghost btn-block btn-sm" type="button" data-action="check-update">重新检查</button>`;
  }

  function renderUpdatePane() {
    const pane = $('#updatePane');
    if (!pane) return;
    pane.innerHTML = updatePaneHTML();
  }

  async function checkAppUpdate(animate = true) {
    if (updateState.checking || updateState.downloading) return;
    updateState.checking = true;
    updateState.error = '';
    updateState.downloaded = null;
    renderUpdatePane();
    const started = Date.now();
    let checkPct = 12;
    const checkTimer = animate ? setInterval(() => {
      checkPct = Math.min(88, checkPct + 7);
      const bar = $('#updateCheckBar');
      if (bar) bar.style.width = checkPct + '%';
    }, 90) : null;
    try {
      const manifest = await fetchUpdateManifest();
      const wait = animate ? Math.max(0, 700 - (Date.now() - started)) : 0;
      if (wait) await new Promise((r) => setTimeout(r, wait));
      if (checkTimer) clearInterval(checkTimer);
      updateState.manifest = manifest;
      updateState.checking = false;
      renderUpdatePane();
      if (isNewerVersion(manifest.version, DATA.version)) {
        recordActivity('generate', { tool: '内置更新', title: '发现新版本 v' + manifest.version, detail: '可在设置 → 关于软件中下载更新' });
        toast(`发现新版本 v${manifest.version}`, 'success', 3600);
      } else {
        toast('当前已是最新版本 v' + DATA.version, 'success', 2600);
      }
    } catch (err) {
      if (checkTimer) clearInterval(checkTimer);
      updateState.checking = false;
      updateState.error = (err && err.message) || '无法连接更新服务器';
      renderUpdatePane();
      toast('检查更新失败：' + updateState.error, 'error', 4600);
    }
  }

  function setUpdateDownloadProgress(pct, text) {
    const bar = $('#updateDownloadBar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, Math.round(pct))) + '%';
    const label = $('#updateDownloadPct');
    if (label) label.textContent = Math.max(0, Math.min(100, Math.round(pct))) + '%';
    const line = $('#updateDownloadText');
    if (line && text) line.textContent = text;
  }

  async function downloadAppUpdate() {
    const m = updateState.manifest;
    if (!m || !m.packageUrl) { toast('当前没有可下载的更新包', 'warn'); return; }
    if (updateState.downloading) return;
    updateState.downloading = true;
    updateState.error = '';
    renderUpdatePane();
    try {
      const url = new URL(m.packageUrl, location.href).href;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('下载失败 HTTP ' + res.status);
      const total = Number(res.headers.get('content-length')) || Number(m.size) || 0;
      const chunks = [];
      let received = 0;
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader();
        let simulated = 4;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          const pct = total ? Math.min(96, Math.round(received / total * 96)) : Math.min(92, simulated += 2);
          setUpdateDownloadProgress(pct, total ? `${(received / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)} MB` : `已下载 ${(received / 1024 / 1024).toFixed(1)} MB`);
        }
      } else {
        const buf = await res.arrayBuffer();
        chunks.push(new Uint8Array(buf));
        received = buf.byteLength;
      }
      const blob = new Blob(chunks, { type: 'application/vnd.android.package-archive' });
      if (m.sha256 && window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
        setUpdateDownloadProgress(96, '正在校验更新包…');
        const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
        const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
        if (hex.toLowerCase() !== String(m.sha256).toLowerCase()) throw new Error('更新包校验失败，请重新下载');
      }
      setUpdateDownloadProgress(97, '正在写入下载路径…');
      const filename = m.filename || `世界织卷APP-v${m.version}.apk`;
      const saved = await saveExportFile(filename, blob, 'application/vnd.android.package-archive');
      if (!saved) throw new Error('保存更新包失败');
      setUpdateDownloadProgress(100, '下载完成');
      await new Promise((r) => setTimeout(r, 450));
      updateState.downloading = false;
      updateState.downloaded = { filename, path: exportPathLabel(), version: m.version };
      recordActivity('export', { tool: '内置更新', title: `v${m.version}`, detail: `${blob.size} 字节 · 下载完成`, filename, path: exportPathLabel(), bytes: blob.size });
      renderUpdatePane();
      const full = exportPathLabel().replace(/\/$/, '') + '/' + filename;
      if (window.WWShell && typeof window.WWShell.installFile === 'function') {
        try {
          const installed = await window.WWShell.installFile(full);
          if (installed) toast('已调起系统安装器，请按提示完成更新', 'success', 5200);
          else toast('更新包已下载，请到下载目录手动安装', 'info', 5200);
          return;
        } catch { /* 回退打开 */ }
      }
      if (window.WWShell && typeof window.WWShell.openFile === 'function') {
        try { await window.WWShell.openFile(full); } catch { /* ignore */ }
      }
      toast(`更新包已下载：${full}`, 'success', 5200);
    } catch (err) {
      updateState.downloading = false;
      updateState.error = (err && err.message) || '下载更新失败';
      renderUpdatePane();
      toast('更新下载失败：' + updateState.error, 'error', 5200);
    }
  }

  function installDownloadedUpdate() {
    const d = updateState.downloaded;
    if (!d) return;
    const full = d.path.replace(/\/$/, '') + '/' + d.filename;
    if (window.WWShell && typeof window.WWShell.installFile === 'function') {
      window.WWShell.installFile(full).then((ok) => {
        toast(ok ? '已调起系统安装器' : '请到下载目录手动安装更新包', ok ? 'success' : 'info', 4600);
      }).catch(() => toast('请到下载目录手动安装更新包', 'info', 4600));
    } else if (window.WWShell && typeof window.WWShell.openFile === 'function') {
      window.WWShell.openFile(full);
    } else {
      toast('请到下载目录打开更新包安装', 'info', 4200);
    }
  }

  function openUpdateSheet() {
    trackTask('settings-open');
    updateState.checking = false;
    updateState.downloading = false;
    updateState.manifest = null;
    updateState.error = '';
    updateState.downloaded = null;
    openSheet(`
      <div class="update-current">
        <span class="update-logo">${GRASS()}</span>
        <div><b>世界织卷APP</b><small>当前版本 v${esc(DATA.version)}</small></div>
      </div>
      <div class="update-pane" id="updatePane">
        <div class="update-checking"><span class="spinner"></span><b>正在检查更新…</b><div class="update-bar"><i style="width:12%"></i></div></div>
      </div>
      <p class="download-note">内置更新会检查 <span class="mono">update.json</span>，下载时显示实时进度，并保存到「${esc(exportPathLabel())}」；原生壳支持时可直接调起系统安装器。不再跳转夸克网盘。</p>
    `, { title: '软件更新', sub: '内置更新 · 下载进度 · 下载路径' });
    checkAppUpdate(true);
  }

  async function openPersonQQ(qq, name) {
    const uin = String(qq || '').replace(/\D/g, '');
    if (!uin) { toast('这位成员的 QQ 号待补充', 'warn'); return; }
    toast(`正在打开 ${name || 'QQ'} 的 QQ 名片…`, 'info', 2200);
    let channel = 'web';
    try { channel = await WW.openQQFriend(uin); } catch { channel = 'web'; }
    if (channel === 'web') {
      copyText(uin);
      toast(`未检测到 QQ 客户端，${name || 'QQ'} 号 ${uin} 已复制`, 'warn', 4600);
    }
  }

  function openAgreementSheet(type) {
    const isPrivacy = type === 'privacy';
    const content = isPrivacy
      ? `<p class="detail-desc">本应用是本地运行的演示作品，不连接真实服务器，也不会收集、上传你的账号或个人信息。<br><br>你在登录页输入的内容仅用于在当前浏览器中生成演示账号，并保存在 localStorage 中。你可以随时退出登录或清理浏览器数据来删除这些信息。<br><br>第三方资源站与启动器官网由其各自运营，请以对应网站公布的隐私政策为准。</p>`
      : `<p class="detail-desc">世界织卷APP 是一个 Minecraft 工具导航演示应用，聚合官方与社区公开的启动器、资源站入口。<br><br>本应用与 Mojang Studios、Microsoft、网易及所列第三方网站没有隶属关系。所有游戏素材、商标与资源版权归其各自权利人所有。<br><br>演示环境中的登录流程不会连接真实账号系统，请勿输入真实的密码或验证码。</p>`;
    openSheet(content, { title: isPrivacy ? '隐私政策' : '用户协议', sub: '请在登录前了解这些内容' });
  }

  function openLogoutConfirm() {
    const content = `
      <p class="confirm-copy">退出后，本机将不再显示账号 ID 与专属皮肤。世界还在，随时可以回来。</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" type="button" data-sheet-close>取消</button>
        <button class="btn btn-danger" type="button" data-confirm-logout>${SVG('logout')}退出登录</button>
      </div>`;
    openSheet(content, { title: '退出当前账号？', sub: state.session ? '当前账号：' + state.session.id : '' });
  }

  /* ---------------- 登录 ---------------- */
  function clearLoginTimer() {
    if (login.codeTimer) {
      clearInterval(login.codeTimer);
      login.codeTimer = null;
    }
    login.countdown = 0;
  }

  function openLogin(options = {}) {
    closeSheet();
    clearLoginTimer();
    stopMsAuth();
    login.method = 'account';
    login.msCode = '';
    login.mode = options.mode === 'register' ? 'register' : 'login';
    login.showOfficial = !!state.session || !!options.showOfficial;
    login.accountView = options.account && login.showOfficial ? options.account : login.showOfficial ? 'list' : 'offline';
    login.allowBack = typeof options.allowBack === 'boolean' ? options.allowBack : true;
    login.skinId = state.session ? state.session.skinId : 'steve';
    login.submitting = false;
    login.returnFocus = document.activeElement;
    const layer = $('#loginLayer');
    layer.hidden = false;
    layer.classList.remove('is-closing');
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-labelledby', 'loginTitle');
    layer.innerHTML = renderLoginScreen();
    paintSkins(layer);
    syncInert();
    const screen = $('.login-screen', layer);
    if (screen) screen.scrollTop = 0;
    setTimeout(() => {
      const input = layer.querySelector('.login-form-card input');
      if (input) input.focus({ preventScroll: true });
    }, 320);
    sfx('open');
  }

  function closeLogin(force = false) {
    if (!force && !state.session && !login.allowBack) {
      blockLoginBack();
      return;
    }
    clearLoginTimer();
    stopMsAuth();
    const layer = $('#loginLayer');
    layer.classList.add('is-closing');
    const back = login.returnFocus;
    setTimeout(() => {
      layer.hidden = true;
      layer.classList.remove('is-closing');
      layer.removeAttribute('role');
      layer.removeAttribute('aria-modal');
      layer.removeAttribute('aria-labelledby');
      layer.innerHTML = '';
      syncInert();
      if (back && typeof back.focus === 'function' && document.contains(back)) {
        try { back.focus({ preventScroll: true }); } catch { /* ignore */ }
      }
    }, 240);
  }

  function blockLoginBack() {
    sfx('error');
    toast('请先完成登录，登录成功后才能返回', 'warn');
    const back = $('[data-login-back]');
    if (back) {
      back.classList.remove('shake');
      void back.offsetWidth;
      back.classList.add('shake');
    }
  }

  function accountServiceNote(info = state.server) {
    if (info === undefined) {
      return `<p class="service-note">${SVG('info')}<span>正在检测账号服务…</span></p>`;
    }
    if (info) {
      return `<p class="service-note is-ok">${SVG('check')}<span>账号服务已连接 · ${info.microsoft ? '微软 / Xbox 授权已就绪' : '微软 / Xbox 授权未配置'} · 支持账号密码与官方登录</span></p>`;
    }
    return `<p class="service-note is-off">${SVG('info')}<span>账号服务未连接：账号密码与微软 / Xbox 登录都会失败。请先运行 <code>node server/server.js</code>。</span></p>`;
  }

  function renderLoginScreen() {
    const allowed = login.allowBack !== false || !!state.session;
    return `
      <div class="login-screen">
        <div class="login-bg"><div class="lg-grid"></div></div>
        <div class="login-head">
          <button class="login-back" type="button" data-login-back aria-label="返回">${SVG('back')}返回</button>
          <span class="login-head-title">ACCOUNT · 世界织卷</span>
          ${allowed ? `<span class="login-lock">${SVG('shield')}可返回</span>` : `<span class="login-lock">${SVG('shield')}需登录</span>`}
        </div>
        <div class="login-body">
          ${login.accountView === 'forgot' ? '' : `<div class="login-hero">
            <div class="login-hero-logo">${GRASS()}</div>
            <h1 id="loginTitle">登录 / 注册账号</h1>
            <p>账号密码保存在本机，注册即登录<br>登录成功后可在「切换账号」中使用微软 / Xbox</p>
            <div class="login-official-tags">
              <span class="tag-mini">账号密码</span>
              <span class="tag-mini">免验证码</span>
              <span class="tag-mini">登录后可切换</span>
            </div>
          </div>`}

          <form class="login-form-card" id="loginForm" novalidate>
            ${renderLoginFormContent()}
          </form>

          <p class="agreement">登录 / 注册即代表你同意
            <button type="button" data-open-agreement="terms">《用户协议》</button>与
            <button type="button" data-open-agreement="privacy">《隐私政策》</button>
          </p>

          <div class="login-role-entry" aria-label="角色后台登录">
            <span class="login-role-title"><i></i>角色后台登录</span>
            <div class="login-role-grid">
              <button class="login-role-btn is-owner" type="button" data-action="login-role" data-role="owner">${SVG('sparkle')}<b>APP主人登录</b><small>最高权限</small></button>
              <button class="login-role-btn is-super" type="button" data-action="login-role" data-role="super">${SVG('shield')}<b>超级管理员登录</b><small>安全密钥</small></button>
              <button class="login-role-btn is-admin" type="button" data-action="login-role" data-role="admin">${SVG('user')}<b>管理员登录</b><small>账号管理</small></button>
            </div>
          </div>

          ${login.showOfficial || state.session
            ? accountServiceNote()
            : `<p class="service-note is-ok">${SVG('check')}<span>账号密码注册即注册即登录，不需要连接或检测账号服务；微软 / Xbox 登录才需要后台。</span></p>`}
        </div>
      </div>`;
  }

  function renderLoginFormContent() {
    if (login.ms) return msPendingHTML();
    if (!login.showOfficial && !state.session) return login.accountView === 'forgot' ? forgotPasswordHTML() : offlineFormHTML();
    if (login.accountView === 'microsoft') return microsoftFormHTML();
    if (login.accountView === 'xbox') return xboxFormHTML();
    if (login.accountView === 'offline') return offlineFormHTML();
    if (login.accountView === 'forgot') return forgotPasswordHTML();
    return accountListHTML();
  }

  function phoneFormHTML() {
    const isRegister = login.mode === 'register';
    return `
      <div class="form-intro">
        <b>${isRegister ? '手机号注册' : '手机号验证码登录'}</b>
        <p>${isRegister ? '验证通过后立即创建账号并完成登录。' : '未注册的手机号在验证通过后会自动创建账号。'}</p>
      </div>
      <div class="field">
        <div class="field-label"><span>手机号</span><small>中国大陆 +86</small></div>
        <div class="input-wrap">
          <span class="input-prefix">+86 ${SVG('chevron')}</span>
          <input type="tel" name="phone" inputmode="numeric" maxlength="11" placeholder="请输入 11 位手机号" autocomplete="tel" aria-label="手机号" aria-required="true" required>
        </div>
        <p class="field-error"></p>
      </div>
      <div class="field">
        <div class="field-label"><span>验证码</span><small>6 位数字</small></div>
        <div class="phone-grid">
          <div class="input-wrap">
            ${SVG('key')}
            <input type="text" name="phoneCode" inputmode="numeric" maxlength="6" placeholder="请输入验证码" autocomplete="one-time-code" aria-label="短信验证码" aria-required="true" required>
          </div>
          <button class="code-btn" type="button" data-send-code>获取验证码</button>
        </div>
        <p class="field-error"></p>
        <p class="field-hint">必须收到运营商下发的官方验证码才能登录；短信通道未配置或发送失败时，登录一定会失败。</p>
      </div>
      <button class="btn btn-primary login-submit" type="submit">${SVG('arrow-right')}${isRegister ? '注册并登录' : '登录'}</button>`;
  }

  function qqFormHTML() {
    return `
      <div class="form-intro">
        <b>QQ 邮箱登录</b>
        <p>服务端会直接连接 QQ 邮箱服务器校验凭据，校验不通过就无法登录。</p>
      </div>
      <div class="field">
        <div class="field-label"><span>QQ 邮箱</span><small>QQ 号或完整邮箱</small></div>
        <div class="input-wrap">
          ${SVG('mail')}
          <input type="text" name="qqMail" inputmode="email" placeholder="123456789 或 xxx@qq.com" autocomplete="username" aria-label="QQ邮箱" aria-required="true" required>
        </div>
        <p class="field-error"></p>
      </div>
      <div class="field">
        <div class="field-label"><span>QQ 邮箱授权码</span><small>16 位</small></div>
        <div class="input-wrap">
          ${SVG('key')}
          <input type="password" name="qqPassword" placeholder="请输入 16 位授权码" autocomplete="current-password" aria-label="QQ邮箱授权码" aria-required="true" required>
          <button class="pwd-toggle" type="button" data-toggle-pwd aria-pressed="false">显示</button>
        </div>
        <p class="field-error"></p>
        <p class="field-hint">腾讯不允许第三方应用使用 QQ 密码登录，官方方式是「授权码」：<button class="link-inline" type="button" data-open-url="https://mail.qq.com/">mail.qq.com</button> → 设置 → 账号 → 开启 IMAP 服务 → 生成授权码。</p>
      </div>
      <button class="btn btn-primary login-submit" type="submit">${SVG('arrow-right')}验证并登录</button>`;
  }

  function accountListHTML() {
    return `
      <div class="form-intro">
        <b>选择登录 / 注册方式</b>
        <p>账号密码保存在本机，注册即登录；微软 / Xbox 使用官方 OAuth，需要账号服务。</p>
      </div>
      <div class="method-list">
        <button class="method-card" type="button" data-account-method="offline">
          <span class="method-ico">${SVG('key')}</span>
          <span class="method-main"><b>账号密码</b><span>${login.mode === 'register' ? '设置账号与密码，创建新账号' : '注册新账号，或使用已有账号密码登录'}</span></span>
          <span class="method-badge">ACCOUNT</span>
          ${SVG('chevron')}
        </button>
        <button class="method-card" type="button" data-account-method="microsoft">
          <span class="method-ico">${SVG('microsoft')}</span>
          <span class="method-main"><b>微软官方登录</b><span>跳转微软官方授权页，校验 Minecraft 档案</span></span>
          <span class="method-badge">MS</span>
          ${SVG('chevron')}
        </button>
        <button class="method-card" type="button" data-account-method="xbox">
          <span class="method-ico">${SVG('xbox')}</span>
          <span class="method-main"><b>Xbox 官方登录</b><span>使用 Xbox Live 官方授权，校验玩家代号</span></span>
          <span class="method-badge">XBOX</span>
          ${SVG('chevron')}
        </button>
      </div>
      <p class="field-hint" style="margin-top:11px">账号密码登录成功后，可在「切换账号」中继续使用微软 / Xbox 官方登录。微软 / Xbox 的密码只输入到官方页面。</p>
      <div class="login-official-links">
        <a href="https://account.microsoft.com/" target="_blank" rel="noopener noreferrer">Microsoft 账号中心 ${SVG('external')}</a>
        <a href="https://www.xbox.com/zh-CN/" target="_blank" rel="noopener noreferrer">Xbox 官网 ${SVG('external')}</a>
      </div>`;
  }

  function subFormHead(icon, title, tag) {
    return `
      <div class="sub-form-head">
        <button class="sub-back" type="button" data-account-list>${SVG('back')}账号方式</button>
        <span class="sub-title">${SVG(icon)}${esc(title)} <span class="mini-tag">${esc(tag)}</span></span>
      </div>`;
  }

  function deviceCodeFormHTML(kind, title, tag) {
    return `
      ${subFormHead(kind, title, tag)}
      <div class="form-intro">
        <b>连接 ${esc(title)}</b>
        <p>点击下方按钮，向微软官方申请一次性设备码，然后在授权页输入该代码完成登录。</p>
      </div>
      <ul class="steps">
        <li><span class="step-no">1</span>获取设备码</li>
        <li><span class="step-no">2</span>在微软页面输入设备码并登录</li>
        <li><span class="step-no">3</span>回到这里，自动完成 Xbox / Minecraft 校验</li>
      </ul>
      <p class="field-hint">${SVG('shield')}密码只输入到微软官方页面，本应用与服务器都不会接触你的密码。</p>
      <button class="btn btn-primary login-submit" type="button" data-ms-start="${kind}">${SVG('arrow-right')}获取设备码</button>`;
  }

  function microsoftFormHTML() {
    return deviceCodeFormHTML('microsoft', '微软登录', 'MICROSOFT');
  }

  function xboxFormHTML() {
    return deviceCodeFormHTML('xbox', 'Xbox 登录', 'XBOX');
  }

  function randomMixedCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < 10; i++) code += chars[randomInt(0, chars.length - 1)];
    return code;
  }

  function msPendingHTML() {
    const info = login.ms;
    if (!info) return '';
    return `
      <div class="ms-panel">
        <div class="ms-local-code">
          <span class="mono">LOCAL VERIFY · ${esc(login.msCode || randomMixedCode())}</span>
          <b>复制验证码后打开官方链接</b>
          <small>A–Z · 1–9 · a–z 随机 10 位；必须完成微软 / Xbox 官方登录后才能返回。</small>
          <button class="btn btn-primary btn-block btn-sm" type="button" data-ms-code-open>${SVG('copy')}复制验证码并打开官方链接</button>
        </div>
        <div class="ms-code-row">
          <span class="ms-code mono" id="msCode">${esc(info.userCode)}</span>
          <button class="btn btn-ghost btn-sm" type="button" data-copy="${esc(info.userCode)}">${SVG('copy')}复制</button>
        </div>
        <p class="ms-status" id="msStatus" role="status" aria-live="polite">等待你在官方页面完成授权…</p>
        <p class="field-hint">官方验证码 ${esc(info.userCode)} 有时效（约 ${Math.max(1, Math.round((info.expiresIn || 900) / 60))} 分钟）。本地验证码仅用于本次登录校验，登录成功后自动进入。</p>
      </div>`;
  }

  function stopMsAuth() {
    if (login.msTimer) {
      clearTimeout(login.msTimer);
      login.msTimer = null;
    }
    login.ms = null;
    login.allowBack = true;
  }

  function offlineFormHTML() {
    const isRegister = login.mode === 'register';
    const showBack = login.showOfficial || !!state.session;
    const head = showBack
      ? subFormHead('key', isRegister ? '注册账号' : '账号密码登录', 'ACCOUNT')
      : `<div class="sub-form-head"><span class="sub-title">${SVG('key')}${isRegister ? '注册账号' : '账号密码登录'} <span class="mini-tag">ACCOUNT</span></span></div>`;
    return `
      ${head}
      <div class="form-intro">
        <b>${isRegister ? '创建新账号' : '账号密码登录'}</b>
        <p>${isRegister ? '账号与密码保存在本机，注册后立即登录，下次可直接用账号密码登录。' : '输入本机注册的账号与密码，验证通过后进入。'}</p>
      </div>
      <div class="field">
        <div class="field-label"><span>账号名称</span><small>3–16 位</small></div>
        <div class="input-wrap">
          ${SVG('user')}
          <input type="text" name="offlineName" maxlength="16" placeholder="例如：史蒂夫" autocomplete="username" aria-label="账号名称" aria-required="true" required>
        </div>
        <p class="field-error"></p>
        <p class="field-hint">支持中文、字母、数字与下划线。</p>
      </div>
      <div class="field">
        <div class="field-label"><span>密码</span><small>至少 8 位</small></div>
        <div class="input-wrap">
          ${SVG('key')}
          <input type="password" name="offlinePassword" placeholder="请输入密码" autocomplete="${isRegister ? 'new-password' : 'current-password'}" aria-label="密码" aria-required="true" required>
          <button class="pwd-toggle" type="button" data-toggle-pwd aria-pressed="false">显示</button>
        </div>
        <p class="field-error"></p>
      </div>
      ${isRegister ? `
      <div class="field">
        <div class="field-label"><span>确认密码</span><small>再输入一次</small></div>
        <div class="input-wrap">
          ${SVG('key')}
          <input type="password" name="offlinePassword2" placeholder="请再次输入密码" autocomplete="new-password" aria-label="确认密码" aria-required="true" required>
          <button class="pwd-toggle" type="button" data-toggle-pwd aria-pressed="false">显示</button>
        </div>
        <p class="field-error"></p>
      </div>
      <div class="field">
        <div class="skin-picker-label"><span>选择皮肤</span><small>登录后仍可更换</small></div>
        <div class="skin-grid" role="radiogroup" aria-label="选择皮肤">
          ${DATA.skins.map(s => `
            <button class="skin-option ${login.skinId === s.id ? 'is-selected' : ''}" type="button" role="radio" aria-checked="${login.skinId === s.id}" data-skin-pick="${s.id}">
              <canvas data-skin-head="${s.id}" width="8" height="8" aria-hidden="true"></canvas>
              <b>${esc(s.name)}</b>
              <span class="sp-check">${SVG('check')}</span>
            </button>`).join('')}
        </div>
      </div>` : ''}
      <button class="btn btn-primary login-submit" type="submit">${SVG('arrow-right')}${isRegister ? '注册并登录' : '登录'}</button>
      <p class="offline-mode-switch">
        <button class="link-inline" type="button" data-offline-mode="${isRegister ? 'login' : 'register'}">${isRegister ? '已有账号？去登录' : '没有账号？注册一个'}</button>
        ${isRegister ? '' : `<span class="offline-switch-dot">·</span><button class="link-inline" type="button" data-forgot-password>忘记密码？</button>`}
      </p>
      ${isRegister ? '' : `<button class="recover-entry" type="button" data-forgot-password>${SVG('shield')}账号找回需要联系作者本人</button>`}
      <p class="field-hint" style="text-align:center;margin-top:8px">登录后可在「切换账号」中继续使用微软 / Xbox 官方登录。</p>`;
  }

  function forgotPasswordHTML() {
    const about = DATA.about || {};
    const authors = (about.authors || []).filter((p) => String(p.qq || '').replace(/\D/g, ''));
    const group = String(about.qqGroup || QQ_GROUP).replace(/\D/g, '');
    return `
      <div class="sub-form-head">
        <button class="sub-back" type="button" data-forgot-back>${SVG('back')}返回登录</button>
        <span class="sub-title">${SVG('shield')}密码找回 <span class="mini-tag">CONTACT</span></span>
      </div>
      <div class="recover-hero">
        <span class="recover-icon">${SVG('key')}</span>
        <h3 id="loginTitle">需要联系作者本人</h3>
        <p>本机账号的密码不会上传，也不会明文保存。忘记密码时，请带上账号名称、UID、注册时间和皮肤，联系作者核对后处理。</p>
      </div>
      <div class="recover-tips">
        <p>${SVG('info')}<span>作者不会索要你的密码，也不会让你把密码发到群里。请只通过下面的 QQ 或官方群联系。</span></p>
      </div>
      <div class="recover-contacts">
        ${authors.map((p) => `<button class="recover-contact" type="button" data-qq="${esc(String(p.qq).replace(/\D/g, ''))}" data-qq-name="${esc(p.name)}"><span class="recover-avatar">${esc(String(p.name || '?').slice(0, 1))}</span><span><b>${esc(p.name)}</b><small>${esc(p.role || '作者')} · QQ ${esc(p.qq)}</small></span>${SVG('chevron')}</button>`).join('')}
        ${group ? `<button class="recover-contact" type="button" data-qq-group="${esc(group)}" data-qq-group-name="官方 QQ 群"><span class="recover-avatar is-group">${SVG('user')}</span><span><b>官方 QQ 群</b><small>群号 ${esc(group)} · 进群联系作者</small></span>${SVG('chevron')}</button>` : ''}
      </div>
      <p class="recover-note">为了确认账号归属，作者可能会要求你提供注册时使用的皮肤、注册时间等信息。请勿提供密码、验证码或任何支付信息。</p>`;
  }

  function switchLoginMethod(method) {
    if (login.submitting) return;
    clearLoginTimer();
    stopMsAuth();
    login.method = method;
    if (method === 'account' && login.accountView !== 'list') login.accountView = 'list';
    renderLoginBody();
    sfx('tap');
  }

  function renderLoginBody() {
    const layer = $('#loginLayer');
    if (!layer) return;
    layer.innerHTML = renderLoginScreen();
    paintSkins(layer);
    const screen = $('.login-screen', layer);
    if (screen) screen.scrollTop = 0;
  }

  function setAccountView(view) {
    if (login.submitting) return;
    stopMsAuth();
    login.method = 'account';
    login.accountView = view;
    renderLoginBody();
    sfx('tap');
  }

  function fieldError(form, name, message) {
    const input = form.elements[name];
    if (!input) return null;
    const field = input.closest('.field');
    if (field) {
      field.classList.add('has-error');
      const err = field.querySelector('.field-error');
      if (err) {
        if (!err.id) err.id = 'err-' + name;
        err.setAttribute('role', 'alert');
        err.textContent = message;
        input.setAttribute('aria-describedby', err.id);
      }
      input.setAttribute('aria-invalid', 'true');
    }
    return input;
  }
  function clearFormErrors(form) {
    $$('.field.has-error', form).forEach(f => {
      f.classList.remove('has-error');
      const input = f.querySelector('input');
      if (input) input.removeAttribute('aria-invalid');
    });
  }
  function validateLoginForm(form) {
    clearFormErrors(form);
    let first = null;
    const fail = (name, msg) => {
      const input = fieldError(form, name, msg);
      if (!first) first = input;
    };
    const isRegister = login.mode === 'register';
    if (login.method === 'phone') {
      const phone = (form.elements.phone.value || '').trim();
      const code = (form.elements.phoneCode.value || '').trim();
      if (!/^1[3-9]\d{9}$/.test(phone)) fail('phone', '请输入正确的 11 位手机号');
      if (!/^\d{6}$/.test(code)) fail('phoneCode', '请输入 6 位数字验证码');
    } else if (login.method === 'qq') {
      const mail = (form.elements.qqMail.value || '').trim();
      const pwd = form.elements.qqPassword.value || '';
      const normalized = /^\d{5,12}$/.test(mail) ? mail + '@qq.com' : mail.toLowerCase();
      if (!/^\d{5,12}@qq\.com$/.test(normalized)) fail('qqMail', '请输入 QQ 号或有效的 @qq.com 邮箱');
      if (pwd.length < 8) fail('qqPassword', '请输入 QQ 邮箱的授权码（16 位）');
    } else if (login.accountView === 'offline') {
      const name = (form.elements.offlineName.value || '').trim();
      const pwd = form.elements.offlinePassword.value || '';
      if (!/^[\u4e00-\u9fa5A-Za-z0-9_]{3,16}$/.test(name)) fail('offlineName', '名称需为 3–16 位中文、字母、数字或下划线');
      if (pwd.length < 8) fail('offlinePassword', '密码至少 8 位');
      if (isRegister) {
        const pwd2 = form.elements.offlinePassword2 ? form.elements.offlinePassword2.value || '' : '';
        if (pwd && pwd2 !== pwd) fail('offlinePassword2', '两次输入的密码不一致');
      }
    } else if (login.accountView === 'microsoft' || login.accountView === 'xbox') {
      /* 设备码流程不使用表单提交 */
      return true;
    }
    if (first) {
      sfx('error');
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      setTimeout(() => first.focus({ preventScroll: false }), 30);
      return null;
    }
    return true;
  }

  function setLoginLoading(btn, label) {
    if (!btn) return;
    if (label == null) {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      if (btn.dataset.originalHtml) {
        btn.innerHTML = btn.dataset.originalHtml;
        delete btn.dataset.originalHtml;
      }
      return;
    }
    if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
    btn.classList.add('is-loading');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>${esc(label)}`;
  }

  function apiErrorMessage(err) {
    if (!err) return '登录失败';
    if (err.code === 'network') return '无法连接账号服务：请先运行 node server/server.js';
    if (err.code === 'network_timeout') return '账号服务响应超时，请稍后重试';
    if (err.code === 'sms_not_configured') return '短信通道未配置，无法发送官方验证码，登录失败';
    if (err.code === 'ms_not_configured') return '微软登录未配置（缺少 MS_CLIENT_ID），登录失败';
    return err.message || '登录失败';
  }

  function sessionFromApi(user) {
    return {
      id: user.id,
      uid: user.uid,
      method: user.method,
      skinId: user.skinId || 'steve',
      loginAt: user.createdAt || Date.now(),
      phone: user.phone || null,
      email: user.email || null,
      username: user.username || null
    };
  }

  function localAccounts() {
    const list = store.get(KEY_LOCAL_ACCOUNTS, []);
    return Array.isArray(list) ? list : [];
  }

  function saveLocalAccounts(list) {
    store.set(KEY_LOCAL_ACCOUNTS, list);
    backupAccounts();
  }

  function localAccountKey(name) {
    return String(name || '').trim().toLowerCase();
  }

  function randomHex(bytes = 16) {
    try {
      const data = new Uint8Array(bytes);
      crypto.getRandomValues(data);
      return Array.from(data, (b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return Math.random().toString(16).slice(2) + Date.now().toString(16);
    }
  }

  async function localPasswordHash(password, salt) {
    const input = `${salt}:${password}`;
    try {
      if (crypto.subtle && crypto.subtle.digest) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
        return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch { /* 回退到简单摘要 */ }
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0') + btoa(unescape(encodeURIComponent(input))).slice(0, 32);
  }

  async function localAccountRegister(name, password, skinId) {
    const key = localAccountKey(name);
    const list = localAccounts();
    if (list.some((item) => item.key === key)) {
      const err = new Error('这个账号已经注册过了，请直接登录');
      err.code = 'name_taken';
      throw err;
    }
    const salt = randomHex(12);
    const account = {
      key,
      name: String(name).trim(),
      salt,
      hash: await localPasswordHash(password, salt),
      uid: 'L' + Date.now().toString(36).toUpperCase() + randomHex(3).toUpperCase(),
      skinId: skinId || 'steve',
      createdAt: Date.now()
    };
    list.push(account);
    saveLocalAccounts(list);
    return {
      uid: account.uid,
      id: account.name,
      method: 'offline',
      local: true,
      premium: false,
      skinId: account.skinId
    };
  }

  async function localAccountLogin(name, password) {
    const key = localAccountKey(name);
    const account = localAccounts().find((item) => item.key === key);
    if (!account) return null;
    if (await localPasswordHash(password, account.salt) !== account.hash) {
      const err = new Error('账号或密码不正确');
      err.code = 'bad_credentials';
      throw err;
    }
    return {
      uid: account.uid,
      id: account.name,
      method: 'offline',
      local: true,
      premium: false,
      skinId: account.skinId
    };
  }

  function applyLocalSession(session) {
    if (typeof WW.setToken === 'function') WW.setToken('');
    state.session = session;
    store.set(KEY_LOCAL_SESSION, session);
    store.set(KEY_SESSION, session);
    loadDailyState();
    login.submitting = false;
    clearLoginTimer();
    showLoginSuccess(session);
  }

  function applySession(payload) {
    if (!payload || !payload.user) {
      toast('账号服务返回数据异常', 'error');
      return;
    }
    if (payload.token && typeof WW.setToken === 'function') WW.setToken(payload.token);
    const session = sessionFromApi(payload.user);
    store.del(KEY_LOCAL_SESSION);
    state.session = session;
    store.set(KEY_SESSION, session);
    loadDailyState();
    login.submitting = false;
    clearLoginTimer();
    showLoginSuccess(session);
  }

  async function handleLoginSubmit(form) {
    if (login.submitting || login.ms) return;
    if (login.method === 'account' && login.accountView !== 'offline') return;
    if (!validateLoginForm(form)) return;
    const btn = form.querySelector('.login-submit');
    const isRegister = login.mode === 'register';
    login.submitting = true;
    const label = login.method === 'phone'
      ? (isRegister ? '正在验证并注册…' : '正在验证验证码…')
      : login.method === 'qq'
        ? '正在向 QQ 邮箱验证…'
        : (isRegister ? '正在创建账号…' : '正在登录…');
    setLoginLoading(btn, label);

    try {
      let payload;
      if (login.method === 'phone') {
        payload = await WW.api('/api/auth/phone/verify', {
          body: {
            phone: form.elements.phone.value.trim(),
            code: form.elements.phoneCode.value.trim(),
            scene: isRegister ? 'register' : 'login'
          }
        });
      } else if (login.method === 'qq') {
        payload = await WW.api('/api/auth/qq/login', {
          body: {
            email: form.elements.qqMail.value.trim(),
            password: form.elements.qqPassword.value
          }
        });
      } else {
        const username = form.elements.offlineName.value.trim();
        const password = form.elements.offlinePassword.value;
        if (isRegister) {
          // 账号密码注册完全在本地完成，不依赖 / 不检测账号服务，注册即登录
          const localSession = await localAccountRegister(username, password, login.skinId);
          applyLocalSession(localSession);
          return;
        }
        const localSession = await localAccountLogin(username, password);
        if (localSession) {
          applyLocalSession(localSession);
          return;
        }
        // 本地没有该账号时，再尝试后台账号（兼容旧版服务端账号）
        payload = await WW.api('/api/auth/local/login', {
          body: { username, password }
        });
      }
      applySession(payload);
    } catch (err) {
      login.submitting = false;
      setLoginLoading(btn, null);
      sfx('error');
      const message = apiErrorMessage(err);
      if (err.code === 'code_invalid' || err.code === 'code_expired' || err.code === 'code_attempts') {
        fieldError(form, 'phoneCode', message);
      } else if (err.code === 'qq_auth_failed') {
        fieldError(form, 'qqPassword', message);
      } else if (err.code === 'name_taken') {
        fieldError(form, 'offlineName', message);
      } else if (err.code === 'bad_credentials') {
        fieldError(form, 'offlinePassword', message);
      } else if (err.code === 'phone_registered') {
        fieldError(form, 'phone', message);
        toast('该手机号已注册，请切到「登录」', 'info', 4000);
        return;
      }
      toast(message, 'error', 4600);
    }
  }

  async function startMsAuth(kind) {
    if (login.submitting) return;
    login.submitting = true;
    login.method = 'account';
    login.accountView = kind;
    login.msCode = randomMixedCode();
    login.allowBack = false;
    const btn = document.querySelector('[data-ms-start]');
    setLoginLoading(btn, '正在申请微软设备码…');
    try {
      const data = await WW.api('/api/auth/ms/start', { body: {} });
      login.submitting = false;
      login.ms = Object.assign({}, data, { kind });
      renderLoginBody();
      sfx('open');
      toast(`设备码 ${data.userCode}，请在微软页面输入`, 'success', 5000);
      msPollLoop();
    } catch (err) {
      login.submitting = false;
      login.allowBack = true;
      if (btn) setLoginLoading(btn, null);
      sfx('error');
      toast(apiErrorMessage(err), 'error', 4600);
    }
  }

  function msSetStatus(text, tone) {
    const el = $('#msStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'ms-status' + (tone ? ' is-' + tone : '');
  }

  function msPollLoop() {
    if (!login.ms) return;
    const interval = Math.max(3, Number(login.ms.interval) || 5) * 1000;
    login.msTimer = setTimeout(async () => {
      if (!login.ms) return;
      const deviceCode = login.ms.deviceCode;
      try {
        const result = await WW.api('/api/auth/ms/poll', { body: { deviceCode } });
        if (!login.ms) return;
        if (result.status === 'ok') {
          stopMsAuth();
          applySession(result);
          return;
        }
        if (result.status === 'expired') {
          stopMsAuth();
          sfx('error');
          renderLoginBody();
          toast('微软授权已过期，请重新获取设备码', 'error', 4200);
          return;
        }
        if (result.status === 'declined') {
          stopMsAuth();
          sfx('error');
          renderLoginBody();
          toast('你取消了微软授权，登录失败', 'warn', 4000);
          return;
        }
        msSetStatus('仍在等待授权…请确认已在微软页面输入代码', 'pending');
        if (result.status === 'slow_down') login.ms.interval = interval / 1000 + 5;
        msPollLoop();
      } catch (err) {
        if (!login.ms) return;
        stopMsAuth();
        sfx('error');
        renderLoginBody();
        toast(apiErrorMessage(err), 'error', 4600);
      }
    }, interval);
  }

  function showLoginSuccess(session) {
    const layer = $('#loginLayer');
    if (!layer) return;
    clearLoginTimer();
    sfx('success');
    layer.innerHTML = `
      <div class="login-success">
        <div class="success-check">${SVG('check')}</div>
        <h2>登录成功</h2>
        <p>世界已经为你准备好，正在返回「我的」。</p>
        <div class="success-account">
          <canvas data-skin-head="${session.skinId}" width="8" height="8"></canvas>
          <div><b>${esc(session.id)}</b><span>${esc(methodLabel(session.method))} · UID ${esc(session.uid)}</span></div>
        </div>
        <div class="success-leaving"><span class="spinner"></span>正在进入世界织卷…</div>
      </div>`;
    paintSkins(layer);
    spawnConfetti(layer);
    setTimeout(() => {
      closeLogin(true);
      setTab('mine');
      renderHome();
      refreshMine(false);
      const panel = document.querySelector('[data-panel="mine"]');
      if (panel) panel.scrollTop = 0;
      toast(`欢迎回来，${session.id}`, 'success', 2600);
    }, 1650);
  }

  function spawnConfetti(layer) {
    const host = layer.querySelector('.login-success');
    if (!host) return;
    const colors = ['#8ada5a', '#f4c44e', '#57d6e8', '#b48cff', '#ff8a5c'];
    for (let i = 0; i < 20; i++) {
      const piece = document.createElement('i');
      piece.className = 'confetti';
      piece.style.left = (12 + Math.random() * 76) + '%';
      piece.style.top = (26 + Math.random() * 20) + '%';
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty('--dx', (Math.random() * 140 - 70) + 'px');
      piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      piece.style.animationDelay = (Math.random() * 0.25) + 's';
      piece.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
      host.appendChild(piece);
    }
  }

  /* ---------------- 退出登录 ---------------- */
  function doLogout() {
    state.session = null;
    state.daily = null;
    quizCurrent = null;
    store.del(KEY_SESSION);
    store.del(KEY_LOCAL_SESSION);
    if (typeof WW.logout === 'function') WW.logout();
    closeSheet();
    setTab('mine');
    renderHome();
    refreshMine(false);
    const panel = document.querySelector('[data-panel="mine"]');
    if (panel) panel.scrollTop = 0;
    toast('已退出登录，世界下次见', 'success');
    sfx('tap');
  }

  /* ---------------- 全局事件 ---------------- */
  function bindEvents() {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);

    /* 所有 http(s) 外链统一交给系统浏览器打开 */
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) return;
      e.preventDefault();
      openBrowserLink(href);
    }, true);

    const input = $('#searchInput');
    if (input) {
      input.addEventListener('input', () => {
        renderSearchPanel();
      });
      input.addEventListener('focus', () => {
        openSearchPanel();
      });
      input.addEventListener('keydown', onSearchKeyDown);
    }

    const permissionAgree = $('#permissionAgree');
    if (permissionAgree) {
      permissionAgree.addEventListener('change', () => {
        const btn = $('#permissionAllow');
        if (btn) btn.disabled = !permissionAgree.checked || permissionState.busy;
      });
    }
    const permissionAllow = $('#permissionAllow');
    if (permissionAllow) permissionAllow.addEventListener('click', allowPermissionsAndEnter);
    const permissionSettings = $('#permissionSettings');
    if (permissionSettings) permissionSettings.addEventListener('click', openAppSettings);
    document.addEventListener('gesturestart', (event) => {
      const target = event.target;
      if (target && typeof target.closest === 'function' && target.closest('input, textarea')) return;
      event.preventDefault();
    }, { passive: false });
    document.addEventListener('touchmove', (event) => {
      if (event.touches && event.touches.length > 1) event.preventDefault();
    }, { passive: false });
    document.addEventListener('wheel', (event) => {
      if (event.ctrlKey) event.preventDefault();
    }, { passive: false });

    const loginLayer = $('#loginLayer');
    loginLayer.addEventListener('click', onLoginClick);
    loginLayer.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLoginSubmit(e.target);
    });
    loginLayer.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if (field) {
        field.classList.remove('has-error');
        e.target.removeAttribute('aria-invalid');
      }
      if (e.target.name === 'phone') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (e.target.name === 'phoneCode') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
    loginLayer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') blockLoginBack();
    });

    document.addEventListener('pointerdown', () => {
      ensureAudio();
      if (state.settings.bgm && !bgmPlaying) applyBgm();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseBgm();
      } else if (state.settings.bgm && !bgmPlaying) {
        applyBgm();
      }
    });
    if (typeof window.addEventListener === 'function') window.addEventListener('pagehide', () => pauseBgm());

    /* 百宝箱：搜索只局部刷新列表，避免输入框失焦 */
    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target.id === 'boxSearch') {
        state.boxQuery = target.value;
        const list = $('#cmdList');
        if (list) list.innerHTML = cmdCardsHTML();
        const count = $('#boxCmdCount');
        const total = state.boxEdition === 'java' ? BOX.javaCommands.length : BOX.bedrockCommands.length;
        if (count) count.textContent = `${filterCommands().length} / ${total}`;
        return;
      }
      if (target.id === 'blockSearch') {
        state.blockQuery = target.value;
        const list = $('#blockList');
        if (list) list.innerHTML = blockRowsHTML();
        const count = $('#boxBlockCount');
        if (count) count.textContent = `${filterBlocks().length} / ${BOX.blocks.length}`;
        return;
      }
      if (target.id === 'complexSearch') {
        state.complexQuery = target.value;
        const list = $('#complexList');
        if (list) list.innerHTML = complexCardsHTML();
        const count = $('#complexCount');
        const total = complexEditionCommands().length;
        if (count) count.textContent = `${filteredComplex().length} / ${total}`;
        return;
      }
      if (target.id === 'resourceSearch') {
        state.resourceQuery = target.value;
        return;
      }
      if (target.id === 'complexInput') {
        onComplexInput();
        return;
      }
      if (target.id === 'pixelSize') {
        pixel.size = Math.max(PIXEL_MIN, Math.min(PIXEL_MAX, Number(target.value) || PIXEL_MIN));
        const out = $('#pixelSizeVal');
        if (out) out.textContent = `${pixel.size} × ${pixel.size}`;
        if (pixelResizeTimer) clearTimeout(pixelResizeTimer);
        pixelResizeTimer = setTimeout(() => { pixelResizeTimer = null; regridPixel(); }, 260);
        return;
      }
      if (target.id === 'pixelPaletteSearch') {
        pixel.paletteQuery = target.value;
        pixel.paletteLimit = 160;
        const groups = $('#pixelPaletteGroups');
        if (groups) groups.innerHTML = pixelPaletteGroupsHTML();
        renderPixelPalette();
        return;
      }
      if (target.id === 'dotText') {
        dot.text = target.value;
        dot.grid = buildDotGrid();
        drawDotPreview();
        return;
      }
      if (target.id === 'dotSize') {
        dot.size = Math.max(DOT_MIN, Math.min(DOT_MAX, Number(target.value) || DOT_MIN));
        const out = $('#dotSizeVal');
        if (out) out.textContent = `${dot.size} × ${dot.size}`;
        if (dotResizeTimer) clearTimeout(dotResizeTimer);
        dotResizeTimer = setTimeout(() => { dotResizeTimer = null; dot.grid = buildDotGrid(); drawDotPreview(); }, 220);
        return;
      }
      if (target.id === 'bgmVolume') {
        setBgmVolume(target.value);
        const label = target.closest('.bgm-volume-row');
        const small = label ? label.querySelector('.field-label small') : null;
        if (small) small.textContent = `${target.value}%`;
        return;
      }
      if (target.id === 'bgmProgress') {
        setBgmPosition(target.value);
        return;
      }
      const form = target.closest ? target.closest('#toolForm') : null;
      if (form) runToolFromForm(form);
    });
    document.addEventListener('change', (e) => {
      if (e.target.id === 'pixelSize') {
        pixel.size = parseInt(e.target.value, 10) || 256;
        pixel.grid = pixel.source ? pixelGridFromImage(pixel.source, pixel.size) : new Uint16Array(pixel.size * pixel.size);
        drawPixelPreview();
        return;
      }
      if (e.target.id === 'pixelDither') {
        pixel.dither = !!e.target.checked;
        if (pixel.source) regridPixel();
        return;
      }
      if (e.target.id === 'dotSize') {
        dot.size = parseInt(e.target.value, 10) || 40;
        dot.grid = buildDotGrid();
        drawDotPreview();
        return;
      }
      if (e.target.id === 'dotBlock') {
        dot.block = e.target.value;
        drawDotPreview();
        return;
      }
      if (e.target.id === 'dotFont') {
        dot.font = DOT_FONTS.some((f) => f.id === e.target.value) ? e.target.value : 'hei';
        dot.grid = buildDotGrid();
        drawDotPreview();
        return;
      }
      if (e.target.id === 'dotDir') {
        dot.direction = e.target.value === 'vertical' ? 'vertical' : 'horizontal';
        drawDotPreview();
        return;
      }
      if (e.target.id === 'musicInstrument') {
        musicInstrument = e.target.value;
        toast(`音符盒音色已切换：${(MUSIC_INSTRUMENTS.find((m) => m.id === musicInstrument) || MUSIC_INSTRUMENTS[0]).name}`, 'success');
        openMusicSheet();
        return;
      }
      if (e.target.id === 'seedEdition') return;
      const form = e.target.closest ? e.target.closest('#toolForm') : null;
      if (form) runToolFromForm(form);
    });
    document.addEventListener('keydown', (e) => {
      if (e.target && e.target.id === 'complexInput') onComplexKeyDown(e);
      if (e.target && e.target.id === 'resourceSearch' && e.key === 'Enter') {
        e.preventDefault();
        state.resourceQuery = e.target.value;
        state.resourceView = 'sites';
        renderResources();
      }
      if (e.target && e.target.id === 'chatInput' && e.key === 'Enter') {
        e.preventDefault();
        sendChat();
      }
    });
    document.addEventListener('submit', (e) => {
      const roleForm = e.target.closest ? e.target.closest('[data-role-form]') : null;
      if (roleForm) {
        e.preventDefault();
        handleRoleSubmit(roleForm);
        return;
      }
      const form = e.target.closest ? e.target.closest('#toolForm') : null;
      if (form) {
        e.preventDefault();
        runToolFromForm(form);
      }
    });
  }

  function onDocumentClick(e) {
    /* 登录层内的交互由 onLoginClick 处理 */
    if (e.target.closest('#loginLayer') && !e.target.closest('[data-copy], [data-open-agreement]')) return;

    const pwdToggle = e.target.closest('[data-toggle-pwd]');
    if (pwdToggle) {
      const wrap = pwdToggle.closest('.input-wrap');
      const input = wrap ? wrap.querySelector('input') : null;
      if (input) {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        pwdToggle.textContent = show ? '隐藏' : '显示';
        pwdToggle.setAttribute('aria-pressed', String(show));
      }
      return;
    }

    const roleCard = e.target.closest('[data-role-card]');
    if (roleCard) {
      const role = roleCard.dataset.roleCard;
      if (roleState.session && roleState.session.role === role) openRolePanel();
      else openRoleLogin(role);
      return;
    }

    const roleTab = e.target.closest('[data-role-tab]');
    if (roleTab) {
      roleState.tab = roleTab.dataset.roleTab;
      openRolePanel();
      return;
    }

    const extractTabBtn = e.target.closest('[data-extract-tab]');
    if (extractTabBtn) {
      extractTab = extractTabBtn.dataset.extractTab;
      renderExtractionSheet();
      return;
    }

    const extractStart = e.target.closest('[data-extract-start]');
    if (extractStart) {
      startExtraction(extractStart.dataset.extractStart);
      return;
    }

    const extractMoveBtn = e.target.closest('[data-extract-move]');
    if (extractMoveBtn) {
      const [dx, dy] = extractMoveBtn.dataset.extractMove.split(',').map(Number);
      extractMove(dx, dy);
      return;
    }

    const extractFinish = e.target.closest('[data-extract-finish]');
    if (extractFinish) { finishExtraction(true); return; }
    const extractFight = e.target.closest('[data-extract-fight]');
    if (extractFight) { fightExtraction(); return; }
    const extractFlee = e.target.closest('[data-extract-flee]');
    if (extractFlee) { fleeExtraction(); return; }

    const extractBuy = e.target.closest('[data-extract-buy]');
    if (extractBuy) { buyExtractGear(extractBuy.dataset.extractBuy); return; }
    const extractEquip = e.target.closest('[data-extract-equip]');
    if (extractEquip) { equipExtractGear(extractEquip.dataset.extractEquip); return; }
    const extractUnequip = e.target.closest('[data-extract-unequip]');
    if (extractUnequip) {
      const data = extractData();
      const gear = data.equipment[extractUnequip.dataset.extractUnequip];
      if (gear) {
        data.stash[gear.id] = (data.stash[gear.id] || 0) + 1;
        delete data.equipment[extractUnequip.dataset.extractUnequip];
        saveEconomy(); renderExtractionSheet();
      }
      return;
    }
    const extractEnchant = e.target.closest('[data-extract-enchant]');
    if (extractEnchant) { enchantExtractSlot(extractEnchant.dataset.extractEnchant); return; }

    const extractSell = e.target.closest('[data-extract-sell]');
    if (extractSell) {
      const data = extractData();
      const id = extractSell.dataset.extractSell;
      if (!data.stash[id] || data.stash[id] <= 0) return;
      const gear = gearById(id);
      const price = gear ? Math.round(gear.price * 0.6) : 20;
      data.stash[id] -= 1;
      if (data.stash[id] <= 0) delete data.stash[id];
      const eNow = currentEconomy();
      eNow.gold += price;
      saveEconomy(); refreshMine(true); renderExtractionSheet();
      toast(`已出售，获得 ${price} 金锭`, 'success');
      return;
    }

    const extractCapacity = e.target.closest('[data-extract-capacity]');
    if (extractCapacity) {
      const data = extractData();
      const eNow = currentEconomy();
      if (data.capacity >= 50) { toast('背包容量已满 50 格', 'info'); return; }
      const cost = 500 + data.capacity * 100;
      if (eNow.gold < cost) { toast('金锭不足', 'warn'); return; }
      eNow.gold -= cost;
      data.capacity = Math.min(50, data.capacity + 5);
      saveEconomy(); refreshMine(true); renderExtractionSheet();
      toast(`背包容量提升到 ${data.capacity} 格`, 'success');
      return;
    }

    const extractBook = e.target.closest('[data-extract-book]');
    if (extractBook) {
      const eNow = currentEconomy();
      const data = extractData();
      if (eNow.gold < 300) { toast('金锭不足', 'warn'); return; }
      eNow.gold -= 300;
      data.books = (data.books || 0) + 1;
      saveEconomy(); refreshMine(true); renderExtractionSheet();
      toast('购买附魔书 ×1', 'success');
      return;
    }

    const shopViewBtn = e.target.closest('[data-shop-view]');
    if (shopViewBtn) {
      shopView = shopViewBtn.dataset.shopView === 'player' ? 'player' : 'official';
      renderShopSheet();
      return;
    }

    const playerBuy = e.target.closest('[data-player-buy]');
    if (playerBuy) {
      buyPlayerListing(playerBuy.dataset.playerBuy);
      return;
    }

    const playerDelist = e.target.closest('[data-player-delist]');
    if (playerDelist) {
      delistPlayerListing(playerDelist.dataset.playerDelist);
      return;
    }

    const bagSell = e.target.closest('[data-bag-sell]');
    if (bagSell) {
      listPlayerShopItem(bagSell.dataset.bagSell);
      return;
    }

    const shopCategoryBtn = e.target.closest('[data-shop-category]');
    if (shopCategoryBtn) {
      shopCategory = shopCategoryBtn.dataset.shopCategory;
      renderShopSheet();
      return;
    }

    const shopBuy = e.target.closest('[data-shop-buy]');
    if (shopBuy) {
      buyShopItem(shopBuy.dataset.shopBuy);
      return;
    }

    const bagUse = e.target.closest('[data-bag-use]');
    if (bagUse) {
      useInventoryItem(bagUse.dataset.bagUse);
      return;
    }

    const gmTab = e.target.closest('[data-gm-tab]');
    if (gmTab) {
      openGmSheet(gmTab.dataset.gmTab);
      return;
    }

    const gmRunBtn = e.target.closest('[data-gm-run]');
    if (gmRunBtn) {
      runGm(gmRunBtn.dataset.gmRun);
      return;
    }

    const gmQuick = e.target.closest('[data-gm-item], [data-gm-entity], [data-gm-effect]');
    if (gmQuick) {
      if (gmQuick.dataset.gmItem) { const el = $('#gmItem'); if (el) el.value = gmQuick.dataset.gmItem; }
      if (gmQuick.dataset.gmEntity) { const el = $('#gmEntity'); if (el) el.value = gmQuick.dataset.gmEntity; }
      if (gmQuick.dataset.gmEffect) { const el = $('#gmEffect'); if (el) el.value = gmQuick.dataset.gmEffect; }
      sfx('tap');
      return;
    }

    const tabBtn = e.target.closest('.tab[data-tab]');
    if (tabBtn) {
      setTab(tabBtn.dataset.tab);
      return;
    }

    if (e.target.closest('#homeAccount')) {
      goToAccount();
      return;
    }

    const gotoBtn = e.target.closest('[data-goto]');
    if (gotoBtn) {
      const tab = gotoBtn.dataset.goto;
      if (tab === 'mine' && gotoBtn.dataset.login === '1' && !state.session) {
        setTab('mine');
        setTimeout(() => openLogin(), 200);
      } else if (tab === 'launchers' && gotoBtn.dataset.focus) {
        focusLauncherSection(gotoBtn.dataset.focus);
      } else {
        setTab(tab);
      }
      return;
    }

    const searchTerm = e.target.closest('[data-search-term], [data-search]');
    if (searchTerm) {
      const term = searchTerm.dataset.searchTerm || searchTerm.dataset.search;
      setTab('home');
      setSearchTerm(term, true);
      return;
    }

    if (e.target.closest('[data-scan-device]')) {
      scanDeviceApps();
      return;
    }

    const deviceOpen = e.target.closest('[data-device-open]');
    if (deviceOpen) {
      launchDeviceApp(deviceOpen.dataset.deviceOpen, deviceOpen.dataset.deviceName);
      return;
    }

    const deviceDownload = e.target.closest('[data-device-download]');
    if (deviceDownload) {
      openDeviceDownload(deviceDownload.dataset.deviceDownload);
      return;
    }

    if (e.target.closest('[data-clear-history]')) {
      state.history = [];
      store.set(KEY_HISTORY, state.history);
      renderSearchPanel();
      toast('搜索历史已清空', 'success');
      return;
    }

    const sr = e.target.closest('[data-sr-type]');
    if (sr) {
      navigateSearchResult(sr.dataset.srType, sr.dataset.srId);
      return;
    }

    const launcher = e.target.closest('[data-launcher]');
    if (launcher) {
      openLauncherDetail(launcher.dataset.launcher);
      return;
    }

    const bedrockVersion = e.target.closest('[data-bedrock-version]');
    if (bedrockVersion) {
      state.bedrockVersion = bedrockVersion.dataset.bedrockVersion;
      openLauncherDetail('bedrock');
      toast(`已选择基岩版 ${state.bedrockVersion}`, 'success');
      return;
    }

    const dl = e.target.closest('[data-download]');
    if (dl) {
      openDownloadSheet();
      return;
    }

    const confirmVersion = e.target.closest('[data-confirm-version]');
    if (confirmVersion) {
      applyBoxVersion(confirmVersion.dataset.versionEdition || state.boxEdition, confirmVersion.dataset.confirmVersion);
      return;
    }

    if (e.target.closest('[data-sheet-close]')) {
      closeSheet();
      return;
    }

    const quizOption = e.target.closest('[data-quiz-option]');
    if (quizOption) {
      selectQuizOption(Number(quizOption.dataset.quizOption), Number(quizOption.dataset.quizOpt));
      return;
    }

    const friendRow = e.target.closest('.friend-row[data-friend-uid]');
    if (friendRow) {
      selectFriend(friendRow.dataset.friendUid);
      return;
    }

    const qqPerson = e.target.closest('[data-qq]');
    if (qqPerson) {
      openPersonQQ(qqPerson.dataset.qq, qqPerson.dataset.qqName);
      return;
    }

    const qqGroup = e.target.closest('[data-qq-group]');
    if (qqGroup) {
      openQQGroupByNumber(qqGroup.dataset.qqGroup, qqGroup.dataset.qqGroupName);
      return;
    }

    const themeChoice = e.target.closest('[data-theme-choice]');
    if (themeChoice) {
      const t = themeById(themeChoice.dataset.themeChoice);
      setTheme(t.id);
      closeSheet();
      refreshMine(true);
      toast(`已切换至「${t.name}」主题`, 'success');
      sfx('success');
      return;
    }

    const skinChoice = e.target.closest('[data-skin-choice]');
    if (skinChoice && state.session) {
      state.session.skinId = skinChoice.dataset.skinChoice;
      store.set(KEY_SESSION, state.session);
      closeSheet();
      renderHome();
      refreshMine(true);
      toast(`已换上「${skinById(state.session.skinId).name}」皮肤`, 'success');
      sfx('success');
      return;
    }

    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      copyText(copyBtn.dataset.copy);
      trackTask('copy');
      return;
    }

    const confirmLogout = e.target.closest('[data-confirm-logout]');
    if (confirmLogout) {
      doLogout();
      return;
    }

    const setting = e.target.closest('[data-setting]');
    const commandRole = e.target.closest('[data-command-role]');
    if (commandRole) {
      if (!commandBoxAllowed(commandRole.dataset.commandRole)) {
        toast('你的权限不足', 'error');
        return;
      }
      commandBoxRole = commandRole.dataset.commandRole;
      renderCommandBox();
      sfx('tap');
      return;
    }

    if (setting) {
      handleSetting(setting.dataset.setting);
      return;
    }

    const toggle = e.target.closest('[data-set-toggle]');
    if (toggle) {
      toggleSetting(toggle.dataset.setToggle);
      return;
    }

    const action = e.target.closest('[data-action]');
    if (action) {
      handleAction(action.dataset.action, action);
      return;
    }

    const agreement = e.target.closest('[data-open-agreement]');
    if (agreement) {
      openAgreementSheet(agreement.dataset.openAgreement);
      return;
    }

    const resourceView = e.target.closest('[data-resource-view]');
    if (resourceView) {
      state.resourceView = resourceView.dataset.resourceView;
      state.resourceQuery = '';
      renderResources();
      sfx('tap');
      return;
    }

    const downloadCat = e.target.closest('[data-download-cat]');
    if (downloadCat) {
      state.downloadCat = downloadCat.dataset.downloadCat;
      renderResources();
      sfx('tap');
      return;
    }

    const serverRegion = e.target.closest('[data-server-region]');
    if (serverRegion) {
      state.serverRegion = serverRegion.dataset.serverRegion;
      renderResources();
      sfx('tap');
      return;
    }

    if (e.target.closest('[data-resource-search-go]')) {
      const input = $('#resourceSearch');
      state.resourceQuery = input ? input.value : state.resourceQuery;
      state.resourceView = 'sites';
      renderResources();
      sfx('tap');
      return;
    }

    const cat = e.target.closest('[data-cat]');
    if (cat) {
      state.resourceFilter = cat.dataset.cat;
      renderResources(true);
      sfx('tap');
      return;
    }

    const boxCommandMode = e.target.closest('[data-box-command-mode]');
    if (boxCommandMode) {
      state.commandMode = boxCommandMode.dataset.boxCommandMode === 'complex' ? 'complex' : 'search';
      renderBox();
      if (state.commandMode === 'complex' && state.complexCode) runComplexCheck();
      sfx('tap');
      return;
    }

    const boxMode = e.target.closest('[data-box-mode]');
    if (boxMode) {
      state.boxMode = boxMode.dataset.boxMode;
      renderBox();
      if (state.boxMode === 'complex' && state.complexCode) runComplexCheck();
      sfx('tap');
      return;
    }

    const boxEdition = e.target.closest('[data-box-edition]');
    if (boxEdition) {
      if (state.boxEdition !== boxEdition.dataset.boxEdition) {
        state.boxEdition = boxEdition.dataset.boxEdition;
        state.boxCat = '全部';
        state.boxQuery = '';
        state.complexCat = '全部';
        state.complexQuery = '';
        renderBox();
        if (state.boxMode === 'complex' && state.complexCode) runComplexCheck();
      }
      sfx('tap');
      return;
    }

    const boxVersion = e.target.closest('[data-box-version]');
    if (boxVersion) {
      openVersionConfirm(state.boxEdition, boxVersion.dataset.boxVersion);
      return;
    }

    const boxCat = e.target.closest('[data-box-cat]');
    if (boxCat) {
      state.boxCat = boxCat.dataset.boxCat;
      renderBox(true);
      sfx('tap');
      return;
    }

    const complexCat = e.target.closest('[data-complex-cat]');
    if (complexCat) {
      state.complexCat = complexCat.dataset.complexCat;
      renderBox(true);
      sfx('tap');
      return;
    }

    const complexLoad = e.target.closest('[data-complex-load]');
    if (complexLoad) {
      loadComplexTemplate(complexLoad.dataset.complexLoad);
      return;
    }

    const complexAct = e.target.closest('[data-complex-action]');
    if (complexAct) {
      complexAction(complexAct.dataset.complexAction);
      return;
    }

    const complexSuggest = e.target.closest('[data-complex-suggest]');
    if (complexSuggest) {
      applyComplexSuggestion(parseInt(complexSuggest.dataset.complexSuggest, 10) || 0);
      return;
    }

    const bgmTrack = e.target.closest('[data-bgm-track]');
    if (bgmTrack) {
      setBgmTrack(bgmTrack.dataset.bgmTrack);
      return;
    }

    const storageFilter = e.target.closest('[data-storage-filter]');
    if (storageFilter) {
      state.storageFilter = storageFilter.dataset.storageFilter === 'all' ? 'all' : 'apk';
      $$('[data-storage-filter]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.storageFilter === state.storageFilter));
      renderStorageSheet();
      sfx('tap');
      return;
    }

    const storageOpen = e.target.closest('[data-storage-open]');
    if (storageOpen) {
      openStorageFile(storageOpen.dataset.storageOpen, storageOpen.dataset.storageName);
      return;
    }

    const historyTabBtn = e.target.closest('[data-history-tab]');
    if (historyTabBtn) {
      openHistorySheet(historyTabBtn.dataset.historyTab);
      return;
    }
    const historyClear = e.target.closest('[data-history-clear]');
    if (historyClear) {
      const kind = historyClear.dataset.historyClear === 'export' ? 'export' : 'generate';
      saveActivity(activityEntries().filter((entry) => entry.kind !== kind));
      openHistorySheet(kind);
      toast('历史记录已清空', 'success');
      return;
    }
    const historyOpen = e.target.closest('[data-history-open]');
    if (historyOpen) {
      checkHistoryFile(historyOpen.dataset.historyOpen);
      return;
    }

    const pixelGroup = e.target.closest('[data-pixel-group]');
    if (pixelGroup) {
      pixel.paletteGroup = pixelGroup.dataset.pixelGroup;
      pixel.paletteQuery = '';
      pixel.paletteLimit = 120;
      const search = $('#pixelPaletteSearch');
      if (search) search.value = '';
      const groups = $('#pixelPaletteGroups');
      if (groups) groups.innerHTML = pixelPaletteGroupsHTML();
      renderPixelPalette();
      sfx('tap');
      return;
    }

    const pixelBulkBtn = e.target.closest('[data-pixel-bulk]');
    if (pixelBulkBtn) {
      pixelBulk(pixelBulkBtn.dataset.pixelBulk);
      return;
    }

    const pixelBlock = e.target.closest('[data-pixel-block]');
    if (pixelBlock) {
      const idx = Number(pixelBlock.dataset.pixelBlock);
      if (pixel.enabled.has(idx)) {
        if (pixel.enabled.size <= 1) { toast('至少保留一种方块', 'warn'); return; }
        pixel.enabled.delete(idx);
      } else {
        pixel.enabled.add(idx);
      }
      $$('[data-pixel-block]', $('#pixelPalette')).forEach((btn) => {
        const active = pixel.enabled.has(Number(btn.dataset.pixelBlock));
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      const count = $('#pixelPaletteCount');
      if (count) count.textContent = `已启用 ${pixel.enabled.size} / ${PIXEL_BLOCKS.length} 种`;
      if (pixel.source) {
        if (pixelPaletteTimer) clearTimeout(pixelPaletteTimer);
        pixelPaletteTimer = setTimeout(() => { pixelPaletteTimer = null; regridPixel(); }, 160);
      } else {
        drawPixelPreview();
      }
      sfx('tap');
      return;
    }

    const pixelAct = e.target.closest('[data-pixel-action]');
    if (pixelAct) {
      pixelAction(pixelAct.dataset.pixelAction);
      return;
    }

    const dotAct = e.target.closest('[data-dot-action]');
    if (dotAct) {
      dotAction(dotAct.dataset.dotAction);
      return;
    }

    const toolCard = e.target.closest('[data-tool]');
    if (toolCard) {
      openToolSheet(toolCard.dataset.tool);
      return;
    }

    /* 点击搜索框外部时收起结果 */
    if (!e.target.closest('#searchWrap')) closeSearchPanel();
  }

  function handleAction(action, el) {
    if (action === 'login-role') {
      const role = el.dataset.role;
      closeLogin(true);
      setTimeout(() => openRoleLogin(role), 280);
    } else if (action === 'run-command-box') {
      runCommandBox();
    } else if (action === 'clear-command-box') {
      const input = $('#commandInput');
      if (input) input.value = '';
      const out = $('#commandOutput');
      if (out) out.textContent = '等待指令…';
    } else if (action === 'open-extraction') {
      openExtractionSheet();
    } else if (action === 'open-shop') {
      openShopSheet();
    } else if (action === 'open-bag') {
      openBagSheet();
    } else if (action === 'open-name-change') {
      openNameChangeSheet();
    } else if (action === 'exchange-gold') {
      exchangeGoldForDiamond();
    } else if (action === 'upgrade-super') {
      upgradeAdminToSuper();
    } else if (action === 'role-gm') {
      openGmSheet();
    } else if (action === 'role-add-super') {
      openRoleCreate('super');
    } else if (action === 'role-add-admin') {
      openRoleCreate('admin');
    } else if (action === 'role-add-blacklist') {
      openRoleBlacklistForm();
    } else if (action === 'role-panel') {
      openRolePanel();
    } else if (action === 'role-logout') {
      roleLogout();
    } else if (action === 'role-delete') {
      roleDelete(el.dataset.roleTarget, el.dataset.roleId);
    } else if (action === 'role-delete-confirm') {
      roleDeleteConfirm(el.dataset.roleTarget, el.dataset.roleId);
    } else if (action === 'role-reset-key') {
      roleResetKey(el.dataset.roleId);
    } else if (action === 'role-reset-password') {
      openRoleResetPassword(el.dataset.roleTarget, el.dataset.roleId);
    } else if (action === 'role-blacklist-remove') {
      roleState.data.blacklist = roleState.data.blacklist.filter((item) => item.id !== el.dataset.blacklistId);
      saveRoleData();
      openRolePanel();
      toast('已从黑名单移除', 'success');
    } else if (action === 'login') {
      setTab('mine');
      openLogin({ mode: 'login' });
    } else if (action === 'register') {
      setTab('mine');
      openLogin({ method: 'account', account: 'offline', mode: 'register' });
    } else if (action === 'login-offline') {
      setTab('mine');
      openLogin({ method: 'account', account: 'offline', mode: 'register' });
    } else if (action === 'switch-account') {
      openLogin({ allowBack: true, mode: 'login' });
    } else if (action === 'logout') {
      openLogoutConfirm();
    } else if (action === 'change-skin') {
      openSkinSheet();
    } else if (action === 'open-settings' || action === 'scroll-settings') {
      openSettingsSheet();
    } else if (action === 'choose-export-path') {
      if (typeof window.showDirectoryPicker === 'function') chooseExportPath();
      else saveExportPathName();
    } else if (action === 'reset-export-path') {
      resetExportPath();
    } else if (action === 'checkin') {
      checkIn();
    } else if (action === 'daily-tasks') {
      openDailyTasksSheet();
    } else if (action === 'refresh-tasks') {
      refreshDailyTasks();
    } else if (action === 'daily-quiz') {
      openQuizSheet();
    } else if (action === 'friends') {
      openFriendsSheet();
    } else if (action === 'add-friend') {
      addFriend();
    } else if (action === 'remove-friend') {
      removeFriend(el.dataset.friendUid);
    } else if (action === 'send-chat') {
      sendChat();
    } else if (action === 'claim-task') {
      claimTask(el.dataset.taskId);
    } else if (action === 'submit-quiz') {
      submitQuiz();
    } else if (action === 'open-seed-map') {
      openSeedMap();
    } else if (action === 'import-bgm') {
      const file = $('#bgmFile');
      if (file) file.click();
    } else if (action === 'remove-bgm') {
      removeCustomMusic();
    } else if (action === 'open-storage') {
      openStorageSheet();
    } else if (action === 'scan-storage') {
      scanStorageFiles();
    } else if (action === 'refresh-download-path') {
      refreshDownloadPath(true).then(updatePathDisplays);
    } else if (action === 'check-update') {
      openUpdateSheet();
    } else if (action === 'download-update') {
      downloadAppUpdate();
    } else if (action === 'install-update') {
      installDownloadedUpdate();
    } else if (action === 'open-qq-group') {
      openQQGroupFriend();
    } else if (action === 'copy-id' && state.session) {
      copyText(state.session.id);
    }
  }

  async function openQQGroupByNumber(group, name) {
    const uin = String(group || '').replace(/\D/g, '');
    if (!uin) { toast('群号待补充', 'warn'); return; }
    sfx('tap');
    toast(`正在打开${name || 'QQ 群'} ${uin}…`, 'info', 2400);
    let channel = 'web';
    try {
      channel = await WW.openQQGroup(uin);
    } catch { channel = 'web'; }
    if (channel === 'web') {
      copyText(uin);
      toast(`未检测到 QQ 客户端，群号 ${uin} 已复制`, 'warn', 5200);
    }
  }

  function openQQGroupFriend() {
    return openQQGroupByNumber(QQ_GROUP, '官方 QQ 群');
  }

  const COMMAND_BOX_LABEL = { owner: 'APP主人', super: '超级管理员', admin: '管理员' };
  let commandBoxRole = '';

  function commandBoxAllowed(role) {
    const current = roleState.session.role;
    if (current === 'owner') return true;
    if (current === 'super') return role === 'super' || role === 'admin';
    if (current === 'admin') return role === 'admin';
    return false;
  }

  function openCommandBox(role = roleState.session.role) {
    const current = roleState.session.role;
    if (!current) {
      toast('你的权限不足：请先在设置顶部登录角色账号', 'error', 4600);
      openSheet(`<div class="command-denied"><span>${SVG('shield')}</span><b>你的权限不足</b><p>指令盒只对 APP主人、超级管理员、管理员开放。普通玩家无法使用。</p><button class="btn btn-primary btn-sm" type="button" data-action="open-settings">返回设置</button></div>`, { title: '指令盒', sub: '权限校验' });
      return;
    }
    commandBoxRole = commandBoxAllowed(role) ? role : current;
    renderCommandBox();
  }

  function renderCommandBox() {
    const current = roleState.session.role;
    const tabs = ['owner', 'super', 'admin'].filter((role) => commandBoxAllowed(role));
    openSheet(`
      <div class="command-box">
        <div class="command-tabs">${tabs.map((role) => `<button class="command-tab ${commandBoxRole === role ? 'is-active' : ''}" type="button" data-command-role="${role}">${COMMAND_BOX_LABEL[role]}指令盒</button>`).join('')}</div>
        <div class="command-banner"><span>${SVG('terminal')}</span><div><b>${COMMAND_BOX_LABEL[commandBoxRole]}指令盒</b><small>作用于当前登录的主 APP 账号 · 支持货币 / 经验 / 官方商店</small></div></div>
        <textarea id="commandInput" class="command-input" rows="5" placeholder="每行一条指令，例如：&#10;加货币金锭 1000&#10;加经验 5级&#10;上架 限定钻石剑 10 500"></textarea>
        <div class="command-actions"><button class="btn btn-primary btn-sm" type="button" data-action="run-command-box">${SVG('terminal')}执行指令</button><button class="btn btn-ghost btn-sm" type="button" data-action="clear-command-box">清空</button></div>
        <pre class="command-output" id="commandOutput">等待指令…</pre>
        <p class="download-note">支持：加/减货币金锭/钻石 数量；加/减经验 几级；加/减经验值 数量；加/减商店货物 编号 数量；上架 名称 数量 价格；下架 编号 数量。错误会逐行提示。</p>
      </div>
    `, { title: '指令盒', sub: `${COMMAND_BOX_LABEL[commandBoxRole]} · ${current === 'owner' ? '最高权限' : '角色权限'}` });
  }

  function runCommandBox() {
    const input = $('#commandInput');
    const out = $('#commandOutput');
    if (!input || !out) return;
    if (!commandBoxAllowed(commandBoxRole)) {
      out.textContent = '错误：你的权限不足，无法执行这条指令。';
      return;
    }
    if (!state.session) {
      out.textContent = '错误：请先登录主 APP 账号，指令盒需要一个货币账户作为目标。';
      return;
    }
    const lines = input.value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) { out.textContent = '错误：请输入至少一条指令。'; return; }
    const results = lines.map((line) => executeBoxCommand(line));
    out.textContent = results.join('\n');
    refreshMine(true);
  }

  function executeBoxCommand(line) {
    const text = String(line || '').replace(/[，,]/g, ' ').replace(/\s+/g, ' ').trim();
    const uid = state.session.uid;
    if (commandBoxRole === 'admin' && /(商店货物|上架|下架)/.test(text)) {
      return '✗ 管理员不能上架 / 下架官方商店货物，只能使用货币与经验指令';
    }
    let m;
    try {
      if ((m = text.match(/^(加|减)货币(金锭|钻石)\s+(\d+)$/))) {
        const delta = (m[1] === '加' ? 1 : -1) * Math.max(0, Number(m[3]));
        const kind = m[2] === '金锭' ? 'gold' : 'diamond';
        const e = currentEconomy();
        if (delta < 0 && !e) throw new Error('没有货币账户');
        if (delta < 0 && (kind === 'gold' ? e.gold : e.diamonds) < Math.abs(delta)) throw new Error(`${m[2]}不足，当前只有 ${kind === 'gold' ? e.gold : e.diamonds}`);
        addCurrency(kind, delta, '指令盒', uid);
        return `✓ ${m[1]}${m[2]} ${m[3]}`;
      }
      if ((m = text.match(/^(加|减)经验\s+(\d+)\s*级?$/))) {
        const delta = (m[1] === '加' ? 1 : -1) * Math.max(0, Number(m[2]));
        const xp = gmLevelChange(uid, delta);
        setXpForUid(uid, xp);
        return `✓ ${m[1]}经验 ${m[2]} 级 → LV.${levelFromXp(xp).level}`;
      }
      if ((m = text.match(/^(加|减)经验值\s+(\d+)$/))) {
        const delta = (m[1] === '加' ? 1 : -1) * Math.max(0, Number(m[2]));
        const xp = Math.max(0, Math.min(MAX_XP, xpForUid(uid) + delta));
        setXpForUid(uid, xp);
        return `✓ ${m[1]}经验值 ${m[2]} → ${xp} EXP`;
      }
      if ((m = text.match(/^(加|减)商店货物\s+(\S+)\s+(\d+)$/))) {
        const item = shopItem(m[2]);
        if (!item) throw new Error(`找不到商品编号 ${m[2]}`);
        const stock = shopStockOf(item);
        const qty = Math.max(0, Number(m[3]));
        if (m[1] === '减') {
          if (stock !== Infinity && stock < qty) throw new Error(`库存不足，当前 ${stock}`);
          shopState.stock[item.id] = stock === Infinity ? 0 : stock - qty;
        } else {
          shopState.stock[item.id] = stock === Infinity ? qty : stock + qty;
        }
        saveShopState();
        return `✓ ${m[1]}商店货物 ${item.id} ${qty}，当前库存 ${shopStockOf(item) === Infinity ? '不限量' : shopState.stock[item.id]}`;
      }
      if ((m = text.match(/^上架\s+(.+?)\s+(\d+)\s+(\d+)$/))) {
        const name = m[1].trim();
        if (!name) throw new Error('商品名称不能为空');
        const qty = Math.max(1, Number(m[2]));
        const price = Math.max(1, Number(m[3]));
        const id = 'custom_' + randomHex(5);
        shopState.custom.push({ id, name, desc: '官方指令盒上架', priceGold: price, priceDiamonds: 0, stock: qty });
        shopState.stock[id] = qty;
        saveShopState();
        return `✓ 已上架 ${name}（${id}）库存 ${qty}，价格 ${price} 金锭`;
      }
      if ((m = text.match(/^下架\s+(\S+)\s+(\d+)$/))) {
        const item = shopItem(m[1]);
        if (!item) throw new Error(`找不到商品编号 ${m[1]}`);
        const qty = Math.max(1, Number(m[2]));
        const stock = shopStockOf(item);
        if (stock !== Infinity && stock < qty) throw new Error(`库存不足，当前 ${stock}`);
        const next = stock === Infinity ? 0 : stock - qty;
        if (next <= 0) {
          if (shopState.custom.some((entry) => entry.id === item.id)) {
            shopState.custom = shopState.custom.filter((entry) => entry.id !== item.id);
            delete shopState.stock[item.id];
          } else {
            shopState.stock[item.id] = 0;
          }
        } else {
          shopState.stock[item.id] = next;
        }
        saveShopState();
        return `✓ 已下架 ${item.id} ${qty}，剩余 ${next <= 0 ? '已售罄 / 移除' : next}`;
      }
      throw new Error('无法识别的指令，请检查空格与关键词');
    } catch (error) {
      return `✗ ${error.message}`;
    }
  }

  function handleSetting(key) {
    if (key === 'command-box') {
      openCommandBox();
    } else if (key === 'theme') {
      openThemeSheet();
    } else if (key === 'bgm') {
      openBgmSheet();
    } else if (key === 'clear-search') {
      state.history = [];
      store.set(KEY_HISTORY, state.history);
      toast('搜索历史已清空', 'success');
      sfx('tap');
    } else if (key === 'history') {
      openHistorySheet('generate');
    } else if (key === 'export-path') {
      openExportPathSheet();
    } else if (key === 'storage') {
      openStorageSheet();
    } else if (key === 'permissions') {
      closeSheet();
      openPermissionGate();
    } else if (key === 'other-apps') {
      openOtherAppsSheet();
    } else if (key === 'about-us') {
      openAboutUsSheet();
    } else if (key === 'sponsor-us') {
      openSponsorSheet();
    } else if (key === 'about-app') {
      openUpdateSheet();
    } else if (key === 'admin-console') {
      openAdminConsole();
    }
  }

  function onLoginClick(e) {
    const msCodeOpen = e.target.closest('[data-ms-code-open]');
    if (msCodeOpen) {
      if (!login.ms) { toast('授权信息尚未准备好，请稍候', 'warn'); return; }
      copyText(login.msCode || '', false);
      openBrowserLink(login.ms.verificationUri || 'https://www.microsoft.com/link');
      toast('验证码已复制，请在官方页面完成登录', 'success', 4600);
      return;
    }

    const roleLogin = e.target.closest('[data-action="login-role"]');
    if (roleLogin) {
      const role = roleLogin.dataset.role;
      closeLogin(true);
      setTimeout(() => openRoleLogin(role), 280);
      return;
    }

    const back = e.target.closest('[data-login-back]');
    if (back) {
      if (login.allowBack || state.session) closeLogin(true);
      else blockLoginBack();
      return;
    }

    const modeBtn = e.target.closest('[data-auth-mode]');
    if (modeBtn) {
      if (login.submitting) return;
      const mode = modeBtn.dataset.authMode === 'register' ? 'register' : 'login';
      if (mode === login.mode) return;
      login.mode = mode;
      stopMsAuth();
      clearLoginTimer();
      login.accountView = 'list';
      renderLoginBody();
      sfx('tap');
      return;
    }

    const method = e.target.closest('[data-login-method]');
    if (method) {
      switchLoginMethod(method.dataset.loginMethod);
      return;
    }

    const accountMethod = e.target.closest('[data-account-method]');
    if (accountMethod) {
      setAccountView(accountMethod.dataset.accountMethod);
      return;
    }

    if (e.target.closest('[data-account-list]')) {
      setAccountView('list');
      return;
    }

    const offlineMode = e.target.closest('[data-offline-mode]');
    if (offlineMode) {
      login.mode = offlineMode.dataset.offlineMode === 'register' ? 'register' : 'login';
      login.accountView = 'offline';
      renderLoginBody();
      sfx('tap');
      return;
    }

    if (e.target.closest('[data-forgot-password]')) {
      login.mode = 'login';
      login.accountView = 'forgot';
      renderLoginBody();
      sfx('open');
      return;
    }

    if (e.target.closest('[data-forgot-back]')) {
      login.accountView = 'offline';
      login.mode = 'login';
      renderLoginBody();
      sfx('back');
      return;
    }

    const recoverQQ = e.target.closest('[data-qq]');
    if (recoverQQ) {
      openPersonQQ(recoverQQ.dataset.qq, recoverQQ.dataset.qqName);
      return;
    }

    const recoverGroup = e.target.closest('[data-qq-group]');
    if (recoverGroup) {
      openQQGroupByNumber(recoverGroup.dataset.qqGroup, recoverGroup.dataset.qqGroupName);
      return;
    }

    const skinPick = e.target.closest('[data-skin-pick]');
    if (skinPick) {
      login.skinId = skinPick.dataset.skinPick;
      $$('.skin-option[data-skin-pick]', $('#loginLayer')).forEach(btn => {
        btn.classList.toggle('is-selected', btn.dataset.skinPick === login.skinId);
      });
      sfx('tap');
      return;
    }

    const sendCode = e.target.closest('[data-send-code]');
    if (sendCode) {
      sendPhoneCode(sendCode);
      return;
    }

    const msStart = e.target.closest('[data-ms-start]');
    if (msStart) {
      startMsAuth(msStart.dataset.msStart);
      return;
    }

    const msCancel = e.target.closest('[data-ms-cancel]');
    if (msCancel) {
      stopMsAuth();
      renderLoginBody();
      toast('已取消微软授权', 'warn');
      return;
    }

    const openUrl = e.target.closest('[data-open-url]');
    if (openUrl) {
      openBrowserLink(openUrl.dataset.openUrl);
      return;
    }

    const pwdToggle = e.target.closest('[data-toggle-pwd]');
    if (pwdToggle) {
      const wrap = pwdToggle.closest('.input-wrap');
      const input = wrap ? wrap.querySelector('input') : null;
      if (input) {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        pwdToggle.textContent = show ? '隐藏' : '显示';
        pwdToggle.setAttribute('aria-pressed', String(show));
      }
      return;
    }

    const agreement = e.target.closest('[data-open-agreement]');
    if (agreement) {
      openAgreementSheet(agreement.dataset.openAgreement);
      return;
    }

    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      copyText(copyBtn.dataset.copy);
    }
  }

  async function sendPhoneCode(btn) {
    const form = $('#loginForm');
    if (!form) return;
    const input = form.elements.phone;
    const phone = (input.value || '').trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      fieldError(form, 'phone', '请先输入正确的 11 位手机号');
      sfx('error');
      input.focus();
      return;
    }
    if (btn.disabled) return;
    const field = input.closest('.field');
    if (field) field.classList.remove('has-error');

    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '正在发送…';

    try {
      const data = await WW.api('/api/auth/phone/code', {
        body: { phone, scene: login.mode === 'register' ? 'register' : 'login' }
      });
      toast(`验证码已发送至 ${phone.slice(0, 3)}****${phone.slice(-4)}，请查收短信`, 'success', 3800);
      if (data && data.devCode) {
        toast(`开发模式验证码：${data.devCode}`, 'warn', 6000);
      }
      sfx('tap');
      clearLoginTimer();
      login.countdown = 60;
      btn.textContent = '60s 后重发';
      const codeInput = form.elements.phoneCode;
      if (codeInput) codeInput.focus();
      login.codeTimer = setInterval(() => {
        login.countdown -= 1;
        if (login.countdown <= 0) {
          clearInterval(login.codeTimer);
          login.codeTimer = null;
          btn.disabled = false;
          btn.textContent = '重新获取';
        } else {
          btn.textContent = login.countdown + 's 后重发';
        }
      }, 1000);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = original;
      sfx('error');
      toast(apiErrorMessage(err), 'error', 5200);
    }
  }

  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      if (!$('#loginLayer').hidden) {
        if (login.allowBack || state.session) closeLogin(true);
        else blockLoginBack();
        return;
      }
      if (state.sheetOpen) { closeSheet(); return; }
      closeSearchPanel();
      const input = $('#searchInput');
      if (input) input.blur();
    }
    if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
      e.preventDefault();
      if (!$('#loginLayer').hidden) return;
      setTab('home');
      setTimeout(() => {
        const input = $('#searchInput');
        if (input) {
          input.focus();
          input.select();
          openSearchPanel();
        }
      }, 120);
    }
  }

  function onSearchKeyDown(e) {
    const panel = $('#searchPanel');
    if (!panel || panel.hidden) {
      if (e.key === 'ArrowDown') openSearchPanel();
      return;
    }
    if (e.key === 'Escape') {
      closeSearchPanel();
      e.currentTarget.blur();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!state.searchResults.length) return;
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      state.searchCursor = (state.searchCursor + delta + state.searchResults.length) % state.searchResults.length;
      const items = $$('.sr-item', panel);
      items.forEach((el, i) => {
        const on = i === state.searchCursor;
        el.classList.toggle('is-cursor', on);
        el.setAttribute('aria-selected', String(on));
      });
      const active = items[state.searchCursor];
      if (active) active.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.searchResults.length) {
        const idx = state.searchCursor >= 0 ? state.searchCursor : 0;
        const r = state.searchResults[idx];
        if (r) navigateSearchResult(r.type, r.id);
      }
    }
  }

  /* ---------------- 进入动画 ---------------- */
  function initSplash() {
    const splash = $('#splash');
    const app = $('#app');
    if (!splash || !app) return;
    app.classList.add('is-booting');
    app.setAttribute('aria-hidden', 'true');
    app.setAttribute('inert', '');

    const starHost = $('#splashStars');
    if (starHost) {
      let html = '';
      for (let i = 0; i < 44; i++) {
        const top = Math.random() * 62;
        const left = Math.random() * 100;
        const delay = (Math.random() * 4).toFixed(2);
        const dur = (2.6 + Math.random() * 3.4).toFixed(2);
        const op = (0.15 + Math.random() * 0.65).toFixed(2);
        html += `<i style="top:${top}%;left:${left}%;animation-delay:-${delay}s;animation-duration:${dur}s;opacity:${op}"></i>`;
      }
      starHost.innerHTML = html;
    }

    const bar = $('#splashBar');
    const pct = $('#splashPct');
    const status = $('#splashStatus');
    const progressEl = $('#splashProgress');
    const stages = [
      { at: 0, text: '正在唤醒织卷…' },
      { at: 7, text: '校验本地运行环境…' },
      { at: 16, text: '加载本地设置…' },
      { at: 28, text: '生成地形与群系…' },
      { at: 40, text: '种植第一棵树…' },
      { at: 52, text: '点亮第一支火把…' },
      { at: 64, text: '准备本地账号…' },
      { at: 78, text: '装载启动器与资源…' },
      { at: 90, text: '整理资源站点与皮肤…' },
      { at: 97, text: '世界生成完毕，正在进入…' }
    ];
    const reduce = !state.settings.motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (new URLSearchParams(location.search).has('skip')) {
      splash.classList.add('is-out');
      app.classList.remove('is-booting');
      app.classList.add('is-ready');
      app.removeAttribute('aria-hidden');
      app.removeAttribute('inert');
      setTimeout(() => {
        splash.remove();
        showPermissionGateIfNeeded();
      }, 30);
      return;
    }

    /* 进入动画时长：默认 12 秒，带百分比；只有到 100% 才允许进入 */
    const duration = reduce ? 1200 : 12000;
    const START_DELAY = reduce ? 0 : 400;
    let started = performance.now() + START_DELAY;
    let done = false;
    let raf = null;
    let serverDone = false;

    function setProgress(value) {
      const v = Math.max(0, Math.min(100, Math.round(value)));
      if (bar) bar.style.width = v + '%';
      if (pct) pct.textContent = v + '%';
      if (progressEl) {
        progressEl.setAttribute('aria-valuenow', String(v));
        progressEl.setAttribute('aria-valuetext', v + '%');
      }
    }
    function setStatusByProgress(v) {
      let current = stages[0].text;
      for (const s of stages) if (v >= s.at) current = s.text;
      if (status && status.textContent !== current) status.textContent = current;
    }

    async function checkServer() {
      if (serverDone) return;
      serverDone = true;
      if (typeof WW.health !== 'function') return;
      try {
        const info = await WW.health();
        state.server = info || false;
        if (status) {
          status.textContent = info
            ? '账号服务已连接…'
            : '账号服务未连接，本地账号仍可使用…';
        }
      } catch { /* 忽略 */ }
    }

    function finish(instant) {
      if (done) return;
      done = true;
      if (raf) cancelAnimationFrame(raf);
      setProgress(100);
      if (status) status.textContent = '世界已就绪';
      splash.classList.add('is-out');
      app.classList.remove('is-booting');
      app.classList.add('is-ready');
      app.removeAttribute('aria-hidden');
      app.removeAttribute('inert');
      setTimeout(() => {
        splash.remove();
        showPermissionGateIfNeeded();
      }, instant ? 30 : 700);
    }
    function tick(now) {
      if (done) return;
      const elapsed = now - started;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const t = Math.min(1, elapsed / duration);
      // 缓动：前慢后快再收尾，避免百分比跳变
      const eased = 1 - Math.pow(1 - t, 2.2);
      const v = eased * 100;
      setProgress(v);
      setStatusByProgress(v);
      if (!serverDone && v >= 64) checkServer();
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => finish(false), 700);
      }
    }
    raf = requestAnimationFrame(tick);
  }

  /* ---------------- 初始化 ---------------- */
  async function restoreSession() {
    if (typeof WW.me !== 'function') return;
    if (!WW.getToken()) {
      const local = store.get(KEY_LOCAL_SESSION, null);
      if (local && local.uid) {
        state.session = local;
        store.set(KEY_SESSION, local);
        loadDailyState();
        renderHomeAccount();
        refreshMine(false);
      }
      return;
    }
    if (!state.session) return;
    const user = await WW.me();
    if (user) {
      state.session = sessionFromApi(user);
      store.set(KEY_SESSION, state.session);
      loadDailyState();
      renderHomeAccount();
      refreshMine(false);
      return;
    }
    // 服务端已判定令牌失效（me() 在 401 时会清掉令牌）→ 同步清掉本地登录态，避免“假登录”
    if (!WW.getToken()) {
      state.session = null;
      state.daily = null;
      store.del(KEY_SESSION);
      renderHome();
      refreshMine(false);
    }
  }

  function init() {
    applySettings();
    restoreAccountsFromBackup();
    roleValidateSession();
    backupAccounts();
    if (state.session) loadDailyState();
    refreshDownloadPath(false).then(updatePathDisplays);
    restoreCustomMusic();
    buildSearchIndex();
    renderHome();
    renderLaunchers();
    renderResources();
    renderBox();
    renderMine();
    bindEvents();
    restoreSession();
    initSplash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
