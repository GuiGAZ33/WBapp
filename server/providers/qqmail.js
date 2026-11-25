/* =========================================================
   QQ 邮箱真实性校验（IMAP over TLS）
   说明：QQ 邮箱没有对第三方开放的「密码登录」接口。
   第三方应用只能使用 QQ 邮箱的「授权码」（16 位），
   或用 QQ 互联 OAuth（需要企业资质）。这里使用 IMAP 授权码校验，
   校验通过即证明该邮箱与凭据真实有效。
   ========================================================= */
'use strict';

const tls = require('node:tls');
const config = require('../config');

function quote(value) {
  return '"' + String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

/**
 * 尝试用 IMAP LOGIN 验证邮箱凭据。
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
function verifyImap(user, secret) {
  return new Promise((resolve) => {
    const tag = 'A' + Date.now().toString(36).toUpperCase();
    let settled = false;
    let buffer = '';
    let sentLogin = false;

    const done = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.end(); } catch { /* ignore */ }
      try { socket.destroy(); } catch { /* ignore */ }
      resolve(result);
    };

    const socket = tls.connect(
      {
        host: config.qq.imapHost,
        port: config.qq.imapPort,
        servername: config.qq.imapHost,
        rejectUnauthorized: true
      },
      () => { /* 等待服务器问候语 */ }
    );

    const timer = setTimeout(() => {
      done({ ok: false, reason: 'QQ 邮箱服务器响应超时' });
    }, 15000);

    socket.setEncoding('utf8');
    socket.on('error', (err) => {
      done({ ok: false, reason: '无法连接 QQ 邮箱服务器：' + err.message });
    });
    socket.on('close', () => {
      done({ ok: false, reason: 'QQ 邮箱连接已关闭' });
    });

    socket.on('data', (chunk) => {
      buffer += chunk;
      // 服务器问候语：以 * OK 开头
      if (!sentLogin && /\*\s+(OK|PREAUTH)/i.test(buffer)) {
        sentLogin = true;
        buffer = '';
        socket.write(`${tag} LOGIN ${quote(user)} ${quote(secret)}\r\n`);
        return;
      }
      if (!sentLogin) return;
      const resultLine = new RegExp(`^${tag}\\s+(OK|NO|BAD)`, 'im');
      const match = resultLine.exec(buffer);
      if (!match) return;
      if (match[1].toUpperCase() === 'OK') {
        try { socket.write(`${tag}2 LOGOUT\r\n`); } catch { /* ignore */ }
        done({ ok: true });
      } else {
        done({ ok: false, reason: 'QQ 邮箱账号或密码（授权码）不正确' });
      }
    });
  });
}

async function verifyQqMail(email, password) {
  const local = String(email).split('@')[0];
  if (!/^\d{5,12}$/.test(local)) {
    return { ok: false, reason: '请使用 QQ 号形式的邮箱（如 123456789@qq.com）' };
  }
  if (!config.qq.allowPassword && password.length !== 16) {
    return {
      ok: false,
      reason: 'QQ 邮箱在第三方应用只能使用 16 位「授权码」登录（不是 QQ 密码）。请到 mail.qq.com → 设置 → 账户 开启 IMAP 并生成授权码。'
    };
  }
  return verifyImap(local, password);
}

module.exports = { verifyQqMail, quote };
