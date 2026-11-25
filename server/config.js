/* =========================================================
   世界织卷APP · 服务端配置
   零依赖：只用 Node 内置模块。配置全部来自环境变量或 server/.env
   ========================================================= */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

/** 极简 .env 解析：KEY=VALUE，# 开头为注释，支持引号 */
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(path.join(__dirname, '.env'));

const str = (key, fallback = '') => (process.env[key] || fallback).trim();
const num = (key, fallback) => {
  const n = Number(process.env[key]);
  return Number.isFinite(n) ? n : fallback;
};
const bool = (key, fallback = false) => {
  const v = str(key).toLowerCase();
  if (!v) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v);
};

const config = {
  root: ROOT,
  host: str('HOST', '127.0.0.1'),
  port: num('PORT', 8787),
  dataDir: path.resolve(ROOT, str('DATA_DIR', 'server/data')),
  sessionTtlMs: num('SESSION_TTL_DAYS', 30) * 24 * 3600 * 1000,
  /* 只允许这些来源跨域访问 API（file:// 打开时 Origin 为 null） */
  allowedOrigins: str('ALLOWED_ORIGINS', '*'),

  /* 开发专用：把验证码打印到控制台，默认关闭，且只允许本机监听 */
  allowDevCode: bool('ALLOW_DEV_CODE', false),

  sms: {
    provider: str('SMS_PROVIDER', 'none').toLowerCase(), // none | aliyun | custom
    signName: str('SMS_SIGN_NAME'),
    templateCode: str('SMS_TEMPLATE_CODE'),
    templateParamKey: str('SMS_TEMPLATE_PARAM_KEY', 'code'),
    aliyun: {
      accessKeyId: str('ALIYUN_ACCESS_KEY_ID'),
      accessKeySecret: str('ALIYUN_ACCESS_KEY_SECRET'),
      endpoint: str('ALIYUN_SMS_ENDPOINT', 'https://dysmsapi.aliyuncs.com/')
    },
    custom: {
      url: str('SMS_CUSTOM_URL'),
      token: str('SMS_CUSTOM_TOKEN')
    },
    codeTtlMs: num('SMS_CODE_TTL_SECONDS', 300) * 1000,
    resendCooldownMs: num('SMS_RESEND_COOLDOWN_SECONDS', 60) * 1000,
    maxAttempts: num('SMS_MAX_ATTEMPTS', 5)
  },

  qq: {
    imapHost: str('QQ_IMAP_HOST', 'imap.qq.com'),
    imapPort: num('QQ_IMAP_PORT', 993),
    /* QQ 邮箱第三方登录必须使用「授权码」，不是 QQ 密码 */
    allowPassword: bool('QQ_ALLOW_PASSWORD', false)
  },

  microsoft: {
    clientId: str('MS_CLIENT_ID'),
    tenant: str('MS_TENANT', 'consumers'),
    scopes: str('MS_SCOPES', 'XboxLive.signin offline_access')
  },

  /* 管理后台：首次本机访问可初始化；也可用环境变量固定管理员 */
  admin: {
    username: str('ADMIN_USERNAME'),
    password: str('ADMIN_PASSWORD'),
    sessionTtlMs: num('ADMIN_SESSION_TTL_HOURS', 12) * 3600 * 1000
  }
};

config.isConfigured = {
  sms: config.sms.provider !== 'none' && Boolean(config.sms.signName) && Boolean(config.sms.templateCode),
  qq: true,
  microsoft: Boolean(config.microsoft.clientId)
};

module.exports = config;
