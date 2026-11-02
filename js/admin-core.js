/* Panel Admin — inti: sesi, login (Google + darurat), layout berbasis peran, router, komponen bersama */
(function () {
  const A = window.A = { me: null, pages: {}, st: {}, schema: null, brand: { nama: 'Panel Admin', logo: '' }, badges: {}, cur: null };
  const SA = 'superadmin';
  const NAV = [
    { g: 'Ringkasan', it: [['dashboard', 'Dashboard', 'dashboard', SA]] },
    { g: 'Konten Website', it: [['konten/hero', 'Hero & Slideshow', 'image', SA], ['konten/profil', 'Profil Sekolah', 'building', SA], ['konten/keunggulan', 'Keunggulan', 'sparkles', SA], ['konten/fasilitas', 'Fasilitas & Galeri', 'library', SA], ['konten/prestasi', 'Prestasi', 'trophy', SA], ['konten/kegiatan', 'Kegiatan', 'camera', SA], ['konten/berita', 'Berita & Artikel', 'file', SA], ['konten/testimoni', 'Testimoni', 'heart', SA], ['konten/biaya', 'Biaya Pendidikan', 'tag', SA], ['konten/kontak', 'Kontak & Peta', 'map-pin', SA]] },
    { g: 'PPDB', it: [['periode', 'Periode PPDB', 'calendar', SA], ['form', 'Form Builder', 'wand', SA], ['pendaftar', 'Daftar Pendaftar', 'users', SA, 'baru']] },
    { g: 'Notifikasi & CRM', it: [['notif/config', 'Konfigurasi & Template', 'sliders', SA], ['notif/blast', 'WhatsApp Blast', 'megaphone', SA], ['notif/log', 'Log Notifikasi', 'send', SA, 'gagal'], ['crm', 'CRM Kontak', 'id', SA]] },
    { g: 'Pengaturan', it: [['pengaturan', 'Pengaturan Umum', 'sliders', 'any'], ['pengguna', 'Role & Akses', 'shield', 'any']] }
  ];
  const SESS = 'adm_sess';

  // ---------- util bersama ----------
  A.call = async function (action, data, o) { o = o || {}; const r = await Api.post(action, data || {}, o.token !== undefined ? { token: o.token } : {}); if (!r.success && !o.quiet && r.code !== 'AUTH') toast(r.message || 'Terjadi kesalahan.', 'err'); if (r.success && o.ok) toast(typeof o.ok === 'string' ? o.ok : (r.message || 'Berhasil.'), 'ok'); return r; };
  A.pill = (s) => { const m = { Baru: 'blue', Diverifikasi: 'info', Diterima: 'ok', Ditolak: 'err', Cadangan: 'warn', Terkirim: 'ok', Gagal: 'err', Antri: 'warn', Proses: 'blue', Batal: '', Berjalan: 'blue', Selesai: 'ok', Dihentikan: '', tampil: 'ok', tersembunyi: '', Terdaftar: 'ok', 'Tidak Terdaftar': 'err', dibuka: 'ok', ditutup: '', penuh: 'err', belum: 'warn' }; return '<span class="pill ' + (m[s] || '') + '"><i class="dot"></i>' + esc(s) + '</span>'; };
  A.sw = (id, on, extra) => '<label class="sw"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + (extra || '') + '><i></i></label>';
  A.av = (n) => '<span class="av">' + esc(inisial(n)) + '</span>';
  A.loading = (n) => '<div style="display:grid;gap:12px">' + Array.from({ length: n || 4 }, () => '<div class="skel" style="height:64px"></div>').join('') + '</div>';
  A.empty = (ico, t, p) => '<div class="empty2">' + ic(ico) + '<b style="display:block;color:var(--heading);font-size:16px">' + esc(t) + '</b><p style="margin:6px 0 0">' + esc(p || '') + '</p></div>';
  A.pager = (total, page, per) => { const n = Math.max(1, Math.ceil(total / per)); if (n <= 1) return '<div class="pg"><span>Menampilkan ' + total + ' data</span></div>'; const from = (page - 1) * per + 1, to = Math.min(total, page * per); let nums = ''; const show = [1, page - 1, page, page + 1, n].filter((v, i, a) => v >= 1 && v <= n && a.indexOf(v) === i).sort((a, b) => a - b); let prev = 0; show.forEach((v) => { if (v - prev > 1) nums += '<button disabled>…</button>'; nums += '<button data-p="' + v + '" class="' + (v === page ? 'on' : '') + '">' + v + '</button>'; prev = v; }); return '<div class="pg"><span>Menampilkan <b>' + from + '–' + to + '</b> dari <b>' + total + '</b></span><div class="nums"><button data-p="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>' + ic('chevron-left') + '</button>' + nums + '<button data-p="' + (page + 1) + '"' + (page >= n ? ' disabled' : '') + '>' + ic('chevron-right') + '</button></div></div>'; };
  A.confirm = (text, o) => new Promise((res) => {
    o = o || {}; const m = modal('<h3>' + esc(o.title || 'Konfirmasi') + '</h3><p style="color:var(--muted);margin:0 0 22px">' + (o.html ? text : esc(text)) + '</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-soft" data-n>Batal</button><button class="btn ' + (o.danger ? 'btn-danger' : 'btn-gold') + '" data-y>' + esc(o.ok || 'Ya, lanjutkan') + '</button></div>', { onClose: () => res(false) });
    $('.box', m.el).style.maxWidth = '440px'; $('[data-n]', m.el).onclick = () => { res(false); m.close(); }; $('[data-y]', m.el).onclick = () => { res(true); m.el.remove(); document.body.style.overflow = ''; };
  });
  A.drawer = (title, body, foot, sub) => {
    const d = document.createElement('div'); d.className = 'dw'; d.innerHTML = '<div class="scrim"></div><div class="pn" role="dialog" aria-modal="true"><div class="hd"><div style="flex:1;min-width:0"><h3 style="font-size:18px">' + title + '</h3>' + (sub ? '<small style="color:var(--muted)">' + sub + '</small>' : '') + '</div><button class="icon-btn" data-x aria-label="Tutup">' + ic('x') + '</button></div><div class="bd">' + body + '</div>' + (foot ? '<div class="ft">' + foot + '</div>' : '') + '</div>';
    document.body.appendChild(d); requestAnimationFrame(() => d.classList.add('open'));
    const close = () => { d.classList.remove('open'); setTimeout(() => d.remove(), 350); document.removeEventListener('keydown', k); }; const k = (e) => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', k);
    $('.scrim', d).onclick = close; $('[data-x]', d).onclick = close; return { el: d, close, body: $('.bd', d), foot: $('.ft', d) };
  };
  A.compress = async function (file, maxPx, q) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Format gambar harus JPG, PNG, atau WebP.');
    const url = URL.createObjectURL(file);
    try { const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Gambar tidak dapat dibaca.')); i.src = url; }); const sc = Math.min(1, (maxPx || 1600) / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', q || .84)); return blob; } finally { URL.revokeObjectURL(url); }
  };
  A.blobB64 = (b) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(b); });
  /** Unggah gambar ke Drive → {id, preview} */
  A.upload = async function (file, folder) { const b = await A.compress(file, folder === 'branding' ? 600 : 1600, .84), data = await A.blobB64(b), r = await A.call('upload.gambar', { name: file.name, data, folder }); if (!r.success) throw new Error(r.message); const pv = URL.createObjectURL(b); A.localPv[r.data.id] = pv; return { id: r.data.id, preview: pv }; };
  A.localPv = {};
  A.pv = (id, w) => A.localPv[id] || imgUrl(id, w || 300);
  let xlsxP = null;
  A.xlsx = async function (sheets, nama) {
    if (!window.XLSX) { xlsxP = xlsxP || new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = ok; s.onerror = () => no(new Error('Pustaka Excel gagal dimuat (cek koneksi internet).')); document.head.appendChild(s); }); await xlsxP; }
    const wb = XLSX.utils.book_new(); sheets.forEach((s) => { const ws = XLSX.utils.aoa_to_sheet(s.rows); ws['!cols'] = s.rows[0].map((_, i) => ({ wch: Math.min(40, Math.max(10, ...s.rows.slice(0, 80).map((r) => String(r[i] == null ? '' : r[i]).length + 2))) })); XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31)); });
    XLSX.writeFile(wb, nama); toast('Laporan Excel diunduh: ' + nama, 'ok');
  };
  A.saveBlob = (b64, mime, nama) => { const by = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), url = URL.createObjectURL(new Blob([by], { type: mime })), a = document.createElement('a'); a.href = url; a.download = nama; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000); };

  // ---------- sesi ----------
  const saveSess = (t, me) => lsSet(SESS, { token: t, me, at: Date.now() });
  function logout(msg) { lsDel(SESS); Api.token = null; A.me = null; if (A.timer) clearInterval(A.timer); showLogin(msg); }
  A.logout = logout;
  Api.onAuthFail = () => { if (A.me) { toast('Sesi berakhir. Silakan masuk kembali.', 'err'); logout(); } };

  // ---------- login ----------
  async function showLogin(msg) {
    $('#app').hidden = true; const L = $('#login'); L.hidden = false; document.title = 'Masuk — Panel Admin';
    L.innerHTML = '<div class="lg-card"><div class="logo">' + (A.brand.logo ? '<img src="' + esc(A.brand.logo) + '" alt="">' : ic('graduation')) + '</div><h1>Masuk Panel Admin</h1><p id="lgp">Khusus Superadmin & panitia sekolah. Gunakan akun Google yang sudah didaftarkan.</p><div id="lgerr"></div><div id="gbtn" style="display:flex;justify-content:center;min-height:50px"><div class="skel" style="width:100%;height:50px"></div></div>' +
      '<div style="margin-top:18px"><button class="more" id="tgd" style="background:none;border:0;font-size:13.5px;color:var(--muted);margin:0 auto">Bermasalah dengan Google? Akses darurat ' + ic('chevron-down') + '</button></div><form id="dform" hidden style="text-align:left;margin-top:14px;display:grid;gap:10px;background:var(--surface);padding:16px;border-radius:14px"><label class="ff" style="margin:0"><span class="lbl">Nama pengguna darurat</span><input class="in" name="u" autocomplete="username" required></label><label class="ff" style="margin:0"><span class="lbl">Kata sandi darurat</span><input class="in" type="password" name="p" autocomplete="current-password" required></label><button class="btn btn-gold btn-block" type="submit">' + ic('key') + 'Masuk dengan akses darurat</button></form>' +
      '<p style="margin:22px 0 0;font-size:13.5px"><a href="index.html" class="more" style="justify-content:center">' + ic('arrow-left') + 'Kembali ke Beranda Sekolah</a></p></div>';
    const err = (t) => { $('#lgerr').innerHTML = t ? '<div class="alert err" style="text-align:left">' + ic('alert') + '<div>' + esc(t) + '</div></div>' : ''; };
    if (msg) err(msg);
    const dform = $('#dform'); if (location.hash === '#darurat') dform.hidden = false;
    $('#tgd').onclick = () => { dform.hidden = !dform.hidden; };
    dform.onsubmit = async (e) => { e.preventDefault(); const b = $('button', dform); b.disabled = true; const r = await A.call('auth.darurat', { username: dform.u.value, password: dform.p.value }, { quiet: true, token: '' }); b.disabled = false; if (r.success) masuk(r.data); else err(r.message); };
    const cfg = await Api.get('auth.config'); if (!cfg.success) { $('#gbtn').innerHTML = ''; err(cfg.code === 'CONFIG' ? 'URL API belum diatur di js/config.js.' : cfg.message); dform.hidden = false; return; }
    if (cfg.data.nama) { A.brand.nama = cfg.data.nama; const lp = $('#lgp'); if (lp) lp.textContent = 'Khusus Superadmin & panitia ' + cfg.data.nama + '. Gunakan akun Google yang sudah didaftarkan.'; }
    const cid = cfg.data.googleClientId;
    if (!cid) { $('#gbtn').innerHTML = '<div class="alert warn" style="text-align:left">' + ic('info') + '<div>Login Google belum dikonfigurasi. Masuk dengan <b>akses darurat</b> lalu isi Google Client ID di <b>Pengaturan → Keamanan</b>.</div></div>'; dform.hidden = false; return; }
    const init = () => { google.accounts.id.initialize({ client_id: cid, callback: async (resp) => { const r = await A.call('auth.google', { credential: resp.credential }, { quiet: true, token: '' }); if (r.success) masuk(r.data); else err(r.message); }, auto_select: false }); $('#gbtn').innerHTML = ''; google.accounts.id.renderButton($('#gbtn'), { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 340, locale: 'id' }); };
    if (window.google && google.accounts) init(); else { const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = init; s.onerror = () => { $('#gbtn').innerHTML = ''; err('Tidak dapat memuat Google Sign-In. Gunakan akses darurat.'); dform.hidden = false; }; document.head.appendChild(s); }
  }
  function masuk(d) { Api.token = d.token; A.me = d.me; saveSess(d.token, d.me); $('#login').hidden = true; boot(); }

  // ---------- layout ----------
  const isSA = () => A.me && A.me.role === SA;
  const canSee = (r) => r === 'any' || (r === SA && isSA());
  function buildSidebar() {
    const logo = A.brand.logo ? '<img src="' + esc(A.brand.logo) + '" alt="">' : ic('graduation');
    $('#sb').innerHTML = '<div class="sb-brand"><span class="logo">' + logo + '</span><div><b>' + esc(A.brand.nama) + '</b><small>Admin & PPDB Hub</small></div></div><span class="role-pill">' + (isSA() ? 'Superadmin' : 'Admin') + '</span>' +
      NAV.map((g) => { const its = g.it.filter((x) => canSee(x[3])); return its.length ? '<div class="sb-group"><h6>' + g.g + '</h6>' + its.map((x) => '<a class="sb-link" href="#/' + x[0] + '" data-r="' + x[0] + '">' + ic(x[2]) + '<span>' + x[1] + '</span>' + (x[4] ? '<span class="bdg' + (x[4] === 'gagal' ? ' red' : '') + '" data-bdg="' + x[4] + '" hidden></span>' : '') + '</a>').join('') + '</div>' : ''; }).join('') +
      '<div class="sb-foot"><div class="sb-user">' + A.av(A.me.nama || A.me.email) + '<div style="min-width:0"><b>' + esc(A.me.nama || A.me.email) + '</b><small>' + (isSA() ? 'Superadmin' : 'Admin') + (A.me.darurat ? ' · darurat' : '') + '</small></div><button id="lo" title="Keluar" aria-label="Keluar">' + ic('log-out') + '</button></div></div>';
    $('#lo').onclick = async () => { if (await A.confirm('Keluar dari panel admin?', { title: 'Keluar', ok: 'Keluar' })) logout(); };
  }
  function buildTopbar() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('#tb').innerHTML = '<button class="icon-btn menu-btn" id="mb" aria-label="Menu">' + ic('menu') + '</button><div class="crumb2">' + ic('home') + '<span>/</span><span id="ttl">Panel</span></div>' + (isSA() ? '<div class="search">' + ic('search') + '<input class="in" id="gs" placeholder="Cari pendaftar: nama, token, email…" aria-label="Cari pendaftar"></div>' : '') + '<div class="sp"></div>' +
      '<span id="pchip"></span><a class="icon-btn" href="index.html" target="_blank" rel="noopener" title="Lihat website" aria-label="Lihat website">' + ic('external') + '</a><button class="icon-btn" id="bell" aria-label="Notifikasi" style="position:relative">' + ic('bell') + '<span id="bdot" hidden style="position:absolute;top:7px;right:8px;width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid var(--card)"></span></button><button class="icon-btn" id="thm" aria-label="Ganti tema">' + ic(dark ? 'sun' : 'moon') + '</button>';
    $('#mb').onclick = () => $('#sb').classList.toggle('open');
    $('#thm').onclick = () => { const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = n; try { localStorage.setItem('tema', n); } catch (e) {} $('#thm').innerHTML = ic(n === 'dark' ? 'sun' : 'moon'); if (A.cur && A.cur.rerender) A.cur.rerender(); };
    const gs = $('#gs'); if (gs) gs.onkeydown = (e) => { if (e.key === 'Enter' && gs.value.trim()) { A.st.pendCari = gs.value.trim(); A.st.pend = null; location.hash = '#/pendaftar'; gs.value = ''; if (location.hash === '#/pendaftar' && A.cur && A.cur.id === 'pendaftar') route(); } };
    $('#bell').onclick = () => { const b = A.badges; const items = []; if (b.baru) items.push(['users', b.baru + ' pendaftar baru menunggu verifikasi', '#/pendaftar']); if (b.gagal) items.push(['alert', b.gagal + ' notifikasi gagal terkirim', '#/notif/log']); const m = modal('<h3 style="margin-bottom:14px">Pemberitahuan</h3>' + (items.length ? items.map((i) => '<a href="' + i[2] + '" class="card" style="display:flex;gap:12px;align-items:center;padding:14px;margin-bottom:10px;box-shadow:none">' + ic(i[0]) + '<b style="color:var(--heading);font-size:14px">' + esc(i[1]) + '</b>' + ic('chevron-right') + '</a>').join('') : A.empty('check', 'Semuanya beres', 'Tidak ada tindakan yang menunggu.'))); $('.box', m.el).style.maxWidth = '420px'; $('.box', m.el).onclick = (e) => { if (e.target.closest('a')) m.close(); }; };
  }
  async function refreshBadges() {
    if (!isSA()) return; const r = await Api.post('batch', { calls: [{ action: 'pendaftar.list', data: { status: 'Baru', per: 5 } }, { action: 'sys.status' }, { action: 'periode.list' }] }); if (!r.success) return;
    const [p, s, per] = r.data.results; A.badges = { baru: p.success ? p.data.total : 0, gagal: s.success ? s.data.antrean.gagal : 0 };
    $$('[data-bdg]').forEach((b) => { const n = A.badges[b.dataset.bdg]; b.hidden = !n; b.textContent = n > 99 ? '99+' : n; });
    const bd = $('#bdot'); if (bd) bd.hidden = !(A.badges.baru || A.badges.gagal);
    if (per.success && $('#pchip')) { const u = per.data.rows.filter((x) => x.utama)[0] || per.data.rows[0]; $('#pchip').innerHTML = u ? '<a href="#/periode" class="pill ' + ({ dibuka: 'ok', penuh: 'err', belum: 'warn' }[u.state] || '') + '" style="text-decoration:none"><i class="dot"></i>' + esc(u.nama_periode) + ' · ' + esc(u.state) + '</a>' : ''; }
  }
  A.refreshBadges = refreshBadges;

  // ---------- router ----------
  A.page = (id, def) => { A.pages[id] = def; };
  function route() {
    if (!A.me) return; const h = (location.hash || '').replace(/^#\/?/, '') || (isSA() ? 'dashboard' : 'pengaturan'), parts = h.split('/'), id = parts[0], arg = parts.slice(1).join('/');
    const pg = A.pages[id]; if (!pg) { location.hash = isSA() ? '#/dashboard' : '#/pengaturan'; return; }
    if (!canSee(pg.role || SA)) { toast('Anda tidak memiliki akses ke halaman ini.', 'err'); location.hash = '#/pengaturan'; return; }
    $('#sb').classList.remove('open'); if (A.cur && A.cur.leave) A.cur.leave();
    $$('.sb-link').forEach((a) => a.classList.toggle('on', a.dataset.r === h || (a.dataset.r.split('/')[0] === id && a.dataset.r.indexOf('/') > -1 && a.dataset.r === id + '/' + arg) || (a.dataset.r === id && !arg)));
    if (id === 'pendaftar') $$('.sb-link').forEach((a) => a.classList.toggle('on', a.dataset.r === 'pendaftar'));
    A.cur = Object.assign({ id }, pg); const page = $('#page'); page.innerHTML = '<div style="padding:10px 0">' + A.loading(5) + '</div>'; $('#ttl').textContent = pg.title || 'Panel'; document.title = (pg.title || 'Panel') + ' — ' + A.brand.nama;
    window.scrollTo(0, 0); Promise.resolve(pg.render(page, arg, A.cur)).catch((e) => { console.error(e); page.innerHTML = A.empty('alert', 'Terjadi kesalahan', e.message); });
  }
  A.route = route;

  async function boot() {
    buildSidebar(); buildTopbar(); $('#app').hidden = false; route(); refreshBadges(); A.timer = setInterval(refreshBadges, 90000);
    Api.post('sys.status').then(() => {}); if (isSA()) fetch(window.APP_CONFIG.API_URL + '?w=admin').catch(() => {});
  }
  A.start = async function () {
    window.addEventListener('hashchange', () => { if (A.me) route(); });
    const s = lsGet(SESS, null);
    if (s && s.token && Date.now() - s.at < 12 * 3600e3) {
      Api.token = s.token; A.me = s.me; const r = await Api.post('auth.me', {}, { quiet: true });
      if (r.success) { A.me = r.data.me; const b = await Api.get('auth.config'); if (b.success && b.data.nama) A.brand.nama = b.data.nama; boot(); return; }
      lsDel(SESS); Api.token = null; A.me = null;
    }
    showLogin();
  };
  // pengaturan merek memuat logo setelah login
  A.loadBrand = async function () { const r = await A.call('pengaturan.get', {}, { quiet: true }); if (r.success) { A.brand.nama = r.data.setting.nama_sekolah || A.brand.nama; A.brand.logo = r.data.setting.logo_id ? imgUrl(r.data.setting.logo_id, 200) : ''; buildSidebar(); $$('.sb-link').forEach((a) => { }); route0Sync(); } };
  function route0Sync() { const h = (location.hash || '').replace(/^#\/?/, '') || 'dashboard'; $$('.sb-link').forEach((a) => a.classList.toggle('on', a.dataset.r === h || (h.indexOf('pendaftar') === 0 && a.dataset.r === 'pendaftar'))); refreshBadges(); }
  const _boot = boot; boot = async function () { await _boot(); A.loadBrand(); };
})();
