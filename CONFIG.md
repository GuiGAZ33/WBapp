# 配置与真实登录接入指南

默认状态下**所有联网登录方式都会失败**，这是设计目标：没有真实凭据就不放行。
要让某一种方式真正可用，按下面配置对应凭据，然后重启服务。

> 当前前端登录界面为 **账号密码（本机注册即登录）+ 登录后切换微软 / Xbox**。下面的手机号与 QQ 邮箱配置仍由服务端保留，用于兼容旧版 API；普通用户不会在 APP 内看到这些入口。

```bash
cp server/.env.example server/.env
# 编辑 server/.env
node server/server.js
```

## 1. 手机号短信验证码

需要短信服务商（国内需实名 + 模板报备）。本项目内置**阿里云短信**适配器。

1. 在阿里云开通「短信服务」，申请签名（`SMS_SIGN_NAME`）与验证码模板（`SMS_TEMPLATE_CODE`，模板变量名默认 `code`）。
2. 创建 RAM 用户并授予 `AliyunDysmsFullAccess`，拿到 AccessKey。
3. 填写：

```ini
SMS_PROVIDER=aliyun
SMS_SIGN_NAME=你的签名
SMS_TEMPLATE_CODE=SMS_123456789
SMS_TEMPLATE_PARAM_KEY=code
ALIYUN_ACCESS_KEY_ID=...
ALIYUN_ACCESS_KEY_SECRET=...
```

也可用 `SMS_PROVIDER=custom` 接入自己的短信网关：服务端会 `POST {phone, code, template, signName}` 到 `SMS_CUSTOM_URL`，带 `Authorization: Bearer $SMS_CUSTOM_TOKEN`，返回 2xx 视为发送成功。

**验证码规则**：6 位随机数字，5 分钟有效，60 秒冷却，最多尝试 5 次，一次性使用；发送失败则不写入记录，前端可直接重试。

> 没有短信通道时，`POST /api/auth/phone/code` 返回 `503 sms_not_configured`，手机登录必然失败。

## 2. QQ 邮箱

腾讯**不提供**第三方使用 QQ 密码登录的接口（网页登录有滑块 / 风控，且违反第三方接入规范）。
官方支持的方式是 **IMAP 授权码**：

