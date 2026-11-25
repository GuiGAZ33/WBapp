/* =========================================================
   短信服务商适配层
   严格模式：未配置短信通道时一律发送失败（登录随之失败），
   绝不使用本地假验证码。
   ========================================================= */
'use strict';

const crypto = require('node:crypto');
const config = require('../config');

/** RFC3986 百分号编码（阿里云签名要求） */
function percentEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

/* ---------------- 阿里云短信（RPC 风格，HMAC-SHA1） ---------------- */
async function sendViaAliyun(phone, code) {
  const { accessKeyId, accessKeySecret, endpoint } = config.sms.aliyun;
  if (!accessKeyId || !accessKeySecret) {
    throw Object.assign(new Error('阿里云短信密钥未配置'), { status: 503, code: 'sms_not_configured' });
  }
  const params = {
    AccessKeyId: accessKeyId,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: phone,
    RegionId: 'cn-hangzhou',
    SignName: config.sms.signName,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: '1.0',
    TemplateCode: config.sms.templateCode,
    TemplateParam: JSON.stringify({ [config.sms.templateParamKey]: code }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2017-05-25'
  };
  const canonical = Object.keys(params)
    .sort()
    .map((k) => percentEncode(k) + '=' + percentEncode(params[k]))
    .join('&');
  const stringToSign = 'GET&%2F&' + percentEncode(canonical);
  const signature = crypto
    .createHmac('sha1', accessKeySecret + '&')
    .update(stringToSign)
    .digest('base64');

  const url = endpoint.replace(/\/$/, '') + '/?Signature=' + percentEncode(signature) + '&' + canonical;
  const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15000) });
  const body = await res.text();
  let json = null;
  try { json = JSON.parse(body); } catch { /* 保留原始文本 */ }
  if (!res.ok || !json || json.Code !== 'OK') {
    const detail = json ? `${json.Code || ''} ${json.Message || ''}`.trim() : String(body).slice(0, 200);
    throw Object.assign(new Error(`短信发送失败：${detail || res.status}`), { status: 502, code: 'sms_send_failed' });
  }
  return true;
}

/* ---------------- 自定义网关：POST JSON 到自己的短信中间件 ---------------- */
async function sendViaCustom(phone, code) {
  const { url, token } = config.sms.custom;
  if (!url || !token) {
    throw Object.assign(new Error('自定义短信网关未配置'), { status: 503, code: 'sms_not_configured' });
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      phone,
      code,
      template: config.sms.templateCode,
      signName: config.sms.signName
    }),
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 200);
    throw Object.assign(new Error(`短信网关返回 ${res.status} ${detail}`), { status: 502, code: 'sms_send_failed' });
  }
  return true;
}

/**
 * 发送验证码。未配置通道时抛出 503，调用方据此让登录失败。
 */
async function sendCode(phone, code) {
  if (!config.isConfigured.sms) {
    throw Object.assign(
      new Error('短信服务未配置：无法发送官方验证码'),
      { status: 503, code: 'sms_not_configured' }
    );
  }
  if (config.sms.provider === 'aliyun') return sendViaAliyun(phone, code);
  if (config.sms.provider === 'custom') return sendViaCustom(phone, code);
  throw Object.assign(new Error('未知的短信服务商'), { status: 503, code: 'sms_not_configured' });
}

module.exports = { sendCode, percentEncode };
