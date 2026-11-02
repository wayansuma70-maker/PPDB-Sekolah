/* Admin A: Dashboard · Konten (CRUD generik) · Pengaturan · Role & Pengguna */
(function () {
  const STC = { Baru: '#3b82f6', Diverifikasi: '#6366f1', Diterima: '#22c55e', Ditolak: '#ef4444', Cadangan: '#f59e0b' };
  const JC = ['#14305a', '#f5b301', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

  // ---------- grafik SVG ----------
  function chartBars(d) {
    const W = 720, H = 250, p = { l: 34, r: 14, t: 24, b: 32 }, iw = W - p.l - p.r, ih = H - p.t - p.b, n = d.length, max = Math.max(4, ...d.map((x) => x.n), ...d.map((x) => x.rata)), bw = iw / n * .56;
    const y = (v) => p.t + ih - ih * v / max, cx = (i) => p.l + iw / n * (i + .5); let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik pendaftar per hari">';
    for (let k = 0; k <= 4; k++) { const v = Math.round(max * k / 4); s += '<line class="gl" x1="' + p.l + '" x2="' + (W - p.r) + '" y1="' + y(max * k / 4) + '" y2="' + y(max * k / 4) + '"/><text x="' + (p.l - 8) + '" y="' + (y(max * k / 4) + 4) + '" text-anchor="end">' + v + '</text>'; }
    d.forEach((x, i) => { const h = ih * x.n / max; s += '<rect class="bar" x="' + (cx(i) - bw / 2) + '" y="' + (p.t + ih - h) + '" width="' + bw + '" height="' + Math.max(h, 0) + '" rx="6"><title>' + x.label + ': ' + x.n + ' pendaftar</title></rect>' + (x.n ? '<text x="' + cx(i) + '" y="' + (p.t + ih - h - 6) + '" text-anchor="middle" style="font-weight:700">' + x.n + '</text>' : '') + (i % 2 === 0 || n < 9 ? '<text x="' + cx(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + x.label + '</text>' : ''); });
    s += '<polyline class="ln" points="' + d.map((x, i) => cx(i) + ',' + y(x.rata)).join(' ') + '"/>' + d.map((x, i) => '<circle class="pt" r="3.5" cx="' + cx(i) + '" cy="' + y(x.rata) + '"/>').join('') + '</svg>'; return s;
  }
  function donut(items, center, sub) {
    const tot = items.reduce((a, b) => a + b.v, 0) || 1, R = 70, C = 2 * Math.PI * R; let off = 0, s = '<svg viewBox="0 0 200 200" style="width:100%;max-width:210px;display:block;margin:0 auto" role="img" aria-label="Komposisi"><circle cx="100" cy="100" r="' + R + '" fill="none" stroke="var(--border)" stroke-width="28"/>';
    items.forEach((it) => { const len = C * it.v / tot; if (it.v) s += '<circle cx="100" cy="100" r="' + R + '" fill="none" stroke="' + it.c + '" stroke-width="28" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 100 100)"><title>' + it.l + ': ' + it.v + '</title></circle>'; off += len; });
    return s + '<text x="100" y="104" text-anchor="middle" style="font-size:34px;font-weight:800;fill:var(--heading)">' + center + '</text><text x="100" y="124" text-anchor="middle" style="font-size:11px;fill:var(--muted);font-weight:700;letter-spacing:.08em">' + sub + '</text></svg>';
  }

  // ---------- ekspor pendaftar (dipakai Dashboard & Pendaftar) ----------
  A.exportPend = async function (f) {
    const r = await A.call('pendaftar.export', f || {}); if (!r.success) return; const d = r.data;
    const ringkas = [['Laporan Pendaftar PPDB'], ['Sekolah', d.sekolah], ['Periode', d.periode], ['Dibuat', d.dibuat.replace('T', ' ')], ['Total pendaftar', d.total], ['Kuota', d.kuota || '—'], [], ['Status', 'Jumlah']].concat(Object.keys(d.ringkasan).map((k) => [k, d.ringkasan[k]]));
    try { await A.xlsx([{ name: 'Ringkasan', rows: ringkas }, { name: 'Pendaftar', rows: [d.kolom].concat(d.baris) }], 'Pendaftar-PPDB-' + new Date().toISOString().slice(0, 10) + '.xlsx'); } catch (e) { toast(e.message, 'err'); }
  };

  // ============ DASHBOARD ============
  A.page('dashboard', {
    title: 'Ringkasan',
    async render(el) {
      let pid = A.st.dashPid || '';
      const draw = async () => {
        const r = await A.call('dash.summary', { periode_id: pid }); if (!r.success) { el.innerHTML = A.empty('alert', 'Gagal memuat', r.message); return; }
        const s = r.data.ringkasan, sys = r.data.sistem, per = r.data.periodes, tot = s.total || 0, pct = s.kuota ? Math.min(100, Math.round(s.terisi / s.kuota * 100)) : 0, selisih = s.hariIni - s.kemarin;
        const jItems = Object.keys(s.jenjang).map((k, i) => ({ l: k, v: s.jenjang[k], c: JC[i % JC.length] })), jTot = jItems.reduce((a, b) => a + b.v, 0);
        const stItems = Object.keys(s.status).map((k) => ({ l: k, v: s.status[k], c: STC[k] }));
        const dummyN = sys.dummy;
        el.innerHTML = '<div class="ph"><div><h1>Ringkasan Eksekutif & PPDB ' + (sys.sinkron ? '<span class="pill ok"><i class="dot"></i>Live</span>' : '') + '</h1><p>Pantauan pendaftar, kuota, performa notifikasi, dan aktivitas sistem terintegrasi.</p></div><div class="acts"><select class="sel" id="dp" style="width:auto;min-width:220px">' + '<option value="">Semua periode</option>' + per.map((p) => '<option value="' + esc(p.id) + '"' + (p.id === pid ? ' selected' : '') + '>' + esc(p.nama) + (p.utama ? ' (utama)' : '') + '</option>').join('') + '</select><button class="btn btn-gold" id="dx">' + ic('download') + 'Unduh Excel</button></div></div>' +
          (dummyN ? '<div class="alert info">' + ic('info') + '<div>Website masih menampilkan <b>' + dummyN + ' data contoh (dummy)</b>. Ganti dengan data asli sekolah lalu hapus lewat <a href="#/pengaturan" style="text-decoration:underline;font-weight:700">Pengaturan → Zona Berbahaya</a>.</div></div>' : '') +
          '<div class="sysbar"><span><i class="' + (sys.wa.aktif ? '' : 'off') + '"></i>WhatsApp: ' + (sys.wa.aktif ? 'Aktif' : sys.wa.token ? 'Dimatikan' : 'Belum diatur') + '</span><span><i class="' + (sys.email.aktif ? '' : 'off') + '"></i>Email: ' + (sys.email.aktif ? 'Aktif' : 'Dimatikan') + (sys.email.sisaKuota != null ? ' (sisa kuota ' + sys.email.sisaKuota + ')' : '') + '</span><span><i class="' + (sys.antrean.gagal ? 'bad' : '') + '"></i>Antrean: ' + sys.antrean.antri + ' menunggu · ' + sys.antrean.gagal + ' gagal</span><span><i class="' + (sys.googleClient ? '' : 'off') + '"></i>Login Google: ' + (sys.googleClient ? 'Terhubung' : 'Belum diatur') + '</span><span class="r">Kontak CRM: ' + sys.crm + ' · v' + esc(sys.versi) + '</span></div>' +
          '<div class="kpi"><div class="card kc"><div class="lb">Total Pendaftar' + ic('users') + '</div><div class="v">' + tot + '</div><div class="sub">Akumulasi seluruh jenjang pada periode terpilih</div></div>' +
          '<div class="card kc"><div class="lb">Pendaftar Hari Ini' + ic('calendar') + '</div><div class="v">' + s.hariIni + '</div><span class="trend ' + (selisih < 0 ? 'dn' : '') + '">' + (selisih >= 0 ? '+' : '') + selisih + ' dari kemarin</span></div>' +
          '<div class="card kc"><div class="lb">Kuota Terisi' + ic('graduation') + '</div><div class="v">' + s.terisi + ' <small>/ ' + (s.kuota || '∞') + '</small></div><div class="pbar"><i style="width:' + pct + '%"></i></div><div class="sub" style="margin-top:6px">' + (s.kuota ? pct + '% terpenuhi · sisa ' + Math.max(0, s.kuota - s.terisi) + ' kursi' : 'Kuota tidak dibatasi') + '</div></div>' +
          '<div class="card kc"><div class="lb">Komposisi Seleksi</div><div class="legend">' + stItems.map((x) => '<div><i style="background:' + x.c + '"></i>' + x.l + '<b>' + x.v + '</b></div>').join('') + '</div></div></div>' +
          '<div class="row2"><div class="card pad"><div class="ct"><div><h3>Tren Pendaftaran 14 Hari Terakhir</h3><p>Batang: pendaftar harian · garis emas: rata-rata bergerak 3 hari</p></div></div>' + chartBars(s.perHari) + '</div>' +
          '<div class="card pad"><div class="ct"><div><h3>' + (jTot ? 'Komposisi Jenjang' : 'Komposisi Status') + '</h3><p>Proporsi pendaftar</p></div></div>' + donut(jTot ? jItems : stItems, jTot || tot, 'TOTAL') + '<div class="legend" style="margin-top:16px">' + (jTot ? jItems : stItems).map((x) => '<div><i style="background:' + x.c + '"></i>' + esc(x.l) + '<b>' + x.v + ' · ' + Math.round(x.v / ((jTot || tot) || 1) * 100) + '%</b></div>').join('') + '</div></div></div>' +
          '<div class="card"><div class="pad ct" style="margin:0;padding-bottom:6px"><div><h3>Pendaftar Terbaru Masuk</h3><p>Calon peserta didik yang menunggu tindak lanjut verifikasi berkas</p></div><a class="btn btn-soft btn-xs" href="#/pendaftar">Lihat semua ' + ic('arrow-right') + '</a></div><div class="tw"><table class="ta2"><thead><tr><th>Token</th><th>Nama Calon Siswa</th><th>Jenjang</th><th>Status</th><th>Tanggal Daftar</th><th></th></tr></thead><tbody>' +
          (s.terbaru.length ? s.terbaru.map((p) => '<tr' + (p.is_dummy ? ' class="dummy"' : '') + '><td class="mono">' + esc(p.token) + '</td><td><div class="who2">' + A.av(p.nama) + '<div><b>' + esc(p.nama) + '</b>' + (p.is_dummy ? ' <span class="tag dm">DUMMY</span>' : '') + '<small>' + esc(p.email) + '</small></div></div></td><td>' + esc(p.jenjang || '—') + '</td><td>' + A.pill(p.status) + '</td><td>' + esc(tglID(p.tanggal_daftar, true)) + '</td><td><a class="btn btn-soft btn-xs" href="#/pendaftar/' + esc(p.id) + '">Detail ' + ic('chevron-right') + '</a></td></tr>').join('') : '<tr><td colspan="6">' + A.empty('users', 'Belum ada pendaftar', 'Pendaftar akan tampil di sini setelah formulir PPDB diisi.') + '</td></tr>') + '</tbody></table></div></div>';
        $('#dp', el).onchange = (e) => { pid = A.st.dashPid = e.target.value; draw(); };
        $('#dx', el).onclick = () => A.exportPend({ periode_id: pid });
      };
      await draw();
    }
  });

  // ============ KONTEN (generik) ============
  const fid = (k) => 'kf_' + k;
  function fieldHtml(f, v, isNew) {
    const id = fid(f.k), req = f.req ? ' <span class="req">*</span>' : '', hint = f.hint ? '<div class="hint">' + esc(f.hint) + '</div>' : '';
    switch (f.t) {
      case 'toggle': return '<div class="ff sw-row"><label for="' + id + '">' + esc(f.l) + '</label>' + A.sw(id, isNew ? true : !!v) + '</div>';
      case 'statusToggle': return '<div class="ff sw-row"><label for="' + id + '">' + esc(f.l) + '</label>' + A.sw(id, isNew ? true : v === 'tampil') + '</div>';
      case 'textarea': return '<div class="ff"><label for="' + id + '">' + esc(f.l) + req + '</label><textarea class="ta" id="' + id + '" rows="3" maxlength="' + (f.max || 500) + '">' + esc(v) + '</textarea>' + hint + '</div>';
      case 'longtext': return '<div class="ff"><label for="' + id + '">' + esc(f.l) + req + '</label><div class="mdbar" data-md="' + id + '"><button type="button" data-m="**">B</button><button type="button" data-m="*"><i>I</i></button><button type="button" data-m="### ">H3</button><button type="button" data-m="- ">• Daftar</button><button type="button" data-m="link">Tautan</button></div><textarea class="ta" id="' + id + '" rows="9" maxlength="' + (f.max || 6000) + '">' + esc(v) + '</textarea><div class="hint">Mendukung Markdown ringan: **tebal**, *miring*, ### judul kecil, - daftar, [teks](https://tautan)</div></div>';
      case 'select': { const o = f.opts || []; const has = o.indexOf(v) > -1 || !v; return '<div class="ff"><label for="' + id + '">' + esc(f.l) + req + '</label><select class="sel" id="' + id + '">' + (v ? '' : '<option value="">Pilih…</option>') + o.concat(has ? [] : [v]).map((x) => '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + '</select></div>'; }
      case 'number': return '<div class="ff"><label for="' + id + '">' + esc(f.l) + req + '</label><input class="in" type="number" id="' + id + '" value="' + esc(v) + '"' + (f.min !== undefined ? ' min="' + f.min + '"' : '') + (f.max !== undefined ? ' max="' + f.max + '"' : '') + ' step="any"></div>';
      case 'date': return '<div class="ff"><label for="' + id + '">' + esc(f.l) + '</label><input class="in" type="date" id="' + id + '" value="' + esc(String(v || '').slice(0, 10)) + '"></div>';
      case 'images': case 'image': return '<div class="ff"><span class="lbl">' + esc(f.l) + '</span><div class="imgs" id="' + id + '" data-multi="' + (f.t === 'images' ? 1 : 0) + '"></div><div class="hint">JPG/PNG/WebP · dikompres otomatis · disimpan di Google Drive sekolah' + (f.t === 'images' ? ' · lebih dari satu gambar akan menjadi slideshow otomatis' : '') + '</div></div>';
      case 'icon': return '<div class="ff"><span class="lbl">' + esc(f.l) + '</span><div class="icons-pick" id="' + id + '">' + A.schema.ikon.map((n) => '<button type="button" data-ic="' + n + '" title="' + n + '" class="' + (n === (v || 'star') ? 'on' : '') + '">' + ic(n) + '</button>').join('') + '</div></div>';
      case 'readonly': return '<div class="ff"><label>' + esc(f.l) + '</label><input class="in" value="' + esc(v) + '" disabled style="background:var(--surface)"></div>';
      case 'sosmed': { let o = {}; try { o = JSON.parse(v || '{}'); } catch (e) {} return '<div class="ff"><span class="lbl">' + esc(f.l) + '</span><div class="ff2">' + ['instagram', 'facebook', 'youtube', 'tiktok'].map((k) => '<div style="position:relative"><input class="in" id="' + id + '_' + k + '" placeholder="https://… (' + k + ')" value="' + esc(o[k] || '') + '"></div>').join('') + '</div></div>'; }
      default: return '<div class="ff"><label for="' + id + '">' + esc(f.l) + req + '</label><input class="in" id="' + id + '" value="' + esc(v) + '" maxlength="' + (f.max || 300) + '">' + hint + '</div>';
    }
  }
  /** Hubungkan interaksi form (gambar, ikon, toolbar markdown) dan kembalikan fungsi pembaca nilai */
  function bindForm(root, cfg, row) {
    const imgs = {}, uploading = {};
    cfg.fields.forEach((f) => {
      if (f.t === 'images' || f.t === 'image') {
        imgs[f.k] = imgList(row ? row[f.k] : '').filter((x) => x.indexOf('ph:') !== 0 || true); const box = $('#' + fid(f.k), root), multi = f.t === 'images';
        const draw = () => {
          box.innerHTML = imgs[f.k].map((id, i) => '<div class="im"><img src="' + esc(id.indexOf('ph:') === 0 ? imgUrl(id) : A.pv(id, 200)) + '" alt=""><span class="n">' + (i + 1) + '</span><span class="o">' + (multi && i > 0 ? '<button type="button" data-l="' + i + '" title="Geser ke kiri">' + ic('chevron-left') + '</button>' : '') + '<button type="button" data-d="' + i + '" title="Hapus">' + ic('x') + '</button></span></div>').join('') + (uploading[f.k] ? Array.from({ length: uploading[f.k] }, () => '<div class="im up"><svg class="ic" viewBox="0 0 24 24" style="animation:spin 1s linear infinite;color:#fff">' + ICONS.refresh + '</svg></div>').join('') : '') + (multi || !imgs[f.k].length ? '<label class="add"><span>' + ic('plus') + '<br>Tambah</span><input type="file" accept="image/jpeg,image/png,image/webp"' + (multi ? ' multiple' : '') + '></label>' : '');
        };
        box.onclick = (e) => { const d = e.target.closest('[data-d]'), l = e.target.closest('[data-l]'); if (d) { imgs[f.k].splice(+d.dataset.d, 1); draw(); } else if (l) { const i = +l.dataset.l; [imgs[f.k][i - 1], imgs[f.k][i]] = [imgs[f.k][i], imgs[f.k][i - 1]]; draw(); } };
        box.onchange = async (e) => { const inp = e.target; if (inp.type !== 'file') return; const files = Array.from(inp.files); uploading[f.k] = (uploading[f.k] || 0) + files.length; draw(); for (const file of files) { try { const u = await A.upload(file, f.k === 'logo_id' ? 'branding' : 'konten'); if (!multi) imgs[f.k] = []; if (imgs[f.k].length < 8) imgs[f.k].push(u.id); } catch (er) { toast(er.message, 'err', 'Unggah gagal'); } uploading[f.k]--; draw(); } };
        draw();
      }
      if (f.t === 'icon') { const box = $('#' + fid(f.k), root); box.onclick = (e) => { const b = e.target.closest('[data-ic]'); if (!b) return; $$('button', box).forEach((x) => x.classList.toggle('on', x === b)); }; }
      if (f.t === 'longtext') { const bar = $('[data-md="' + fid(f.k) + '"]', root), ta = $('#' + fid(f.k), root); bar.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; const m = b.dataset.m, s = ta.selectionStart, en = ta.selectionEnd, sel = ta.value.slice(s, en); let ins; if (m === 'link') ins = '[' + (sel || 'teks tautan') + '](https://)'; else if (m === '### ' || m === '- ') ins = m + sel; else ins = m + (sel || 'teks') + m; ta.setRangeText(ins, s, en, 'end'); ta.focus(); }; }
    });
    return () => {
      const o = {};
      cfg.fields.forEach((f) => {
        const id = fid(f.k);
        if (f.t === 'toggle') o[f.k] = $('#' + id, root).checked;
        else if (f.t === 'statusToggle') o[f.k] = $('#' + id, root).checked ? 'tampil' : 'tersembunyi';
        else if (f.t === 'images') o[f.k] = imgs[f.k].join(',');
        else if (f.t === 'image') o[f.k] = imgs[f.k][0] || '';
        else if (f.t === 'icon') { const b = $('#' + id + ' .on', root); o[f.k] = b ? b.dataset.ic : 'star'; }
        else if (f.t === 'sosmed') { const so = {}; ['instagram', 'facebook', 'youtube', 'tiktok'].forEach((k) => { const v = $('#' + id + '_' + k, root).value.trim(); if (v) so[k] = v; }); o[f.k] = so; }
        else if (f.t === 'readonly') return;
        else o[f.k] = $('#' + id, root).value;
      });
      return o;
    };
  }
  async function schema() { if (!A.schema) { const r = await A.call('konten.schema'); if (r.success) A.schema = r.data; } return A.schema; }

  function openKontenForm(kunci, cfg, row, done) {
    const isNew = !row, m = modal('<h3>' + (isNew ? 'Tambah' : 'Ubah') + ' ' + esc(cfg.label) + '</h3><div id="kform">' + cfg.fields.map((f) => fieldHtml(f, row ? row[f.k] : '', isNew)).join('') + '</div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;position:sticky;bottom:-28px;background:var(--card);padding:14px 0 4px"><button class="btn btn-soft" data-c>Batal</button><button class="btn btn-gold" data-s>' + ic('check') + 'Simpan</button></div>');
    $('.box', m.el).classList.add('wide'); const read = bindForm($('#kform', m.el), cfg, row);
    $('[data-c]', m.el).onclick = m.close;
    $('[data-s]', m.el).onclick = async (e) => { const bt = e.currentTarget; const b = bt; b.disabled = true; const vals = read(); if (row) vals.id = row.id; const r = await A.call('konten.save', { kunci, row: vals }, { ok: 'Tersimpan.' }); b.disabled = false; if (r.success) { m.close(); done(r.data.row); } };
  }

  A.page('konten', {
    title: 'Konten',
    async render(el, kunci) {
      await schema(); const cfg = A.schema && A.schema.konten[kunci]; if (!cfg) { el.innerHTML = A.empty('alert', 'Section tidak ditemukan', ''); return; }
      $('#ttl').textContent = cfg.label;
      if (cfg.single) {
        const r = await A.call('konten.list', { kunci }); const row = (r.data.rows || [])[0] || null;
        el.innerHTML = '<div class="ph"><div><h1>' + esc(cfg.label) + '</h1><p>Informasi kontak yang tampil di bagian atas, kontak, dan footer website.</p></div></div><div class="card pad" style="max-width:820px"><div id="kform">' + cfg.fields.map((f) => fieldHtml(f, row ? row[f.k] : '', false)).join('') + '</div><div style="display:flex;justify-content:flex-end"><button class="btn btn-gold" id="ks">' + ic('check') + 'Simpan Perubahan</button></div></div>';
        const read = bindForm($('#kform', el), cfg, row); $('#ks', el).onclick = async (e) => { const bt = e.currentTarget; bt.disabled = true; const v = read(); if (row) v.id = row.id; const rr = await A.call('konten.save', { kunci, row: v }, { ok: 'Kontak tersimpan.' }); bt.disabled = false; if (rr.success) A.schema = A.schema; }; return;
      }
      const st = A.st['k_' + kunci] = A.st['k_' + kunci] || { q: '', f: '', page: 1 }; let rows = []; const per = cfg.urut ? 100 : 10;
      const cell = (c, r) => { const k = c[0], t = c[2], v = r[k]; switch (t) { case 'img': return '<div class="thumb2"><img src="' + esc(A.pv(imgList(v)[0] || '', 160)) + '" alt="" loading="lazy"></div>'; case 'date': return esc(tglID(v)); case 'rupiah': return '<b>' + rupiah(v) + '</b>'; case 'badge': return v ? '<span class="tag">' + esc(v) + '</span>' : '—'; case 'aktif': return A.pill(v ? 'tampil' : 'tersembunyi'); case 'status': return A.pill(v); case 'num': return esc(v); default: return '<span style="display:block;max-width:360px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(v) + '</span>'; } };
      const isOn = (r) => cfg.statusKey ? r.status === 'tampil' : r.aktif !== false;
      const draw = () => {
        const q = st.q.toLowerCase(), f = rows.filter((r) => (!st.f || (st.f === 'on' ? isOn(r) : !isOn(r))) && (!q || JSON.stringify(r).toLowerCase().indexOf(q) > -1)), pageRows = f.slice((st.page - 1) * per, st.page * per);
        $('#kt', el).innerHTML = (pageRows.length ? '<table class="ta2"><thead><tr>' + (cfg.urut ? '<th style="width:34px"></th>' : '') + cfg.tampil.map((c) => '<th>' + c[1] + '</th>').join('') + '<th style="text-align:right">Aksi</th></tr></thead><tbody>' + pageRows.map((r) => '<tr data-id="' + esc(r.id) + '"' + (cfg.urut && !st.q && !st.f ? ' draggable="true"' : '') + (r.is_dummy ? ' class="dummy"' : '') + '>' + (cfg.urut ? '<td class="grip">' + ic('grip') + '</td>' : '') + cfg.tampil.map((c, i) => '<td>' + cell(c, r) + (i === (cfg.tampil[0][2] === 'img' ? 1 : 0) && r.is_dummy ? ' <span class="tag dm">DUMMY</span>' : '') + '</td>').join('') + '<td><div class="acts"><button class="btn btn-soft" data-e title="Ubah">' + ic('edit') + '</button><button class="btn btn-soft" data-t title="' + (isOn(r) ? 'Sembunyikan' : 'Tampilkan') + '">' + ic(isOn(r) ? 'eye' : 'eye-off') + '</button><button class="btn btn-danger" data-x title="Hapus">' + ic('trash') + '</button></div></td></tr>').join('') + '</tbody></table>' : A.empty('file', 'Belum ada data', 'Klik "+ Tambah" untuk membuat yang pertama.')) + A.pager(f.length, st.page, per);
        $('#kc', el).textContent = f.length + ' item';
      };
      const load = async () => { const r = await A.call('konten.list', { kunci }); rows = r.success ? r.data.rows : []; draw(); };
      el.innerHTML = '<div class="ph"><div><h1>' + esc(cfg.label) + ' <span class="pill" id="kc"></span></h1>' + (cfg.urut ? '<p>Seret ikon ⋮⋮ untuk mengubah urutan tampil di website.</p>' : '') + '</div><div class="acts"><button class="btn btn-gold" id="kadd">' + ic('plus') + 'Tambah</button></div></div><div class="card fbar2"><div class="grow">' + ic('search') + '<input class="in" id="kq" placeholder="Cari…" value="' + esc(st.q) + '"></div><select class="sel" id="kf"><option value="">Semua status</option><option value="on"' + (st.f === 'on' ? ' selected' : '') + '>Tampil</option><option value="off"' + (st.f === 'off' ? ' selected' : '') + '>Tersembunyi</option></select></div><div class="card"><div class="tw" id="kt">' + A.loading(4) + '</div></div>';
      $('#kadd', el).onclick = () => openKontenForm(kunci, cfg, null, load);
      $('#kq', el).oninput = debounce((e) => { st.q = e.target.value; st.page = 1; draw(); }, 200); $('#kf', el).onchange = (e) => { st.f = e.target.value; st.page = 1; draw(); };
      const kt = $('#kt', el);
      kt.onclick = async (e) => {
        const pg = e.target.closest('[data-p]'); if (pg) { st.page = +pg.dataset.p; draw(); return; }
        const tr = e.target.closest('tr[data-id]'); if (!tr) return; const row = rows.find((r) => r.id === tr.dataset.id);
        if (e.target.closest('[data-e]')) openKontenForm(kunci, cfg, row, load);
        else if (e.target.closest('[data-t]')) { const r = await A.call('konten.toggle', { kunci, id: row.id, aktif: !isOn(row) }, { ok: true }); if (r.success) load(); }
        else if (e.target.closest('[data-x]')) { if (await A.confirm('Hapus "' + (row.judul || row.nama || row.komponen || 'item ini') + '"? Tindakan ini tidak dapat dibatalkan.', { title: 'Hapus item', danger: true, ok: 'Hapus' })) { const r = await A.call('konten.delete', { kunci, id: row.id }, { ok: 'Terhapus.' }); if (r.success) load(); } }
      };
      if (cfg.urut) { let drag = null; kt.ondragstart = (e) => { drag = e.target.closest('tr[data-id]'); if (drag) { drag.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', drag.dataset.id); } }; kt.ondragover = (e) => { const tr = e.target.closest('tr[data-id]'); if (!tr || !drag) return; e.preventDefault(); $$('tr.drag-over', kt).forEach((x) => x.classList.remove('drag-over')); if (tr !== drag) tr.classList.add('drag-over'); }; kt.ondragend = () => { $$('tr', kt).forEach((x) => x.classList.remove('drag-over', 'dragging')); drag = null; }; kt.ondrop = async (e) => { e.preventDefault(); const tr = e.target.closest('tr[data-id]'); if (!tr || !drag || tr === drag) return; const ids = $$('tr[data-id]', kt).map((x) => x.dataset.id), from = ids.indexOf(drag.dataset.id), to = ids.indexOf(tr.dataset.id); ids.splice(to, 0, ids.splice(from, 1)[0]); rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); draw(); const r = await A.call('konten.reorder', { kunci, ids }, { ok: 'Urutan disimpan.' }); if (!r.success) load(); }; }
      await load();
    }
  });

  // ============ PENGATURAN ============
  const PRESET = [['#14305a', '#f5b301'], ['#0f4c3a', '#f2b632'], ['#7a1f2b', '#f5b301'], ['#1d3f8f', '#ff9f1c'], ['#3b2a7a', '#ffc94d'], ['#0b3b52', '#2dd4bf']];
  A.page('pengaturan', {
    title: 'Pengaturan', role: 'any',
    async render(el) {
      const sa = A.me.role === 'superadmin', r = await A.call('pengaturan.get'); if (!r.success) { el.innerHTML = A.empty('alert', 'Gagal memuat', r.message); return; }
      const s = r.data.setting; let logoId = s.logo_id || '', pri = s.warna_primer || '#14305a', acc = s.warna_aksen || '#f5b301';
      const inp = (k, l, o) => { o = o || {}; return '<div class="ff' + (o.cls ? ' ' + o.cls : '') + '"><label for="s_' + k + '">' + l + '</label>' + (o.ta ? '<textarea class="ta" id="s_' + k + '" rows="' + o.ta + '">' + esc(s[k]) + '</textarea>' : '<input class="in" id="s_' + k + '" value="' + esc(s[k]) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + '>') + (o.h ? '<div class="hint">' + o.h + '</div>' : '') + '</div>'; };
      el.innerHTML = '<div class="ph"><div><h1>Pengaturan Umum</h1><p>Identitas, tampilan, dan informasi yang tampil di website sekolah.</p></div><div class="acts"><button class="btn btn-gold" id="ssave">' + ic('check') + 'Simpan Perubahan</button></div></div><div style="display:grid;gap:18px;max-width:900px">' +
        '<div class="card pad"><div class="ct"><h3>Identitas Sekolah</h3></div><div class="ff2">' + inp('nama_sekolah', 'Nama sekolah') + inp('jenjang_label', 'Label jenjang', { ph: 'SD • SMP • SMA' }) + '</div>' + inp('tagline', 'Tagline') + inp('deskripsi_singkat', 'Deskripsi singkat', { ta: 3 }) + '<div class="ff2">' + inp('akreditasi', 'Akreditasi', { ph: 'A (Unggul)' }) + inp('tahun_berdiri', 'Tahun berdiri') + '</div>' + inp('footer_tagline', 'Teks footer', { ta: 2 }) + '</div>' +
        '<div class="card pad"><div class="ct"><h3>Logo</h3></div><div class="logo-up"><div class="pv" id="lpv">' + (logoId ? '<img src="' + esc(A.pv(logoId, 200)) + '" alt="">' : ic('graduation')) + '</div><div><label class="btn btn-soft btn-xs" style="cursor:pointer">' + ic('upload') + 'Unggah logo<input type="file" id="lfile" accept="image/jpeg,image/png,image/webp" hidden></label> <button class="btn btn-danger btn-xs" id="ldel"' + (logoId ? '' : ' hidden') + '>Hapus</button><div class="hint" style="margin-top:8px;font-size:12.5px;color:var(--muted)">PNG/JPG persegi, maks. 1 MB (dikompres otomatis).</div></div></div></div>' +
        '<div class="card pad"><div class="ct"><h3>Tema & Efek</h3></div><div class="ff"><span class="lbl">Palet warna (utama + aksen)</span><div class="swatches" id="pal">' + PRESET.map((p, i) => '<button type="button" data-i="' + i + '" title="' + p[0] + ' / ' + p[1] + '" style="background:linear-gradient(135deg,' + p[0] + ' 50%,' + p[1] + ' 50%)"></button>').join('') + '<span style="margin-left:8px;font-size:13px">Utama</span><input type="color" id="cpri" value="' + esc(pri) + '"><span style="font-size:13px">Aksen</span><input type="color" id="cacc" value="' + esc(acc) + '"></div></div>' +
        '<div class="ff"><span class="lbl">Mode tampilan bawaan</span><div class="seg2" id="mode">' + [['terang', 'Terang'], ['gelap', 'Gelap'], ['auto', 'Ikuti perangkat']].map((m) => '<button type="button" data-m="' + m[0] + '" class="' + ((s.mode_default || 'auto') === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div></div>' +
        '<div class="ff sw-row"><label for="s_bee">🐝 Lebah interaktif yang mengikuti kursor<div class="hint" style="font-weight:400">Pengunjung tetap dapat mematikannya lewat tombol di pojok kiri bawah.</div></label>' + A.sw('s_bee', s.bee_aktif !== 'TIDAK') + '</div><div class="ff2">' + inp('hero_interval', 'Interval slideshow hero (ms)', { h: '5500 = 5,5 detik. Minimal 3000.' }) + inp('wa_sapaan', 'Pesan awal WhatsApp') + '</div></div>' +
        '<div class="card pad"><div class="ct"><h3>Statistik Sekolah</h3><p>Tiga angka yang tampil di bagian Profil.</p></div>' + [1, 2, 3].map((n) => '<div class="ff2" style="grid-template-columns:140px 1fr">' + inp('stat_' + n + '_angka', 'Angka ' + n, { ph: '98%' }) + inp('stat_' + n + '_label', 'Keterangan ' + n) + '</div>').join('') + '</div>' +
        '<div class="card pad"><div class="ct"><h3>Seksi Pendaftaran & Peta</h3></div>' + inp('ppdb_judul', 'Judul banner PPDB') + inp('ppdb_deskripsi', 'Deskripsi banner PPDB', { ta: 2 }) + inp('maps_embed', 'Embed Google Maps', { ta: 3, h: 'Tempel kode &lt;iframe&gt; dari Google Maps → Bagikan → Sematkan peta (atau URL-nya). Kosongkan untuk memakai koordinat dari menu Kontak.' }) + '</div>' +
        (sa ? '<div class="card pad" id="sec-keamanan"><div class="ct"><h3>Keamanan & Akses</h3></div><div id="kmn">' + A.loading(2) + '</div></div><div class="card pad" id="sec-migrasi"><div class="ct"><div><h3>Migrasi Data dari Aplikasi Lama</h3><p>Impor dari spreadsheet lama (hanya dibaca, aman diulang, ada mode pindai).</p></div></div><div id="mig"></div></div>' : '') +
        '<div class="card pad danger-z"><div class="ct"><div><h3 style="color:var(--err-fg)">Zona Berbahaya</h3><p>Menghapus data contoh (dummy) saja — data asli tidak tersentuh.</p></div></div><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><button class="btn btn-danger" id="ddel"' + (r.data.dummyAda ? '' : ' disabled') + '>' + ic('trash') + 'Hapus Semua Data Dummy</button><span style="font-size:13.5px;color:var(--muted)">' + (r.data.dummyAda ? r.data.dummyAda + ' baris data dummy ditemukan.' : 'Tidak ada data dummy tersisa.') + '</span></div></div></div>';
      // interaksi
      const applyPal = (p, c) => { pri = p; acc = c; $('#cpri', el).value = p; $('#cacc', el).value = c; };
      $('#pal', el).onclick = (e) => { const b = e.target.closest('button'); if (b) applyPal(PRESET[+b.dataset.i][0], PRESET[+b.dataset.i][1]); };
      $('#cpri', el).oninput = (e) => { pri = e.target.value; }; $('#cacc', el).oninput = (e) => { acc = e.target.value; };
      let mode = s.mode_default || 'auto'; $('#mode', el).onclick = (e) => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('#mode button', el).forEach((x) => x.classList.toggle('on', x === b)); };
      $('#lfile', el).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const u = await A.upload(f, 'branding'); logoId = u.id; $('#lpv', el).innerHTML = '<img src="' + u.preview + '" alt="">'; $('#ldel', el).hidden = false; toast('Logo diunggah — klik Simpan Perubahan.', 'ok'); } catch (er) { toast(er.message, 'err'); } };
      $('#ldel', el).onclick = () => { logoId = ''; $('#lpv', el).innerHTML = ic('graduation'); $('#ldel', el).hidden = true; };
      $('#ssave', el).onclick = async (e) => { const bt = e.currentTarget;
        const o = { logo_id: logoId, warna_primer: pri, warna_aksen: acc, mode_default: mode, bee_aktif: $('#s_bee', el).checked ? 'YA' : 'TIDAK' };
        ['nama_sekolah', 'jenjang_label', 'tagline', 'deskripsi_singkat', 'akreditasi', 'tahun_berdiri', 'footer_tagline', 'hero_interval', 'wa_sapaan', 'stat_1_angka', 'stat_1_label', 'stat_2_angka', 'stat_2_label', 'stat_3_angka', 'stat_3_label', 'ppdb_judul', 'ppdb_deskripsi', 'maps_embed'].forEach((k) => { o[k] = $('#s_' + k, el).value; });
        if (+o.hero_interval < 3000) o.hero_interval = '3000'; bt.disabled = true; const rr = await A.call('pengaturan.save', { setting: o }, { ok: 'Pengaturan tersimpan. Website diperbarui.' }); bt.disabled = false; if (rr.success) { lsDel('boot_v2'); A.loadBrand(); }
      };
      $('#ddel', el).onclick = async () => { if (await A.confirm('Semua data contoh (' + r.data.dummyAda + ' baris) akan dihapus permanen, termasuk pendaftar & kontak dummy. Data asli tidak tersentuh.', { title: 'Hapus data dummy?', danger: true, ok: 'Ya, hapus' })) { const rr = await A.call('dummy.hapus', {}, { ok: true }); if (rr.success) { lsDel('boot_v2'); A.cur.render(el); } } };
      if (sa) { renderKeamanan($('#kmn', el)); renderMigrasi($('#mig', el)); }
    }
  });

  async function renderKeamanan(box) {
    const r = await A.call('rahasia.status'); if (!r.success) { box.innerHTML = ''; return; } const d = r.data;
    box.innerHTML = '<div class="ff"><label>Google Client ID (login Google)</label><div style="display:flex;gap:8px;flex-wrap:wrap"><input class="in" id="gcid" style="flex:1;min-width:240px" placeholder="1234-abc.apps.googleusercontent.com"><button class="btn btn-gold" id="gcs">Simpan</button></div><div class="hint">Status: ' + (d.GOOGLE_CLIENT_ID.ada ? '<b style="color:var(--ok-fg)">Terpasang</b> (' + esc(d.GOOGLE_CLIENT_ID.samar) + ')' : '<b style="color:var(--err-fg)">Belum diatur</b> — login Google belum aktif') + '. Disimpan aman di Script Properties, tidak pernah ditampilkan penuh.</div></div>' +
      '<div class="sect-h">Akses darurat Superadmin</div><div class="ff2"><div class="ff"><label>Nama pengguna baru</label><input class="in" id="du" value="' + esc(d.darurat.user || 'darurat') + '"></div><div class="ff"><label>Kata sandi baru (min. 12 karakter, huruf + angka)</label><input class="in" type="password" id="dp" autocomplete="new-password"></div></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-soft" id="drot">' + ic('key') + 'Ganti kredensial darurat</button><button class="btn btn-soft" id="dlo">' + ic('log-out') + 'Keluarkan akun saya dari semua perangkat</button></div>';
    $('#gcs', box).onclick = async () => { const v = $('#gcid', box).value.trim(); if (!v) return toast('Isi Client ID.', 'err'); const rr = await A.call('rahasia.simpan', { kunci: 'GOOGLE_CLIENT_ID', nilai: v }, { ok: 'Client ID tersimpan.' }); if (rr.success) renderKeamanan(box); };
    $('#drot', box).onclick = async () => { if (!(await A.confirm('Kredensial darurat lama tidak berlaku dan sesi darurat dicabut. Catat kata sandi baru di tempat aman.', { title: 'Ganti akses darurat?', ok: 'Ganti' }))) return; const rr = await A.call('darurat.rotasi', { username: $('#du', box).value, password: $('#dp', box).value }, { ok: true }); if (rr.success) { if (A.me.darurat) { toast('Silakan masuk kembali.', 'ok'); setTimeout(() => A.logout(), 1200); } else $('#dp', box).value = ''; } };
    $('#dlo', box).onclick = async () => { const rr = await A.call('auth.logoutSemua', {}, { ok: true }); if (rr.success) setTimeout(() => A.logout(), 900); };
  }
  function renderMigrasi(box) {
    const L = ['Berita', 'Prestasi', 'Fasilitas', 'Kegiatan', 'Testimoni', 'Biaya', 'Pendaftar', 'Pengguna'];
    box.innerHTML = '<div class="ff"><label>URL atau ID spreadsheet aplikasi lama</label><input class="in" id="msrc" placeholder="https://docs.google.com/spreadsheets/d/…"></div><div class="ff"><span class="lbl">Data yang diimpor</span><div style="display:flex;gap:6px 18px;flex-wrap:wrap">' + L.map((x) => '<label style="display:flex;gap:6px;align-items:center;font-size:14px"><input type="checkbox" class="chk2" value="' + x + '" ' + (['Berita', 'Prestasi', 'Fasilitas', 'Kegiatan'].indexOf(x) > -1 ? 'checked' : '') + '>' + x + '</label>').join('') + '</div><div class="hint">Kolom dibaca berdasarkan <b>nama header</b> (bukan urutan). Kunci pencocokan: slug / token / email / judul.</div></div><div class="ff sw-row"><label for="mover">Timpa data yang sudah ada (perbarui bila berbeda)</label>' + A.sw('mover', false) + '</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-soft" id="mscan">' + ic('search') + 'Pindai (tanpa menulis)</button><button class="btn btn-gold" id="mrun">' + ic('download') + 'Jalankan Import</button></div><div id="mres" style="margin-top:16px"></div>';
    const payload = () => ({ sumber: $('#msrc', box).value, sheets: $$('.chk2:checked', box).map((c) => c.value), timpa: $('#mover', box).checked });
    const show = (d) => { $('#mres', box).innerHTML = '<div class="alert ' + (d.dryRun ? 'info' : 'ok') + '">' + ic(d.dryRun ? 'info' : 'check') + '<div><b>' + (d.dryRun ? 'Hasil pindai' : 'Import selesai') + ' — ' + esc(d.sumber.nama) + '</b></div></div><div class="tw"><table class="ta2" style="min-width:0"><thead><tr><th>Data</th><th>Baris sumber</th><th>Ditambah</th><th>Diperbarui</th><th>Dilewati</th></tr></thead><tbody>' + Object.keys(d.laporan).map((k) => '<tr><td><b>' + k + '</b></td><td>' + d.laporan[k].sumber + '</td><td>' + d.laporan[k].ditambah + '</td><td>' + d.laporan[k].diperbarui + '</td><td>' + d.laporan[k].dilewati + '</td></tr>').join('') + '</tbody></table></div>' + d.peringatan.map((p) => '<div class="alert warn" style="margin-top:10px">' + ic('alert') + '<div>' + esc(p) + '</div></div>').join(''); };
    $('#mscan', box).onclick = async () => { const r = await A.call('migrasi.pindai', payload()); if (r.success) show(r.data); };
    $('#mrun', box).onclick = async () => { if (!(await A.confirm('Data dari spreadsheet lama akan ditambahkan ke database ini. Disarankan menjalankan "Pindai" dulu.', { title: 'Jalankan import?', ok: 'Jalankan' }))) return; const r = await A.call('migrasi.jalankan', payload(), { ok: 'Import selesai.' }); if (r.success) { show(r.data); lsDel('boot_v2'); } };
  }

  // ============ ROLE & PENGGUNA ============
  A.page('pengguna', {
    title: 'Role & Akses', role: 'any',
    async render(el) {
      const load = async () => {
        const r = await A.call('pengguna.list'); if (!r.success) return; const rows = r.data.rows, sa = A.me.role === 'superadmin';
        el.innerHTML = '<div class="ph"><div><h1>Role & Akses</h1><p>Kelola siapa yang boleh masuk ke panel. <b>Superadmin</b> mengakses semua fitur; <b>Admin</b> hanya Pengaturan dan Role & Akses.</p></div><div class="acts"><button class="btn btn-gold" id="uadd">' + ic('plus') + 'Tambah Pengguna</button></div></div><div class="card"><div class="tw"><table class="ta2"><thead><tr><th>Pengguna</th><th>Role</th><th>Aktif</th><th>Login terakhir</th><th style="text-align:right">Aksi</th></tr></thead><tbody>' +
          rows.map((u) => '<tr><td><div class="who2">' + A.av(u.nama || u.email) + '<div><b>' + esc(u.nama || '—') + '</b><small>' + esc(u.email) + '</small></div></div></td><td><span class="pill ' + (u.role === 'superadmin' ? 'gold' : 'info') + '">' + (u.role === 'superadmin' ? 'Superadmin' : 'Admin') + '</span></td><td>' + A.sw('ua_' + esc(u.email), u.aktif, ' data-email="' + esc(u.email) + '"' + ((!sa && u.role === 'superadmin') || u.email === A.me.email ? ' disabled' : '')) + '</td><td>' + esc(u.login_terakhir ? tglID(u.login_terakhir, true) : 'Belum pernah') + '</td><td><div class="acts"><button class="btn btn-soft" data-e="' + esc(u.email) + '"' + (!sa && u.role === 'superadmin' ? ' disabled' : '') + '>' + ic('edit') + '</button></div></td></tr>').join('') + '</tbody></table></div></div>';
        const form = (u) => { const m = modal('<h3>' + (u ? 'Ubah' : 'Tambah') + ' Pengguna</h3><div class="ff"><label>Email Google</label><input class="in" id="ue" value="' + esc(u ? u.email : '') + '"' + (u ? ' disabled' : '') + ' placeholder="nama@gmail.com"></div><div class="ff"><label>Nama</label><input class="in" id="un" value="' + esc(u ? u.nama : '') + '"></div><div class="ff2"><div class="ff"><label>Role</label><select class="sel" id="ur"><option value="admin"' + (u && u.role === 'admin' ? ' selected' : '') + '>Admin (terbatas)</option>' + (sa ? '<option value="superadmin"' + (u && u.role === 'superadmin' ? ' selected' : '') + '>Superadmin</option>' : '') + '</select></div><div class="ff sw-row" style="margin-top:22px"><label for="ua">Aktif</label>' + A.sw('ua', u ? u.aktif : true) + '</div></div><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-soft" data-c>Batal</button><button class="btn btn-gold" data-s>Simpan</button></div>'); $('.box', m.el).style.maxWidth = '480px'; $('[data-c]', m.el).onclick = m.close; $('[data-s]', m.el).onclick = async () => { const r2 = await A.call('pengguna.save', { email: $('#ue', m.el).value, nama: $('#un', m.el).value, role: $('#ur', m.el).value, aktif: $('#ua', m.el).checked }, { ok: true }); if (r2.success) { m.close(); load(); } }; };
        $('#uadd', el).onclick = () => form(null);
        el.onclick = (e) => { const b = e.target.closest('[data-e]'); if (b) form(rows.find((x) => x.email === b.dataset.e)); };
        el.onchange = async (e) => { const c = e.target.closest('[data-email]'); if (!c) return; const u = rows.find((x) => x.email === c.dataset.email); const r2 = await A.call('pengguna.save', { email: u.email, nama: u.nama, role: u.role, aktif: c.checked }, { ok: true }); if (!r2.success) { c.checked = !c.checked; } };
      };
      await load();
    }
  });
})();
