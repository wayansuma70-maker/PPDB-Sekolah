/* ============================================================
   LEBAH — satu karakter hidup yang selalu mengikuti kursor
   • SVG berlapis: sayap ganda + ghost (blur gerak), bulu prosedural, mata majemuk, kaki & kantong serbuk sari, antena
   • Fisika pegas-redaman, orbit goyang, menoleh halus, pitch saat menukik, kepakan mengikuti kecepatan
   • Diam → hinggap di samping kursor; klik → berputar (loop); layar sentuh → mengikuti jari / berkeliaran
   ============================================================ */
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const Bee = window.Bee = { on: false, ready: false };
  let el, P = {}, raf = 0, last = 0, W = 92, H = 69;

  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function fuzz(cx, cy, rx, ry, n, r, from, to) {
    let s = ''; const cols = ['#ffe69a', '#f4c430', '#d99a10', '#8a5a06'];
    for (let i = 0; i < n; i++) {
      const a = (from === undefined ? r() * 6.2832 : from + r() * (to - from)), k = .72 + r() * .42, x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k, L = 2 + r() * 3.6;
      s += '<line x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + (x + Math.cos(a) * L).toFixed(1) + '" y2="' + (y + Math.sin(a) * L).toFixed(1) + '" stroke="' + cols[(r() * cols.length) | 0] + '" stroke-width="' + (.6 + r() * .6).toFixed(2) + '" stroke-linecap="round" opacity="' + (.55 + r() * .4).toFixed(2) + '"/>';
    }
    return s;
  }
  function wing(kind, op) {
    const fore = 'M0 0 C-4 -20 -26 -35 -51 -29 C-62 -26 -59 -12 -46 -4 C-30 4 -10 4 0 0Z', hind = 'M0 0 C-2 -12 -16 -21 -33 -16 C-40 -13 -35 -3 -24 0 C-14 3 -4 3 0 0Z';
    const d = kind === 'fore' ? fore : hind, veins = kind === 'fore' ? 'M0 0 L-49 -21 M-9 -2 L-41 -9 M-19 -3 L-53 -27 M-30 -12 L-34 -2' : 'M0 0 L-33 -12 M-8 -1 L-28 -6';
    return '<path d="' + d + '" fill="url(#bee-gw)" stroke="rgba(110,140,180,.85)" stroke-width=".8" opacity="' + op + '"/><path d="' + veins + '" stroke="rgba(100,130,170,.55)" stroke-width=".7" fill="none" opacity="' + op + '"/>';
  }
  function leg(basket) {
    return '<path d="' + (basket ? 'M0 0 Q-4 8 -2 15 Q0 22 -6 28' : 'M0 0 Q3 7 1 13 Q-1 19 4 25') + '" stroke="#2a1a06" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      (basket ? '<ellipse cx="-2.8" cy="15" rx="3.8" ry="5.4" fill="#f59e0b"/><ellipse cx="-3.4" cy="13.6" rx="1.5" ry="2.2" fill="#fde68a" opacity=".85"/>' : '') + '<circle cx="1" cy="13" r="1.3" fill="#3b2609"/>';
  }
  function svgBee() {
    const r = rng(7);
    const abd = 'M68 60 C68 44 52 34 34 40 C20 44 12 54 10 62 C12 70 20 80 34 84 C52 88 68 76 68 60 Z';
    return '<svg xmlns="' + NS + '" viewBox="0 0 160 120"><defs>' +
      '<radialGradient id="bee-gt" cx=".42" cy=".3" r=".8"><stop offset="0" stop-color="#ffe68a"/><stop offset=".55" stop-color="#f2b81a"/><stop offset="1" stop-color="#8f6006"/></radialGradient>' +
      '<linearGradient id="bee-ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd54f"/><stop offset=".6" stop-color="#eba80c"/><stop offset="1" stop-color="#8a5a04"/></linearGradient>' +
      '<linearGradient id="bee-gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3010"/><stop offset="1" stop-color="#130b03"/></linearGradient>' +
      '<linearGradient id="bee-gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>' +
      '<radialGradient id="bee-ge" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#6b5a49"/><stop offset=".3" stop-color="#241a10"/><stop offset="1" stop-color="#050302"/></radialGradient>' +
      '<linearGradient id="bee-gw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".6" stop-color="#d7e8fb" stop-opacity=".5"/><stop offset="1" stop-color="#a9c8ee" stop-opacity=".3"/></linearGradient>' +
      '<clipPath id="bee-ca"><path d="' + abd + '"/></clipPath></defs>' +
      // sayap jauh
      '<g transform="translate(90 45)"><g id="bw-f2"><g transform="rotate(-14)">' + wing('fore', .16) + '</g>' + wing('fore', .42) + '</g></g>' +
      '<g transform="translate(88 47)"><g id="bw-h2"><g transform="rotate(-14)">' + wing('hind', .14) + '</g>' + wing('hind', .4) + '</g></g>' +
      // kaki belakang (jauh)
      '<g transform="translate(77 72)"><g id="bl-3b" opacity=".75">' + leg(true) + '</g></g><g transform="translate(95 71)"><g id="bl-1b" opacity=".75">' + leg(false) + '</g></g>' +
      // perut
      '<path d="M12 57 L1 62 L12 67Z" fill="#2a1a06"/><path d="' + abd + '" fill="url(#bee-ga)"/>' +
      '<g clip-path="url(#bee-ca)"><path d="M14 30 Q6 62 14 96 L24 96 Q16 62 24 30Z" fill="url(#bee-gd)"/><path d="M31 30 Q23 62 31 96 L41 96 Q33 62 41 30Z" fill="url(#bee-gd)"/><path d="M48 30 Q40 62 48 96 L57 96 Q49 62 57 30Z" fill="url(#bee-gd)"/>' +
      '<g>' + fuzz(40, 62, 30, 24, 46, r, 3.2, 6.2) + fuzz(40, 62, 30, 24, 16, r, 0, .5) + '</g></g>' +
      '<path d="' + abd + '" fill="url(#bee-gs)"/><ellipse cx="38" cy="47" rx="17" ry="3.8" fill="#fff" opacity=".24" transform="rotate(-8 38 47)"/>' +
      // dada
      '<ellipse cx="82" cy="58" rx="19.5" ry="17.5" fill="url(#bee-gt)"/><g>' + fuzz(82, 58, 19.5, 17.5, 150, r) + '</g><ellipse cx="82" cy="58" rx="19.5" ry="17.5" fill="url(#bee-gs)" opacity=".6"/>' +
      // antena jauh + kepala
      '<g transform="translate(103 51)"><g id="ba-2"><path d="M0 0 Q3 -13 10 -22" stroke="#1a1006" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="10" cy="-22" r="2" fill="#1a1006"/></g></g>' +
      '<circle cx="107" cy="62" r="12.8" fill="url(#bee-gd)"/><g>' + fuzz(107, 62, 12.5, 12.5, 40, r, 3.3, 5.6) + '</g>' +
      '<ellipse cx="102.5" cy="57" rx="2.6" ry="6.4" fill="#0a0604"/>' +
      '<ellipse cx="111.5" cy="58" rx="6.6" ry="8.8" transform="rotate(-18 111.5 58)" fill="url(#bee-ge)"/><ellipse cx="113.6" cy="54.4" rx="1.9" ry="3" transform="rotate(-18 113.6 54.4)" fill="#fff" opacity=".88"/><circle cx="109" cy="62" r="1.1" fill="#fff" opacity=".45"/>' +
      '<path d="M116 66.5 q3 3 1 6.5" stroke="#2a1a06" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M118 68 q6 1 9 7" stroke="#5a4018" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<g transform="translate(109 50)"><g id="ba-1"><path d="M0 0 Q6 -12 17 -19" stroke="#1a1006" stroke-width="1.7" fill="none" stroke-linecap="round"/><circle cx="17" cy="-19" r="2.3" fill="#1a1006"/></g></g>' +
      // kaki depan (dekat)
      '<g transform="translate(86 74)"><g id="bl-2">' + leg(false) + '</g></g><g transform="translate(72 72)"><g id="bl-3">' + leg(true) + '</g></g><g transform="translate(98 72)"><g id="bl-1">' + leg(false) + '</g></g>' +
      // sayap dekat
      '<g transform="translate(83 43)"><g id="bw-f1"><g transform="rotate(-16)">' + wing('fore', .2) + '</g>' + wing('fore', .62) + '</g></g>' +
      '<g transform="translate(81 45)"><g id="bw-h1"><g transform="rotate(-16)">' + wing('hind', .18) + '</g>' + wing('hind', .58) + '</g></g></svg>';
  }

  // ---------- Keadaan & input ----------
  const S = { x: -140, y: 220, vx: 0, vy: 0, face: 1, mode: 'follow', modeT: 0, lastMove: 0, loop: null, wp: 0, wander: { x: 0, y: 0, t: 0 }, cs: 0, px: 0, py: 0, ang: 0 };
  const cur = { x: innerWidth * .62, y: innerHeight * .38, has: false, touch: false };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function move(x, y, touch) {
    const now = performance.now();
    cur.x = x; cur.y = y; cur.has = true; cur.touch = !!touch; S.lastMove = now;
    if (S.mode === 'rest' && Math.hypot(x - S.x, y - S.y) > 60) { S.mode = 'follow'; S.modeT = now; }
  }
  const onPM = (e) => move(e.clientX, e.clientY, e.pointerType === 'touch');
  const onTM = (e) => { const t = e.touches && e.touches[0]; if (t) move(t.clientX, t.clientY, true); };
  const onPD = (e) => { move(e.clientX, e.clientY, e.pointerType === 'touch'); if (!S.loop) S.loop = { t0: performance.now(), cx: e.clientX, cy: e.clientY, dir: Math.random() < .5 ? 1 : -1 }; };

  function set(id, a) { const n = P[id]; if (n) n.setAttribute('transform', 'rotate(' + a.toFixed(1) + ')'); }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = clamp((now - last) / 1000, 0.001, .05); last = now; const t = now / 1000;
    // kecepatan kursor (dihaluskan) → mengurangi goyang orbit saat kursor bergerak cepat
    const cd = Math.hypot(cur.x - S.px, cur.y - S.py) / dt; S.px = cur.x; S.py = cur.y; S.cs += (cd - S.cs) * Math.min(1, dt * 6);
    const idle = now - S.lastMove;
    let tx, ty, wingMode = 'fly';
    const autonomous = !cur.has || (cur.touch && idle > 3500);
    if (S.loop) {
      const k = (now - S.loop.t0) / 1050; if (k >= 1) S.loop = null;
      else { const a = k * 6.2832 * S.loop.dir - 1.57; tx = S.loop.cx + Math.cos(a) * 52; ty = S.loop.cy + Math.sin(a) * 52 - 8; }
    }
    if (tx === undefined) {
      if (autonomous) {
        if (now - S.wander.t > 2300 || Math.hypot(S.wander.x - S.x, S.wander.y - S.y) < 40) { S.wander = { x: 60 + Math.random() * (innerWidth - 120), y: 80 + Math.random() * (innerHeight - 160), t: now }; }
        tx = S.wander.x + Math.cos(t * 2) * 14; ty = S.wander.y + Math.sin(t * 2.6) * 12;
      } else {
        if (S.mode === 'follow' && idle > 5200 && now - S.modeT > 3000) { S.mode = 'rest'; S.modeT = now; }
        else if (S.mode === 'rest' && now - S.modeT > 2800) { S.mode = 'follow'; S.modeT = now; S.lastMove = now - 2500; }
        if (S.mode === 'rest') { tx = cur.x + 34; ty = cur.y - 2; wingMode = 'rest'; }
        else {
          const calm = clamp(1 - S.cs / 900, .3, 1), idleBoost = idle > 1800 ? 1.5 : 1;
          tx = cur.x + (Math.cos(t * 1.7) * 30 + Math.sin(t * .9) * 12) * calm * idleBoost - 8;
          ty = cur.y - 36 + Math.sin(t * 3.2) * 10 * calm * idleBoost;
        }
      }
    }
    // pegas-redaman
    const k = wingMode === 'rest' ? 38 : 64, c = wingMode === 'rest' ? 12 : 9.8;
    const ax = (tx - S.x) * k - S.vx * c, ay = (ty - S.y) * k - S.vy * c;
    S.vx = clamp(S.vx + ax * dt, -1900, 1900); S.vy = clamp(S.vy + ay * dt, -1900, 1900);
    S.x += S.vx * dt; S.y += S.vy * dt;
    const sp = Math.hypot(S.vx, S.vy), spr = clamp(sp / 900, 0, 1);
    // menoleh halus
    const want = tx > S.x + 14 ? 1 : tx < S.x - 14 ? -1 : (Math.abs(S.vx) > 50 ? Math.sign(S.vx) : S.face >= 0 ? 1 : -1);
    S.face += (want - S.face) * Math.min(1, dt * 11);
    const fs = Math.abs(S.face) < .12 ? .12 * Math.sign(S.face || 1) : S.face;
    const pitch = clamp(S.vy * .034, -20, 20) * Math.sign(S.face || 1) + (wingMode === 'rest' ? -10 : Math.sin(t * 2.3) * 3);
    el.style.transform = 'translate3d(' + (S.x - W / 2).toFixed(1) + 'px,' + (S.y - H / 2 + (wingMode === 'rest' ? 0 : Math.sin(t * 24) * .8)).toFixed(1) + 'px,0) rotate(' + pitch.toFixed(1) + 'deg) scale(' + fs.toFixed(3) + ',1)';
    // sayap
    const hz = wingMode === 'rest' ? 3.2 : 12 + spr * 5, amp = wingMode === 'rest' ? 13 : 36 + spr * 10;
    S.wp += dt * 6.2832 * hz;
    const s1 = Math.sin(S.wp), s2 = Math.sin(S.wp - .5), s3 = Math.sin(S.wp + .35);
    set('bw-f1', 8 + amp * s1); set('bw-h1', 2 + amp * .95 * s2); set('bw-f2', 14 + amp * .88 * s3); set('bw-h2', 6 + amp * .85 * Math.sin(S.wp - .2));
    // kaki: menjuntai & terseret ke belakang saat melaju; terjulur saat hinggap
    const trail = wingMode === 'rest' ? -8 : 16 * spr + 5, sw = Math.sin(t * 5) * (wingMode === 'rest' ? 2 : 4);
    set('bl-1', trail + sw); set('bl-2', trail * 1.05 - sw * .8 + 3); set('bl-3', trail * 1.2 + sw * .6 + 6); set('bl-1b', trail - sw + 4); set('bl-3b', trail * 1.2 - sw * .5 + 7);
    // antena
    const drag = clamp(-S.vx * Math.sign(S.face || 1) * .012, -12, 12);
    set('ba-1', Math.sin(t * 5.3) * 6 + drag); set('ba-2', Math.sin(t * 4.1 + 1) * 7 + drag * .8);
  }

  function start() { if (raf || !Bee.on) return; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function build() {
    el = document.createElement('div'); el.id = 'bee'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = svgBee(); el.className = 'hide';
    document.body.appendChild(el); W = el.offsetWidth || W; H = el.offsetHeight || H;
    ['bw-f1', 'bw-h1', 'bw-f2', 'bw-h2', 'bl-1', 'bl-2', 'bl-3', 'bl-1b', 'bl-3b', 'ba-1', 'ba-2'].forEach((id) => { P[id] = el.querySelector('#' + id); });
    window.addEventListener('pointermove', onPM, { passive: true }); window.addEventListener('touchmove', onTM, { passive: true }); window.addEventListener('pointerdown', onPD, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    window.addEventListener('resize', () => { W = el.offsetWidth || W; H = el.offsetHeight || H; });
    Bee.ready = true;
  }
  const BEE_ICON = '<svg viewBox="0 0 40 40" width="24" height="24" aria-hidden="true"><ellipse cx="18" cy="23" rx="10" ry="8" fill="#f5b301"/><path d="M12 16q-3 8 0 14M19 15q-3 9 0 16M26 17q-2 6 0 11" stroke="#2a1a06" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="30" cy="21" r="5.5" fill="#2a1a06"/><circle cx="32" cy="19.5" r="1.8" fill="#fff"/><ellipse cx="17" cy="11" rx="8" ry="4.2" fill="#cfe4fb" stroke="#8fb0d8" stroke-width=".8" transform="rotate(-18 17 11)"/></svg>';
  Bee.icon = BEE_ICON;
  let adminOn = true;
  Bee.set = function (on, persist) {
    if (!Bee.ready) build(); Bee.on = !!on; el.classList.toggle('hide', !on);
    if (on) { S.lastMove = performance.now(); if (S.x < -100) { S.x = -110; S.y = innerHeight * .3; } start(); } else stop();
    Bee.sync(); if (persist) lsSet('bee', on ? 'on' : 'off');
  };
  /** Sinkronkan tombol #bee-toggle (ada di navbar; dibuat ulang tiap render header) */
  Bee.sync = function () {
    const b = document.getElementById('bee-toggle'); if (!b) return;
    b.style.display = adminOn || lsGet('bee', null) === 'on' ? '' : 'none'; b.classList.toggle('off', !Bee.on); b.setAttribute('aria-pressed', Bee.on ? 'true' : 'false'); b.title = Bee.on ? 'Sembunyikan lebah' : 'Tampilkan lebah'; b.onclick = () => Bee.set(!Bee.on, true);
  };
  /** Mulai: hormati preferensi pengunjung → pengaturan admin → prefers-reduced-motion */
  Bee.init = function (settingAktif) {
    const pref = lsGet('bee', null); adminOn = String(settingAktif || 'YA').toUpperCase() !== 'TIDAK';
    const on = pref !== null ? pref === 'on' : (adminOn && !reduceMotion);
    if (adminOn || pref === 'on') Bee.set(on); else { Bee.on = false; Bee.sync(); }
  };
})();
