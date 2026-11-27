# 世界织卷 · Android 原生壳（WebView）

本目录是「世界织卷APP-v2.1.5.apk」的原生壳源码：一个极简 WebView 容器，
把仓库根目录的网页资源打进 APK 的 `assets/`，并通过本地 https 源
（`https://appassets.androidplatform.net`）加载 `index.html`，从而保证
localStorage / DOM Storage 正常工作。

## 行为

- 启动直接加载网页版「世界织卷」，进入动画与百分比进度由网页自身实现。
- 所有 `http(s)` 外链（资源站、启动器、QQ 群网页回退）一律交给系统浏览器打开。
- `mqqapi://`、`qq://`、`tel:` 等自定义 scheme 交给系统 Intent 处理（已装 QQ 时直接打开名片/群）。
- 声明并申请存储权限；导出文件（`.schem`、APK 更新包等）优先写入系统「下载」目录。
- `window.WWNative` 是 Java 桥，`shell.js` 把它包装成网页使用的 `window.WWShell`。
- 不依赖任何第三方 SDK，APK 仅约 20 MB（体积主要来自内置 BGM 与启动器封面）。

## 构建（Termux / Linux 均可，需要 JDK 17 + android.jar + d8 + aapt + apksigner）

```bash
# 1) 准备 assets：把仓库根目录的网页文件复制进 assets/（排除 server、admin、_test、android 等目录）
# 2) 编译
javac -source 8 -target 8 -bootclasspath android.jar -d out/classes \
      src/com/szyj/worldweave/MainActivity.java
(cd out/classes && zip -qr ../classes.jar .)
java -cp d8.jar com.android.tools.r8.D8 --release --min-api 21 --lib android.jar \
      --output out/dex out/classes.jar
# 3) 打包资源与 assets
aapt package -f -M AndroidManifest.xml -S res -A assets -I android.jar -F out/base.apk \
      --min-sdk-version 21 --target-sdk-version 29 --version-code 7 --version-name 2.1.5
(cd out && aapt add base.apk classes.dex)
# 4) 签名
apksigner sign --ks release.jks --out 世界织卷APP-v2.1.5.apk out/base.apk
```

## 说明

- `targetSdkVersion` 为 29，保留旧版存储模型；Android 10 及以上导出文件走 MediaStore 写入「下载」目录。
- 网页通过 `WWShell.getPermissionStatus()` 读取权限；壳内除存储外一律视为已允许，避免权限门卡住。
- 账号服务（`server/`）不随 APK 打包：账号密码在本机注册即登录；手机验证码 / QQ 邮箱 / 微软 Xbox
  需要自行部署 `server/server.js` 并在网页里配置 `window.WW_API_BASE`。