1. 用浏览器登录 [mail.qq.com](https://mail.qq.com/)。
2. 设置 → 账号 → 开启「IMAP/SMTP 服务」（需短信验证）。
3. 生成 16 位授权码。

用户在应用里填写「QQ 号 + 16 位授权码」，服务端用 IMAP `LOGIN` 直连 `imap.qq.com:993` 校验：

- 登录成功 → 证明邮箱与凭据真实有效 → 建号并发放会话。
- 返回 `NO`/`BAD`、连接失败、超时 → 登录失败。
- 服务端**不保存**授权码，只保存校验通过后的邮箱。

```ini
QQ_IMAP_HOST=imap.qq.com
QQ_IMAP_PORT=993
QQ_ALLOW_PASSWORD=false   # 不建议改：QQ 密码走第三方登录会被拒绝
```

若要支持企业邮箱或 QQ 互联 OAuth，替换 `server/providers/qqmail.js` 中的 `verifyQqMail` 即可。

## 3. 微软 / Xbox

采用标准 OAuth 2.0 **设备码流程**，用户密码只输入在微软官方页面：

1. 打开 [Azure Portal](https://portal.azure.com/) → Microsoft Entra ID → 应用注册 → 新注册。
2. 账户类型选择「仅个人 Microsoft 账户」（对应 `MS_TENANT=consumers`）。
3. 在「身份验证」里启用 **允许公共客户端流**（Allow public client flows = 是）。
4. 复制「应用程序(客户端) ID」：

```ini
MS_CLIENT_ID=你的客户端ID
MS_TENANT=consumers
MS_SCOPES=XboxLive.signin offline_access
```

登录链路（任一环节失败即整体失败）：

```
设备码 → 微软令牌 → Xbox Live (XBL) → XSTS → Minecraft Services → 正版档案
```

常见失败原因会翻译成中文提示，例如「该微软账号还没有 Xbox 账号」「该账号没有 Minecraft Java 版档案」。

> 本项目不再提供「邮箱 + 密码直接登录微软」的假流程——那既无法验证真实性，也不该收集用户密码。

## 4. 部署与安全

```ini
HOST=127.0.0.1        # 对外部署改成 0.0.0.0 并置于反向代理之后
PORT=8787
ALLOWED_ORIGINS=*     # 收紧时可写成 https://your.domain
```

- 会话令牌：32 字节随机数，服务端只存 SHA-256 摘要，默认 30 天有效，可随时撤销。
- 密码：scrypt + 随机盐，`timingSafeEqual` 比对，绝不明文存储或回传。
- 限流：验证码 8 次 / 10 分钟 / IP，校验 20 次 / 10 分钟；注册 10 次 / 小时。
- 静态服务禁止访问 `server/`、隐藏文件，并拦截路径穿越。
- 生产环境请务必启用 HTTPS，否则短信验证码与令牌会在传输中明文暴露。

### 前端指向远端服务

网页和账号服务不同源时，在 `index.html` 里 `bridge.js` **之前**声明地址：

```html
<script>window.WW_API_BASE = 'https://api.your-domain.com';</script>
<script src="bridge.js"></script>
```

同源部署（服务端同时托管静态文件）则无需配置。用 `file://` 直接打开时，前端默认回退到 `http://127.0.0.1:8787`。

## 5. 内置更新与原生壳

`update.json` 与 `index.html` 同目录，前端检查更新时读取它。发布新 APK 后填写：

```json
{
  "version": "2.1.5",
  "releasedAt": "2026-12-01",
  "notes": ["本次更新内容"],
  "packageUrl": "https://your.domain/download/世界织卷APP-v2.1.5.apk",
  "filename": "世界织卷APP-v2.1.5.apk",
  "size": 23456789,
  "sha256": "APK 的 SHA-256（小写十六进制）",
  "minVersion": "1.0.0",
  "mandatory": false
}
```

- 下载进度显示在「设置 → 关于软件 / 更新」中，文件保存到系统下载路径（默认 `/storage/emulated/0/Download`）。
- 有 `sha256` 时前端会校验更新包，校验失败拒绝安装。
- 原生壳建议实现：
  - `requestStoragePermission()`
  - `saveFile(filename, base64, mime, targetPath)`
  - `installFile(fullPath)` / `openFile(fullPath)`
  - `listInstalledApps()` 返回包名数组，`launchApp(packageName)` 打开应用
  - `checkUpdate()` 可选；不实现时走 HTTP `update.json`
- 没有原生壳时，浏览器只能下载 APK / `.schem` 到下载目录，不能静默安装。

## 6. 管理后台

后台地址：`http://127.0.0.1:8787/admin/`。

- 首次本机访问：页面会要求创建管理员账号与密码，保存在 `server/data/admin.json`（scrypt 哈希）。
- 远程部署：首次初始化仅允许 loopback；先在 `server/.env` 配置：

```ini
ADMIN_USERNAME=你的管理员账号
ADMIN_PASSWORD=至少8位的密码
ADMIN_SESSION_TTL_HOURS=12
```

- 管理员会话只存内存，服务重启后需重新登录；登录失败有 IP 限流。
- 后台可停用 / 启用账号、重置密码、强制下线、删除账号；停用会立刻撤销该账号所有会话。
- 后台可直接编辑 `update.json`，保存后主 APP 检查更新会立即读取；发布 APK 时填 `packageUrl`、`filename`、`size`、`sha256`。
- 主 APP 的本机账号（只存浏览器 localStorage）不会出现在后台，这是设计差异，不是数据丢失。

## 7. Android 权限 / 下载目录（2.1.5）

- `android/AndroidManifest.xml` 提供存储、通知、相机、麦克风、已安装应用、安装包与前台服务权限模板。
- `android/res/xml/file_paths.xml` 提供下载目录 / 外部目录的 FileProvider 路径。
- 首次启动必须通过 APP 权限门；原生壳需实现：

```js
WWShell.getPermissionStatus()
WWShell.requestAllPermissions()
WWShell.openAppSettings()
WWShell.getDownloadPath()
WWShell.listFiles(path)
WWShell.listApkFiles() // 可选
WWShell.openFile(path)
```

- `WWShell.getDownloadPath()` 返回真实下载目录，主 APP 的所有 `.schem` 与更新 APK 都写入该路径；不再支持改到其他目录。
- `WWShell.listFiles(path)` 返回 `{name,path,size,modified,isDirectory}` 数组，「我的 → 存储与 APK」会读取并显示。
- 浏览器无法获得 Android 存储权限时会回退到选择文件夹读取；导出仍使用浏览器默认下载目录。
- 后台 `/admin/` 不经过前台权限门，后台管理员权限与 Android 权限互不影响。

## 8. 开发调试

只有显式设置 `ALLOW_DEV_CODE=1` 且**仅监听 127.0.0.1** 时，才会跳过真实短信发送、把验证码打印到控制台并在响应里返回 `devCode`。默认关闭，切勿在生产开启。

```bash
PORT=8788 ALLOW_DEV_CODE=1 node server/server.js
node server/selftest.js http://127.0.0.1:8788
```
