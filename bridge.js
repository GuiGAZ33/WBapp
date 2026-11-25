/* =========================================================
   世界织卷APP · 桥接层（浏览器可用，原生壳可扩展）
   - 账号 API 客户端（严格模式：服务端返回失败即失败）
   - 所有外链统一交给系统浏览器打开
   - 官方 QQ 群 / QQ 好友名片跳转
   - 不申请任何存储权限：设置只写入浏览器 localStorage
   ========================================================= */
(function () {
  'use strict';

  const TOKEN_KEY = 'szyj.token.v1';
  const API_BASE_KEY = 'szyj.apiBase.v1';
  const QQ_GROUP = '1137437440';

  /* ---------------- 服务地址 ---------------- */
  function apiBase() {
    if (typeof window.WW_API_BASE === 'string' && window.WW_API_BASE) return window.WW_API_BASE.replace(/\/$/, '');
    // 由服务端托管时使用同源地址；直接用文件打开时回退到本机服务
    if (location.protocol === 'http:' || location.protocol === 'https:') return '';
    let saved = '';
    try { saved = localStorage.getItem(API_BASE_KEY) || ''; } catch { /* ignore */ }
    return (saved || 'http://127.0.0.1:8787').replace(/\/$/, '');
  }

  /* ---------------- 错误类型 ---------------- */
  class WWError extends Error {
    constructor(code, message, status) {
      super(message || '操作失败');
      this.name = 'WWError';
      this.code = code || 'error';
      this.status = status || 0;
    }
  }

  /* ---------------- 令牌 ---------------- */
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  }
  function setToken(token) {
    try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  }

  /* ---------------- API 客户端 ---------------- */
  async function api(path, options = {}) {
    const { method = 'POST', body, auth = true, timeout = 25000 } = options;
    const headers = {};
    if (body !== undefined) headers['content-type'] = 'application/json';
    const token = getToken();
    if (auth && token) headers.authorization = 'Bearer ' + token;

    let res;
    try {
      res = await fetch(apiBase() + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeout)
      });
    } catch (err) {
      if (err && err.name === 'TimeoutError') {
        throw new WWError('network_timeout', '账号服务响应超时，请稍后重试', 0);
      }
      throw new WWError('network', '无法连接账号服务，请确认账号服务已启动（node server/server.js）', 0);
    }

    let payload = null;
    const text = await res.text().catch(() => '');
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!payload || typeof payload !== 'object') {
      throw new WWError('bad_response', `账号服务返回异常（HTTP ${res.status}）`, res.status);
    }
    if (!payload.ok) {
      const error = payload.error || {};
      throw new WWError(error.code || 'error', error.message || '操作失败', res.status);
    }
    return payload.data;
  }

  async function health() {
    try {
      return await api('/api/health', { method: 'GET', auth: false, timeout: 6000 });
    } catch {
      return null;
    }
  }

  async function me() {
    if (!getToken()) return null;
    try {
      const data = await api('/api/auth/me', { method: 'GET' });
      return data.user;
    } catch (err) {
      if (err.status === 401) setToken('');
      return null;
    }
  }

  async function logout() {
    try { await api('/api/auth/logout', { body: {} }); } catch { /* 本地登出不受影响 */ }
    setToken('');
  }

  /* ---------------- 外链统一走系统浏览器 ---------------- */
  function openExternal(url) {
    if (!url) return false;
    const target = String(url);
    // 1. 原生壳：由安卓 / iOS 壳交给系统浏览器，绝不在 WebView 内打开
    if (window.WWShell && typeof window.WWShell.openExternal === 'function') {
      try { window.WWShell.openExternal(target); return true; } catch { /* 回退 */ }
    }
    // 2. Capacitor：AppLauncher 打开系统默认浏览器
    try {
      const cap = window.Capacitor;
      if (cap && cap.Plugins && cap.Plugins.AppLauncher && typeof cap.Plugins.AppLauncher.openUrl === 'function') {
        cap.Plugins.AppLauncher.openUrl({ url: target });
        return true;
      }
      if (cap && cap.Plugins && cap.Plugins.Browser && typeof cap.Plugins.Browser.open === 'function') {
        cap.Plugins.Browser.open({ url: target });
        return true;
      }
    } catch { /* 回退 */ }
    // 3. Cordova InAppBrowser：_system 明确交给系统浏览器
    try {
      if (window.cordova && window.cordova.InAppBrowser && typeof window.cordova.InAppBrowser.open === 'function') {
        window.cordova.InAppBrowser.open(target, '_system');
        return true;
      }
    } catch { /* 回退 */ }
    // 4. 普通手机浏览器：新标签页打开，避免把当前 SPA 导航走
    const a = document.createElement('a');
    a.href = target;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  }

  function isHttpLink(value) {
    return /^https?:\/\//i.test(String(value || ''));
  }

  /* ---------------- 官方 QQ 群 / QQ 好友 ---------------- */
  function qqCardScheme(qq, cardType) {
    const p = new URLSearchParams({
      src_type: 'internal',
      version: '1',
      uin: String(qq),
      card_type: cardType === 'group' ? 'group' : 'friend',
      source: 'qrcode'
    });
    return 'mqqapi://card/show_pslcard?' + p.toString();
  }

  function qqGroupScheme(qqGroup) {
    const uin = String(qqGroup || QQ_GROUP).replace(/\D/g, '') || QQ_GROUP;
    return qqCardScheme(uin, 'group');
  }

  function qqFriendScheme(qq) {
    return qqCardScheme(qq, 'friend');
  }

  /**
   * 打开 QQ 名片：移动端尝试 mqqapi 深链，未安装 QQ 时回退到网页版。
   * @param {string} qq QQ 号
   * @param {'group'|'friend'} cardType 名片类型
   * @param {string} webFallback 未安装 QQ 时打开的网页
   * @returns {Promise<'app'|'web'>} 实际使用的通道
   */
  function openQQCard(qq, cardType, webFallback) {
    return new Promise((resolve) => {
      const isMobile = /android|iphone|ipad|ipod|harmony/i.test(navigator.userAgent);
      if (!isMobile) {
        openExternal(webFallback);
        resolve('web');
        return;
      }
      let handled = false;
      const onHide = () => { if (document.hidden) handled = true; };
      document.addEventListener('visibilitychange', onHide);
      try {
        location.href = qqCardScheme(qq, cardType);
      } catch { /* ignore */ }
      setTimeout(() => {
        document.removeEventListener('visibilitychange', onHide);
        if (handled || document.hidden) {
          resolve('app');
          return;
        }
        openExternal(webFallback);
        resolve('web');
      }, 1400);
    });
  }

  /** 打开指定 QQ 群，不传参时打开官方群 */
  function openQQGroup(qqGroup) {
    const uin = String(qqGroup || QQ_GROUP).replace(/\D/g, '') || QQ_GROUP;
    return openQQCard(uin, 'group', 'https://qun.qq.com/');
  }

  /** 打开某个 QQ 的加好友名片 */
  function openQQFriend(qq) {
    const uin = String(qq || '').replace(/\D/g, '');
    if (!uin) return Promise.resolve('web');
    const fallback = 'https://wpa.qq.com/msgrd?v=3&uin=' + encodeURIComponent(uin) + '&site=qq&menu=yes';
    return openQQCard(uin, 'friend', fallback);
  }

  window.WW = {
    TOKEN_KEY,
    QQ_GROUP,
    WWError,
    apiBase,
    api,
    health,
    me,
    logout,
    getToken,
    setToken,
    openExternal,
    isHttpLink,
    openQQGroup,
    openQQFriend,
    qqGroupScheme,
    qqFriendScheme
  };
})();
