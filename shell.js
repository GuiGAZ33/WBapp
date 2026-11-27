/* =========================================================
   世界织卷APP · 原生壳适配（仅安卓 WebView 壳内生效）
   浏览器打开时 window.WWNative 不存在，本文件不做任何事。
   所有方法统一返回 Promise，兼容 await 与 .then 两种写法。
   ========================================================= */
(function () {
  'use strict';
  if (!window.WWNative) return;

  const N = window.WWNative;
  const str = (v) => (v === undefined || v === null ? '' : String(v));

  function invoke(name) {
    try {
      if (typeof N[name] !== 'function') return undefined;
      return N[name].apply(N, Array.prototype.slice.call(arguments, 1));
    } catch (e) {
      return undefined;
    }
  }

  function jsonOr(fallback, text) {
    try {
      const value = JSON.parse(text);
      return value && typeof value === 'object' ? value : fallback;
    } catch (e) {
      return fallback;
    }
  }

  const ok = (value) => Promise.resolve(value);

  window.WWShell = {
    openExternal(url) {
      if (!url) return ok(false);
      invoke('openExternal', str(url));
      return ok(true);
    },
    getDownloadPath() {
      return ok(str(invoke('getDownloadPath')) || '/storage/emulated/0/Download');
    },
    getDownloadsPath() {
      return this.getDownloadPath();
    },
    getDownloadDir() {
      return this.getDownloadPath();
    },
    getStoragePaths() {
      const p = str(invoke('getDownloadPath')) || '/storage/emulated/0/Download';
      return ok({ download: p, downloads: p, path: p, app: p, external: p });
    },
    saveFile(name, base64, mime, dir) {
      return ok(invoke('saveFile', str(name), str(base64), str(mime), str(dir)) === true);
    },
    requestStoragePermission() {
      return ok(invoke('requestStoragePermission') !== false);
    },
    getPermissionStatus() {
      return ok(jsonOr({}, str(invoke('getPermissionStatus'))));
    },
    requestAllPermissions() {
      return ok(jsonOr({}, str(invoke('requestAllPermissions'))));
    },
    fileExists(path) {
      return ok(invoke('fileExists', str(path)) === true);
    },
    listFiles(path) {
      const list = jsonOr([], str(invoke('listFiles', str(path))));
      return ok(Array.isArray(list) ? list : []);
    },
    openFile(path) {
      return ok(invoke('openFile', str(path)) === true);
    },
    installFile(path) {
      return ok(invoke('installFile', str(path)) === true);
    },
    checkUpdate() {
      return ok(null);
    }
  };
})();
