/* =========================================================
   世界织卷APP · 百宝箱数据层
   - Java 版 / 基岩版指令速查
   - 方块查询（命名空间 ID + 1.12.2 及更早的数字 ID）
   - 工具定义（表单字段 + 执行器编号）
   说明：数字 ID 仅存在于 1.12.2 及更早版本；1.13 起官方已扁平化，
        表中高版本方块只给命名空间 ID。
   ========================================================= */

window.BOX_DATA = {
  /* ---------------- 指令版本 ----------------
     每个版本带 ver 数值（用于判断指令引入版本）；
     legacy 表示该版本还没有经历 1.13「扁平化」。
  */
  commandVersions: {
    java: [
      { id: '1.8.9', label: '1.8.9', ver: 8.9, note: '经典 PvP / 旧版语法', legacy: true },
      { id: '1.12.2', label: '1.12.2', ver: 12.2, note: '最后一个带数字 ID 的版本', legacy: true },
      { id: '1.13.2', label: '1.13.2', ver: 13.2, note: '扁平化 · execute 重写' },
      { id: '1.16.5', label: '1.16.5', ver: 16.5, note: '下界更新 · 属性指令' },
      { id: '1.17.1', label: '1.17.1', ver: 17.1, note: '洞穴与山崖 · item 指令' },
      { id: '1.19.4', label: '1.19.4', ver: 19.4, note: 'ride / damage / place' },
      { id: '1.20.1', label: '1.20.1', ver: 20.1, note: '常用整合包版本' },
      { id: '1.20.5', label: '1.20.5', ver: 20.5, note: '数据组件与 random' },
      { id: '1.21.4', label: '1.21.4', ver: 21.4, note: '当前最新语法' }
    ],
    bedrock: [
      { id: '1.16.100', label: '1.16.100', ver: 16.1, note: '组件与结构指令' },
      { id: '1.17.10', label: '1.17.10', ver: 17.1, note: '洞穴与山崖' },
      { id: '1.19.10', label: '1.19.10', ver: 19.1, note: 'execute 对齐 Java' },
      { id: '1.19.80', label: '1.19.80', ver: 19.8, note: 'camera / 输入锁定' },
      { id: '1.20.80', label: '1.20.80', ver: 20.8, note: '常用基岩版' },
      { id: '1.21.50', label: '1.21.50', ver: 21.5, note: '当前最新语法' }
    ]
  },

  /* 指令引入版本：键为指令名，值为可用的最低版本数值；未列出的按 0 处理 */
  commandSince: {
    java: {
      '/help': 8, '/seed': 8, '/list': 8, '/version': 20.5,
      '/give': 8, '/clear': 8, '/item': 17, '/enchant': 8, '/loot': 14,
      '/setblock': 8, '/fill': 8, '/clone': 8, '/place': 19, '/locate': 11,
      '/forceload': 13, '/time': 8, '/weather': 8, '/gamerule': 8,
      '/difficulty': 8, '/setworldspawn': 8, '/worldborder': 8,
      '/summon': 8, '/kill': 8, '/data': 13, '/tag': 13, '/effect': 8,
      '/attribute': 16, '/ride': 19.4, '/damage': 19.4,
      '/tp': 8, '/teleport': 13, '/gamemode': 8, '/xp': 8,
      '/advancement': 12, '/recipe': 12, '/spawnpoint': 8,
      '/title': 8, '/tellraw': 8, '/tell': 8, '/say': 8, '/playsound': 8,
      '/stopsound': 8, '/particle': 8, '/bossbar': 13,
      '/scoreboard': 8, '/team': 8,
      '/execute': 8, '/function': 12, '/schedule': 14, '/random': 20.2,
      '/datapack': 13, '/reload': 8, '/jfr': 18, '/debug': 18,
      '/whitelist': 8, '/op': 8
    },
    bedrock: {
      '/help': 16, '/list': 16, '/me': 16, '/msg': 16,
      '/give': 16, '/clear': 16, '/enchant': 16, '/loot': 16,
      '/setblock': 16, '/fill': 16, '/clone': 16, '/time': 16,
      '/weather': 16, '/gamerule': 16, '/difficulty': 16, '/spawnpoint': 16,
      '/tickingarea': 16, '/locate': 19,
      '/summon': 16, '/kill': 16, '/effect': 16, '/ride': 16.1,
      '/tp': 16, '/gamemode': 16, '/xp': 16, '/camera': 19.8, '/inputpermission': 19.8,
      '/title': 16, '/tellraw': 16, '/say': 16, '/particle': 16, '/playsound': 16,
      '/music': 19.1, '/fog': 16.1,
      '/scoreboard': 16, '/tag': 16,
      '/structure': 16, '/function': 17, '/dialogue': 17.1,
      '/execute': 16, '/connect': 16
    }
  },

  /* ---------------- 指令：Java 版 ---------------- */
  javaCommands: [
    { c: '/help', cat: '基础', u: '/help [页码 | 指令]', d: '查看指令帮助与用法', e: '/help give', v: '全版本' },
    { c: '/seed', cat: '基础', u: '/seed', d: '显示当前世界种子', e: '/seed', v: '1.3+' },
    { c: '/list', cat: '基础', u: '/list [uuids]', d: '列出在线玩家（需管理员）', e: '/list', v: '全版本' },
    { c: '/version', cat: '基础', u: '/version', d: '查看服务端版本与平台', e: '/version', v: '1.20.5+' },

    { c: '/give', cat: '物品', u: '/give <目标> <物品>[<数据组件>] [数量]', d: '给予实体物品', e: '/give @s minecraft:diamond 64', v: '1.13+ 命名空间 ID' },
    { c: '/clear', cat: '物品', u: '/clear [目标] [物品] [最大数量]', d: '清空物品栏或指定物品', e: '/clear @s minecraft:dirt', v: '全版本' },
    { c: '/item', cat: '物品', u: '/item replace <容器> <栏位> with <物品> [数量]', d: '直接修改容器里的物品', e: '/item replace block ~ ~ ~ container.0 with minecraft:apple', v: '1.17+' },
    { c: '/enchant', cat: '物品', u: '/enchant <目标> <魔咒> [等级]', d: '给手持物品附魔（仅原版可附魔项）', e: '/enchant @s minecraft:sharpness 5', v: '1.13+' },
    { c: '/loot', cat: '物品', u: '/loot give <玩家> <来源>', d: '把战利品表结果发给玩家', e: '/loot give @s loot minecraft:chests/simple_dungeon', v: '1.14+' },

    { c: '/setblock', cat: '世界', u: '/setblock <坐标> <方块> [replace | keep | destroy]', d: '在指定位置放置方块', e: '/setblock ~ ~1 ~ minecraft:stone', v: '1.13+ 方块 ID' },
    { c: '/fill', cat: '世界', u: '/fill <起点> <终点> <方块> [模式]', d: '填充长方体区域（单次上限 32768 格）', e: '/fill ~-5 ~ ~-5 ~5 ~3 ~5 minecraft:air', v: '全版本' },
    { c: '/clone', cat: '世界', u: '/clone <起点> <终点> <目标> [masked | replace]', d: '复制区域到另一处', e: '/clone ~ ~ ~ ~5 ~5 ~5 ~10 ~ ~', v: '全版本' },
    { c: '/place', cat: '世界', u: '/place <结构 | feature | template> <参数>', d: '放置结构或地物', e: '/place feature minecraft:village_plains', v: '1.19+' },
    { c: '/locate', cat: '世界', u: '/locate <structure | biome | poi> <类型>', d: '定位最近的结构或生物群系', e: '/locate structure minecraft:stronghold', v: '1.19+ 支持 biome' },
    { c: '/forceload', cat: '世界', u: '/forceload add | remove | query <区块>', d: '强制加载区块（红石/刷怪塔常用）', e: '/forceload add ~ ~', v: '1.13+' },
    { c: '/time', cat: '世界', u: '/time set <day | noon | night | midnight | 数值>', d: '设置世界时间', e: '/time set day', v: '全版本' },
    { c: '/weather', cat: '世界', u: '/weather <clear | rain | thunder> [时长]', d: '设置天气', e: '/weather clear 1000', v: '全版本' },
    { c: '/gamerule', cat: '世界', u: '/gamerule <规则> [值]', d: '查看或设置游戏规则', e: '/gamerule keepInventory true', v: '全版本' },
    { c: '/difficulty', cat: '世界', u: '/difficulty <peaceful | easy | normal | hard>', d: '设置难度', e: '/difficulty hard', v: '全版本' },
    { c: '/setworldspawn', cat: '世界', u: '/setworldspawn [坐标] [角度]', d: '设置世界出生点', e: '/setworldspawn 0 64 0', v: '全版本' },
    { c: '/worldborder', cat: '世界', u: '/worldborder <set | add | center | damage | warning> ...', d: '管理世界边界', e: '/worldborder set 1000', v: '全版本' },

    { c: '/summon', cat: '实体', u: '/summon <实体> [坐标] [NBT]', d: '生成实体', e: '/summon minecraft:zombie ~ ~ ~ {IsBaby:1b}', v: '1.13+ 实体 ID' },
    { c: '/kill', cat: '实体', u: '/kill <目标>', d: '清除实体', e: '/kill @e[type=minecraft:zombie]', v: '全版本' },
    { c: '/data', cat: '实体', u: '/data <get | merge | modify | remove> ...', d: '读写实体 / 方块的 NBT', e: '/data get entity @s Health', v: '1.13+' },
    { c: '/tag', cat: '实体', u: '/tag <目标> <add | remove | list> <标签>', d: '给实体打标签（选择器用）', e: '/tag @s add builder', v: '1.13+' },
    { c: '/effect', cat: '实体', u: '/effect give <目标> <效果> [秒] [等级] [隐藏粒子]', d: '施加或清除状态效果', e: '/effect give @s minecraft:speed 30 2', v: '1.13+ 语法' },
    { c: '/attribute', cat: '实体', u: '/attribute <目标> <属性> <get | base | modifier>', d: '读写实体属性（血量/攻击力等）', e: '/attribute @s minecraft:generic.max_health get', v: '1.16+' },
    { c: '/ride', cat: '实体', u: '/ride <骑乘者> mount | dismount', d: '让实体骑乘/下坐骑', e: '/ride @s mount @e[type=minecraft:boat,limit=1]', v: '1.19.4+' },
    { c: '/damage', cat: '实体', u: '/damage <目标> <伤害> [类型]', d: '对实体造成指定类型伤害', e: '/damage @s 5 minecraft:fall', v: '1.19.4+' },

    { c: '/tp', cat: '玩家', u: '/tp <目标> <坐标 | 实体>', d: '传送实体', e: '/tp @s 100 64 -200', v: '全版本' },
    { c: '/teleport', cat: '玩家', u: '/teleport <目标> <坐标> [朝向]', d: '传送并指定视角朝向', e: '/teleport @s ~ ~ ~ facing entity @p', v: '1.13+ 分支' },
    { c: '/gamemode', cat: '玩家', u: '/gamemode <survival | creative | adventure | spectator> [玩家]', d: '切换游戏模式', e: '/gamemode creative @s', v: '全版本' },
    { c: '/xp', cat: '玩家', u: '/xp add | set <目标> <数量> [levels | points]', d: '增减或设置经验', e: '/xp add @s 30 levels', v: '1.13+ 语法' },
    { c: '/advancement', cat: '玩家', u: '/advancement grant | revoke <目标> <进度>', d: '授予或撤销进度', e: '/advancement grant @s only minecraft:story/root', v: '1.12+' },
    { c: '/recipe', cat: '玩家', u: '/recipe give | take <目标> <配方 | *>', d: '解锁或锁定合成配方', e: '/recipe give @s *', v: '1.12+' },
    { c: '/spawnpoint', cat: '玩家', u: '/spawnpoint [玩家] [坐标]', d: '设置玩家重生点', e: '/spawnpoint @s ~ ~ ~', v: '全版本' },

    { c: '/title', cat: '文本', u: '/title <目标> <title | subtitle | actionbar> <文本>', d: '显示标题 / 副标题 / 动作栏', e: '/title @a title {"text":"欢迎","color":"gold"}', v: '全版本' },
    { c: '/tellraw', cat: '文本', u: '/tellraw <目标> <JSON 文本>', d: '发送可点击/带格式的聊天消息', e: '/tellraw @a [{"text":"点我","clickEvent":{"action":"run_command","value":"/spawn"}}]', v: '全版本' },
    { c: '/tell', cat: '文本', u: '/tell <玩家> <消息>', d: '私聊（等价 /msg /w）', e: '/tell @s 你好', v: '全版本' },
    { c: '/say', cat: '文本', u: '/say <消息>', d: '全服广播', e: '/say 服务器将在5分钟后重启', v: '全版本' },
    { c: '/playsound', cat: '文本', u: '/playsound <音效> <来源> <目标> [坐标] [音量] [音调]', d: '播放音效', e: '/playsound minecraft:entity.player.levelup master @s', v: '1.13+ 音效 ID' },
    { c: '/stopsound', cat: '文本', u: '/stopsound <目标> [来源] [音效]', d: '停止音效', e: '/stopsound @s', v: '全版本' },
    { c: '/particle', cat: '文本', u: '/particle <粒子> [坐标] [扩散] [速度] [数量] [模式]', d: '生成粒子效果', e: '/particle minecraft:flame ~ ~1 ~ 0.5 0.5 0.5 0 50', v: '1.13+ 粒子 ID' },
    { c: '/bossbar', cat: '文本', u: '/bossbar <add | set | get | remove> <id> ...', d: '创建与修改 Boss 血条', e: '/bossbar add raid:boss {"text":"凋灵"}', v: '1.13+' },

    { c: '/scoreboard', cat: '计分', u: '/scoreboard objectives | players <子命令> ...', d: '记分板目标与分数管理', e: '/scoreboard objectives add kills deathCount', v: '全版本' },
    { c: '/team', cat: '计分', u: '/team add | join | leave | modify | list ...', d: '队伍与队友管理', e: '/team add red', v: '全版本' },

    { c: '/execute', cat: '执行', u: '/execute <as | at | if | unless | store | run> ...', d: '条件化执行指令（1.13 重写）', e: '/execute as @a at @s run summon minecraft:lightning_bolt', v: '1.13+ 完全重写' },
    { c: '/function', cat: '执行', u: '/function <命名空间:函数>', d: '运行数据包中的函数', e: '/function mypack:start', v: '1.12+' },
    { c: '/schedule', cat: '执行', u: '/schedule function <函数> <时间> [append | replace]', d: '定时执行函数', e: '/schedule function mypack:tick 5s', v: '1.14+' },
    { c: '/random', cat: '执行', u: '/random value <范围> | reset', d: '掷随机数（可写入记分板）', e: '/random value 1..100', v: '1.20.2+' },

    { c: '/datapack', cat: '服务器', u: '/datapack <list | enable | disable> <名称>', d: '管理数据包', e: '/datapack list', v: '1.13+' },
    { c: '/reload', cat: '服务器', u: '/reload', d: '重载数据包与战利品表', e: '/reload', v: '全版本' },
    { c: '/jfr', cat: '服务器', u: '/jfr <start | stop>', d: '启动/停止性能分析（服务端排障）', e: '/jfr start', v: '1.18+' },
    { c: '/debug', cat: '服务器', u: '/debug <start | stop | function>', d: '性能与函数调试', e: '/debug start', v: '1.18+' },
    { c: '/whitelist', cat: '服务器', u: '/whitelist <add | remove | list | on | off>', d: '白名单管理', e: '/whitelist add Steve', v: '服务端' },
    { c: '/op', cat: '服务器', u: '/op <玩家>', d: '授予管理员权限', e: '/op Steve', v: '服务端' }
  ],

  /* ---------------- 指令：基岩版 ---------------- */
  bedrockCommands: [
    { c: '/help', cat: '基础', u: '/help [页码 | 指令]', d: '查看可用指令列表', e: '/help 2', v: '全版本' },
    { c: '/list', cat: '基础', u: '/list', d: '列出在线玩家', e: '/list', v: '全版本' },
    { c: '/me', cat: '基础', u: '/me <动作>', d: '以第三人称发消息', e: '/me 挖到了钻石', v: '全版本' },
    { c: '/msg', cat: '基础', u: '/msg <玩家> <消息>', d: '私聊（/tell /w 等价）', e: '/msg Steve 一起玩吗', v: '全版本' },

    { c: '/give', cat: '物品', u: '/give <玩家> <物品> [数量] [数据值] [组件]', d: '给予物品（组件为 JSON）', e: '/give @s diamond 64', v: '1.16+ 组件' },
    { c: '/clear', cat: '物品', u: '/clear [玩家] [物品] [数据值] [最大数量]', d: '清空物品', e: '/clear @s dirt', v: '全版本' },
    { c: '/enchant', cat: '物品', u: '/enchant <玩家> <魔咒> [等级]', d: '给手持物品附魔', e: '/enchant @s sharpness 5', v: '全版本' },
    { c: '/loot', cat: '物品', u: '/loot give <玩家> <来源>', d: '发放战利品表', e: '/loot give @s loot chests/simple_dungeon', v: '1.16+' },

    { c: '/setblock', cat: '世界', u: '/setblock <坐标> <方块> [模式]', d: '放置单个方块', e: '/setblock ~ ~ ~ stone', v: '全版本' },
    { c: '/fill', cat: '世界', u: '/fill <起点> <终点> <方块> [模式]', d: '填充区域（上限 32768 格）', e: '/fill ~-3 ~ ~-3 ~3 ~3 ~3 glass', v: '全版本' },
    { c: '/clone', cat: '世界', u: '/clone <起点> <终点> <目标> [模式]', d: '复制区域', e: '/clone ~ ~ ~ ~4 ~4 ~4 ~8 ~ ~', v: '全版本' },
    { c: '/time', cat: '世界', u: '/time <set | add> <day | noon | night | midnight | 数值>', d: '设置时间', e: '/time set night', v: '全版本' },
    { c: '/weather', cat: '世界', u: '/weather <clear | rain | thunder> [时长]', d: '设置天气', e: '/weather thunder 600', v: '全版本' },
    { c: '/gamerule', cat: '世界', u: '/gamerule <规则> [值]', d: '游戏规则', e: '/gamerule keepInventory true', v: '全版本' },
    { c: '/difficulty', cat: '世界', u: '/difficulty <peaceful | easy | normal | hard>', d: '设置难度', e: '/difficulty hard', v: '全版本' },
    { c: '/spawnpoint', cat: '世界', u: '/spawnpoint [玩家] [坐标]', d: '设置重生点', e: '/spawnpoint @s ~ ~ ~', v: '全版本' },
    { c: '/tickingarea', cat: '世界', u: '/tickingarea <add | remove | list> <区域>', d: '常加载区域（手机性能友好）', e: '/tickingarea add ~-16 ~ ~-16 ~16 ~ ~16 farm', v: '全版本' },
    { c: '/locate', cat: '世界', u: '/locate <structure | biome> <类型>', d: '定位最近结构 / 群系', e: '/locate structure village', v: '1.19+ biome' },

    { c: '/summon', cat: '实体', u: '/summon <实体> [坐标] [NBT]', d: '生成实体', e: '/summon zombie ~ ~ ~', v: '全版本' },
    { c: '/kill', cat: '实体', u: '/kill <目标>', d: '清除实体', e: '/kill @e[type=zombie]', v: '全版本' },
    { c: '/effect', cat: '实体', u: '/effect <玩家> <效果> [秒] [等级] [隐藏粒子]', d: '施加状态效果', e: '/effect @s speed 30 2 true', v: '语法与 Java 不同' },
    { c: '/ride', cat: '实体', u: '/ride <实体> <目标>', d: '让实体骑乘目标', e: '/ride @s @e[type=boat]', v: '1.16.100+' },

    { c: '/tp', cat: '玩家', u: '/tp <目标> <坐标 | 实体>', d: '传送', e: '/tp @s 0 64 0', v: '全版本' },
    { c: '/gamemode', cat: '玩家', u: '/gamemode <玩家> <模式>', d: '切换游戏模式（参数顺序与 Java 相反）', e: '/gamemode @s creative', v: '全版本' },
    { c: '/xp', cat: '玩家', u: '/xp <数量> [玩家] [levels | points]', d: '增减经验', e: '/xp 30 @s levels', v: '参数顺序不同' },
    { c: '/camera', cat: '玩家', u: '/camera <玩家> <set | clear | fade | shake> ...', d: '镜头控制（地图作者常用）', e: '/camera @s set minecraft:free pos 0 70 0', v: '1.19.80+' },
    { c: '/inputpermission', cat: '玩家', u: '/inputpermission set <玩家> <camera | movement> <enabled | disabled>', d: '锁定玩家输入', e: '/inputpermission set @s movement disabled', v: '1.19.80+' },

    { c: '/title', cat: '文本', u: '/title <玩家> <title | subtitle | actionbar> <文本>', d: '标题与动作栏', e: '/title @a title §6欢迎', v: '全版本' },
    { c: '/tellraw', cat: '文本', u: '/tellraw <玩家> <JSON>', d: '发送 JSON 文本', e: '/tellraw @a {"rawtext":[{"text":"你好"}]}', v: '基岩版用 rawtext' },
    { c: '/say', cat: '文本', u: '/say <消息>', d: '全服广播', e: '/say 晚安', v: '全版本' },
    { c: '/particle', cat: '文本', u: '/particle <效果> [坐标]', d: '粒子效果', e: '/particle minecraft:basic_flame_particle ~ ~1 ~', v: '基岩版粒子名不同' },
    { c: '/playsound', cat: '文本', u: '/playsound <音效> [玩家] [坐标] [音量] [音调]', d: '播放音效', e: '/playsound random.levelup @s', v: '全版本' },
    { c: '/music', cat: '文本', u: '/music <play | stop> <曲目> [淡入] [淡出]', d: '控制背景音乐', e: '/music play record.cat', v: '1.19.10+' },
    { c: '/fog', cat: '文本', u: '/fog <玩家> <push | pop | remove> <雾效>', d: '自定义距离雾（地图氛围）', e: '/fog @s push minecraft:fog_hell', v: '1.16.100+' },

    { c: '/scoreboard', cat: '计分', u: '/scoreboard objectives | players ...', d: '记分板', e: '/scoreboard objectives add coins dummy', v: '全版本' },
    { c: '/tag', cat: '计分', u: '/tag <玩家> <add | remove | list> <标签>', d: '实体标签', e: '/tag @s add vip', v: '全版本' },

    { c: '/structure', cat: '结构', u: '/structure <save | load | delete> <名称> <坐标> <尺寸>', d: '保存/加载建筑结构', e: '/structure save house ~ ~ ~ ~10 ~10 ~10', v: '全版本' },
    { c: '/function', cat: '结构', u: '/function <函数>', d: '运行行为包函数', e: '/function mypack/start', v: '1.17+' },
    { c: '/dialogue', cat: '结构', u: '/dialogue open <NPC> <玩家> <对话>', d: '打开对话界面（地图交互）', e: '/dialogue open @e[type=npc] @s mytalk', v: '1.17.10+' },

    { c: '/execute', cat: '执行', u: '/execute <as | at | if | unless | run> ...', d: '条件执行（1.19.10 起与新语法一致）', e: '/execute as @a at @s run summon lightning_bolt', v: '1.19.10+' },
    { c: '/connect', cat: '执行', u: '/connect <服务器地址:端口>', d: '从游戏内跳转服务器', e: '/connect play.example.com:19132', v: '全版本（需权限）' }
  ],

  /* ---------------- 方块表 ----------------
     num = 1.12.2 及更早的数字 ID；null 表示 1.13+ 已无数字 ID
  */
  blocks: [
    { i: 'air', n: '空气', en: 'Air', num: 0 },
    { i: 'stone', n: '石头', en: 'Stone', num: 1 },
    { i: 'granite', n: '花岗岩', en: 'Granite', num: 1 },
    { i: 'diorite', n: '闪长岩', en: 'Diorite', num: 1 },
    { i: 'andesite', n: '安山岩', en: 'Andesite', num: 1 },
    { i: 'grass_block', n: '草方块', en: 'Grass Block', num: 2, note: '旧名 grass' },
    { i: 'dirt', n: '泥土', en: 'Dirt', num: 3 },
    { i: 'coarse_dirt', n: '砂土', en: 'Coarse Dirt', num: 3 },
    { i: 'podzol', n: '灰化土', en: 'Podzol', num: 3 },
    { i: 'cobblestone', n: '圆石', en: 'Cobblestone', num: 4 },
    { i: 'oak_planks', n: '橡木木板', en: 'Oak Planks', num: 5 },
    { i: 'spruce_planks', n: '云杉木板', en: 'Spruce Planks', num: 5 },
    { i: 'birch_planks', n: '白桦木板', en: 'Birch Planks', num: 5 },
    { i: 'jungle_planks', n: '丛林木板', en: 'Jungle Planks', num: 5 },
    { i: 'acacia_planks', n: '金合欢木板', en: 'Acacia Planks', num: 5 },
    { i: 'dark_oak_planks', n: '深色橡木木板', en: 'Dark Oak Planks', num: 5 },
    { i: 'bedrock', n: '基岩', en: 'Bedrock', num: 7 },
    { i: 'sand', n: '沙子', en: 'Sand', num: 12 },
    { i: 'red_sand', n: '红沙', en: 'Red Sand', num: 12 },
    { i: 'gravel', n: '沙砾', en: 'Gravel', num: 13 },
    { i: 'gold_ore', n: '金矿石', en: 'Gold Ore', num: 14 },
    { i: 'iron_ore', n: '铁矿石', en: 'Iron Ore', num: 15 },
    { i: 'coal_ore', n: '煤矿石', en: 'Coal Ore', num: 16 },
    { i: 'oak_log', n: '橡木原木', en: 'Oak Log', num: 17 },
    { i: 'spruce_log', n: '云杉原木', en: 'Spruce Log', num: 17 },
    { i: 'birch_log', n: '白桦原木', en: 'Birch Log', num: 17 },
    { i: 'jungle_log', n: '丛林原木', en: 'Jungle Log', num: 17 },
    { i: 'oak_leaves', n: '橡树树叶', en: 'Oak Leaves', num: 18 },
    { i: 'spruce_leaves', n: '云杉树叶', en: 'Spruce Leaves', num: 18 },
    { i: 'sponge', n: '海绵', en: 'Sponge', num: 19 },
    { i: 'wet_sponge', n: '湿海绵', en: 'Wet Sponge', num: 19 },
    { i: 'glass', n: '玻璃', en: 'Glass', num: 20 },
    { i: 'lapis_ore', n: '青金石矿石', en: 'Lapis Ore', num: 21 },
    { i: 'lapis_block', n: '青金石块', en: 'Lapis Block', num: 22 },
    { i: 'dispenser', n: '发射器', en: 'Dispenser', num: 23 },
    { i: 'sandstone', n: '砂岩', en: 'Sandstone', num: 24 },
    { i: 'note_block', n: '音符盒', en: 'Note Block', num: 25 },
    { i: 'red_bed', n: '床', en: 'Bed', num: 26 },
    { i: 'powered_rail', n: '动力铁轨', en: 'Powered Rail', num: 27 },
    { i: 'detector_rail', n: '探测铁轨', en: 'Detector Rail', num: 28 },
    { i: 'sticky_piston', n: '黏性活塞', en: 'Sticky Piston', num: 29 },
    { i: 'cobweb', n: '蜘蛛网', en: 'Cobweb', num: 30 },
    { i: 'short_grass', n: '草', en: 'Short Grass', num: 31, note: '旧名 tall_grass / grass' },
    { i: 'dead_bush', n: '枯萎的灌木', en: 'Dead Bush', num: 32 },
    { i: 'piston', n: '活塞', en: 'Piston', num: 33 },
    { i: 'white_wool', n: '白色羊毛', en: 'White Wool', num: 35 },
    { i: 'red_wool', n: '红色羊毛', en: 'Red Wool', num: 35 },
    { i: 'blue_wool', n: '蓝色羊毛', en: 'Blue Wool', num: 35 },
    { i: 'black_wool', n: '黑色羊毛', en: 'Black Wool', num: 35 },
    { i: 'dandelion', n: '蒲公英', en: 'Dandelion', num: 37 },
    { i: 'poppy', n: '虞美人', en: 'Poppy', num: 38 },
    { i: 'brown_mushroom', n: '棕色蘑菇', en: 'Brown Mushroom', num: 39 },
    { i: 'red_mushroom', n: '红色蘑菇', en: 'Red Mushroom', num: 40 },
    { i: 'gold_block', n: '金块', en: 'Gold Block', num: 41 },
    { i: 'iron_block', n: '铁块', en: 'Iron Block', num: 42 },
    { i: 'smooth_stone_slab', n: '平滑石头台阶', en: 'Smooth Stone Slab', num: 44 },
    { i: 'bricks', n: '砖块', en: 'Bricks', num: 45 },
    { i: 'tnt', n: 'TNT', en: 'TNT', num: 46 },
    { i: 'bookshelf', n: '书架', en: 'Bookshelf', num: 47 },
    { i: 'mossy_cobblestone', n: '苔石', en: 'Mossy Cobblestone', num: 48 },
    { i: 'obsidian', n: '黑曜石', en: 'Obsidian', num: 49 },
    { i: 'torch', n: '火把', en: 'Torch', num: 50 },
    { i: 'fire', n: '火', en: 'Fire', num: 51 },
    { i: 'spawner', n: '刷怪笼', en: 'Monster Spawner', num: 52 },
    { i: 'oak_stairs', n: '橡木楼梯', en: 'Oak Stairs', num: 53 },
    { i: 'chest', n: '箱子', en: 'Chest', num: 54 },
    { i: 'redstone_wire', n: '红石线', en: 'Redstone Wire', num: 55 },
    { i: 'diamond_ore', n: '钻石矿石', en: 'Diamond Ore', num: 56 },
    { i: 'diamond_block', n: '钻石块', en: 'Diamond Block', num: 57 },
    { i: 'crafting_table', n: '工作台', en: 'Crafting Table', num: 58 },
    { i: 'wheat', n: '小麦', en: 'Wheat', num: 59 },
    { i: 'farmland', n: '耕地', en: 'Farmland', num: 60 },
    { i: 'furnace', n: '熔炉', en: 'Furnace', num: 61 },
    { i: 'oak_sign', n: '橡木告示牌', en: 'Oak Sign', num: 63 },
    { i: 'oak_door', n: '橡木门', en: 'Oak Door', num: 64 },
    { i: 'ladder', n: '梯子', en: 'Ladder', num: 65 },
    { i: 'rail', n: '铁轨', en: 'Rail', num: 66 },
    { i: 'stone_stairs', n: '石楼梯', en: 'Stone Stairs', num: 67 },
    { i: 'lever', n: '拉杆', en: 'Lever', num: 69 },
    { i: 'stone_pressure_plate', n: '石压力板', en: 'Stone Pressure Plate', num: 70 },
    { i: 'iron_door', n: '铁门', en: 'Iron Door', num: 71 },
    { i: 'oak_pressure_plate', n: '橡木压力板', en: 'Oak Pressure Plate', num: 72 },
    { i: 'redstone_ore', n: '红石矿石', en: 'Redstone Ore', num: 73 },
    { i: 'redstone_torch', n: '红石火把', en: 'Redstone Torch', num: 76 },
    { i: 'stone_button', n: '石按钮', en: 'Stone Button', num: 77 },
    { i: 'snow', n: '雪', en: 'Snow', num: 78 },
    { i: 'ice', n: '冰', en: 'Ice', num: 79 },
    { i: 'snow_block', n: '雪块', en: 'Snow Block', num: 80 },
    { i: 'cactus', n: '仙人掌', en: 'Cactus', num: 81 },
    { i: 'clay', n: '黏土', en: 'Clay', num: 82 },
    { i: 'sugar_cane', n: '甘蔗', en: 'Sugar Cane', num: 83 },
    { i: 'jukebox', n: '唱片机', en: 'Jukebox', num: 84 },
    { i: 'oak_fence', n: '橡木栅栏', en: 'Oak Fence', num: 85 },
    { i: 'carved_pumpkin', n: '雕刻过的南瓜', en: 'Carved Pumpkin', num: 86 },
    { i: 'netherrack', n: '下界岩', en: 'Netherrack', num: 87 },
    { i: 'soul_sand', n: '灵魂沙', en: 'Soul Sand', num: 88 },
    { i: 'glowstone', n: '萤石', en: 'Glowstone', num: 89 },
    { i: 'nether_portal', n: '下界传送门', en: 'Nether Portal', num: 90 },
    { i: 'jack_o_lantern', n: '南瓜灯', en: 'Jack o Lantern', num: 91 },
    { i: 'cake', n: '蛋糕', en: 'Cake', num: 92 },
    { i: 'repeater', n: '红石中继器', en: 'Repeater', num: 93 },
    { i: 'white_stained_glass', n: '白色染色玻璃', en: 'White Stained Glass', num: 95 },
    { i: 'oak_trapdoor', n: '橡木活板门', en: 'Oak Trapdoor', num: 96 },
    { i: 'stone_bricks', n: '石砖', en: 'Stone Bricks', num: 98 },
    { i: 'brown_mushroom_block', n: '棕色蘑菇方块', en: 'Brown Mushroom Block', num: 99 },
    { i: 'red_mushroom_block', n: '红色蘑菇方块', en: 'Red Mushroom Block', num: 100 },
    { i: 'iron_bars', n: '铁栏杆', en: 'Iron Bars', num: 101 },
    { i: 'glass_pane', n: '玻璃板', en: 'Glass Pane', num: 102 },
    { i: 'melon', n: '西瓜', en: 'Melon', num: 103 },
    { i: 'vine', n: '藤蔓', en: 'Vines', num: 106 },
    { i: 'oak_fence_gate', n: '橡木栅栏门', en: 'Oak Fence Gate', num: 107 },
    { i: 'brick_stairs', n: '砖楼梯', en: 'Brick Stairs', num: 108 },
    { i: 'mycelium', n: '菌丝体', en: 'Mycelium', num: 110 },
    { i: 'lily_pad', n: '睡莲', en: 'Lily Pad', num: 111 },
    { i: 'nether_bricks', n: '下界砖块', en: 'Nether Bricks', num: 112 },
    { i: 'nether_wart', n: '下界疣', en: 'Nether Wart', num: 115 },
    { i: 'enchanting_table', n: '附魔台', en: 'Enchanting Table', num: 116 },
    { i: 'brewing_stand', n: '酿造台', en: 'Brewing Stand', num: 117 },
    { i: 'cauldron', n: '炼药锅', en: 'Cauldron', num: 118 },
    { i: 'end_portal', n: '末地传送门', en: 'End Portal', num: 119 },
    { i: 'end_portal_frame', n: '末地传送门框架', en: 'End Portal Frame', num: 120 },
    { i: 'end_stone', n: '末地石', en: 'End Stone', num: 121 },
    { i: 'dragon_egg', n: '龙蛋', en: 'Dragon Egg', num: 122 },
    { i: 'redstone_lamp', n: '红石灯', en: 'Redstone Lamp', num: 123 },
    { i: 'oak_slab', n: '橡木台阶', en: 'Oak Slab', num: 126 },
    { i: 'sandstone_stairs', n: '砂岩楼梯', en: 'Sandstone Stairs', num: 128 },
    { i: 'emerald_ore', n: '绿宝石矿石', en: 'Emerald Ore', num: 129 },
    { i: 'ender_chest', n: '末影箱', en: 'Ender Chest', num: 130 },
    { i: 'tripwire_hook', n: '绊线钩', en: 'Tripwire Hook', num: 131 },
    { i: 'tripwire', n: '绊线', en: 'Tripwire', num: 132 },
    { i: 'emerald_block', n: '绿宝石块', en: 'Emerald Block', num: 133 },
    { i: 'spruce_stairs', n: '云杉楼梯', en: 'Spruce Stairs', num: 134 },
    { i: 'birch_stairs', n: '白桦楼梯', en: 'Birch Stairs', num: 135 },
    { i: 'command_block', n: '命令方块', en: 'Command Block', num: 137 },
    { i: 'beacon', n: '信标', en: 'Beacon', num: 138 },
    { i: 'cobblestone_wall', n: '圆石墙', en: 'Cobblestone Wall', num: 139 },
    { i: 'flower_pot', n: '花盆', en: 'Flower Pot', num: 140 },
    { i: 'carrots', n: '胡萝卜', en: 'Carrots', num: 141 },
    { i: 'potatoes', n: '马铃薯', en: 'Potatoes', num: 142 },
    { i: 'oak_button', n: '橡木按钮', en: 'Oak Button', num: 143 },
    { i: 'anvil', n: '铁砧', en: 'Anvil', num: 145 },
    { i: 'trapped_chest', n: '陷阱箱', en: 'Trapped Chest', num: 146 },
    { i: 'light_weighted_pressure_plate', n: '轻质测重压力板', en: 'Light Weighted Pressure Plate', num: 147 },
    { i: 'heavy_weighted_pressure_plate', n: '重质测重压力板', en: 'Heavy Weighted Pressure Plate', num: 148 },
    { i: 'comparator', n: '红石比较器', en: 'Comparator', num: 149 },
    { i: 'daylight_detector', n: '阳光探测器', en: 'Daylight Detector', num: 151 },
    { i: 'redstone_block', n: '红石块', en: 'Redstone Block', num: 152 },
    { i: 'nether_quartz_ore', n: '下界石英矿石', en: 'Nether Quartz Ore', num: 153 },
    { i: 'hopper', n: '漏斗', en: 'Hopper', num: 154 },
    { i: 'quartz_block', n: '石英块', en: 'Quartz Block', num: 155 },
    { i: 'activator_rail', n: '激活铁轨', en: 'Activator Rail', num: 157 },
    { i: 'dropper', n: '投掷器', en: 'Dropper', num: 158 },
    { i: 'white_terracotta', n: '白色陶瓦', en: 'White Terracotta', num: 159 },
    { i: 'white_stained_glass_pane', n: '白色染色玻璃板', en: 'White Stained Glass Pane', num: 160 },
    { i: 'acacia_leaves', n: '金合欢树叶', en: 'Acacia Leaves', num: 161 },
    { i: 'acacia_log', n: '金合欢原木', en: 'Acacia Log', num: 162 },
    { i: 'dark_oak_log', n: '深色橡木原木', en: 'Dark Oak Log', num: 162 },
    { i: 'slime_block', n: '黏液块', en: 'Slime Block', num: 165 },
    { i: 'barrier', n: '屏障', en: 'Barrier', num: 166 },
    { i: 'iron_trapdoor', n: '铁活板门', en: 'Iron Trapdoor', num: 167 },
    { i: 'prismarine', n: '海晶石', en: 'Prismarine', num: 168 },
    { i: 'sea_lantern', n: '海晶灯', en: 'Sea Lantern', num: 169 },
    { i: 'hay_block', n: '干草捆', en: 'Hay Block', num: 170 },
    { i: 'white_carpet', n: '白色地毯', en: 'White Carpet', num: 171 },
    { i: 'terracotta', n: '陶瓦', en: 'Terracotta', num: 172 },
    { i: 'coal_block', n: '煤炭块', en: 'Coal Block', num: 173 },
    { i: 'packed_ice', n: '浮冰', en: 'Packed Ice', num: 174 },
    { i: 'sunflower', n: '向日葵', en: 'Sunflower', num: 175 },
    { i: 'lilac', n: '丁香', en: 'Lilac', num: 175 },
    { i: 'red_sandstone', n: '红砂岩', en: 'Red Sandstone', num: 179 },
    { i: 'spruce_fence_gate', n: '云杉栅栏门', en: 'Spruce Fence Gate', num: 183 },
    { i: 'spruce_fence', n: '云杉栅栏', en: 'Spruce Fence', num: 188 },
    { i: 'spruce_door', n: '云杉门', en: 'Spruce Door', num: 193 },
    { i: 'end_rod', n: '末地烛', en: 'End Rod', num: 198 },
    { i: 'chorus_plant', n: '紫颂植物', en: 'Chorus Plant', num: 199 },
    { i: 'chorus_flower', n: '紫颂花', en: 'Chorus Flower', num: 200 },
    { i: 'purpur_block', n: '紫珀块', en: 'Purpur Block', num: 201 },
    { i: 'purpur_pillar', n: '紫珀柱', en: 'Purpur Pillar', num: 202 },
    { i: 'end_stone_bricks', n: '末地石砖', en: 'End Stone Bricks', num: 206 },
    { i: 'beetroots', n: '甜菜根', en: 'Beetroots', num: 207 },
    { i: 'dirt_path', n: '土径', en: 'Dirt Path', num: 208, note: '旧名 grass_path' },
    { i: 'repeating_command_block', n: '循环命令方块', en: 'Repeating Command Block', num: 210 },
    { i: 'chain_command_block', n: '连锁命令方块', en: 'Chain Command Block', num: 211 },
    { i: 'frosted_ice', n: '霜冰', en: 'Frosted Ice', num: 212 },
    { i: 'magma_block', n: '岩浆块', en: 'Magma Block', num: 213 },
    { i: 'nether_wart_block', n: '下界疣块', en: 'Nether Wart Block', num: 214 },
    { i: 'red_nether_bricks', n: '红色下界砖块', en: 'Red Nether Bricks', num: 215 },
    { i: 'bone_block', n: '骨块', en: 'Bone Block', num: 216 },
    { i: 'structure_void', n: '结构空位', en: 'Structure Void', num: 217 },
    { i: 'observer', n: '侦测器', en: 'Observer', num: 218 },
    { i: 'white_shulker_box', n: '白色潜影盒', en: 'White Shulker Box', num: 219 },
    { i: 'shulker_box', n: '潜影盒', en: 'Shulker Box', num: 234 },
    { i: 'white_glazed_terracotta', n: '白色带釉陶瓦', en: 'White Glazed Terracotta', num: 235 },
    { i: 'black_glazed_terracotta', n: '黑色带釉陶瓦', en: 'Black Glazed Terracotta', num: 250 },

    /* 1.13+ 方块：无数字 ID */
    { i: 'stripped_oak_log', n: '去皮橡木原木', en: 'Stripped Oak Log', num: null },
    { i: 'oak_wood', n: '橡木木头', en: 'Oak Wood', num: null },
    { i: 'smooth_stone', n: '平滑石头', en: 'Smooth Stone', num: null },
    { i: 'stone_slab', n: '石头台阶', en: 'Stone Slab', num: null },
    { i: 'cobblestone_slab', n: '圆石台阶', en: 'Cobblestone Slab', num: null },
    { i: 'mossy_stone_bricks', n: '苔石砖', en: 'Mossy Stone Bricks', num: null },
    { i: 'cracked_stone_bricks', n: '裂纹石砖', en: 'Cracked Stone Bricks', num: null },
    { i: 'chiseled_stone_bricks', n: '錾制石砖', en: 'Chiseled Stone Bricks', num: null },
    { i: 'deepslate', n: '深板岩', en: 'Deepslate', num: null },
    { i: 'cobbled_deepslate', n: '深板岩圆石', en: 'Cobbled Deepslate', num: null },
    { i: 'tuff', n: '凝灰岩', en: 'Tuff', num: null },
    { i: 'calcite', n: '方解石', en: 'Calcite', num: null },
    { i: 'amethyst_block', n: '紫水晶块', en: 'Amethyst Block', num: null },
    { i: 'copper_block', n: '铜块', en: 'Block of Copper', num: null },
    { i: 'oxidized_copper', n: '氧化铜块', en: 'Oxidized Copper', num: null },
    { i: 'raw_iron_block', n: '粗铁块', en: 'Block of Raw Iron', num: null },
    { i: 'raw_copper_block', n: '粗铜块', en: 'Block of Raw Copper', num: null },
    { i: 'deepslate_diamond_ore', n: '深层钻石矿石', en: 'Deepslate Diamond Ore', num: null },
    { i: 'sculk', n: '幽匿块', en: 'Sculk', num: null },
    { i: 'sculk_catalyst', n: '幽匿催发体', en: 'Sculk Catalyst', num: null },
    { i: 'sculk_sensor', n: '幽匿感测体', en: 'Sculk Sensor', num: null },
    { i: 'mud', n: '泥巴', en: 'Mud', num: null },
    { i: 'mangrove_log', n: '红树木原木', en: 'Mangrove Log', num: null },
    { i: 'cherry_planks', n: '樱花木板', en: 'Cherry Planks', num: null },
    { i: 'bamboo_block', n: '竹块', en: 'Block of Bamboo', num: null },
    { i: 'netherite_block', n: '下界合金块', en: 'Block of Netherite', num: null },
    { i: 'ancient_debris', n: '远古残骸', en: 'Ancient Debris', num: null },
    { i: 'crying_obsidian', n: '哭泣的黑曜石', en: 'Crying Obsidian', num: null },
    { i: 'respawn_anchor', n: '重生锚', en: 'Respawn Anchor', num: null },
    { i: 'blackstone', n: '黑石', en: 'Blackstone', num: null },
    { i: 'basalt', n: '玄武岩', en: 'Basalt', num: null },
    { i: 'soul_soil', n: '灵魂土', en: 'Soul Soil', num: null },
    { i: 'shroomlight', n: '菌光体', en: 'Shroomlight', num: null },
    { i: 'nether_gold_ore', n: '下界金矿石', en: 'Nether Gold Ore', num: null },
    { i: 'quartz_bricks', n: '石英砖', en: 'Quartz Bricks', num: null },
    { i: 'honey_block', n: '蜂蜜块', en: 'Honey Block', num: null },
    { i: 'honeycomb_block', n: '蜜脾块', en: 'Honeycomb Block', num: null },
    { i: 'mud_bricks', n: '泥砖', en: 'Mud Bricks', num: null },
    { i: 'packed_mud', n: '泥坯', en: 'Packed Mud', num: null },
    { i: 'moss_block', n: '苔藓块', en: 'Moss Block', num: null },
    { i: 'azalea_leaves', n: '杜鹃花叶', en: 'Azalea Leaves', num: null },
    { i: 'dripstone_block', n: '滴水石块', en: 'Dripstone Block', num: null },
    { i: 'pointed_dripstone', n: '滴水石锥', en: 'Pointed Dripstone', num: null },
    { i: 'glow_lichen', n: '发光地衣', en: 'Glow Lichen', num: null },
    { i: 'light', n: '光源方块', en: 'Light Block', num: null },
    { i: 'structure_block', n: '结构方块', en: 'Structure Block', num: null },
    { i: 'jigsaw', n: '拼图方块', en: 'Jigsaw Block', num: null }
  ],

  /* ---------------- 颜色代码 ---------------- */
  colorCodes: [
    { code: '0', name: '黑色', hex: '#000000' },
    { code: '1', name: '深蓝', hex: '#0000AA' },
    { code: '2', name: '深绿', hex: '#00AA00' },
    { code: '3', name: '深青', hex: '#00AAAA' },
    { code: '4', name: '深红', hex: '#AA0000' },
    { code: '5', name: '紫色', hex: '#AA00AA' },
    { code: '6', name: '金色', hex: '#FFAA00' },
    { code: '7', name: '灰色', hex: '#AAAAAA' },
    { code: '8', name: '深灰', hex: '#555555' },
    { code: '9', name: '蓝色', hex: '#5555FF' },
    { code: 'a', name: '绿色', hex: '#55FF55' },
    { code: 'b', name: '青色', hex: '#55FFFF' },
    { code: 'c', name: '红色', hex: '#FF5555' },
    { code: 'd', name: '粉色', hex: '#FF55FF' },
    { code: 'e', name: '黄色', hex: '#FFFF55' },
    { code: 'f', name: '白色', hex: '#FFFFFF' }
  ],

  /* ---------------- 工具 ---------------- */
  tools: [
    {
      id: 'color', name: '颜色代码', en: 'COLOR', icon: 'palette', desc: '生成 & 颜色 / 样式代码，并实时预览效果',
      fields: [
        { key: 'text', label: '文字', type: 'text', value: '世界织卷', hint: '支持中文与符号' },
        { key: 'color', label: '颜色', type: 'select', value: '6', options: [] },
        { key: 'style', label: '样式', type: 'select', value: 'none', options: [{ v: 'none', t: '普通' }, { v: 'l', t: '加粗' }, { v: 'o', t: '斜体' }, { v: 'n', t: '下划线' }, { v: 'm', t: '删除线' }] }
      ]
    },
    {
      id: 'projection', name: '投影网站', en: 'SCHEMATIC', icon: 'globe', kind: 'projection',
      desc: 'Litematica 投影模组、.schematic 蓝图与建筑地图网站合集'
    },
    {
      id: 'seed', name: 'MC种子查找器', en: 'SEED MAP', icon: 'search', kind: 'seed',
      desc: '输入种子和版本，打开 Chunkbase 种子地图查找村庄、要塞与群系'
    },
    {
      id: 'java', name: 'Java 下载', en: 'JDK 8 / 17 / 21 / 26', icon: 'download', kind: 'java',
      desc: 'Java 8 / 17 / 21 / 26 官方下载入口，按 Minecraft 版本选择'
    },
    {
      id: 'network', name: '联网工具', en: 'NETWORK', icon: 'globe', kind: 'network',
      desc: '樱花内网穿透、蓝盾、playit.gg、Cloudflare Tunnel 等联机工具集合'
    },
    {
      id: 'pixel', name: '红石音乐 / 像素画生成网站', en: 'MCPIXELART', icon: 'palette', kind: 'pixel-site',
      desc: '跳转 mcpixelart.com，在线制作像素画与红石音乐'
    }
  ],

  /* ---------------- 投影 / 蓝图网站 ---------------- */
  projectionSites: [
    {
      name: 'Litematica', en: 'MODRINTH', url: 'https://modrinth.com/mod/litematica',
      desc: 'masa 的客户端投影模组，可加载 .litematic 蓝图并在游戏内逐块投影。',
      tags: ['投影模组', 'Fabric', '客户端']
    },
    {
      name: 'Masa 模组页', en: 'MASA.DY.FI', url: 'https://masa.dy.fi/t/mc/',
      desc: 'Litematica / MiniHUD / Tweakeroo 等 masa 系模组的官方下载与说明。',
      tags: ['官方下载', '投影', '工具']
    },
    {
      name: 'Minecraft Schematics', en: 'SCHEMATICS', url: 'https://www.minecraft-schematics.com/',
      desc: '大量 .schematic / .schem 建筑蓝图，按分类和版本筛选后下载。',
      tags: ['蓝图', '建筑', '存档']
    },
    {
      name: 'GrabCraft', en: 'GRABCRAFT', url: 'https://www.grabcraft.com/',
      desc: '按建筑类型浏览的蓝图站，城堡、房屋、像素画与大型地标都有。',
      tags: ['蓝图', '建筑', '像素画']
    },
    {
      name: 'Planet Minecraft', en: 'PLANETMINECRAFT', url: 'https://www.planetminecraft.com/projects/',
      desc: '国际创作社区，地图、建筑存档与投影作品分享，附带截图和版本说明。',
      tags: ['社区', '地图', '建筑']
    },
    {
      name: 'Schematica', en: 'CURSEFORGE', url: 'https://www.curseforge.com/minecraft/mc-mods/schematica',
      desc: '经典建造辅助模组，可导入 .schematic 并在世界中显示半透明轮廓。',
      tags: ['投影', 'Forge', '建造']
    },
    {
      name: '苦力怕论坛', en: 'KLPBBS', url: 'https://klpbbs.com/',
      desc: '中文 Minecraft 社区，地图、建筑、整合包与基岩版资源都很活跃。',
      tags: ['中文社区', '地图', '基岩版']
    }
  ],

  /* ---------------- 复杂指令库 ----------------
     每条都带 code（可直接载入编辑器）、hint（输入提示）与 s（引入版本）。
  */
  complexCommands: [
    {
      id: 'execute-chain', name: 'execute 条件执行链', cat: '执行', edition: 'java', s: 13.2,
      desc: '站在草方块上的玩家脚下生成绿色粒子，演示 as / at / if / run 的组合。',
      hint: 'execute 的条件与执行顺序从左到右生效；at 只改坐标，不改执行者。',
      code: '/execute as @a at @s if block ~ ~-1 ~ minecraft:grass_block run particle minecraft:happy_villager ~ ~1 ~ 0.2 0.2 0.2 0 8'
    },
    {
      id: 'execute-store', name: 'execute store 写入记分板', cat: '执行', edition: 'java', s: 13.2,
      desc: '读取玩家主手物品数量，把结果写进 coins 记分板，做商店或计分系统时常用。',
      hint: 'store result 保存返回值，store success 只保存 0/1 是否成功。',
      code: '/execute store result score @s coins run data get entity @s SelectedItem.Count'
    },
    {
      id: 'execute-if-entity', name: 'execute if entity 条件判断', cat: '执行', edition: 'java', s: 13.2,
      desc: '检测附近是否有僵尸，有则播放音效并给玩家提示。',
      hint: 'if entity 只判断存在；要判断数量请配合 limit 或 scoreboard。',
      code: '/execute if entity @e[type=minecraft:zombie,distance=..10,limit=1] run playsound minecraft:entity.zombie.ambient hostile @a ~ ~ ~ 1 1'
    },
    {
      id: 'summon-armor-stand', name: 'summon 盔甲架展示台', cat: '实体', edition: 'java', s: 8.9,
      desc: '生成一个隐形、无重力、带自定义名字的盔甲架，适合做悬浮文字或商店展示。',
      hint: 'Invisible:1b、Marker:1b、NoGravity:1b 是盔甲架展示三件套。',
      code: '/summon minecraft:armor_stand ~ ~1 ~ {Invisible:1b,Marker:1b,NoGravity:1b,CustomNameVisible:1b,CustomName:\'{"text":"世界织卷","color":"gold"}\'}'
    },
    {
      id: 'summon-gear', name: 'summon 穿戴装备的僵尸', cat: '实体', edition: 'java', s: 13.2,
      desc: '生成一只戴头盔、穿胸甲、手持钻石剑的僵尸，可指定掉落率与拾取行为。',
      hint: 'HandItems / ArmorItems 是列表，每个装备用 {id:"...",Count:1b} 表示。',
      code: '/summon minecraft:zombie ~ ~ ~ {CustomName:\'{"text":"守卫"}\',HandItems:[{id:"minecraft:diamond_sword",Count:1b},{}],ArmorItems:[{},{id:"minecraft:diamond_chestplate",Count:1b},{},{id:"minecraft:iron_helmet",Count:1b}],ArmorDropChances:[0.0f,0.0f,0.0f,0.0f]}'
    },
    {
      id: 'tellraw-click', name: 'tellraw 可点击消息', cat: '文本', edition: 'java', s: 8.9,
      desc: '发送一条金色可点击消息，点击后执行 /spawn，适合做菜单和公告。',
      hint: 'clickEvent.action 可选 run_command / suggest_command / open_url。',
      code: '/tellraw @a [{"text":"[点击回到出生点]","color":"gold","bold":true,"clickEvent":{"action":"run_command","value":"/spawn"}},{"text":" 世界织卷","color":"gray"}]'
    },
    {
      id: 'title-timing', name: 'title 标题与时间轴', cat: '文本', edition: 'java', s: 8.9,
      desc: '同时设置主标题、副标题，并用 times 控制淡入、停留、淡出。',
      hint: 'title times 的 3 个数字单位是 tick，20 tick = 1 秒。',
      code: '/title @a times 10 50 20\n/title @a subtitle {"text":"欢迎来到服务器","color":"gray"}\n/title @a title {"text":"世界织卷","color":"gold","bold":true}'
    },
    {
      id: 'scoreboard-sidebar', name: 'scoreboard 侧边栏计分', cat: '计分', edition: 'java', s: 8.9,
      desc: '创建 coins 目标并显示在侧边栏，然后把玩家分数设为 100。',
      hint: 'dummy 目标不会自动变化，需要命令或插件手动加减分。',
      code: '/scoreboard objectives add coins dummy "金币"\n/scoreboard objectives setdisplay sidebar coins\n/scoreboard players set @s coins 100'
    },
    {
      id: 'bossbar', name: 'bossbar 自定义 Boss 血条', cat: '文本', edition: 'java', s: 13.2,
      desc: '创建一个紫色 Boss 血条，设置名称、颜色、样式与进度。',
      hint: 'bossbar 的 id 可以自定义命名空间，value 范围是 0..1。',
      code: '/bossbar add worldweave:boss {"text":"世界织卷 · 守关者","color":"light_purple"}\n/bossbar set worldweave:boss color purple\n/bossbar set worldweave:boss style notched_10\n/bossbar set worldweave:boss value 0.75'
    },
    {
      id: 'item-modify', name: 'item modify 修改物品', cat: '物品', edition: 'java', s: 17,
      desc: '把主手物品的名字改成金色并加一行描述，适合做任务道具。',
      hint: '1.17+ 用 item modify；更早版本用 /data merge 或 /give 的 NBT。',
      code: '/item modify entity @s weapon.mainhand worldweave:rename'
    },
    {
      id: 'data-merge', name: 'data merge 合并 NBT', cat: '实体', edition: 'java', s: 13.2,
      desc: '给最近的盔甲架加上发光效果与自定义名字，演示 merge 的增量修改。',
      hint: 'data merge 只覆盖给出的键，不会删除其他 NBT。',
      code: '/data merge entity @e[type=minecraft:armor_stand,limit=1,sort=nearest] {Glowing:1b,CustomName:\'{"text":"展示台","color":"aqua"}\'}'
    },
    {
      id: 'particle-ring', name: 'particle 粒子圆环', cat: '世界', edition: 'java', s: 13.2,
      desc: '以玩家为中心生成一圈火焰粒子；把坐标改成变量即可做技能特效。',
      hint: '粒子数量太多会卡顿，手机端建议 count 控制在 50 以内。',
      code: '/execute at @s run particle minecraft:flame ~ ~1 ~ 1.5 0.2 1.5 0 80 normal'
    },
    {
      id: 'fill-hollow', name: 'fill 空心墙', cat: '世界', edition: 'java', s: 8.9,
      desc: '在玩家前方生成 9×5 的空心石墙，hollow 只填充外轮廓。',
      hint: 'fill 单次最多 32768 格；更大区域请拆成多条或使用数据包函数。',
      code: '/fill ~2 ~ ~-4 ~10 ~4 ~4 minecraft:stone_bricks hollow'
    },
    {
      id: 'worldborder', name: 'worldborder 世界边界', cat: '世界', edition: 'java', s: 8.9,
      desc: '把世界边界收缩到 500 格，并设置 10 秒的收缩动画与伤害缓冲。',
      hint: 'border 以方块中心为基准，set 的数值是半径而不是直径。',
      code: '/worldborder set 500 10\n/worldborder damage buffer 5\n/worldborder damage amount 2'
    },
    {
      id: 'attribute-modifier', name: 'attribute 属性修饰符', cat: '实体', edition: 'java', s: 16.5,
      desc: '给玩家增加 20 点最大生命值，并立即补满血量。',
      hint: '1.21 起属性名去掉了 generic. 前缀，旧版本仍使用 generic.max_health。',
      code: '/attribute @s minecraft:generic.max_health modifier add worldweave:bonus 20 add_value\n/effect give @s minecraft:instant_health 1 10 true'
    },
    {
      id: 'random-score', name: 'random 随机数写入记分板', cat: '执行', edition: 'java', s: 20.2,
      desc: '掷一个 1..100 的随机数并存进 roll 记分板，可做抽奖或战斗判定。',
      hint: 'random value 的范围写法是 min..max，结果可通过 store 保存。',
      code: '/execute store result score @s roll run random value 1..100'
    },
    {
      id: 'schedule-function', name: 'schedule 定时执行函数', cat: '执行', edition: 'java', s: 14,
      desc: '5 秒后执行一次数据包函数，适合做延时开门、Boss 阶段切换。',
      hint: '函数必须先放在数据包的 data/<命名空间>/functions 目录里。',
      code: '/schedule function worldweave:boss_phase 5s replace'
    },
    {
      id: 'clone-masked', name: 'clone 区域复制', cat: '世界', edition: 'java', s: 8.9,
      desc: '把玩家脚下的 3×3×3 区域复制到前方 10 格，masked 只复制非空气方块。',
      hint: 'clone 的目标坐标是复制区域的最小角，不是中心。',
      code: '/clone ~-1 ~-1 ~-1 ~1 ~1 ~1 ~10 ~-1 ~-1 masked'
    },
    {
      id: 'team-friendly', name: 'team 队伍与友伤', cat: '计分', edition: 'java', s: 8.9,
      desc: '创建红队、关闭队友伤害并把玩家加入红队。',
      hint: 'friendfire 在 1.13+ 使用，旧版本用 friendlyfire 的数值写法。',
      code: '/team add red "红队"\n/team modify red color red\n/team modify red friendlyFire false\n/team join red @s'
    },
    {
      id: 'advancement-grant', name: 'advancement 授予进度', cat: '玩家', edition: 'java', s: 12,
      desc: '只授予某个进度的根节点，用于解锁自定义进度树或奖励。',
      hint: 'grant only 只给当前节点，grant through 会补齐前置。',
      code: '/advancement grant @s only minecraft:story/root'
    },
    {
      id: 'loot-chest', name: 'loot 发放战利品', cat: '物品', edition: 'java', s: 14,
      desc: '把简单地牢箱子里的战利品直接发给玩家。',
      hint: 'loot 的来源可以是 loot 表、方块、实体或钓鱼。',
      code: '/loot give @s loot minecraft:chests/simple_dungeon'
    },
    {
      id: 'ride-stack', name: 'ride 实体叠叠乐', cat: '实体', edition: 'java', s: 19.4,
      desc: '让最近的船骑到玩家身上，做出可移动的展示台或载具。',
      hint: 'ride 可以连续 mount，形成多层实体堆叠。',
      code: '/ride @e[type=minecraft:boat,limit=1,sort=nearest] mount @s'
    },
    {
      id: 'bedrock-execute', name: '基岩版 execute 条件链', cat: '执行', edition: 'bedrock', s: 19.1,
      desc: '1.19.10 起基岩版 execute 与 Java 对齐，可用 as / at / if / run。',
      hint: '1.19.10 之前仍是 /execute <实体> <x> <y> <z> <指令> 的旧语法。',
      code: '/execute as @a at @s if block ~ ~-1 ~ grass_block run particle minecraft:happy_villager_particle ~ ~1 ~'
    },
    {
      id: 'bedrock-tellraw', name: '基岩版 tellraw rawtext', cat: '文本', edition: 'bedrock', s: 16.1,
      desc: '基岩版没有 Java 的 text 组件，必须用 rawtext 数组包一层。',
      hint: '基岩版文本颜色用 § 代码，rawtext 里的 text 不支持 clickEvent。',
      code: '/tellraw @a {"rawtext":[{"text":"§6世界织卷 §7· 欢迎回来"}]}'
    },
    {
      id: 'bedrock-structure', name: 'structure 保存建筑', cat: '结构', edition: 'bedrock', s: 16.1,
      desc: '把玩家周围 10×10×10 的建筑保存为结构，之后可随时 load 回来。',
      hint: '结构名不能重复；保存前先确认区域包含完整建筑。',
      code: '/structure save house ~-5 ~ ~-5 ~5 ~10 ~5\n/structure load house ~ ~ ~'
    },
    {
      id: 'bedrock-camera', name: 'camera 镜头运镜', cat: '玩家', edition: 'bedrock', s: 19.8,
      desc: '把玩家镜头固定到空中机位，做地图过场动画或展示 PV。',
      hint: 'camera clear 才会把镜头还给玩家；别忘了在结尾清掉。',
      code: '/camera @s set minecraft:free pos 0 80 0 rot 0 30\n/camera @s fade color 0 0 0 1\n/camera @s clear'
    },
    {
      id: 'bedrock-dialogue', name: 'dialogue NPC 对话', cat: '结构', edition: 'bedrock', s: 17.1,
      desc: '打开指定 NPC 的对话界面，适合做地图剧情与任务发布。',
      hint: '对话内容要先在行为包里定义，再通过 dialogue open 调用。',
      code: '/dialogue open @e[type=npc,c=1] @s worldweave_intro'
    },
    {
      id: 'bedrock-fog', name: 'fog 自定义雾效', cat: '文本', edition: 'bedrock', s: 16.1,
      desc: '给玩家叠加下界雾效，做恐怖地图或场景切换。',
      hint: 'fog push 可叠加，fog remove 指定 id 才能移除。',
      code: '/fog @s push minecraft:fog_hell worldweave_hell\n/fog @s remove worldweave_hell'
    }
  ]
};
