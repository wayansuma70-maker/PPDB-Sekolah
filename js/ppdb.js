/* Halaman PPDB publik: formulir bertahap · pendaftaran berhasil · cek status */
(function () {
  const Ppdb = window.Ppdb = {};
  let st = null;

  // ---------- Kompres gambar (JPG/PNG → JPEG ≤1600px) ----------
  async function kompres(file, maxPx, q) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
      const sc = Math.min(1, maxPx / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      return await new Promise((ok) => c.toBlob(ok, 'image/jpeg', q));
    } finally { URL.revokeObjectURL(url); }
  }
  const toB64 = (blob) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(blob); });

  async function olahBerkas(f, file) {
    const va = f.validasi || {}, jenis = va.jenis || ['pdf', 'jpg', 'png'], mb = va.maks_mb || 2, nm = file.name.toLowerCase();
    const ext = /\.pdf$/.test(nm) ? 'pdf' : /\.(jpe?g)$/.test(nm) ? 'jpg' : /\.png$/.test(nm) ? 'png' : '';
    if (!ext || jenis.indexOf(ext) === -1) throw new Error('Format berkas harus ' + jenis.map((j) => j.toUpperCase()).join(' / ') + '.');
    let blob = file, name = file.name;
    if ((ext === 'jpg' || ext === 'png') && jenis.indexOf('jpg') > -1 && (file.size > 350 * 1024 || ext === 'png')) { try { const b = await kompres(file, 1600, .82); if (b && b.size < file.size || ext === 'png') { blob = b; name = name.replace(/\.[a-z]+$/i, '') + '.jpg'; } } catch (e) {} }
    if (blob.size > mb * 1048576) throw new Error('Ukuran berkas melebihi ' + mb + ' MB' + (ext === 'pdf' ? ' — kompres PDF terlebih dahulu.' : '.'));
    return { name, size: blob.size, data: await toB64(blob), preview: ext === 'pdf' ? '' : URL.createObjectURL(blob) };
  }

  // ---------- FORMULIR ----------
  Ppdb.renderForm = async function (view, B) {
    view.innerHTML = '<div class="phead"><div class="wrap"><div class="skel" style="height:90px;opacity:.25"></div></div></div><div class="wrap sec"><div class="skel" style="height:420px"></div></div>';
    const r = await Api.get('ppdb.form');
    if (!r.success) { view.innerHTML = '<div class="wrap sec"><div class="alert err">' + ic('alert') + '<div>' + esc(r.message) + '</div></div></div>'; return; }
    const per = r.data.periode, fields = r.data.fields, groups = FormUI.groups(fields), key = 'draft_' + (per.id || 'x');
    const draft = lsGet(key, null);
    st = { per, fields, groups, versi: r.data.versi, step: 0, vals: {}, files: {}, err: {}, key, restored: false, busy: false, maxStep: 0 };
    if (draft && draft.vals && draft.v === r.data.versi) { st.vals = draft.vals; st.step = Math.min(draft.step || 0, groups.length - 1); st.maxStep = st.step; st.restored = draft.at; }
    paint(view, B);
  };

  const kuotaPct = (p) => (p.kuota ? Math.min(100, Math.round(p.terisi / p.kuota * 100)) : 0);
  function stateInfo(p) {
    return { dibuka: ['ok', 'Dibuka'], ditutup: ['off', 'Ditutup'], penuh: ['err', 'Kuota Penuh'], belum: ['warn', 'Belum Dibuka'] }[p.state] || ['off', 'Tidak tersedia'];
  }
  /** Render mengikuti urutan skema: deret non-berkas → grid 2 kolom, deret berkas → grid tile */
  function chunks(fields, fld) {
    const out = []; let cur = null;
    fields.forEach((f) => { const k = f.tipe === 'file' ? 'f' : 'n'; if (!cur || cur.k !== k) { cur = { k, items: [] }; out.push(cur); } cur.items.push(f); });
    return out.map((c, i) => c.k === 'n' ? '<div class="fields"' + (i ? ' style="margin-top:22px"' : '') + '>' + c.items.map(fld).join('') + '</div>' : '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:' + (i ? 22 : 0) + 'px">' + c.items.map(fld).join('') + '</div>').join('');
  }
  function paint(view, B) {
    const p = st.per, [pc, pt] = stateInfo(p), closed = !p.ada || p.state !== 'dibuka', g = st.groups[st.step], last = st.step === st.groups.length - 1;
    const msg = !p.ada ? 'Periode pendaftaran belum tersedia.' : p.state === 'penuh' ? 'Kuota pendaftaran telah penuh.' : p.state === 'belum' ? 'Pendaftaran akan dibuka pada ' + tglPanjang(p.tanggal_buka) + '.' : 'Pendaftaran telah ditutup' + (p.tanggal_tutup ? ' pada ' + tglPanjang(p.tanggal_tutup) : '') + '.';
    const stepsHtml = st.groups.map((x, i) => '<button type="button" class="stp ' + (i === st.step ? 'on ' : '') + (i < st.step ? 'done' : '') + '" data-step="' + i + '"' + (i > st.maxStep ? ' disabled style="opacity:.55;cursor:not-allowed"' : '') + '><span class="n">' + (i < st.step ? ic('check') : i + 1) + '</span><span><b>' + esc(x.nama) + '</b><small>' + x.fields.length + ' isian' + (x.fields.some((f) => f.tipe === 'file') ? ' · unggah berkas' : '') + '</small></span></button>').join('');
    const fld = (f) => FormUI.field(f, { value: st.vals[f.kunci], error: st.err[f.kunci], disabled: closed, file: st.files[f.kunci] });
    view.innerHTML =
      '<div class="phead"><div class="wrap"><div class="crumb"><a href="#/">Beranda</a>' + ic('chevron-right') + '<span>Pendaftaran PPDB</span></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><span class="pill ' + pc + '"><i class="dot"></i>' + pt + '</span>' + (p.nama ? '<span class="pill" style="background:rgba(255,255,255,.14);color:#fff">' + esc(p.nama) + '</span>' : '') + (p.tanggal_tutup ? '<span class="pill" style="background:rgba(255,255,255,.14);color:#fff">Batas akhir: ' + tglPanjang(p.tanggal_tutup) + '</span>' : '') + '</div>' +
      '<h1>Formulir Pendaftaran PPDB ' + esc(p.tahun_ajaran || '') + '</h1><p>Lengkapi data calon peserta didik dan unggah dokumen secara digital. Anda dapat menyimpan draf dan melanjutkan kapan saja.</p>' +
      (p.kuota ? '<div class="kuota" style="margin-top:22px;max-width:420px"><div class="row"><span>Kuota terisi</span><b>' + p.terisi + ' / ' + p.kuota + '</b></div><div class="bar"><i style="width:' + kuotaPct(p) + '%"></i></div><small>Sisa ' + (p.sisa == null ? '—' : p.sisa) + ' kursi tersedia</small></div>' : '') + '</div></div>' +
      '<div class="wrap" style="padding-top:28px;padding-bottom:60px"><div class="fgrid ' + (closed ? 'overlay-closed' : '') + '">' +
      '<aside class="side"><div class="card steps"><h4>Tahapan Pendaftaran <span class="pill gold">Langkah ' + (st.step + 1) + '/' + st.groups.length + '</span></h4>' + stepsHtml + '</div>' +
      '<div class="help"><h4>' + ic('message') + 'Butuh Bantuan?</h4><p>Kendala saat mengisi formulir atau mengunggah berkas? Tim registrasi siap membantu Anda.</p><a class="btn btn-wa btn-sm btn-block" target="_blank" rel="noopener" href="' + waLink(B, 'Halo, saya butuh bantuan pengisian formulir PPDB.') + '">' + icWA() + 'Chat Helpdesk WhatsApp</a></div></aside>' +
      '<div id="fmain">' +
      (closed ? '<div class="alert warn">' + ic('alert') + '<div><b>' + esc(pt) + '.</b> ' + esc(msg) + ' Formulir hanya dapat dilihat, tidak dapat dikirim.</div></div>' : '') +
      (st.restored && !closed ? '<div class="alert info">' + ic('info') + '<div>Draf pengisian dipulihkan (disimpan ' + esc(tglID(st.restored, true)) + '). Berkas perlu dipilih ulang. <a href="#" data-reset style="text-decoration:underline;font-weight:700">Mulai dari awal</a></div></div>' : '') +
      '<div id="ferr"></div><div class="card fcard"><h3><span class="n">' + (st.step + 1) + '</span>' + esc(g.nama) + '</h3><p class="lead">Kolom bertanda <span style="color:var(--err-fg)">*</span> wajib diisi.</p>' +
      chunks(g.fields, fld) +
      '<input type="text" name="website" id="hp_extra" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0"></div>' +
      '<div class="card fbar"><button type="button" class="btn btn-ghost btn-sm" data-draft>' + ic('file') + 'Simpan Draf</button><span class="st">Langkah ' + (st.step + 1) + ' dari ' + st.groups.length + ': ' + esc(g.nama) + '</span><div style="display:flex;gap:10px">' +
      (st.step > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-prev>' + ic('arrow-left') + 'Kembali</button>' : '') +
      (last ? '<button type="button" class="btn btn-cta" data-submit' + (closed ? ' disabled' : '') + '>' + ic('send') + 'Kirim Pendaftaran</button>' : '<button type="button" class="btn btn-cta" data-next' + (closed ? ' disabled' : '') + '>Lanjutkan ke Tahap Berikutnya' + ic('arrow-right') + '</button>') + '</div></div></div>' +
      (closed ? '' : '') + '</div></div>';
    FX.scan(view); bindForm(view, B);
    $$('.kuota .bar i', view).forEach((b) => { const w = b.style.width; b.style.width = '0'; requestAnimationFrame(() => requestAnimationFrame(() => (b.style.width = w))); });
  }
  window.waLink = function (B, text) { const n = hp62((B && B.kontak && B.kontak.whatsapp) || ''); return 'https://wa.me/' + (n || '') + '?text=' + encodeURIComponent(text || ''); };

  function snap(view) { // baca nilai dari DOM ke state
    st.groups[st.step].fields.forEach((f) => {
      if (f.tipe === 'file') return;
      if (f.tipe === 'checkbox') st.vals[f.kunci] = $$('input[name="' + f.kunci + '"]:checked', view).map((i) => i.value);
      else if (f.tipe === 'radio') { const c = $('input[name="' + f.kunci + '"]:checked', view); st.vals[f.kunci] = c ? c.value : ''; }
      else { const e = $('[name="' + f.kunci + '"]', view); if (e) st.vals[f.kunci] = e.value; }
    });
  }
  function saveDraft(silent) { lsSet(st.key, { vals: st.vals, step: st.step, at: new Date().toISOString().slice(0, 19), v: st.versi }); if (!silent) toast('Draf tersimpan di perangkat ini.', 'ok'); }
  function validateGroup(idx, view) {
    let first = null; const g = st.groups[idx];
    g.fields.forEach((f) => { const m = FormUI.validate(f, st.vals[f.kunci], st.files[f.kunci]); if (m) { st.err[f.kunci] = m; if (!first) first = f.kunci; } else delete st.err[f.kunci]; });
    return first;
  }
  function showErrors(view) {
    $$('.fld', view).forEach((w) => { const k = w.dataset.k, m = st.err[k], em = $('.em', w); if (!em) return; if (m) { em.hidden = false; em.innerHTML = ic('alert') + esc(m); const i = $('.in,.sel,.ta', w); if (i) i.classList.add('err'); } else { em.hidden = true; const i = $('.in,.sel,.ta', w); if (i) i.classList.remove('err'); } });
  }
  function bindForm(view, B) {
    const root = $('#fmain', view);
    root.addEventListener('input', debounce((e) => { if (e.target.closest('.fld')) { snap(root); const k = e.target.closest('.fld').dataset.k; if (st.err[k]) { const f = st.fields.find((x) => x.kunci === k); const m = FormUI.validate(f, st.vals[k], st.files[k]); if (!m) { delete st.err[k]; showErrors(root); } } saveDraft(true); } }, 350));
    root.addEventListener('focusout', (e) => { const w = e.target.closest && e.target.closest('.fld'); if (!w || st.per.state !== 'dibuka') return; snap(root); const k = w.dataset.k, f = st.fields.find((x) => x.kunci === k); if (!f || f.tipe === 'file') return; const m = FormUI.validate(f, st.vals[k], st.files[k]); if (m && String(st.vals[k] || '').length) st.err[k] = m; else delete st.err[k]; showErrors(root); });
    root.addEventListener('change', async (e) => {
      const fi = e.target.closest && e.target.closest('[data-file]'); if (!fi) { snap(root); saveDraft(true); return; }
      await pilihBerkas(fi.dataset.file, fi.files[0], view, B);
    });
    ['dragover', 'dragenter'].forEach((ev) => root.addEventListener(ev, (e) => { const d = e.target.closest && e.target.closest('.drop'); if (d) d.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => root.addEventListener(ev, (e) => { const d = e.target.closest && e.target.closest('.drop'); if (d) d.classList.remove('over'); }));
    view.addEventListener('click', async (e) => {
      const t = e.target.closest('button,a'); if (!t) return;
      if (t.dataset.rm) { e.preventDefault(); delete st.files[t.dataset.rm]; snap(root); paint(view, B); return; }
      if (t.dataset.step !== undefined) { snap(root); const n = +t.dataset.step; if (n <= st.maxStep) { st.step = n; paint(view, B); window.scrollTo({ top: 0, behavior: 'smooth' }); } return; }
      if (t.dataset.reset !== undefined) { e.preventDefault(); lsDel(st.key); st.vals = {}; st.files = {}; st.step = 0; st.maxStep = 0; st.restored = false; paint(view, B); return; }
      if (t.hasAttribute('data-draft')) { snap(root); saveDraft(); return; }
      if (t.hasAttribute('data-prev')) { snap(root); st.step--; paint(view, B); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (t.hasAttribute('data-next')) { snap(root); const k = validateGroup(st.step, root); showErrors(root); if (k) { toast('Lengkapi isian yang ditandai terlebih dahulu.', 'err'); const el = $('[data-k="' + k + '"]', root); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; } saveDraft(true); st.step++; st.maxStep = Math.max(st.maxStep, st.step); paint(view, B); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (t.hasAttribute('data-submit')) { snap(root); kirim(view, B); }
    });
  }
  async function pilihBerkas(kunci, file, view, B) {
    if (!file) return; const f = st.fields.find((x) => x.kunci === kunci), root = $('#fmain', view);
    try { snap(root); const b = await olahBerkas(f, file); st.files[kunci] = b; delete st.err[kunci]; paint(view, B); }
    catch (e) { toast(e.message, 'err', f.label); st.err[kunci] = e.message; showErrors(root); }
  }
  async function kirim(view, B) {
    if (st.busy) return; const root = $('#fmain', view);
    for (let i = 0; i < st.groups.length; i++) { const k = validateGroup(i, root); if (k) { st.step = i; paint(view, B); showErrors($('#fmain', view)); toast('Masih ada isian yang belum lengkap pada tahap "' + st.groups[i].nama + '".', 'err'); const el = $('[data-k="' + k + '"]', view); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; } }
    st.busy = true;
    const ov = document.createElement('div'); ov.className = 'modal'; ov.innerHTML = '<div class="scrim"></div><div class="box" style="text-align:center;max-width:380px"><div class="okring" style="background:var(--accent-soft);color:var(--accent-dark)"><svg class="ic" viewBox="0 0 24 24" style="animation:spin 1s linear infinite;stroke-dasharray:none;stroke-dashoffset:0">' + ICONS.refresh + '</svg></div><h3>Mengirim pendaftaran…</h3><p style="color:var(--muted);margin:8px 0 0">Mengunggah berkas dan menyimpan data. Mohon jangan tutup halaman ini.</p></div>'; document.body.appendChild(ov);
    const berkas = {}; Object.keys(st.files).forEach((k) => { berkas[k] = { name: st.files[k].name, data: st.files[k].data }; });
    const r = await Api.post('ppdb.submit', { jawaban: st.vals, berkas, cid: cid(), hp_extra: ($('#hp_extra') || {}).value || '' }, { token: '' });
    ov.remove(); st.busy = false;
    if (!r.success) {
      const box = $('#ferr', view); if (box) box.innerHTML = '<div class="alert err">' + ic('alert') + '<div><b>Pendaftaran belum terkirim.</b><br>' + esc(r.message) + (r.code === 'DUPLIKAT' ? ' <a href="#/status" style="text-decoration:underline;font-weight:700">Cek Status</a>' : '') + '</div></div>';
      window.scrollTo({ top: 0, behavior: 'smooth' }); if (r.code === 'CLOSED') { setTimeout(() => location.reload(), 2500); } return;
    }
    lsDel(st.key); try { sessionStorage.setItem('ppdb_ok', JSON.stringify(Object.assign({ nq: r.nq || 0 }, r.data))); } catch (e) {}
    if (r.nq) setTimeout(() => Api.post('notif.drain', {}, { token: '' }), 700);
    location.hash = '#/berhasil';
  }

  // ---------- BERHASIL ----------
  Ppdb.renderSuccess = function (view, B) {
    let d = null; try { d = JSON.parse(sessionStorage.getItem('ppdb_ok') || 'null'); } catch (e) {}
    if (!d) { location.hash = '#/status'; return; }
    const sekolah = (B && B.setting && B.setting.nama_sekolah) || 'sekolah';
    view.innerHTML = '<div style="background:linear-gradient(180deg,var(--surface),var(--bg));padding:60px 0 40px"><div class="wrap"><div class="card center-card reveal"><div class="okring">' + ic('check') + '</div><span class="pill ok" style="margin-bottom:12px"><i class="dot"></i>Tahap 1 selesai: formulir masuk</span>' +
      '<h2>Pendaftaran Berhasil Dikirim!</h2><p style="color:var(--muted);margin-top:10px">Terima kasih telah mendaftar di ' + esc(sekolah) + '. Data Anda sedang menunggu verifikasi panitia PPDB.</p>' +
      '<div class="tokbox"><div><small>Token Pendaftaran Anda — simpan baik-baik</small><b id="tok">' + esc(d.token) + '</b></div><button class="btn btn-ghost btn-sm" id="cptok">' + ic('copy') + 'Salin</button></div>' +
      (d.nq ? '<div class="alert info" style="text-align:left">' + ic('mail') + '<div>Notifikasi dan rincian pendaftaran dikirim ke <b>' + esc(d.email_samar || '') + '</b>' + (d.wa_samar ? ' dan WhatsApp <b>' + esc(d.wa_samar) + '</b>' : '') + '. Bila belum diterima dalam beberapa menit, gunakan token di atas untuk cek status.</div></div>' : '<div class="alert info" style="text-align:left">' + ic('info') + '<div><b>Simpan token di atas.</b> Token dibutuhkan untuk memeriksa status pendaftaran pada menu "Cek Status". Pemberitahuan hasil akan disampaikan panitia melalui kontak yang Anda daftarkan.</div></div>') +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:6px"><a class="btn btn-cta" href="#/status/' + esc(d.token) + '">' + ic('search') + 'Cek Status Sekarang</a><button class="btn btn-ghost" id="prn">' + ic('download') + 'Cetak / Simpan Bukti</button></div><p style="margin:22px 0 0"><a href="#/" class="more">' + ic('arrow-left') + 'Kembali ke Beranda</a></p></div></div></div>';
    FX.scan(view); $('#cptok').onclick = async () => { toast((await copyText(d.token)) ? 'Token disalin.' : 'Salin manual token Anda.', 'ok'); };
    $('#prn').onclick = () => { const w = window.open('', '_blank'); if (!w) return toast('Izinkan pop-up untuk mencetak bukti.', 'err'); w.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Bukti Pendaftaran ' + esc(d.token) + '</title><style>body{font-family:Arial,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;color:#1a2433}h1{color:#14305a;border-bottom:4px solid #f5b301;padding-bottom:10px}.t{font:700 28px monospace;letter-spacing:.08em;background:#eaf2fb;border:2px dashed #f5b301;padding:18px;text-align:center;margin:24px 0}td{padding:8px 0;border-bottom:1px solid #dce4ef}</style></head><body><h1>Bukti Pendaftaran PPDB</h1><p><b>' + esc(sekolah) + '</b></p><div class="t">' + esc(d.token) + '</div><table width="100%"><tr><td>Nama</td><td><b>' + esc(d.nama) + '</b></td></tr><tr><td>Tanggal daftar</td><td>' + esc(tglID(d.tanggal, true)) + '</td></tr><tr><td>Status awal</td><td>Menunggu verifikasi</td></tr></table><p style="margin-top:28px;font-size:13px;color:#5b6b82">Simpan token ini untuk memeriksa status pendaftaran pada menu "Cek Status" di website sekolah.</p><script>window.onload=function(){window.print()}<\/script></body></html>'); w.document.close(); };
  };

  // ---------- CEK STATUS ----------
  const TAHAP = ['Verifikasi Berkas', 'Tes & Observasi', 'Registrasi Ulang'];
  const STATUS_VIEW = { Baru: ['blue', 0, 'Pendaftaran Anda sudah kami terima dan menunggu verifikasi berkas oleh panitia.'], Diverifikasi: ['info', 1, 'Berkas Anda telah diverifikasi. Pantau informasi jadwal tes dan observasi dari panitia.'], Diterima: ['ok', 3, 'Selamat! Anda dinyatakan diterima. Silakan lanjutkan ke proses registrasi ulang.'], Ditolak: ['err', -1, 'Mohon maaf, pendaftaran belum dapat kami terima. Lihat catatan panitia di bawah.'], Cadangan: ['warn', 1, 'Anda masuk daftar cadangan. Kami akan menghubungi bila ada kursi tersedia.'] };
  Ppdb.renderStatus = function (view, B, token) {
    let mode = 'token';
    view.innerHTML = '<div class="phead"><div class="wrap"><div class="crumb"><a href="#/">Beranda</a>' + ic('chevron-right') + '<span>Cek Status</span></div><h1>Cek Status Pendaftaran</h1><p>Pantau tahapan verifikasi dan pengumuman hasil seleksi secara mandiri dengan token atau email pendaftaran.</p></div></div>' +
      '<div class="wrap" style="padding-bottom:70px"><div class="card center-card float-bar" style="display:block;text-align:left;margin-top:-40px;padding:30px"><div class="tabs" id="stab" style="margin-bottom:18px;display:flex"><button class="on" data-m="token">' + ic('key') + ' Token</button><button data-m="email">' + ic('mail') + ' Email</button></div>' +
      '<form id="sf" style="display:flex;gap:10px;flex-wrap:wrap"><input class="in" id="sq" style="flex:1;min-width:220px" placeholder="Contoh: PPDB-2027-ABC123" autocomplete="off" required><button class="btn btn-cta" type="submit">' + ic('search') + 'Periksa Status</button></form><div id="sres"></div></div>' +
      '<div class="grid g3" style="margin-top:44px;max-width:920px;margin-left:auto;margin-right:auto">' + [['check', '1. Verifikasi Berkas', 'Panitia memeriksa akta, KK, dan dokumen pendukung dalam 1×24 jam kerja.'], ['target', '2. Tes & Observasi', 'Asesmen diagnostik, minat bakat, dan wawancara bersama orang tua.'], ['id', '3. Registrasi Ulang', 'Pengumuman akhir dan penyelesaian administrasi bagi peserta diterima.']].map((x) => '<div class="card glow reveal" style="padding:24px"><div class="ib" style="width:46px;height:46px;border-radius:12px;background:var(--accent-soft);color:var(--accent-dark);display:grid;place-items:center;margin-bottom:12px">' + ic(x[0]) + '</div><h4 style="margin-bottom:6px">' + x[1] + '</h4><p style="color:var(--muted);font-size:14px;margin:0">' + x[2] + '</p></div>').join('') + '</div></div>';
    FX.scan(view);
    const q = $('#sq', view), res = $('#sres', view);
    $('#stab', view).onclick = (e) => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('#stab button', view).forEach((x) => x.classList.toggle('on', x === b)); q.type = mode === 'email' ? 'email' : 'text'; q.placeholder = mode === 'email' ? 'Email yang dipakai mendaftar' : 'Contoh: PPDB-2027-ABC123'; q.value = ''; res.innerHTML = ''; };
    async function cek() {
      const v = q.value.trim(); if (!v) return;
      res.innerHTML = '<div class="skel" style="height:150px;margin-top:20px"></div>';
      const r = await Api.post('status.cek', { mode, q: v, cid: cid() }, { token: '' });
      if (!r.success) { res.innerHTML = '<div class="alert ' + (r.code === 'RATE' ? 'warn' : 'err') + '" style="margin:20px 0 0">' + ic(r.code === 'RATE' ? 'clock' : 'alert') + '<div>' + esc(r.message) + '</div></div>'; return; }
      const d = r.data, vw = STATUS_VIEW[d.status] || ['off', 0, ''], step = vw[1];
      const tl = TAHAP.map((t, i) => '<div class="t ' + (step === -1 ? (i === 0 ? 'bad' : '') : i < step ? 'done' : i === step ? 'on' : '') + '"><i>' + (step === -1 && i === 0 ? '!' : i < step ? '✓' : i + 1) + '</i>' + t + '</div>').join('');
      res.innerHTML = '<div class="result"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><small style="font-weight:700">HASIL PEMERIKSAAN · ' + esc(d.periode) + '</small><span class="pill ' + vw[0] + '"><i class="dot"></i>' + esc(d.status) + '</span></div>' +
        '<div class="rw"><div><small>Nama Terdaftar</small><b>' + esc(d.nama_samar) + '</b></div><div><small>Jenjang</small><b>' + esc(d.jenjang || '—') + '</b></div><div><small>Tanggal Registrasi</small><b>' + esc(tglID(d.tanggal, true)) + '</b></div><div><small>Token</small><b>' + esc(d.token_samar) + '</b></div></div>' +
        '<div class="tl">' + tl + '</div><p style="color:var(--muted);font-size:14px;margin:14px 0 0">' + esc(vw[2]) + '</p>' + (d.catatan ? '<div class="note"><b style="font-size:12px;color:var(--accent-dark);display:block;margin-bottom:4px">CATATAN PANITIA PPDB</b>' + esc(d.catatan) + '</div>' : '') + '</div>';
    }
    $('#sf', view).onsubmit = (e) => { e.preventDefault(); cek(); };
    if (token) { q.value = decodeURIComponent(token); cek(); }
  };
})();
