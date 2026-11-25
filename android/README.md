# 世界织卷 · Android 存储与权限接入

本目录提供原生壳的 **AndroidManifest 权限模板** 与 FileProvider 路径文件。主 APP 是 WebView/PWA，真正的系统权限必须由原生壳申请并暴露给 `window.WWShell`。

## 文件

- `AndroidManifest.xml`：权限与 application 模板，合并到原生壳清单；把包名与 `.MainActivity` 改成真实值。
- `res/xml/file_paths.xml`：FileProvider 的下载目录 / 外部目录路径，复制到 `android/app/src/main/res/xml/`。

## 运行时权限

首次进入主 APP 会显示权限门，只有全部权限允许后才能使用。原生壳需要实现并返回真实状态：

```js
WWShell.getPermissionStatus() // 返回 { storage, notifications, camera, microphone, packages }
WWShell.requestAllPermissions() // 申请全部并返回上述对象
WWShell.openAppSettings() // 跳系统设置
```

如果未实现 `requestAllPermissions()`，前端会逐个调用：

```js
WWShell.requestStoragePermission()
WWShell.requestNotificationPermission()
WWShell.requestCameraPermission()
WWShell.requestMicrophonePermission()
WWShell.requestPackagePermission()
```

未实现的单个接口会被视为允许；已实现但返回 `false` 会阻止进入 APP。

> Android 11+ 的「所有文件访问」需要引导用户到系统设置开启 `MANAGE_EXTERNAL_STORAGE`；Android 13+ 通知需要 `POST_NOTIFICATIONS`，媒体读取需要 `READ_MEDIA_*`。Google Play 对 `MANAGE_EXTERNAL_STORAGE` / `QUERY_ALL_PACKAGES` 有严格审核要求，上架前请确认用途符合政策。

## 存储 / APK 接口

```js
WWShell.getDownloadPath() // 返回 "/storage/emulated/0/Download"
WWShell.listFiles(path) // 返回 [{name,path,size,modified,isDirectory}]
WWShell.listApkFiles() // 可选，返回 APK 数组
WWShell.openFile(path) // 打开 APK / 文件
WWShell.getStoragePaths() // 可选，{ download, app, external }
```

主 APP 的「我的 → 存储与 APK」会显示下载路径和 APK 文件，点击文件调用 `openFile`。所有 `.schem`、`.apk` 更新包和导出文件统一写入 `getDownloadPath()` 返回的下载目录。

## 后台

管理后台在 `/admin/`，账号密码登录，不经过前台权限门；后台权限与前台 Android 权限互不影响。
