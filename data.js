/* =========================================================
   世界织卷APP · 数据层
   所有启动器 / 资源站信息均为公开官网地址，点击即在浏览器打开。
   ========================================================= */

window.APP_DATA = {
  version: '2.0.3',

  /* ---------------- 关于我们 ----------------
     作者 / 赞助商 / 合作作者 / 其他APP / 赞助我们 信息集中在这里。
     头像与图片放在 assets/ 目录，全部来自提供的 11 张图片。
  */
  about: {
    qqGroup: '1137437440',
    authors: [
      { name: '早安', qq: '3335750182', role: '作者', avatar: 'assets/avatar-zaoan.jpg' },
      { name: '杂鱼', qq: '3692754827', role: '作者', avatar: 'assets/avatar-zayu.jpg' }
    ],
    sponsors: [
      { name: '沐辰', qq: '2575104168', role: '赞助商', avatar: 'assets/avatar-muchen.jpg' },
      { name: '鬼', qq: '1751249668', role: '赞助商', avatar: 'assets/avatar-gui.jpg' },
      { name: '张晚秋', qq: '2729262309', role: '赞助商', avatar: 'assets/avatar-zhangwanqiu.jpg' },
      { name: 'cty', qq: '3372731544', role: '赞助商 · 云析作者', avatar: 'assets/avatar-cty.jpg' },
      { name: 'Vayrm', qq: '1447017701', role: '赞助商 · 极客猫作者', avatar: 'assets/avatar-vayrm.jpg' }
    ],
    /* 合作作者：cty 对应云析；Vayrm 对应极客猫与一叶知音 */
    partners: [
      {
        id: 'cty', name: 'cty', role: '云析作者', qq: '3372731544',
        avatar: 'assets/avatar-cty.jpg', group: '1137154951',
        apps: [
          { id: 'yunxi', name: '云析APP', image: 'assets/app-yunxi.jpg', group: '1137154951', link: 'https://pan.quark.cn/s/09c698b0e1ae?pwd=qshu', pwd: 'qshu' }
        ]
      },
      {
        id: 'vayrm', name: 'Vayrm', role: '极客猫作者', qq: '1447017701',
        avatar: 'assets/avatar-vayrm.jpg', group: '',
        apps: [
          { id: 'geekcat', name: '极客猫APP', image: 'assets/app-geekcat.jpg', group: '1095886790', link: 'https://pan.quark.cn/s/aa533c25cb16' },
          { id: 'yiye', name: '一叶知音APP', image: 'assets/app-yiye.jpg', group: '1124692610', link: 'https://pan.quark.cn/s/aa533c25cb16' }
        ]
      }
    ],
    otherApps: [
      { id: 'yunxi', name: '云析APP', author: 'cty', image: 'assets/app-yunxi.jpg', group: '1137154951', link: 'https://pan.quark.cn/s/09c698b0e1ae?pwd=qshu', pwd: 'qshu' },
      { id: 'geekcat', name: '极客猫APP', author: 'Vayrm', image: 'assets/app-geekcat.jpg', group: '1095886790', link: 'https://pan.quark.cn/s/aa533c25cb16' },
      { id: 'yiye', name: '一叶知音APP', author: 'Vayrm', image: 'assets/app-yiye.jpg', group: '1124692610', link: 'https://pan.quark.cn/s/aa533c25cb16' }
    ],
    support: {
      image: 'assets/sponsor-qr.png',
      title: '赞助我们',
      text: '谢谢您的赞赏，我会努力做好APP的，您的赞赏，我的动力！',
      note: '微信扫码赞赏 · 完全自愿'
    },
    download: {
      url: 'https://pan.quark.cn/s/aa533c25cb16',
      pwd: '',
      label: '夸克网盘'
    },
    update: {
      manifest: 'update.json'
    }
  },

  featuredLauncher: {
    id: 'pcl2',
    name: 'PCL2 启动器',
    shortName: 'PCL2',
    kicker: 'FEATURED · PCL2',
    author: '龙腾猫跃',
    desc: '国内玩家最常用的 Windows 启动器，作者龙腾猫跃。界面简洁、下载补全能力强，整合包、模组与 Java 一键搞定。',
    long: 'Plain Craft Launcher 2（PCL2）由龙腾猫跃开发，是一款免费、开源的 Windows 启动器。拥有极简界面、强大的下载与补全能力，新手也能快速装好游戏与整合包。',
    tags: ['Windows', '免费', '国民级', '龙腾猫跃'],
    platforms: ['Windows', 'Java', '免费'],
    link: 'https://github.com/Hex-Dragon/PCL2',
    download: 'https://github.com/Hex-Dragon/PCL2/releases',
    color: '#52a8e8',
    mono: 'PCL',
    image: 'assets/launchers/pcl2.png',
    highlights: ['一键安装游戏与 Java', '整合包 / 模组 / 光影下载', '国内下载源速度优秀']
  },

  bedrockLauncher: {
    id: 'bedrock',
    name: '我的世界 基岩版',
    en: 'MINECRAFT BEDROCK EDITION',
    kicker: 'OFFICIAL · BEDROCK',
    desc: '微软官方基岩版，手机、平板与电脑都能玩，支持跨平台联机与市场内容。',
    long: '基岩版是 Minecraft 的官方跨平台版本，支持 Android、iOS、Windows 与主机。可在应用内选择要查看的版本，再前往微软官方下载页获取最新版。',
    tags: ['官方', '基岩版', '跨平台', '手机 / 电脑'],
    link: 'https://www.minecraft.net/zh-hans/download',
    download: 'https://www.minecraft.net/zh-hans/download',
    color: '#7ac74f',
    mono: 'BE',
    image: 'assets/launchers/bedrock.png',
    package: 'com.mojang.minecraftpe',
    versions: [
      { id: '1.21.50', name: '1.21.50', note: '最新版本' },
      { id: '1.21.0', name: '1.21.0', note: '1.21 正式版' },
      { id: '1.20.80', name: '1.20.80', note: '常用稳定版' },
      { id: '1.20.0', name: '1.20.0', note: '1.20 正式版' },
      { id: '1.19.80', name: '1.19.80', note: '1.19 后期版本' },
      { id: '1.19.0', name: '1.19.0', note: '荒野更新' },
      { id: '1.18.30', name: '1.18.30', note: '洞穴与山崖' },
      { id: '1.17.40', name: '1.17.40', note: '经典版本' }
    ]
  },

  neteaseBedrock: {
    id: 'netease-bedrock',
    name: '网易我的世界（基岩版）',
    en: 'NETEASE MINECRAFT · CHINA',
    kicker: 'CHINA · BEDROCK',
    desc: '网易代理的《我的世界》中国版，基岩版手机 / 电脑客户端，支持联机大厅、组件中心与好友系统。',
    long: '网易我的世界中国版基于基岩版，提供官方联机大厅、组件中心、皮肤与好友系统。适合国内玩家直接下载安装，账号与官方国际版相互独立。',
    tags: ['网易中国版', '基岩版', '联机大厅', '免费'],
    link: 'https://mc.163.com/',
    download: 'https://mc.163.com/',
    color: '#78d34e',
    mono: 'MC',
    image: 'assets/launchers/netease.png',
    package: 'com.netease.mc',
    highlights: ['网易官方中国版客户端', '联机大厅与组件中心', '手机 / 电脑多端']
  },

  androidLaunchers: [
    {
      id: 'pojav',
      name: 'PojavLauncher',
      en: 'POJAV LAUNCHER',
      desc: '在安卓设备上运行 Java 版我的世界，支持 Forge / Fabric 模组与多版本切换。',
      long: '老牌安卓 Java 版启动器，基于 Boardwalk 项目。可直接登录微软账号，安装 Forge、Fabric、OptiFine 等组件，也能导入整合包与自定义版本。',
      tags: ['Java版', '开源', '模组'],
      link: 'https://github.com/PojavLauncherTeam/PojavLauncher',
      download: 'https://github.com/PojavLauncherTeam/PojavLauncher/releases',
      color: '#5c9ded',
      mono: 'PJ',
      image: 'assets/launchers/pojav.png',
      package: 'net.kdt.pojavlaunch',
      highlights: ['支持 Java 8 / 17 / 21 多运行时', '可安装模组、光影与整合包', '支持微软账号与离线账号登录']
    },
    {
      id: 'fcl',
      name: 'FCL 启动器',
      en: 'FOLD CRAFT LAUNCHER',
      desc: '界面更友好的安卓 Java 版启动器，内置下载源，装模组和整合包更省心。',
      long: 'Fold Craft Launcher 是国内社区活跃维护的安卓启动器，基于 PojavLauncher 深度定制，拥有更直观的中文界面、内置资源下载与整合包导入。',
      tags: ['Java版', '开源', '中文'],
      link: 'https://github.com/FCL-Team/FoldCraftLauncher',
      download: 'https://github.com/FCL-Team/FoldCraftLauncher/releases',
      color: '#63c86f',
      mono: 'FCL',
      image: 'assets/launchers/fcl.png',
      package: 'com.tungsten.fcl',
      highlights: ['中文界面，开箱即用', '内置多种渲染器切换', '支持整合包与模组一键导入']
    },
    {
      id: 'zalith',
      name: 'Zalith Launcher',
      en: 'ZALITH LAUNCHER 2',
      desc: '新一代安卓 Java 版启动器，Material 风格界面，支持多版本与渲染器自由切换。',
      long: 'Zalith Launcher 2 采用现代化界面设计，针对手机操作做了大量优化，支持多个游戏版本隔离、渲染器切换以及资源下载。',
      tags: ['Java版', '开源', '新界面'],
      link: 'https://github.com/ZalithLauncher/ZalithLauncher2',
      download: 'https://github.com/ZalithLauncher/ZalithLauncher2/releases',
      color: '#8f7cf0',
      mono: 'ZL',
      image: 'assets/launchers/zalith.png',
      package: 'com.movtery.zalithlauncher',
      highlights: ['现代化 Material 界面', '多版本实例隔离管理', '内置渲染器与资源下载']
    },
    {
      id: 'amethyst',
      name: 'Amethyst',
      en: 'AMETHYST LAUNCHER',
      desc: '轻量的安卓 Java 版启动器，对低配设备友好，启动速度快。',
      long: 'Amethyst 是一款主打轻量与性能的安卓 Java 版启动器，适合中低端手机运行。基于 PojavLauncher 生态，兼容常见模组与渲染器。',
      tags: ['Java版', '开源', '轻量'],
      link: 'https://github.com/AngelAuraMC/Amethyst-Android',
      download: 'https://github.com/AngelAuraMC/Amethyst-Android/releases',
      color: '#c58cf2',
      mono: 'AM',
      image: 'assets/launchers/amethyst.png',
      package: 'com.angellauramc.amethyst',
      highlights: ['占用低，适合旧手机', '支持常见渲染器', '兼容 Forge / Fabric']
    }
  ],

  javaLaunchers: [
    {
      id: 'hmcl',
      name: 'HMCL',
      en: 'HELLO MINECRAFT LAUNCHER',
      desc: '跨平台 Java 版启动器，Windows / macOS / Linux 通吃，自动安装与模组管理。',
      long: 'Hello Minecraft! Launcher 是成熟稳定的开源启动器，支持多平台、多账号、多版本管理，拥有完善的模组与整合包下载体系。',
      tags: ['跨平台', '开源', '稳定'],
      link: 'https://hmcl.huangyuhui.net/',
      download: 'https://hmcl.huangyuhui.net/download',
      color: '#e9a84b',
      mono: 'HM',
      highlights: ['Windows / macOS / Linux', '支持微软账号与离线账号', '自动补全 Java 与游戏文件']
    },
    {
      id: 'bakaxl',
      name: 'BakaXL',
      en: 'BAKAXL LAUNCHER',
      desc: '高颜值 Windows 启动器，内置整合包与联机功能，界面动效精致。',
      long: 'BakaXL 是一款注重外观与交互体验的 Windows 启动器，内置整合包中心、联机大厅与多版本管理，适合喜欢一站式体验的玩家。',
      tags: ['Windows', '高颜值', '联机'],
      link: 'https://www.bakaxl.com/',
      download: 'https://www.bakaxl.com/',
      color: '#f07aa8',
      mono: 'BXL',
      highlights: ['精致的动态界面', '内置整合包与联机大厅', '多账号与版本管理']
    },
    {
      id: 'prism',
      name: 'Prism Launcher',
      en: 'PRISM LAUNCHER',
      desc: '开源跨平台启动器，多实例隔离管理，深度整合 Modrinth / CurseForge。',
      long: 'Prism Launcher 是 MultiMC 的社区分支，拥有强大的实例隔离、模组管理能力，可直接浏览 Modrinth 与 CurseForge 资源并安装。',
      tags: ['跨平台', '开源', '多实例'],
      link: 'https://prismlauncher.org/',
      download: 'https://prismlauncher.org/download/',
      color: '#67c7c1',
      mono: 'PR',
      highlights: ['每个实例独立隔离', '内置 Modrinth / CurseForge', '支持 Java 自动管理']
    },
    {
      id: 'multimc',
      name: 'MultiMC',
      en: 'MULTIMC LAUNCHER',
      desc: '经典开源启动器，稳定可靠，多实例管理的老牌选择。',
      long: 'MultiMC 是历史悠久的开源启动器，以稳定和多实例管理著称。虽然资源下载需要借助插件，但依旧是许多老玩家的首选。',
      tags: ['跨平台', '开源', '经典'],
      link: 'https://multimc.org/',
      download: 'https://multimc.org/',
      color: '#a9b2c0',
      mono: 'MM',
      highlights: ['稳定的实例隔离', '轻量无广告', '社区插件生态']
    },
    {
      id: 'official',
      name: 'Minecraft 官方启动器',
      en: 'MOJANG OFFICIAL',
      desc: 'Mojang 官方启动器，支持 Java 版与基岩版，正版账号的默认选择。',
      long: '由 Mojang 官方提供的 Minecraft Launcher，可统一管理 Java 版与基岩版，支持微软账号登录。适合追求原版体验的正版玩家。',
      tags: ['官方', '正版', '双版本'],
      link: 'https://www.minecraft.net/zh-hans/download',
      download: 'https://www.minecraft.net/zh-hans/download',
      color: '#7ac74f',
      mono: 'MO',
      highlights: ['官方正版渠道', 'Java 版 + 基岩版', '自动更新游戏']
    },
    {
      id: 'atlauncher',
      name: 'ATLauncher',
      en: 'ATLAUNCHER',
      desc: '开源跨平台启动器，内置整合包浏览与实例管理，界面清爽。',
      long: 'ATLauncher 是一款免费开源的 Minecraft 启动器，支持 Windows、macOS 与 Linux，内置整合包搜索、模组管理与多实例隔离。',
      tags: ['跨平台', '开源', '整合包'],
      link: 'https://atlauncher.com/',
      download: 'https://atlauncher.com/downloads',
      color: '#5bbf9a',
      mono: 'ATL',
      highlights: ['内置整合包浏览器', '多实例隔离', '支持微软正版登录']
    },
    {
      id: 'technic',
      name: 'Technic Launcher',
      en: 'TECHNIC PACK',
      desc: '老牌整合包平台，一键安装经典科技整合包与社区作品。',
      long: 'Technic Launcher 是历史悠久的整合包启动器，拥有大量经典科技与冒险整合包，适合喜欢一键开玩的玩家。',
      tags: ['整合包', '经典', '一键安装'],
      link: 'https://www.technicpack.net/',
      download: 'https://www.technicpack.net/download',
      color: '#e8a33c',
      mono: 'TC',
      highlights: ['海量经典整合包', '一键下载安装', '社区持续更新']
    },
    {
      id: 'gdlauncher',
      name: 'GDLauncher',
      en: 'GDLAUNCHER',
      desc: '现代化界面的开源启动器，整合包与模组管理体验流畅。',
      long: 'GDLauncher 拥有现代化的卡片式界面，支持 CurseForge 与 Modrinth 整合包，内置模组更新与实例管理。',
      tags: ['跨平台', '开源', '现代化'],
      link: 'https://gdlauncher.com/',
      download: 'https://gdlauncher.com/',
      color: '#a78bfa',
      mono: 'GDL',
      highlights: ['现代卡片界面', 'CurseForge / Modrinth', '模组一键更新']
    },
    {
      id: 'modrinthapp',
      name: 'Modrinth App',
      en: 'MODRINTH APP',
      desc: 'Modrinth 官方启动器，直接浏览并安装模组、整合包与光影。',
      long: 'Modrinth App 是 Modrinth 官方推出的启动器，与 Modrinth 资源库深度整合，可一键安装模组、整合包、光影与数据包。',
      tags: ['官方', '开源', 'Modrinth'],
      link: 'https://modrinth.com/app',
      download: 'https://modrinth.com/app',
      color: '#1bd96a',
      mono: 'MR',
      highlights: ['Modrinth 官方出品', '模组 / 整合包 / 光影', '自动管理依赖']
    }
  ],

  resourceCategories: [
    { id: 'all', name: '全部' },
    { id: 'mod', name: '模组' },
    { id: 'shader', name: '光影' },
    { id: 'wiki', name: '百科' },
    { id: 'community', name: '社区' },
    { id: 'skin', name: '地图与皮肤' },
    { id: 'official', name: '官方' }
  ],

  resources: [
    {
      id: 'mcmod',
      name: 'MC百科',
      en: 'MCMOD.CN',
      desc: '最大的中文 Minecraft 模组百科，查模组资料、教程与整合包。',
      url: 'https://www.mcmod.cn/',
      domain: 'mcmod.cn',
      cat: 'wiki',
      color: '#4fb97a',
      mono: 'MC',
      tags: ['模组资料', '教程', '整合包']
    },
    {
      id: 'modrinth',
      name: 'Modrinth',
      en: 'MODRINTH.COM',
      desc: '开源模组平台，模组、整合包、光影与数据包，下载干净无捆绑。',
      url: 'https://modrinth.com/',
      domain: 'modrinth.com',
      cat: 'mod',
      color: '#1bd96a',
      mono: 'MR',
      tags: ['开源', '模组', '整合包']
    },
    {
      id: 'curseforge',
      name: 'CurseForge',
      en: 'CURSEFORGE.COM',
      desc: '全球最大的模组与整合包社区，资源数量遥遥领先。',
      url: 'https://www.curseforge.com/minecraft',
      domain: 'curseforge.com',
      cat: 'mod',
      color: '#f16436',
      mono: 'CF',
      tags: ['模组', '整合包', '全球']
    },
    {
      id: 'minecraftwiki',
      name: 'Minecraft Wiki',
      en: 'ZH.MINECRAFT.WIKI',
      desc: '官方中文 Wiki，方块、生物、合成与游戏机制一网打尽。',
      url: 'https://zh.minecraft.wiki/',
      domain: 'zh.minecraft.wiki',
      cat: 'wiki',
      color: '#9aa3ad',
      mono: 'W',
      tags: ['百科', '机制', '合成表']
    },
    {
      id: 'planetminecraft',
      name: 'Planet Minecraft',
      en: 'PLANETMINECRAFT.COM',
      desc: '国际创作社区，地图、建筑、皮肤与作品分享的聚集地。',
      url: 'https://www.planetminecraft.com/',
      domain: 'planetminecraft.com',
      cat: 'skin',
      color: '#4a9fd8',
      mono: 'PM',
      tags: ['地图', '皮肤', '建筑']
    },
    {
      id: 'klpbbs',
      name: '苦力怕论坛',
      en: 'KLPBBS.COM',
      desc: '活跃的中文 MC 社区，整合包、地图、皮肤与联机内容丰富。',
      url: 'https://klpbbs.com/',
      domain: 'klpbbs.com',
      cat: 'community',
      color: '#5cbf4f',
      mono: 'K',
      tags: ['社区', '整合包', '联机']
    },
    {
      id: 'minecraftnet',
      name: 'Minecraft 官网',
      en: 'MINECRAFT.NET',
      desc: 'Minecraft 官方新闻、版本资讯与游戏购买入口。',
      url: 'https://www.minecraft.net/zh-hans',
      domain: 'minecraft.net',
      cat: 'official',
      color: '#6cc24a',
      mono: 'MC',
      tags: ['官方', '资讯', '购买']
    },
    {
      id: 'optifine',
      name: 'OptiFine',
      en: 'OPTIFINE.NET',
      desc: '经典光影与性能优化模组，搭配光影包让世界更通透。',
      url: 'https://optifine.net/',
      domain: 'optifine.net',
      cat: 'shader',
      color: '#e0b23c',
      mono: 'OF',
      tags: ['光影', '优化', '经典']
    },
    {
      id: 'fabric',
      name: 'Fabric',
      en: 'FABRICMC.NET',
      desc: '轻量级模组加载器，启动快、生态活跃，现代模组的首选。',
      url: 'https://fabricmc.net/',
      domain: 'fabricmc.net',
      cat: 'mod',
      color: '#d9c9a3',
      mono: 'FB',
      tags: ['加载器', '开源', '轻量']
    },
    {
      id: 'forge',
      name: 'MinecraftForge',
      en: 'FILES.MINECRAFTFORGE.NET',
      desc: '老牌模组加载器，大量经典模组与整合包的基础。',
      url: 'https://files.minecraftforge.net/',
      domain: 'minecraftforge.net',
      cat: 'mod',
      color: '#c75a3a',
      mono: 'FG',
      tags: ['加载器', '经典', '模组']
    },
    {
      id: 'namemc',
      name: 'NameMC',
      en: 'NAMEMC.COM',
      desc: '查询玩家 ID、正版皮肤与名称可用性，也可以浏览热门皮肤。',
      url: 'https://namemc.com/',
      domain: 'namemc.com',
      cat: 'skin',
      color: '#6c7bd9',
      mono: 'N',
      tags: ['皮肤', 'ID 查询', '档案']
    },
    {
      id: '9minecraft',
      name: '9Minecraft',
      en: '9MINECRAFT.NET',
      desc: '国际 MC 资源站，模组、地图、皮肤与整合包更新迅速。',
      url: 'https://www.9minecraft.net/',
      domain: '9minecraft.net',
      cat: 'mod',
      color: '#4d7bd6',
      mono: '9',
      tags: ['模组', '地图', '综合']
    }
  ],

  themes: [
    { id: 'grass', name: '草方块', en: 'GRASS', desc: '经典主世界', colors: ['#8ada5a', '#7d5233', '#9ae765'] },
    { id: 'nether', name: '下界', en: 'NETHER', desc: '炽热熔岩', colors: ['#ff8a5c', '#7a2f22', '#ffc17a'] },
    { id: 'end', name: '末地', en: 'THE END', desc: '紫珀虚空', colors: ['#b48cff', '#3b2a58', '#dcc7ff'] },
    { id: 'ocean', name: '海洋', en: 'OCEAN', desc: '深海潮汐', colors: ['#57d6e8', '#1e6070', '#a8f0ff'] },
    { id: 'sakura', name: '樱花', en: 'SAKURA', desc: '春日樱花', colors: ['#f3a6c8', '#713b58', '#ffd6e8'], premium: true },
    { id: 'amethyst', name: '紫水晶', en: 'AMETHYST', desc: '晶簇微光', colors: ['#b48cff', '#3d245f', '#e1c8ff'], premium: true },
    { id: 'gold', name: '黄金', en: 'GOLD', desc: '金锭暖光', colors: ['#f4c44e', '#6b4a14', '#ffe69a'], premium: true },
    { id: 'ice', name: '冰霜', en: 'ICE', desc: '蓝冰雪原', colors: ['#8be8ff', '#234c66', '#d6f8ff'], premium: true }
  ],

  skins: [
    {
      id: 'steve', name: '史蒂夫', tag: '经典',
      skin: '#b98a67', skinShade: '#956b4e', hair: '#2c2117', hairShade: '#1c150e',
      eye: '#4052a4', shirt: '#2f9c9c', shirtShade: '#217373', sleeve: '#35aaaa',
      pants: '#3c3f8f', pantsShade: '#2b2d68', shoe: '#4b4b54'
    },
    {
      id: 'alex', name: '艾莉克斯', tag: '经典',
      skin: '#f0c29b', skinShade: '#d3a077', hair: '#d49a4d', hairShade: '#a97433',
      eye: '#3f8f5e', shirt: '#6cae5b', shirtShade: '#4e8a3f', sleeve: '#79bb67',
      pants: '#9c6a3e', pantsShade: '#7c502b', shoe: '#5a4a3a'
    },
    {
      id: 'diamond', name: '钻石骑士', tag: '稀有',
      skin: '#d8f3f0', skinShade: '#b3d9d6', hair: '#9ff4e8', hairShade: '#6fd6c8',
      eye: '#1b6f7a', shirt: '#48c9c9', shirtShade: '#2c9c9c', sleeve: '#5fe0e0',
      pants: '#2b7f93', pantsShade: '#1e616f', shoe: '#154b58'
    },
    {
      id: 'nether', name: '下界旅人', tag: '稀有',
      skin: '#c76b4d', skinShade: '#a45037', hair: '#2a1313', hairShade: '#180b0b',
      eye: '#ffb347', shirt: '#a33024', shirtShade: '#7b1f18', sleeve: '#bd3c2d',
      pants: '#5c2420', pantsShade: '#431916', shoe: '#2c100e'
    },
    {
      id: 'ender', name: '末影行者', tag: '史诗',
      skin: '#3b3050', skinShade: '#2b223c', hair: '#171323', hairShade: '#0e0b16',
      eye: '#c89bff', shirt: '#4a396b', shirtShade: '#34274d', sleeve: '#5a4680',
      pants: '#2a2140', pantsShade: '#1d172e', shoe: '#141020'
    },
    {
      id: 'rainbow', name: '彩虹方块', tag: '限定',
      skin: '#f3d2b3', skinShade: '#d4b191', hair: '#f26d8a', hairShade: '#c34f6c',
      eye: '#2f8f6f', shirt: '#f26d8a', shirtShade: '#c34f6c', sleeve: '#ff8fa7',
      pants: '#5d6ce0', pantsShade: '#4350ad', shoe: '#2c3477', rainbow: true
    },
    {
      id: 'creeper', name: '苦力怕', tag: '趣味',
      skin: '#7ac74f', skinShade: '#5da539', hair: '#68b543', hairShade: '#4f9432',
      eye: '#141414', shirt: '#69b545', shirtShade: '#4d9631', sleeve: '#7ac74f',
      pants: '#4c8f35', pantsShade: '#3a7228', shoe: '#2e5e20', special: 'creeper'
    }
  ],

  loginMethods: {
    phone: { name: '手机号', sub: '验证码快捷登录', icon: 'i-phone' },
    qq: { name: 'QQ邮箱', sub: '邮箱账号登录', icon: 'i-mail' },
    account: { name: '账号', sub: '微软 / Xbox / 离线', icon: 'i-key' },
    microsoft: { name: '微软账号', sub: 'Microsoft', icon: 'i-microsoft' },
    xbox: { name: 'Xbox 账号', sub: 'Xbox Network', icon: 'i-xbox' },
    offline: { name: '离线账号', sub: '本地账号', icon: 'i-offline' }
  }
};
