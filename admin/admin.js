/* =========================================================
   世界织卷 · 管理后台
   纯前端，同源调用 /api/admin/*
   ========================================================= */
(() => {
  'use strict';

  const TOKEN_KEY = 'ww.admin.token.v1';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const methodLabel = (m) => ({
    offline: '账号密码', phone: '手机号', qq: 'QQ邮箱',
    microsoft: '微软', xbox: 'Xbox', other: '其他'
  }[m] || m || '未知');
  const methodClass = (m) => ({
    offline: 'is-green', phone: 'is-blue', qq: 'is-gold',
    microsoft: 'is-blue', xbox: 'is-green'
  }[m] || '');
  const fmtDate = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };
  const fmtDay = (ts) => {
    if (!ts) return '—';
    try { return new Date(ts).toLocaleDateString('zh-CN'); } catch { return '—'; }
  };

  const state = {
    token: '',
    status: null,
    authMode: 'login',
    view: 'overview',
    overview: null,
    users: null,
    messages: null,
    update: null,
    userQuery: '',
    userPage: 1
  };

  /* ---------------- API ---------------- */
  async function api(path, options = {}) {
    const { method = 'GET', body, auth = true } = options;
    const headers = {};
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (auth && state.token) headers.authorization = 'Bearer ' + state.token;
    let res;
    try {
      res = await fetch(path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(20000)
      });
    } catch (err) {
      const e = new Error('无法连接服务器，请确认 node server/server.js 已启动');
      e.code = 'network';
      throw e;
    }
    let payload = null;
    const text = await res.text().catch(() => '');
    try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
    if (!payload || typeof payload !== 'object') {
      const e = new Error('服务器返回异常（HTTP ' + res.status + '）');
      e.status = res.status;
      throw e;
    }
    if (!payload.ok) {
      const e = new Error((payload.error && payload.error.message) || '操作失败');
      e.code = payload.error && payload.error.code;
      e.status = res.status;
      if (res.status === 401 && state.token) expireSession();
      throw e;
    }
    return payload.data;
  }

  function expireSession() {
    state.token = '';
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    if (!$('#modalRoot').hidden) closeModal();
    showAuth('login');
    setError('登录已过期，请重新输入管理员密码');
    syncTopbar();
  }

  /* ---------------- 顶栏 / 提示 ---------------- */
  function setError(message) {
    const el = $('#authError');
    if (el) el.textContent = message || '';
  }

  function toast(message, tone = '') {
    const host = $('#toastRoot');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast' + (tone ? ' is-' + tone : '');
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-4px)';
      setTimeout(() => el.remove(), 180);
    }, 2800);
  }

  function syncTopbar() {
    const chip = $('#adminChip');
    const out = $('#logoutTop');
    const name = $('#adminChipName');
    const sideName = $('#sideName');
    const sideAvatar = $('#sideAvatar');
    const username = (state.status && state.status.username) || 'admin';
    if (chip) chip.hidden = !state.token;
    if (out) out.hidden = !state.token;
    if (name) name.textContent = username;
    if (sideName) sideName.textContent = username;
    if (sideAvatar) sideAvatar.textContent = String(username || 'A').slice(0, 1).toUpperCase();
  }

  function setServerPill(ok, text) {
    const pill = $('#serverPill');
    if (!pill) return;
    pill.classList.toggle('is-online', !!ok);
    pill.classList.toggle('is-offline', !ok);
    const label = pill.querySelector('span');
    if (label) label.textContent = text || (ok ? '服务器在线' : '服务器离线');
  }

  /* ---------------- 登录 / 初始化 ---------------- */
  function showAuth(mode) {
    state.authMode = mode === 'setup' ? 'setup' : 'login';
    const setup = state.authMode === 'setup';
    $('#authView').hidden = false;
    $('#consoleView').hidden = true;
    $('#authTitle').textContent = setup ? '初始化管理员' : '管理后台';
    $('#authSub').textContent = setup
      ? '第一次使用：创建管理员账号与密码。凭据只保存在服务器本地。'
      : '使用管理员账号密码登录，管理服务端账号、消息与 APP 更新。';
    $('#confirmField').hidden = !setup;
    $('#adminPass2').required = setup;
    $('#authSubmit').textContent = setup ? '创建管理员并登录' : '登录后台';
    $('#adminPass').autocomplete = setup ? 'new-password' : 'current-password';
    $('#authNote').textContent = setup
      ? '账号需 3–32 位，密码至少 8 位；初始化只允许在本机访问时进行。'
      : '管理员凭据只保存在服务器本地，不会显示在 APP 中。';
    $('#adminUser').value = '';
    $('#adminPass').value = '';
    $('#adminPass2').value = '';
    setError('');
    syncTopbar();
    setTimeout(() => $('#adminUser').focus({ preventScroll: true }), 80);
  }

  async function bootStatus() {
    try {
      const status = await api('/api/admin/status', { auth: false });
      state.status = status;
      setServerPill(true, 'v' + (status.version || '2.0.3') + ' 在线');
      const sv = $('#sideVersion');
      if (sv) sv.textContent = 'v' + (status.version || '2.0.3');
      if (!status.initialized) {
        showAuth('setup');
        if (!status.setupAllowed) {
          $('#authSubmit').disabled = true;
          setError('远程部署首次初始化已禁用。请先在 server/.env 配置 ADMIN_USERNAME / ADMIN_PASSWORD，再重启服务。');
          $('#authNote').textContent = '当前不是本机访问，无法在这里初始化管理员。';
        }
        return;
      }
      if (state.token) {
        try {
          const me = await api('/api/admin/me');
          state.status = me;
          enterConsole();
          return;
        } catch { /* 重新登录 */ }
      }
      showAuth('login');
    } catch (err) {
      setServerPill(false, '无法连接');
      showAuth('login');
      setError(err.message || '无法连接服务器');
      $('#authSubmit').disabled = true;
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const username = $('#adminUser').value.trim();
    const password = $('#adminPass').value;
    const confirm = $('#adminPass2').value;
    setError('');
    if (!username) { setError('请输入管理员账号'); return; }
    if (!password) { setError('请输入密码'); return; }
    if (state.authMode === 'setup') {
      if (password.length < 8) { setError('管理员密码至少 8 位'); return; }
      if (password !== confirm) { setError('两次输入的密码不一致'); return; }
    }
    const btn = $('#authSubmit');
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = state.authMode === 'setup' ? '正在创建…' : '正在登录…';
    try {
      const data = await api(state.authMode === 'setup' ? '/api/admin/setup' : '/api/admin/login', {
        method: 'POST',
        auth: false,
        body: { username, password }
      });
      state.token = data.token;
      try { localStorage.setItem(TOKEN_KEY, state.token); } catch { /* ignore */ }
      state.status = Object.assign({}, state.status, { initialized: true, username: data.admin.username });
      setServerPill(true, '服务器在线');
      enterConsole();
      toast(state.authMode === 'setup' ? '管理员已创建' : '欢迎回来，' + data.admin.username, 'success');
    } catch (err) {
      setError(err.message || '操作失败');
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  }

  async function logout() {
    try { await api('/api/admin/logout', { method: 'POST', body: {} }); } catch { /* ignore */ }
    state.token = '';
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    state.overview = null;
    state.users = null;
    state.messages = null;
    state.update = null;
    showAuth('login');
    toast('已退出后台', '');
    syncTopbar();
  }

  /* ---------------- 控制台 ---------------- */
  const PAGE_META = {
    overview: { kicker: 'ADMIN · 01', title: '概览', sub: '服务端账号、会话与消息总览' },
    users: { kicker: 'ADMIN · 02', title: '账号管理', sub: '搜索、停用、重置密码与删除服务端账号' },
    messages: { kicker: 'ADMIN · 03', title: '消息记录', sub: '最近 80 条好友消息，只读' },
    update: { kicker: 'ADMIN · 04', title: 'APP 更新', sub: '编辑 update.json，主 APP 立即读取' }
  };

  function enterConsole() {
    $('#authView').hidden = true;
    $('#consoleView').hidden = false;
    $('#logoutTop').hidden = false;
    syncTopbar();
    switchView('overview');
  }

  function switchView(view) {
    if (!PAGE_META[view]) view = 'overview';
    state.view = view;
    $$('.nav-btn').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.view === view));
    Object.keys(PAGE_META).forEach((key) => {
      const el = $('#view-' + key);
      if (el) el.hidden = key !== view;
    });
    const meta = PAGE_META[view];
    $('#pageKicker').textContent = meta.kicker;
    $('#pageTitle').textContent = meta.title;
    $('#pageSub').textContent = meta.sub;
    if (view === 'overview') loadOverview();
    else if (view === 'users') loadUsers();
    else if (view === 'messages') loadMessages();
    else if (view === 'update') loadUpdate();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function refreshCurrent() {
    const btn = $('#refreshBtn');
    if (btn) btn.disabled = true;
    try {
      if (state.view === 'overview') await loadOverview();
      else if (state.view === 'users') await loadUsers(state.userPage, true);
      else if (state.view === 'messages') await loadMessages();
      else if (state.view === 'update') await loadUpdate();
      toast('已刷新', 'success');
    } catch (err) {
      toast(err.message || '刷新失败', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function loadOverview() {
    try {
      state.overview = await api('/api/admin/overview');
      renderOverview(state.overview);
    } catch (err) {
      if (err.status !== 401) toast(err.message || '加载概览失败', 'error');
    }
  }

  function renderOverview(data) {
    if (!data) return;
    $('#statGrid').innerHTML = `
      <article class="stat-card"><span class="stat-label"><i></i>服务端账号</span><b>${Number(data.users) || 0}</b><small>${Number(data.newToday) || 0} 今日新增 · ${Number(data.newWeek) || 0} 近 7 天</small></article>
      <article class="stat-card is-blue"><span class="stat-label"><i></i>在线会话</span><b>${Number(data.activeSessions) || 0}</b><small>有效登录令牌</small></article>
      <article class="stat-card is-gold"><span class="stat-label"><i></i>好友消息</span><b>${Number(data.messages) || 0}</b><small>服务端最多保留 2000 条</small></article>
      <article class="stat-card is-red"><span class="stat-label"><i></i>已停用</span><b>${Number(data.disabled) || 0}</b><small>停用会立即撤销登录</small></article>`;

    const methods = data.methods || {};
    const max = Math.max(1, ...Object.values(methods).map(Number));
    $('#methodList').innerHTML = Object.keys(methods).map((key) => {
      const count = Number(methods[key]) || 0;
      return `<div class="method-row"><span>${esc(methodLabel(key))}</span><span class="bar"><i style="width:${Math.max(2, Math.round(count / max * 100))}%"></i></span><b>${count}</b></div>`;
    }).join('');

    const days = Array.isArray(data.days) ? data.days : [];
    const maxDay = Math.max(1, ...days.map((d) => Number(d.count) || 0));
    $('#dayChart').innerHTML = days.map((d) => `
      <div class="day-col" title="${esc(d.date)} · ${Number(d.count) || 0} 个">
        <b>${Number(d.count) || 0}</b>
        <i style="height:${Math.max(4, Math.round((Number(d.count) || 0) / maxDay * 68))}px"></i>
        <span>${esc(d.date)}</span>
      </div>`).join('');

    const recent = Array.isArray(data.recent) ? data.recent : [];
    $('#recentList').innerHTML = recent.length ? recent.map((u) => `
      <div class="recent-row">
        <span class="recent-avatar">${esc(String(u.displayId || '?').slice(0, 1).toUpperCase())}</span>
        <span class="recent-main"><b>${esc(u.displayId)}</b><small>${esc(u.uid)} · ${fmtDate(u.createdAt)}</small></span>
        <span class="tag ${methodClass(u.method)}">${esc(methodLabel(u.method))}</span>
        ${u.disabled ? '<span class="tag is-red">停用</span>' : ''}
      </div>`).join('') : '<p class="panel-note">还没有服务端账号。</p>';
  }

  async function loadUsers(page = state.userPage, keepQuery = true) {
    if (!keepQuery) state.userQuery = '';
    state.userPage = Math.max(1, Number(page) || 1);
    try {
      const q = encodeURIComponent(state.userQuery || '');
      state.users = await api(`/api/admin/users?q=${q}&page=${state.userPage}&limit=24`);
      renderUsers(state.users);
    } catch (err) {
      if (err.status !== 401) toast(err.message || '加载账号失败', 'error');
    }
  }

  function renderUsers(data) {
    if (!data) return;
    $('#userCount').textContent = `${data.total} 个账号 · 第 ${data.page} / ${data.pages} 页`;
    const list = Array.isArray(data.users) ? data.users : [];
    $('#userTable').innerHTML = list.length ? list.map((u) => `
      <tr>
        <td data-label="账号">
          <div class="user-cell">
            <span class="recent-avatar">${esc(String(u.displayId || '?').slice(0, 1).toUpperCase())}</span>
            <span><b>${esc(u.displayId)}</b><small>${esc(u.uid)}</small></span>
          </div>
        </td>
        <td data-label="方式"><span class="tag ${methodClass(u.method)}">${esc(methodLabel(u.method))}</span></td>
        <td data-label="联系方式"><span class="mono-cell">${esc(u.phone || u.email || u.username || '—')}</span></td>
        <td data-label="时间"><span class="date-cell">注册 ${fmtDay(u.createdAt)}<br>登录 ${fmtDate(u.lastLoginAt)}</span></td>
        <td data-label="状态">${u.disabled ? '<span class="tag is-red">已停用</span>' : '<span class="tag is-green">正常</span>'}</td>
        <td data-label="操作">
          <div class="row-actions">
            <button class="mini-act" type="button" data-user-action="reset-password" data-user-id="${esc(u.id)}" data-user-name="${esc(u.displayId)}">重置密码</button>
            <button class="mini-act" type="button" data-user-action="${u.disabled ? 'enable' : 'disable'}" data-user-id="${esc(u.id)}" data-user-name="${esc(u.displayId)}">${u.disabled ? '启用' : '停用'}</button>
            <button class="mini-act" type="button" data-user-action="force-logout" data-user-id="${esc(u.id)}" data-user-name="${esc(u.displayId)}">踢下线</button>
            <button class="mini-act is-danger" type="button" data-user-action="delete" data-user-id="${esc(u.id)}" data-user-name="${esc(u.displayId)}">删除</button>
          </div>
        </td>
      </tr>`).join('') : '<tr><td colspan="6"><p class="panel-note">没有找到账号。</p></td></tr>';

    const pages = Math.max(1, Number(data.pages) || 1);
    const page = Number(data.page) || 1;
    const buttons = [];
    buttons.push(`<button type="button" data-page="${Math.max(1, page - 1)}" ${page <= 1 ? 'disabled' : ''}>上一页</button>`);
    const nums = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 2) nums.push(i);
    }
    let last = 0;
    nums.forEach((n) => {
      if (last && n - last > 1) buttons.push('<span>…</span>');
      buttons.push(`<button type="button" data-page="${n}" class="${n === page ? 'is-active' : ''}">${n}</button>`);
      last = n;
    });
    buttons.push(`<button type="button" data-page="${Math.min(pages, page + 1)}" ${page >= pages ? 'disabled' : ''}>下一页</button>`);
    $('#userPager').innerHTML = buttons.join('');
  }

  async function loadMessages() {
    try {
      const data = await api('/api/admin/messages');
      state.messages = data.messages || [];
      const list = state.messages;
      $('#messageList').innerHTML = list.length ? list.map((m) => `
        <div class="message-row">
          <div class="message-main">
            <div class="message-head"><b>${esc(m.fromName)}</b><span>→</span><b>${esc(m.toName)}</b></div>
            <div class="message-text">${esc(m.text)}</div>
          </div>
          <span class="message-time">${fmtDate(m.at)}</span>
        </div>`).join('') : '<p class="panel-note">还没有聊天消息。</p>';
    } catch (err) {
      if (err.status !== 401) toast(err.message || '加载消息失败', 'error');
    }
  }

  async function loadUpdate() {
    try {
      const data = await api('/api/admin/update');
      state.update = data.update || {};
      fillUpdateForm(state.update);
    } catch (err) {
      if (err.status !== 401) toast(err.message || '读取更新清单失败', 'error');
    }
  }

  function fillUpdateForm(manifest) {
    $('#upVersion').value = manifest.version || '';
    $('#upDate').value = manifest.releasedAt || '';
    $('#upUrl').value = manifest.packageUrl || '';
    $('#upFile').value = manifest.filename || '';
    $('#upSize').value = Number(manifest.size) || 0;
    $('#upSha').value = manifest.sha256 || '';
    $('#upNotes').value = Array.isArray(manifest.notes) ? manifest.notes.join('\n') : (manifest.notes || '');
    $('#upMandatory').checked = !!manifest.mandatory;
    $('#updateHint').textContent = manifest.packageUrl
      ? '已配置更新包地址；APP 下载时会显示进度并按 sha256 校验（若填写）。保存后立即生效。'
      : '更新包地址留空时，APP 会显示「当前已是最新版本」，不会下载。';
  }

  async function saveUpdate(event) {
    event.preventDefault();
    const btn = event.target.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      const update = {
        version: $('#upVersion').value.trim(),
        releasedAt: $('#upDate').value.trim(),
        packageUrl: $('#upUrl').value.trim(),
        filename: $('#upFile').value.trim(),
        size: Number($('#upSize').value) || 0,
        sha256: $('#upSha').value.trim(),
        notes: $('#upNotes').value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
        mandatory: $('#upMandatory').checked,
        minVersion: (state.update && state.update.minVersion) || '1.0.0'
      };
      const data = await api('/api/admin/update', { method: 'POST', body: { update } });
      state.update = data.update;
      fillUpdateForm(data.update);
      toast('更新清单已保存，主 APP 下次检查即可读取', 'success');
    } catch (err) {
      toast(err.message || '保存失败', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /* ---------------- 账号操作 ---------------- */
  function openModal(html) {
    const root = $('#modalRoot');
    root.hidden = false;
    root.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  }
  function closeModal() {
    $('#modalRoot').hidden = true;
    $('#modalRoot').innerHTML = '';
  }

  function confirmAction({ title, text, confirmText, danger, withPassword, onConfirm }) {
    openModal(`
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
      ${withPassword ? '<label class="field"><span>新密码（至少 8 位）</span><input id="modalPassword" type="password" autocomplete="new-password" maxlength="128"></label>' : ''}
      <div class="modal-actions">
        <button class="ghost-btn" type="button" data-modal-cancel>取消</button>
        <button class="primary-btn ${danger ? 'is-danger' : ''}" type="button" data-modal-confirm>${esc(confirmText)}</button>
      </div>`);
    const run = async () => {
      const password = withPassword ? ($('#modalPassword').value || '') : '';
      if (withPassword && password.length < 8) { toast('新密码至少 8 位', 'error'); return; }
      const btn = $('[data-modal-confirm]');
      if (btn) btn.disabled = true;
      try {
        await onConfirm(password);
        closeModal();
      } catch (err) {
        toast(err.message || '操作失败', 'error');
        if (btn) btn.disabled = false;
      }
    };
    $('[data-modal-cancel]').addEventListener('click', closeModal);
    $('[data-modal-confirm]').addEventListener('click', run);
    if (withPassword) setTimeout(() => $('#modalPassword').focus(), 60);
  }

  async function runUserAction(action, id, name) {
    if (!id) return;
    if (action === 'reset-password') {
      confirmAction({
        title: '重置密码', text: `为「${name}」设置一个新的服务端密码，旧会话会立即失效。`, confirmText: '重置密码', withPassword: true,
        onConfirm: async (password) => {
          await api('/api/admin/user-action', { method: 'POST', body: { userId: id, action, password } });
          toast('密码已重置，旧会话已失效', 'success');
          await loadUsers(state.userPage);
          await loadOverview();
        }
      });
    } else if (action === 'delete') {
      confirmAction({
        title: '删除账号', text: `确定删除「${name}」吗？好友关系与聊天消息会一并清理，无法恢复。`, confirmText: '删除账号', danger: true,
        onConfirm: async () => {
          await api('/api/admin/user-action', { method: 'POST', body: { userId: id, action } });
          toast('账号已删除', 'success');
          await loadUsers(state.userPage);
          await loadOverview();
        }
      });
    } else if (action === 'disable') {
      confirmAction({
        title: '停用账号', text: `停用「${name}」后，它会立即退出所有设备，且无法再登录。`, confirmText: '停用', danger: true,
        onConfirm: async () => {
          await api('/api/admin/user-action', { method: 'POST', body: { userId: id, action } });
          toast('账号已停用', 'success');
          await loadUsers(state.userPage);
          await loadOverview();
        }
      });
    } else if (action === 'enable') {
      await api('/api/admin/user-action', { method: 'POST', body: { userId: id, action } }).then(async () => {
        toast('账号已启用', 'success');
        await loadUsers(state.userPage);
        await loadOverview();
      }).catch((err) => toast(err.message || '操作失败', 'error'));
    } else if (action === 'force-logout') {
      await api('/api/admin/user-action', { method: 'POST', body: { userId: id, action } }).then(async () => {
        toast('已撤销该账号的在线会话', 'success');
        await loadUsers(state.userPage);
        await loadOverview();
      }).catch((err) => toast(err.message || '操作失败', 'error'));
    }
  }

  /* ---------------- 事件 ---------------- */
  let searchTimer = null;
  function bind() {
    $('#authForm').addEventListener('submit', handleAuthSubmit);
    $('#togglePwd').addEventListener('click', () => {
      const input = $('#adminPass');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      $('#togglePwd').textContent = show ? '隐藏' : '显示';
    });
    $('#logoutTop').addEventListener('click', logout);
    $('#logoutSide').addEventListener('click', logout);
    $('#refreshBtn').addEventListener('click', refreshCurrent);
    $('#menuBtn').addEventListener('click', () => {
      const nav = $('.side-nav');
      if (nav) nav.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    $$('.nav-btn').forEach((btn) => btn.addEventListener('click', () => switchView(btn.dataset.view)));

    $('#userSearch').addEventListener('input', (event) => {
      state.userQuery = event.target.value;
      state.userPage = 1;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadUsers(1), 260);
    });
    $('#userTable').addEventListener('click', (event) => {
      const btn = event.target.closest('[data-user-action]');
      if (!btn) return;
      runUserAction(btn.dataset.userAction, btn.dataset.userId, btn.dataset.userName);
    });
    $('#userPager').addEventListener('click', (event) => {
      const btn = event.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      const page = Number(btn.dataset.page) || 1;
      if (page === state.userPage) return;
      loadUsers(page);
    });

    $('#updateForm').addEventListener('submit', saveUpdate);
    $('#reloadUpdate').addEventListener('click', loadUpdate);

    $('#modalRoot').addEventListener('click', (event) => {
      if (event.target === $('#modalRoot')) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !$('#modalRoot').hidden) closeModal();
    });
  }

  async function init() {
    bind();
    try { state.token = localStorage.getItem(TOKEN_KEY) || ''; } catch { state.token = ''; }
    await bootStatus();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
