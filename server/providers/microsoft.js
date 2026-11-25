/* =========================================================
   Microsoft / Xbox 官方登录
   标准 OAuth 2.0 设备码授权（Device Code Flow）：
     微软令牌 → Xbox Live (XBL) → XSTS → Minecraft Services
   只有全链路拿到真实的 Minecraft 档案才算登录成功。
   需要 MS_CLIENT_ID（Azure 应用注册，公共客户端，无需密钥）。
   ========================================================= */
'use strict';

const config = require('../config');

const MS_BASE = () => `https://login.microsoftonline.com/${config.microsoft.tenant}/oauth2/v2.0`;
const XBL_URL = 'https://user.auth.xboxlive.com/user/authenticate';
const XSTS_URL = 'https://xsts.auth.xboxlive.com/xsts/authorize';
const MC_LOGIN_URL = 'https://api.minecraftservices.com/authentication/login_with_xbox';
const MC_PROFILE_URL = 'https://api.minecraftservices.com/minecraft/profile';

const XSTS_ERRORS = {
  2148916227: '该微软账号已被 Xbox 封禁，无法登录。',
  2148916233: '该微软账号还没有 Xbox 账号，请先在 xbox.com 创建。',
  2148916235: '该微软账号所在地区不支持 Xbox Live。',
  2148916236: '该微软账号需要先完成成人验证。',
  2148916237: '该微软账号需要先完成成人验证。',
  2148916238: '未成年账号需要加入家庭组后才能登录。'
};

function requireClientId() {
  if (!config.isConfigured.microsoft) {
    throw Object.assign(new Error('微软登录未配置：缺少 MS_CLIENT_ID'), {
      status: 503,
      code: 'ms_not_configured'
    });
  }
}

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 保留文本 */ }
  return { ok: res.ok, status: res.status, json, text };
}

/* ---------------- 第一步：申请设备码 ---------------- */
async function startDeviceCode() {
  requireClientId();
  const form = new URLSearchParams({
    client_id: config.microsoft.clientId,
    scope: config.microsoft.scopes
  });
  const res = await fetch(`${MS_BASE()}/devicecode`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
    signal: AbortSignal.timeout(20000)
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || !json.device_code) {
    throw Object.assign(
      new Error((json && (json.error_description || json.error)) || '无法获取微软设备码'),
      { status: 502, code: 'ms_device_code_failed' }
    );
  }
  return {
    deviceCode: json.device_code,
    userCode: json.user_code,
    verificationUri: json.verification_uri,
    expiresIn: json.expires_in,
    interval: json.interval || 5,
    message: json.message
  };
}

/* ---------------- 第二步：轮询令牌 ---------------- */
async function pollDeviceCode(deviceCode) {
  requireClientId();
  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    client_id: config.microsoft.clientId,
    device_code: deviceCode
  });
  const res = await fetch(`${MS_BASE()}/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
    signal: AbortSignal.timeout(20000)
  });
  const json = await res.json().catch(() => null);
  if (res.ok && json && json.access_token) {
    return { status: 'ok', tokens: json };
  }
  const error = json && json.error;
  if (error === 'authorization_pending') return { status: 'pending' };
  if (error === 'slow_down') return { status: 'slow_down' };
  if (error === 'expired_token') return { status: 'expired' };
  if (error === 'authorization_declined') return { status: 'declined' };
  return {
    status: 'failed',
    message: (json && (json.error_description || json.error)) || '微软授权失败'
  };
}

/* ---------------- 第三步：Xbox Live → XSTS → Minecraft ---------------- */
async function resolveXboxProfile(msAccessToken) {
  const xbl = await postJson(XBL_URL, {
    Properties: {
      AuthMethod: 'RPS',
      SiteName: 'user.auth.xboxlive.com',
      RpsTicket: 'd=' + msAccessToken
    },
    RelyingParty: 'http://auth.xboxlive.com',
    TokenType: 'JWT'
  });
  if (!xbl.ok || !xbl.json || !xbl.json.Token) {
    throw Object.assign(new Error('Xbox Live 认证失败'), { status: 502, code: 'xbl_failed' });
  }
  const userHash = xbl.json.DisplayClaims.xui[0].uhs;
  const gamertag = xbl.json.DisplayClaims.xui[0].gtg || '';

  const xsts = await postJson(XSTS_URL, {
    Properties: { SandboxId: 'RETAIL', UserTokens: [xbl.json.Token] },
    RelyingParty: 'rp://api.minecraftservices.com/',
    TokenType: 'JWT'
  });
  if (!xsts.ok || !xsts.json || !xsts.json.Token) {
    const xerr = xsts.json && (xsts.json.XErr || (xsts.json.DisplayClaims && xsts.json.DisplayClaims.xui && xsts.json.DisplayClaims.xui[0] && xsts.json.DisplayClaims.xui[0].XErr));
    if (xerr && XSTS_ERRORS[xerr]) {
      throw Object.assign(new Error(XSTS_ERRORS[xerr]), { status: 403, code: 'xsts_denied' });
    }
    throw Object.assign(new Error('Xbox 安全令牌校验失败'), { status: 502, code: 'xsts_failed' });
  }
  const xstsToken = xsts.json.Token;
  const xstsHash = xsts.json.DisplayClaims.xui[0].uhs || userHash;

  const mc = await postJson(MC_LOGIN_URL, {
    identityToken: `XBL3.0 x=${xstsHash};${xstsToken}`
  });
  if (!mc.ok || !mc.json || !mc.json.access_token) {
    throw Object.assign(new Error('Minecraft 服务拒绝该账号（可能没有正版 Java 版）'), {
      status: 403,
      code: 'mc_login_failed'
    });
  }

  const profileRes = await fetch(MC_PROFILE_URL, {
    headers: { authorization: 'Bearer ' + mc.json.access_token },
    signal: AbortSignal.timeout(20000)
  });
  if (!profileRes.ok) {
    throw Object.assign(new Error('该微软账号没有 Minecraft Java 版档案'), {
      status: 403,
      code: 'mc_profile_missing'
    });
  }
  const profile = await profileRes.json();
  return {
    profileId: profile.id,
    name: profile.name,
    gamertag,
    skins: Array.isArray(profile.skins) ? profile.skins : []
  };
}

module.exports = { startDeviceCode, pollDeviceCode, resolveXboxProfile, XSTS_ERRORS };
