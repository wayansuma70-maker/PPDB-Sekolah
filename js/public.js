/* Situs publik: router hash, seluruh section, FAB WhatsApp, tema, render instan dari cache (SWR) */
(function () {
  const App = window.App = { B: null, timers: [], items: {} };
  let B = null, view = null, pendingGo = null, route0 = '';
  const S = () => (B && B.setting) || {};
  const K = () => (B && B.kontak) || {};

  // ---------- util warna dari pengaturan ----------
  function mix(h, t, p) { const a = parseInt(h.slice(1), 16), b = parseInt(t.slice(1), 16), c = (s) => Math.round(((a >> s) & 255) * (1 - p) + ((b >> s) & 255) * p); return '#' + [16, 8, 0].map((s) => c(s).toString(16).padStart(2, '0')).join(''); }
  function terapkanWarna() {
    const s = S(), r = document.documentElement.style, ok = (x) => /^#[0-9a-fA-F]{6}$/.test(x || '');
    if (ok(s.warna_primer)) { r.setProperty('--navy', s.warna_primer); r.setProperty('--navy-deep', mix(s.warna_primer, '#000000', .45)); r.setProperty('--navy-2', mix(s.warna_primer, '#ffffff', .18)); }
    if (ok(s.warna_aksen)) { r.setProperty('--accent', s.warna_aksen); r.setProperty('--accent-dark', mix(s.warna_aksen, '#000000', .12)); r.setProperty('--accent-soft', mix(s.warna_aksen, '#ffffff', .84)); }
  }
  function tema() {
    let t = null; try { t = localStorage.getItem('tema'); } catch (e) {}
    if (!t) { const m = S().mode_default; t = m === 'gelap' ? 'dark' : m === 'terang' ? 'light' : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    document.documentElement.dataset.theme = t;
  }
  function toggleTema() { const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = n; try { localStorage.setItem('tema', n); } catch (e) {} const b = $('#thm'); if (b) b.innerHTML = ic(n === 'dark' ? 'sun' : 'moon'); }

  // ---------- tautan ----------
  function ctaHref(l) { l = String(l || '').trim(); if (!l) return 'href="#/"'; if (l.indexOf('#/') === 0) return 'href="' + esc(l) + '"'; if (l[0] === '#') return 'href="#/" data-go="' + esc(l.slice(1)) + '"'; return 'href="' + esc(safeUrl(l)) + '" target="_blank" rel="noopener"'; }
  function soc(s) { return ['instagram', 'facebook', 'youtube', 'tiktok'].filter((k) => s && s[k]).map((k) => '<a href="' + esc(safeUrl(s[k])) + '" target="_blank" rel="noopener" aria-label="' + k + '">' + ic(k) + '</a>').join(''); }
  const waTo = (t) => waLink(B, t);
  const logo = () => S().logo_id ? '<img src="' + esc(imgUrl(S().logo_id, 200)) + '" alt="Logo ' + esc(S().nama_sekolah) + '">' : ic('graduation');

  // ---------- header, footer, FAB ----------
  function navItems() {
    const has = { profil: B.profil.length, fasilitas: B.fasilitas.length, prestasi: B.prestasi.length, berita: B.berita.length, biaya: B.biaya.length };
    return [['Beranda', 'top'], ['Profil', 'profil'], ['Fasilitas', 'fasilitas'], ['Prestasi', 'prestasi'], ['Berita', 'berita'], ['Biaya', 'biaya'], ['Kontak', 'kontak']].filter((x) => x[1] === 'top' || x[1] === 'kontak' || has[x[1]]);
  }
  function shell() {
    const s = S(), k = K(), nav = navItems(), dark = document.documentElement.dataset.theme === 'dark';
    $('#hdr').innerHTML = '<div class="topbar"><div class="wrap"><div class="info"><span>' + ic('pin') + esc(k.alamat || '') + '</span>' + (k.telepon ? '<span>' + ic('phone') + esc(k.telepon) + '</span>' : '') + (k.email ? '<span class="hide-sm">' + ic('mail') + esc(k.email) + '</span>' : '') + '</div><div class="soc">' + soc(k.sosmed) + '</div></div></div>' +
      '<nav class="nav" aria-label="Navigasi utama"><div class="wrap"><a class="brand" href="#/" data-go="top"><span class="logo">' + logo() + '</span><span><b>' + esc(s.nama_sekolah) + '</b><small>' + esc(s.jenjang_label) + '</small></span></a>' +
      '<div class="menu">' + nav.map((n) => '<a href="#/" data-go="' + n[1] + '" data-nav="' + n[1] + '">' + n[0] + '</a>').join('') + '</div>' +
      '<div class="nav-act"><a class="btn btn-wa btn-sm btn-mag" target="_blank" rel="noopener" href="' + waTo(s.wa_sapaan || 'Halo, saya ingin bertanya.') + '">' + icWA() + '<span>WhatsApp</span></a><button class="icon-btn" id="bee-toggle" type="button" aria-label="Aktif/nonaktifkan lebah" aria-pressed="false">' + Bee.icon + '</button><button class="icon-btn" id="thm" aria-label="Ganti tema terang/gelap">' + ic(dark ? 'sun' : 'moon') + '</button><a class="btn btn-cta btn-sm" href="#/daftar">' + ic('rocket') + 'Daftar PPDB</a><button class="icon-btn burger" id="burger" aria-label="Buka menu">' + ic('menu') + '</button></div></div></nav>' +
      '<div class="drawer" id="drawer"><div class="scrim"></div><div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><b style="font-size:18px">' + esc(s.nama_sekolah) + '</b><button class="icon-btn" id="dx" style="color:#fff;border-color:rgba(255,255,255,.3)" aria-label="Tutup menu">' + ic('x') + '</button></div>' +
      nav.map((n) => '<a class="mi" href="#/" data-go="' + n[1] + '">' + n[0] + '</a>').join('') + '<a class="mi" href="#/status">Cek Status Pendaftaran</a><a class="btn btn-cta" href="#/daftar">' + ic('rocket') + 'Daftar PPDB Sekarang</a></div></div>';
    $('#ftr').className = 'ftr';
    $('#ftr').innerHTML = '<div class="wrap"><div class="grid"><div><a class="brand" href="#/"><span class="logo">' + logo() + '</span><span><b>' + esc(s.nama_sekolah) + '</b><small>' + esc(s.jenjang_label) + '</small></span></a><p>' + esc(s.footer_tagline || s.deskripsi_singkat) + '</p>' + (s.akreditasi ? '<span class="pill gold">' + ic('medal') + 'Akreditasi ' + esc(s.akreditasi) + '</span>' : '') + '<div class="soc">' + soc(k.sosmed) + '</div></div>' +
      '<div><h4>Tautan Cepat</h4>' + nav.map((n) => '<a href="#/" data-go="' + n[1] + '">' + n[0] + '</a>').join('') + '</div>' +
      '<div><h4>Kontak & Layanan</h4><div class="ct">' + ic('pin') + '<span>' + esc(k.alamat) + '</span></div>' + (k.telepon ? '<div class="ct">' + ic('phone') + '<span>' + esc(k.telepon) + '</span></div>' : '') + (k.email ? '<div class="ct">' + ic('mail') + '<span>' + esc(k.email) + '</span></div>' : '') + (k.jam_layanan ? '<div class="ct">' + ic('clock') + '<span>' + esc(k.jam_layanan) + '</span></div>' : '') + '</div>' +
      '<div><h4>Portal PPDB & Akses</h4><p>' + esc(s.ppdb_deskripsi) + '</p><a class="btn btn-cta btn-sm" href="#/daftar" style="display:inline-flex">' + ic('rocket') + 'Daftar Siswa Baru</a><a class="btn btn-light btn-sm" href="#/status" style="display:inline-flex;margin-top:8px">' + ic('search') + 'Cek Status</a><a href="admin.html" style="margin-top:12px;font-size:13px;opacity:.75">' + ic('lock') + ' Masuk Panel Admin</a></div></div>' +
      '<div class="bot"><span>© ' + new Date().getFullYear() + ' ' + esc(s.nama_sekolah) + '. Hak cipta dilindungi undang-undang.</span><span>' + (B.periode && B.periode.ada ? 'PPDB ' + esc(B.periode.nama) + ' · ' + esc(B.periode.state) : '') + '</span></div></div>';
    fab(); Bee.sync();
  }
  function fab() {
    const k = K(), s = S(), host = $('#fab'); if (!k.whatsapp) { host.innerHTML = ''; return; }
    host.innerHTML = '<button class="wa-fab" id="wafab" aria-label="Chat WhatsApp" aria-expanded="false"><span class="dot">1</span>' + icWA() + '</button>';
    let tip = null, pop = null;
    const closeTip = () => { if (tip) { tip.remove(); tip = null; } };
    const openPop = () => {
      closeTip(); if (pop) { pop.remove(); pop = null; $('#wafab').setAttribute('aria-expanded', 'false'); return; }
      $('#wafab .dot') && $('#wafab .dot').remove(); $('#wafab').setAttribute('aria-expanded', 'true');
      pop = document.createElement('div'); pop.className = 'wa-pop'; pop.setAttribute('role', 'dialog');
      pop.innerHTML = '<div class="hd"><div class="av">' + icWA() + '</div><div><b>' + esc(s.nama_sekolah) + '</b><small><i></i>Biasanya membalas dalam hitungan menit</small></div><button class="x" aria-label="Tutup">' + ic('x') + '</button></div><div class="bd"><div class="bubble">Halo! 👋 Selamat datang di <b>' + esc(s.nama_sekolah) + '</b>. Ada yang bisa kami bantu?</div><div class="qr">' +
        ['Informasi pendaftaran PPDB', 'Biaya pendidikan', 'Jadwal kunjungan sekolah', 'Lainnya'].map((t) => '<button data-q="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div></div><div class="ft"><a class="btn btn-wa btn-block btn-sm" target="_blank" rel="noopener" href="' + waTo(s.wa_sapaan || 'Halo, saya ingin bertanya.') + '">' + icWA() + 'Mulai chat di WhatsApp</a></div>';
      host.insertBefore(pop, host.firstChild);
      pop.onclick = (e) => { const q = e.target.closest('[data-q]'); if (q) window.open(waTo((s.wa_sapaan || 'Halo, saya ingin bertanya tentang ') + q.dataset.q.toLowerCase()), '_blank', 'noopener'); if (e.target.closest('.x')) { pop.remove(); pop = null; } };
    };
    $('#wafab').onclick = openPop;
    let shown = false; try { shown = sessionStorage.getItem('watip'); } catch (e) {}
    if (!shown) setTimeout(() => { if (pop || tip || !$('#wafab')) return; tip = document.createElement('div'); tip.className = 'wa-tip'; tip.innerHTML = '<button class="x" aria-label="Tutup">×</button>Halo! 👋 Ada pertanyaan seputar PPDB? Chat kami di sini.'; host.insertBefore(tip, host.firstChild); tip.onclick = (e) => { if (e.target.closest('.x')) closeTip(); else { closeTip(); openPop(); } }; try { sessionStorage.setItem('watip', '1'); } catch (e) {} setTimeout(closeTip, 9000); }, 4500);
  }

  // ---------- komponen kartu ----------
  const stars = (n) => '<span class="stars" aria-label="' + n + ' dari 5">' + [1, 2, 3, 4, 5].map((i) => ic('star', i > n ? 'off' : '')).join('') + '</span>';
  const SL = (ids, extra) => '<div data-sl="' + esc(ids) + '"' + (extra || '') + '></div>';
  function head(eyebrow, h, p) { return '<div class="sec-head reveal"><span class="eyebrow">' + esc(eyebrow) + '</span><h2>' + esc(h) + '</h2>' + (p ? '<p>' + esc(p) + '</p>' : '') + '</div>'; }
  function reg(kind, arr) { arr.forEach((x) => { App.items[kind + ':' + x.id] = x; }); }

  // ---------- section ----------
  function secHero() {
    return '<section class="hero" id="top"><div class="orb a"></div><div class="orb b"></div><div class="wrap"><div><div class="hero-txt" id="hero-txt"></div><div class="hero-ctrl" id="hero-ctrl"></div></div><div class="hero-vis"><div class="hero-frame"><div id="hero-sl"></div></div>' + (S().akreditasi ? '<div class="hero-chip">' + ic('medal') + '<div><b>Akreditasi ' + esc(S().akreditasi) + '</b><small>' + esc(S().jenjang_label) + '</small></div></div>' : '') + '</div></div><div class="hero-wave"><svg viewBox="0 0 1440 70" preserveAspectRatio="none"><path d="M0 40C240 90 480 0 720 30s480 50 720-10V70H0z"/></svg></div></section>';
  }
  function initHero() {
    const s = S(), slides = B.hero.length ? B.hero : [{ judul: s.nama_sekolah, subjudul: s.deskripsi_singkat || s.tagline, cta_label: 'Daftar PPDB', cta_link: '#/daftar', cta2_label: 'Hubungi Kami', cta2_link: '#kontak', gambar_id: 'ph:building:1,ph:graduation:2' }];
    const txt = $('#hero-txt'), ctrl = $('#hero-ctrl'), frame = $('#hero-sl'), interval = Math.max(3000, +s.hero_interval || 5500); let i = 0, tm = null, sl = null;
    function show(n) {
      clearTimeout(tm); i = (n + slides.length) % slides.length; const h = slides[i];
      txt.innerHTML = '<span class="hero-badge">' + ic('sparkles') + esc(s.tagline || 'Sekolah Unggulan') + '</span><h1>' + esc(h.judul) + '</h1><p class="sub">' + esc(h.subjudul) + '</p><div class="cta">' +
        (h.cta_label ? '<a class="btn btn-cta" ' + ctaHref(h.cta_link) + '>' + esc(h.cta_label) + ic('arrow-right') + '</a>' : '') + (h.cta2_label ? '<a class="btn btn-light" ' + ctaHref(h.cta2_link) + '>' + esc(h.cta2_label) + '</a>' : '') + '</div>';
      if (sl) sl.destroy(); frame.innerHTML = ''; frame.className = ''; sl = FX.slider(frame, imgList(h.gambar_id), { interval: 2600, dots: false, w: 1200, alt: h.judul });
      if (slides.length > 1) { ctrl.innerHTML = '<button class="arrow" data-hp aria-label="Slide sebelumnya">' + ic('chevron-left') + '</button><div class="dots" style="--hi:' + interval + 'ms">' + slides.map((_, k) => '<button data-hg="' + k + '" class="' + (k === i ? 'on' : k < i ? 'done' : '') + '" aria-label="Slide ' + (k + 1) + '"><i></i></button>').join('') + '</div><button class="arrow" data-hn aria-label="Slide berikutnya">' + ic('chevron-right') + '</button>'; tm = setTimeout(() => { if (!document.hidden) show(i + 1); else show(i); }, interval); }
    }
    ctrl.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-hn')) show(i + 1); else if (b.hasAttribute('data-hp')) show(i - 1); else if (b.dataset.hg !== undefined) show(+b.dataset.hg); };
    show(0); App.timers.push({ stop: () => { clearTimeout(tm); if (sl) sl.destroy(); } }); FX.sparks($('.hero'), 12);
    const hero = $('.hero'), vis = $('.hero-vis'); hero.addEventListener('pointermove', (e) => { if (FX.reduce || !FX.fine) return; const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; $('.orb.a', hero).style.transform = 'translate(' + (-x * 60) + 'px,' + (-y * 40) + 'px)'; $('.orb.b', hero).style.transform = 'translate(' + (x * 50) + 'px,' + (y * 30) + 'px)'; });
  }
  function secKeunggulan() {
    if (!B.keunggulan.length) return '';
    return '<div class="strip"><div class="wrap"><div class="grid gx">' + B.keunggulan.map((k, i) => '<div class="card glow tilt kx reveal" style="--d:' + i * 80 + 'ms"><div class="ib">' + ic(k.ikon) + '</div><b>' + esc(k.judul) + '</b><small>' + esc(k.deskripsi) + '</small></div>').join('') + '</div></div></div>';
  }
  function secProfil() {
    const p = B.profil[0], s = S(); if (!p) return ''; const misi = String(p.misi || '').split('\n').filter(Boolean);
    const stats = [1, 2, 3].filter((n) => s['stat_' + n + '_angka']).map((n) => '<div class="stat"><b data-count="' + esc(s['stat_' + n + '_angka']) + '">' + esc(s['stat_' + n + '_angka']) + '</b><small>' + esc(s['stat_' + n + '_label']) + '</small></div>').join('');
    return '<section class="sec" id="profil"><div class="wrap"><div class="profil"><div class="pic reveal">' + SL(p.gambar_id) + (s.tahun_berdiri ? '<div class="badge-float"><small>Berdiri sejak</small>' + esc(s.tahun_berdiri) + '</div>' : '') + '</div><div class="reveal"><span class="eyebrow">Profil Sekolah</span><h2>' + esc(p.judul) + '</h2>' + md(p.isi) + (stats ? '<div class="stats">' + stats + '</div>' : '') +
      '<div class="vm">' + (p.visi ? '<div class="glow"><h4>' + ic('target') + 'Visi</h4><p>' + esc(p.visi) + '</p></div>' : '') + (misi.length ? '<div class="glow"><h4>' + ic('rocket') + 'Misi</h4><ul>' + misi.map((m) => '<li>' + esc(m) + '</li>').join('') + '</ul></div>' : '') + '</div><a class="btn btn-cta" href="#/daftar">' + ic('rocket') + 'Bergabung Bersama Kami</a></div></div></div></section>';
  }
  function secFasilitas() {
    if (!B.fasilitas.length) return ''; reg('fas', B.fasilitas);
    return '<section class="sec alt" id="fasilitas"><div class="wrap">' + head('Fasilitas', 'Lingkungan Belajar Representatif & Terkini', 'Ruang belajar yang mendukung rasa ingin tahu, kreativitas, dan kesehatan siswa.') + '<div class="grid g3">' +
      B.fasilitas.map((f, i) => '<article class="card cx glow tilt reveal" style="--d:' + (i % 3) * 90 + 'ms" data-open="fas:' + esc(f.id) + '" tabindex="0" role="button" aria-label="Lihat foto ' + esc(f.nama) + '"><div class="media">' + SL(f.gambar_id, ' data-cnt="1"') + '</div><div class="bd"><span class="ibadge">' + ic(f.ikon) + '</span><h3>' + esc(f.nama) + '</h3><p>' + esc(f.deskripsi) + '</p><span class="more">Lihat foto' + ic('arrow-right') + '</span></div></article>').join('') + '</div></div></section>';
  }
  function secPrestasi() {
    if (!B.prestasi.length) return ''; reg('prs', B.prestasi);
    return '<section class="sec" id="prestasi"><div class="wrap">' + head('Prestasi', 'Mencetak Prestasi di Tingkat Nasional & Dunia', 'Hasil kerja keras siswa, guru pembimbing, dan dukungan orang tua.') + '<div class="grid g4">' +
      B.prestasi.map((p, i) => '<article class="card cx glow tilt reveal" style="--d:' + (i % 4) * 80 + 'ms" data-open="prs:' + esc(p.id) + '" tabindex="0" role="button"><div class="media">' + SL(p.gambar_id) + (p.tahun ? '<span class="pill gold tagc">' + ic('trophy') + esc(p.tahun) + '</span>' : '') + '</div><div class="bd"><h3 style="font-size:16.5px">' + esc(p.judul) + '</h3>' + (p.tingkat ? '<span class="meta">' + ic('medal') + esc(p.tingkat) + '</span>' : '') + '</div></article>').join('') + '</div></div></section>';
  }
  function secKegiatan() {
    if (!B.kegiatan.length) return ''; reg('kgt', B.kegiatan);
    return '<section class="sec alt" id="kegiatan"><div class="wrap">' + head('Kegiatan', 'Dinamika Kehidupan & Karakter Siswa', 'Potret kegiatan yang menumbuhkan kepemimpinan, kolaborasi, dan kepedulian.') + '<div class="gal">' +
      B.kegiatan.map((k, i) => '<article class="card cx glow tilt reveal' + (i === 0 ? ' big' : '') + '" style="--d:' + (i % 3) * 80 + 'ms" data-open="kgt:' + esc(k.id) + '" tabindex="0" role="button"><div class="media">' + SL(k.gambar_id) + '</div><div class="bd"><span class="meta">' + ic('calendar') + esc(tglPanjang(k.tanggal)) + '</span><h3>' + esc(k.nama) + '</h3>' + (i === 0 ? '<p>' + esc(k.deskripsi) + '</p>' : '') + '</div></article>').join('') + '</div></div></section>';
  }
  function secTestimoni() {
    if (!B.testimoni.length) return ''; reg('tst', B.testimoni);
    return '<section class="sec" id="testimoni"><div class="wrap">' + head('Testimoni', 'Cerita dari Orang Tua, Siswa & Alumni', 'Kartu berputar otomatis. Arahkan kursor untuk menyorot, klik untuk membaca lengkap.') + '<div class="tg" id="tg">' +
      B.testimoni.map((t, i) => '<div class="flip reveal" style="--d:' + (i % 3) * 90 + 'ms" data-tst="' + esc(t.id) + '" tabindex="0" role="button" aria-label="Baca testimoni ' + esc(t.nama) + '"><div class="flip-in"><div class="face front"><span class="hint">' + ic('eye') + 'Klik: lengkap</span><div class="q">“</div><p class="quote">' + esc(t.kutipan) + '</p><div class="who"><span class="av">' + (t.foto_id ? '<img src="' + esc(imgUrl(t.foto_id, 120)) + '" alt="">' : esc(inisial(t.nama))) + '</span><div><b>' + esc(t.nama) + '</b><small>' + esc(t.peran) + '</small></div>' + stars(+t.rating || 5) + '</div></div>' +
        '<div class="face back"><div class="q">”</div><p class="quote">' + esc(t.isi_lengkap || t.kutipan) + '</p><button class="readmore" type="button">' + ic('eye') + 'Baca lengkap</button><div class="who"><span class="av">' + esc(inisial(t.nama)) + '</span><div><b>' + esc(t.nama) + '</b><small>' + esc(t.peran) + '</small></div></div></div></div></div>').join('') + '</div></div></section>';
  }
  function newsCard(b, i) {
    return '<a class="card cx glow tilt reveal" style="--d:' + (i % 3) * 90 + 'ms" href="#/berita/' + esc(b.slug) + '"><div class="media">' + SL(b.gambar_id) + (b.kategori ? '<span class="pill gold tagc">' + esc(b.kategori) + '</span>' : '') + '</div><div class="bd"><span class="meta">' + ic('calendar') + esc(tglPanjang(b.tanggal)) + '</span><h3>' + esc(b.judul) + '</h3><p>' + esc(b.ringkasan) + '</p><span class="more">Baca selengkapnya' + ic('arrow-right') + '</span></div></a>';
  }
  function secBerita() {
    if (!B.berita.length) return '';
    return '<section class="sec alt" id="berita"><div class="wrap">' + head('Berita & Agenda', 'Informasi & Agenda Terbaru', 'Kabar terkini dari lingkungan sekolah.') + '<div class="grid g3">' + B.berita.slice(0, 3).map(newsCard).join('') + '</div><div style="text-align:center;margin-top:36px"><a class="btn btn-ghost btn-shine" href="#/berita">Lihat semua berita' + ic('arrow-right') + '</a></div></div></section>';
  }
  function secBiaya() {
    if (!B.biaya.length) return '';
    const js = []; B.biaya.forEach((b) => { if (js.indexOf(b.jenjang) === -1) js.push(b.jenjang); });
    return '<section class="sec" id="biaya"><div class="wrap">' + head('Biaya Pendidikan', 'Informasi Biaya Pendidikan' + (B.periode && B.periode.tahun_ajaran ? ' T.A ' + B.periode.tahun_ajaran : ''), 'Transparan sejak awal, tanpa biaya tersembunyi.') + '<div style="text-align:center;margin-bottom:24px" class="reveal"><div class="tabs" id="btabs">' + js.map((j, i) => '<button data-j="' + esc(j) + '" class="' + (i ? '' : 'on') + '">' + esc(j) + '</button>').join('') + '</div></div><div id="bbody" class="reveal"></div></div></section>';
  }
  function biayaBody(j) {
    const rows = B.biaya.filter((b) => b.jenjang === j);
    $('#bbody').innerHTML = '<div class="tbl-wrap tbl-cards"><table class="tbl"><thead><tr><th>Komponen</th><th>Keterangan</th><th class="num">Nominal</th></tr></thead><tbody>' + rows.map((r) => '<tr><td><b>' + esc(r.komponen) + '</b></td><td style="color:var(--muted)">' + esc(r.keterangan) + '</td><td class="num">' + rupiah(r.nominal) + '</td></tr>').join('') + '</tbody></table></div>' +
      '<div class="mcards">' + rows.map((r) => '<div class="card"><b style="color:var(--heading)">' + esc(r.komponen) + '</b><div style="font-size:22px;font-weight:800;color:var(--heading);margin:4px 0">' + rupiah(r.nominal) + '</div><small style="color:var(--muted)">' + esc(r.keterangan) + '</small></div>').join('') + '</div>';
  }
  function secPPDB() {
    const p = B.periode || {}, st = p.state, buka = !!p.buka, s = S();
    const pill = buka ? '<span class="pill ok"><i class="dot"></i>Pendaftaran Dibuka</span>' : st === 'penuh' ? '<span class="pill err">Kuota Penuh</span>' : st === 'belum' ? '<span class="pill warn">Segera Dibuka</span>' : '<span class="pill">Pendaftaran Ditutup</span>';
    const rng = p.tanggal_buka || p.tanggal_tutup ? '<div class="per">' + esc(p.nama || '') + (p.tanggal_tutup ? ' · batas akhir ' + tglPanjang(p.tanggal_tutup) : '') + '</div>' : '';
    const pct = p.kuota ? Math.min(100, Math.round(p.terisi / p.kuota * 100)) : 0;
    return '<section class="sec alt tight" id="ppdb"><div class="wrap"><div class="ppdb reveal"><div>' + pill + '<h2>' + (buka ? 'Penerimaan Peserta Didik Baru ' + esc(p.tahun_ajaran || '') + ' Telah Dibuka!' : esc(s.ppdb_judul || 'Penerimaan Peserta Didik Baru')) + '</h2>' + rng + '<p>' + esc(buka ? s.ppdb_deskripsi : st === 'belum' ? 'Pendaftaran akan dibuka pada ' + tglPanjang(p.tanggal_buka) + '. Pantau terus informasi dari kami.' : st === 'penuh' ? 'Kuota pendaftaran telah terpenuhi. Silakan cek status pendaftaran Anda.' : 'Terima kasih atas minat Anda. Anda tetap dapat memeriksa status pendaftaran yang sudah masuk.') + '</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px">' + (buka ? '<a class="btn btn-cta" href="#/daftar">' + ic('rocket') + 'Daftar Sekarang</a>' : '<span class="btn btn-cta disabled">' + ic('lock') + 'Pendaftaran Ditutup</span>') + '<a class="btn btn-light" href="#/status">' + ic('search') + 'Cek Status Pendaftaran</a></div></div>' +
      (p.kuota ? '<div class="kuota"><div class="row"><span>Kuota terisi</span><b>' + p.terisi + ' / ' + p.kuota + '</b></div><div class="bar"><i data-w="' + pct + '"></i></div><small>' + (p.sisa === 0 ? 'Kuota telah penuh' : 'Sisa ' + p.sisa + ' kursi tersedia') + '</small></div>' : '') + '</div></div></section>';
  }
  function mapHTML() {
    const s = S(), k = K(); let src = s.maps_embed;
    if (!src && k.lat !== '' && k.lat != null && k.lng !== '' && k.lng != null) src = 'https://maps.google.com/maps?q=' + encodeURIComponent(k.lat + ',' + k.lng) + '&z=15&output=embed';
    return src ? '<iframe src="' + esc(src) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Peta lokasi sekolah" allowfullscreen></iframe>' : '<div class="empty">' + ic('pin') + '<p>Peta belum diatur oleh admin.</p></div>';
  }
  function secKontak() {
    const k = K(), s = S();
    return '<section class="sec" id="kontak"><div class="wrap">' + head('Kontak', 'Kunjungi Kampus Kami', 'Kami senang menyambut Anda. Hubungi kami atau datang langsung untuk tur sekolah.') + '<div class="kontak"><div class="card reveal" style="padding:28px">' +
      [['pin', 'Alamat', k.alamat], ['phone', 'Telepon', k.telepon, k.telepon ? 'tel:' + k.telepon.replace(/[^\d+]/g, '') : ''], ['mail', 'Email', k.email, k.email ? 'mailto:' + k.email : ''], ['clock', 'Jam Layanan', k.jam_layanan]].filter((x) => x[2]).map((x) => '<div class="ci"><span class="ib">' + ic(x[0]) + '</span><div><b>' + x[1] + '</b>' + (x[3] ? '<a href="' + esc(x[3]) + '">' + esc(x[2]) + '</a>' : '<span>' + esc(x[2]) + '</span>') + '</div></div>').join('') +
      (k.whatsapp ? '<a class="btn btn-wa btn-block" style="margin-top:18px" target="_blank" rel="noopener" href="' + waTo(s.wa_sapaan || 'Halo, saya ingin bertanya.') + '">' + icWA() + 'Chat WhatsApp</a>' : '') +
      '<form class="frm" id="pf"><h4>Kirim pesan kepada kami</h4><input class="in" name="nama" placeholder="Nama Anda" required maxlength="80"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><input class="in" name="email" type="email" placeholder="Email" maxlength="120"><input class="in" name="wa" type="tel" placeholder="WhatsApp (08…)" maxlength="20"></div><textarea class="ta" name="pesan" placeholder="Tulis pertanyaan Anda…" required maxlength="600" rows="3"></textarea><input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;height:0"><button class="btn btn-cta btn-block" type="submit">' + ic('send') + 'Kirim Pesan</button></form></div>' +
      '<div class="map reveal">' + mapHTML() + '</div></div></div></section>';
  }

  // ---------- Pasca-render: slider, flip, tab, form ----------
  function mount(root) {
    $$('[data-sl]', root).forEach((el) => { if (el.dataset.mounted) return; el.dataset.mounted = 1; FX.slider(el, imgList(el.dataset.sl), { interval: 3000, w: 700, count: !!el.dataset.cnt }); });
    $$('.kuota .bar i[data-w]', root).forEach((b) => { const w = b.dataset.w; const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { b.style.width = w + '%'; io.disconnect(); } }); io.observe(b); });
    FX.scan(root);
  }
  function initFlip() {
    const g = $('#tg'); if (!g) return; const cards = $$('.flip', g); let n = 0, visible = false, hov = false;
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(g);
    g.addEventListener('pointerenter', () => { hov = true; }); g.addEventListener('pointerleave', () => { hov = false; });
    if (!FX.reduce) { const t = setInterval(() => { if (!visible || hov || document.hidden) return; const c = cards[n++ % cards.length]; c.classList.add('on'); setTimeout(() => c.classList.remove('on'), 3300); }, 2500); App.timers.push({ stop: () => clearInterval(t) }); }
    const open = (c) => { const t = App.items['tst:' + c.dataset.tst]; if (!t) return; modal('<div class="stars" style="margin:0 0 14px;font-size:18px">' + stars(+t.rating || 5) + '</div><div style="font-size:56px;line-height:.6;color:var(--accent);font-family:Georgia,serif;height:30px">“</div><p class="quote" style="margin-top:12px">' + esc(t.isi_lengkap || t.kutipan) + '</p><div class="who" style="border-color:rgba(255,255,255,.25)"><span class="av" style="width:54px;height:54px">' + (t.foto_id ? '<img src="' + esc(imgUrl(t.foto_id, 160)) + '" alt="">' : esc(inisial(t.nama))) + '</span><div><b style="font-size:17px">' + esc(t.nama) + '</b><small>' + esc(t.peran) + '</small></div></div>', { cls: 'tmodal' }); };
    g.addEventListener('click', (e) => { const c = e.target.closest('.flip'); if (c) open(c); });
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const c = e.target.closest('.flip'); if (c) { e.preventDefault(); open(c); } } });
  }
  function openGal(key) {
    const it = App.items[key]; if (!it) return; const ttl = it.nama || it.judul, ids = it.gambar_id;
    const m = modal('<div style="position:relative;aspect-ratio:16/10;border-radius:16px;overflow:hidden;margin:-6px -6px 18px;background:var(--navy)"><div id="gl"></div></div><span class="meta">' + (it.tahun ? ic('trophy') + esc(it.tahun) + ' · ' + esc(it.tingkat || '') : it.tanggal ? ic('calendar') + esc(tglPanjang(it.tanggal)) : '') + '</span><h3 style="margin:6px 0 8px;font-size:22px">' + esc(ttl) + '</h3><p style="color:var(--muted);margin:0">' + esc(it.deskripsi || '') + '</p>', { cls: '' });
    $('.box', m.el).style.maxWidth = '720px'; FX.slider($('#gl', m.el), imgList(ids), { interval: 2800, w: 1100 });
  }
  function initContact() {
    const f = $('#pf'); if (!f) return;
    f.onsubmit = async (e) => { e.preventDefault(); const fd = new FormData(f), b = $('button', f); b.disabled = true; const r = await Api.post('public.pesan', { nama: fd.get('nama'), email: fd.get('email'), wa: fd.get('wa'), pesan: fd.get('pesan'), hp_extra: fd.get('website'), cid: cid() }, { token: '' }); b.disabled = false; if (r.success) { toast(r.message, 'ok'); f.reset(); } else toast(r.message, 'err'); };
  }
  function spy() {
    if (!('IntersectionObserver' in window)) return; const links = {}; $$('[data-nav]').forEach((a) => { links[a.dataset.nav] = a; });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && links[e.target.id]) { Object.values(links).forEach((a) => a.classList.remove('on')); links[e.target.id].classList.add('on'); } }), { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'profil', 'fasilitas', 'prestasi', 'berita', 'biaya', 'kontak'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  // ---------- Halaman ----------
  function renderHome() {
    view.innerHTML = secHero() + secKeunggulan() + secProfil() + secFasilitas() + secPrestasi() + secKegiatan() + secTestimoni() + secBerita() + secBiaya() + secPPDB() + secKontak();
    initHero(); mount(view); initFlip(); initContact(); spy();
    const tabs = $('#btabs'); if (tabs) { biayaBody(B.biaya[0].jenjang); tabs.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('button', tabs).forEach((x) => x.classList.toggle('on', x === b)); biayaBody(b.dataset.j); }; }
  }
  function renderNews(page, q, kat) {
    page = page || 1; q = (q || '').toLowerCase(); const per = 9;
    const kats = []; B.berita.forEach((b) => { if (b.kategori && kats.indexOf(b.kategori) === -1) kats.push(b.kategori); });
    const list = B.berita.filter((b) => (!kat || b.kategori === kat) && (!q || (b.judul + ' ' + b.ringkasan).toLowerCase().indexOf(q) > -1)), pages = Math.max(1, Math.ceil(list.length / per)); page = Math.min(page, pages);
    view.innerHTML = '<div class="phead"><div class="wrap"><div class="crumb"><a href="#/">Beranda</a>' + ic('chevron-right') + '<span>Berita</span></div><h1>Berita & Informasi</h1><p>Kabar, agenda, dan pengumuman terbaru dari ' + esc(S().nama_sekolah) + '.</p></div></div><div class="wrap" style="padding-bottom:70px"><div class="card float-bar"><div style="flex:1;min-width:200px;position:relative"><input class="in" id="nq" placeholder="Cari berita…" value="' + esc(q) + '" style="padding-left:42px"><span style="position:absolute;left:14px;top:14px;color:var(--muted)">' + ic('search') + '</span></div><select class="sel" id="nk" style="max-width:240px"><option value="">Semua kategori</option>' + kats.map((k) => '<option' + (k === kat ? ' selected' : '') + '>' + esc(k) + '</option>').join('') + '</select></div>' +
      (list.length ? '<div class="grid g3" id="ng">' + list.slice((page - 1) * per, page * per).map(newsCard).join('') + '</div>' : '<div class="empty">' + ic('file') + '<p>Tidak ada berita yang cocok.</p></div>') +
      (pages > 1 ? '<div class="pager">' + Array.from({ length: pages }, (_, i) => '<button data-p="' + (i + 1) + '" class="' + (i + 1 === page ? 'on' : '') + '">' + (i + 1) + '</button>').join('') + '</div>' : '') + '</div>';
    mount(view);
    const re = (p) => renderNews(p, $('#nq').value, $('#nk').value);
    $('#nq').oninput = debounce(() => { const v = $('#nq').value; renderNews(1, v, $('#nk').value); const i = $('#nq'); i.focus(); i.setSelectionRange(v.length, v.length); }, 300);
    $('#nk').onchange = () => re(1); const pg = $('.pager'); if (pg) pg.onclick = (e) => { const b = e.target.closest('button'); if (b) { re(+b.dataset.p); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  }
  async function renderNewsDetail(slug) {
    view.innerHTML = '<div class="phead"><div class="wrap"><div class="skel" style="height:80px;opacity:.25"></div></div></div><div class="wrap sec"><div class="skel" style="height:360px"></div></div>';
    const r = await Api.get('public.berita', { slug });
    if (!r.success) { view.innerHTML = '<div class="wrap sec"><div class="empty">' + ic('file') + '<h3>Berita tidak ditemukan</h3><p>Artikel mungkin sudah dipindahkan atau disembunyikan.</p><a class="btn btn-cta" href="#/berita">Kembali ke Berita</a></div></div>'; return; }
    const b = r.data.berita, lain = B.berita.filter((x) => x.slug !== slug).slice(0, 3), url = location.href.split('#')[0] + '#/berita/' + slug; document.title = b.judul + ' — ' + S().nama_sekolah;
    view.innerHTML = '<div class="wrap sec" style="padding-top:36px"><div class="crumb" style="color:var(--muted)"><a href="#/">Beranda</a>' + ic('chevron-right') + '<a href="#/berita">Berita</a>' + ic('chevron-right') + '<span>' + esc(b.judul.slice(0, 40)) + '…</span></div><article class="art"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px"><span class="pill gold">' + esc(b.kategori) + '</span><span class="meta">' + ic('calendar') + esc(tglPanjang(b.tanggal)) + '</span></div><h1>' + esc(b.judul) + '</h1><div class="hero-img">' + SL(b.gambar_id) + '</div><div class="body">' + md(b.isi) + '</div>' +
      '<div class="share"><b>Bagikan:</b><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(b.judul + ' ' + url) + '">' + icWA() + 'WhatsApp</a><button class="btn btn-ghost btn-sm" id="cplink">' + ic('copy') + 'Salin tautan</button></div><a class="more" href="#/berita">' + ic('arrow-left') + 'Kembali ke Berita</a></article>' +
      (lain.length ? '<div style="margin-top:64px"><h3 style="margin-bottom:22px;font-size:24px">Berita lainnya</h3><div class="grid g3">' + lain.map(newsCard).join('') + '</div></div>' : '') + '</div>';
    mount(view); $('#cplink').onclick = async () => toast((await copyText(url)) ? 'Tautan disalin.' : 'Gagal menyalin.', 'ok');
  }

  // ---------- Router ----------
  function clearTimers() { App.timers.forEach((t) => t.stop && t.stop()); App.timers = []; FX.clearSliders(); }
  function route() {
    if (!B) return; clearTimers(); const h = location.hash || '#/', parts = h.replace(/^#\/?/, '').split('/'), r = parts[0] || 'home';
    document.title = S().nama_sekolah + (S().tagline ? ' — ' + S().tagline : ''); App.items = {};
    $$('.menu a').forEach((a) => a.classList.remove('on'));
    if (r === 'home' || (r && !['berita', 'daftar', 'berhasil', 'status'].includes(r))) { renderHome(); if (pendingGo) { const id = pendingGo; pendingGo = null; setTimeout(() => goSection(id, true), 60); } else if (route0 !== 'home') window.scrollTo(0, 0); route0 = 'home'; return; }
    window.scrollTo(0, 0); route0 = r;
    if (r === 'berita') { if (parts[1]) renderNewsDetail(decodeURIComponent(parts[1])); else { renderNews(1); const a = $('[data-nav="berita"]'); if (a) a.classList.add('on'); } }
    else if (r === 'daftar') { document.title = 'Pendaftaran PPDB — ' + S().nama_sekolah; Ppdb.renderForm(view, B); }
    else if (r === 'berhasil') Ppdb.renderSuccess(view, B);
    else if (r === 'status') { document.title = 'Cek Status — ' + S().nama_sekolah; Ppdb.renderStatus(view, B, parts[1]); }
  }
  function goSection(id, instant) {
    const home = route0 === 'home' && (location.hash === '' || location.hash === '#/' || location.hash === '#');
    if (!home) { pendingGo = id; if (location.hash === '#/' || location.hash === '') route(); else location.hash = '#/'; return; }
    const el = document.getElementById(id); if (el) { const y = id === 'top' ? 0 : el.getBoundingClientRect().top + scrollY - 70; window.scrollTo({ top: y, behavior: instant ? 'auto' : 'smooth' }); }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); $('#drawer') && $('#drawer').classList.remove('open'); goSection(a.dataset.go); return; }
    const o = e.target.closest('[data-open]'); if (o) { openGal(o.dataset.open); return; }
    if (e.target.closest('#thm')) toggleTema(); else if (e.target.closest('#burger')) $('#drawer').classList.add('open'); else if (e.target.closest('#dx') || e.target.closest('#drawer .scrim')) $('#drawer').classList.remove('open'); else if (e.target.closest('#drawer a.mi, #drawer .btn')) $('#drawer').classList.remove('open');
  });
  document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-open]')) { e.preventDefault(); openGal(e.target.dataset.open); } });
  window.addEventListener('hashchange', route);

  // ---------- Boot: render instan dari cache, segarkan di belakang layar ----------
  function pesanGalat(r) {
    const cfg = r && r.code === 'CONFIG';
    return '<div class="wrap sec"><div class="empty" style="max-width:560px;margin:60px auto">' + ic(cfg ? 'sliders' : 'alert') + '<h2 style="margin-bottom:8px">' + (cfg ? 'Website belum terhubung ke server' : 'Tidak dapat memuat data') + '</h2><p>' + (cfg ? 'Buka <b>js/config.js</b> lalu isi <b>API_URL</b> dengan URL aplikasi web Apps Script Anda (berakhiran /exec). Panduan lengkap ada di PANDUAN-INSTALASI.md.' : esc((r && r.message) || 'Periksa koneksi internet Anda.')) + '</p>' + (cfg ? '' : '<button class="btn btn-cta" onclick="location.reload()">' + ic('refresh') + 'Coba lagi</button>') + '</div></div>';
  }
  async function start() {
    view = $('#view'); const cache = lsGet('boot_v2', null);
    if (cache && cache.setting) { B = App.B = cache; terapkanWarna(); tema(); shell(); route(); Bee.init(S().bee_aktif); }
    else { view.innerHTML = '<div class="hero" style="min-height:560px"><div class="wrap"><div><div class="skel" style="height:44px;width:70%;opacity:.25;margin-bottom:14px"></div><div class="skel" style="height:44px;width:50%;opacity:.25;margin-bottom:28px"></div><div class="skel" style="height:90px;opacity:.2"></div></div><div class="skel" style="height:360px;opacity:.2;border-radius:28px"></div></div></div>'; }
    const r = await Api.get('public.boot');
    if (!r.success) { if (!B) { tema(); view.innerHTML = pesanGalat(r); } return; }
    const berubah = JSON.stringify(r.data) !== JSON.stringify(B), first = !B; B = App.B = r.data; lsSet('boot_v2', B);
    if (first) { terapkanWarna(); tema(); shell(); route(); Bee.init(S().bee_aktif); }
    else if (berubah) { const y = scrollY; terapkanWarna(); shell(); const lama = route0; route0 = ''; route(); route0 = lama; window.scrollTo(0, y); }
  }
  document.addEventListener('DOMContentLoaded', start);
})();
