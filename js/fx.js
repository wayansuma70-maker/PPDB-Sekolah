/* Efek interaktif: kartu menyala mengikuti kursor, tombol berkilau, tilt 3D, hitung angka, slideshow otomatis */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const FX = window.FX = { reduce, fine, sliders: [] };

  // ---- Reveal saat scroll ----
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); if (e.target.dataset.count) FX.count(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' }) : null;
  FX.scan = function (root) {
    $$('.reveal:not(.shown)', root).forEach((el, i) => { if (!io) { el.classList.add('shown'); return; } if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i % 6, 5) * 80 + 'ms'); io.observe(el); });
    $$('[data-count]:not([data-counted])', root).forEach((el) => { if (io) io.observe(el); else FX.count(el); });
  };
  // ---- Hitung angka (25+, 98%, 1.200) ----
  FX.count = function (el) {
    if (el.dataset.counted) return; el.dataset.counted = 1;
    const raw = el.dataset.count, m = String(raw).match(/^([^\d]*)([\d.,]+)(.*)$/); if (!m || reduce) { el.textContent = raw; return; }
    const target = parseFloat(m[2].replace(/\./g, '').replace(',', '.')), dur = 1400, t0 = performance.now();
    (function tick(t) { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = m[1] + Math.round(target * e).toLocaleString('id-ID') + m[3]; if (p < 1) requestAnimationFrame(tick); else el.textContent = raw; })(t0);
  };

  // ---- Delegasi pointer: glow, tilt, magnetic ----
  let raf = 0, last = null;
  document.addEventListener('pointermove', (e) => { last = e; if (!raf) raf = requestAnimationFrame(() => { raf = 0; handle(last); }); }, { passive: true });
  function handle(e) {
    const t = e.target.closest && e.target.closest('.glow, .flip, .tilt, .btn-cta, .btn-mag');
    if (FX.curGlow && FX.curGlow !== t) { resetTilt(FX.curGlow); }
    FX.curGlow = t || null; if (!t) return;
    const r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px');
    if (t.classList.contains('flip')) { $$('.face', t).forEach((f) => { f.style.setProperty('--mx', x + 'px'); f.style.setProperty('--my', y + 'px'); }); }
    if (fine && !reduce && t.classList.contains('tilt')) { const px = x / r.width - .5, py = y / r.height - .5; t.style.transform = 'perspective(900px) rotateY(' + (px * 9).toFixed(2) + 'deg) rotateX(' + (-py * 9).toFixed(2) + 'deg) translateY(-6px)'; }
    if (fine && !reduce && (t.classList.contains('btn-cta') || t.classList.contains('btn-mag'))) { const cx = r.left + r.width / 2, cy = r.top + r.height / 2; t.style.transform = 'translate(' + ((e.clientX - cx) * .16).toFixed(1) + 'px,' + ((e.clientY - cy) * .22 - 2).toFixed(1) + 'px)'; }
  }
  function resetTilt(t) { if (t.classList.contains('tilt') || t.classList.contains('btn-cta') || t.classList.contains('btn-mag')) t.style.transform = ''; }
  document.addEventListener('pointerleave', () => { if (FX.curGlow) resetTilt(FX.curGlow); }, true);

  // ---- Riak saat klik ----
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest && e.target.closest('.btn'); if (!b || reduce) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement('span'); sp.className = 'ripple';
    sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px'; b.appendChild(sp); setTimeout(() => sp.remove(), 700);
  });

  // ---- Progress scroll + navbar ----
  window.addEventListener('scroll', () => {
    const h = document.documentElement, p = $('#progress'); if (p) p.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + '%';
    const n = $('.nav'); if (n) n.classList.toggle('scrolled', h.scrollTop > 8);
  }, { passive: true });

  // ---- Slideshow otomatis ----
  /** FX.slider(el, ids[], {interval, dots, count}) — crossfade + Ken Burns; berhenti di luar layar / saat tab tersembunyi */
  FX.slider = function (el, ids, o) {
    o = o || {}; ids = ids && ids.length ? ids : ['ph:building:1']; el.classList.add('sl');
    const imgs = ids.map((id, i) => { const im = document.createElement('img'); im.alt = o.alt || ''; im.decoding = 'async'; im.draggable = false; if (i === 0) { im.src = imgUrl(id, o.w || 900); im.className = 'on'; } else im.dataset.src = id; el.appendChild(im); return im; });
    if (ids.length < 2) return { destroy() {}, go() {} };
    let i = 0, timer = null, visible = true, hover = false; const dots = [];
    if (o.dots !== false) { const d = document.createElement('div'); d.className = 'sl-dots'; ids.forEach((_, k) => { const b = document.createElement('i'); b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); go(k, true); }; d.appendChild(b); dots.push(b); }); el.appendChild(d); dots[0].classList.add('on'); }
    if (o.count) { const c = document.createElement('span'); c.className = 'sl-cnt'; c.innerHTML = ic('image') + ids.length; el.appendChild(c); }
    function load(k) { const im = imgs[k]; if (im.dataset.src) { im.src = imgUrl(im.dataset.src, o.w || 900); delete im.dataset.src; } }
    function go(k, manual) { load(k); imgs[i].classList.remove('on'); i = (k + ids.length) % ids.length; imgs[i].classList.add('on'); dots.forEach((d, n) => d.classList.toggle('on', n === i)); load((i + 1) % ids.length); if (manual) restart(); }
    function tick() { if (visible && !hover && !document.hidden) go(i + 1); }
    function restart() { clearInterval(timer); timer = setInterval(tick, (o.interval || 3200) + Math.random() * 500); }
    el.addEventListener('pointerenter', () => { hover = true; }); el.addEventListener('pointerleave', () => { hover = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { visible = e.isIntersecting; })).observe(el);
    load(1); restart();
    const api = { go, destroy() { clearInterval(timer); } }; FX.sliders.push(api); return api;
  };
  FX.clearSliders = function () { FX.sliders.forEach((s) => s.destroy()); FX.sliders = []; };

  // ---- Bintang kecil di hero ----
  FX.sparks = function (host, n) { if (reduce) return; for (let k = 0; k < (n || 14); k++) { const s = document.createElement('i'); s.className = 'spark'; s.style.left = Math.random() * 100 + '%'; s.style.top = (30 + Math.random() * 60) + '%'; s.style.animationDelay = (Math.random() * 5).toFixed(2) + 's'; s.style.animationDuration = (4 + Math.random() * 4).toFixed(2) + 's'; host.appendChild(s); } };
})();
