/* Utilitas bersama: escape (anti-XSS), Markdown ringan, format, toast, modal, API */
(function () {
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  window.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  window.$ = (s, r) => (r || document).querySelector(s);
  window.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  window.safeUrl = (u) => { u = String(u || '').trim(); return /^(https?:\/\/|#|\/|mailto:|tel:)/i.test(u) ? u : '#'; };

  const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  window.tglID = (s, withTime) => {
    if (!s) return '—'; const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/); if (!m) return esc(s);
    return +m[3] + ' ' + BLN[+m[2] - 1].slice(0, 3) + ' ' + m[1] + (withTime && m[4] ? ', ' + m[4] + '.' + m[5] + ' WIB' : '');
  };
  window.tglPanjang = (s) => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? +m[3] + ' ' + BLN[+m[2] - 1] + ' ' + m[1] : '—'; };
  window.rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  window.inisial = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  window.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms || 250); }; };
  window.lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  window.lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  window.lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
  window.cid = () => { let c = lsGet('cid'); if (!c) { c = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); lsSet('cid', c); } return c; };

  /** Markdown ringan yang aman: escape dulu, baru tandai. Hanya tautan http(s). */
  window.md = (src) => {
    const lines = String(src || '').replace(/\r/g, '').split('\n'); let out = '', list = false, para = [];
    const inl = (t) => esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    const flushP = () => { if (para.length) { out += '<p>' + para.map(inl).join('<br>') + '</p>'; para = []; } };
    lines.forEach((l) => {
      const li = l.match(/^\s*[-*•]\s+(.*)$/), h = l.match(/^#{1,4}\s+(.*)$/);
      if (li) { flushP(); if (!list) { out += '<ul>'; list = true; } out += '<li>' + inl(li[1]) + '</li>'; return; }
      if (list) { out += '</ul>'; list = false; }
      if (h) { flushP(); out += '<h3>' + inl(h[1]) + '</h3>'; } else if (!l.trim()) flushP(); else para.push(l);
    });
    flushP(); if (list) out += '</ul>'; return out;
  };

  // ---------- Toast ----------
  window.toast = (msg, type, judul) => {
    let root = $('#toast-root'); if (!root) { root = document.createElement('div'); root.id = 'toast-root'; document.body.appendChild(root); }
    const sama = $$('.toast', root).find((t) => t.textContent === (judul ? judul : '') + msg); if (sama) return;       // jangan menumpuk toast identik
    while (root.children.length >= 3) root.firstChild.remove();
    const el = document.createElement('div'); el.className = 'toast ' + (type || ''); el.setAttribute('role', 'status');
    el.innerHTML = ic(type === 'err' ? 'alert' : type === 'ok' ? 'check' : 'info') + '<div>' + (judul ? '<b>' + esc(judul) + '</b>' : '') + esc(msg) + '</div>';
    root.appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, type === 'err' ? 6000 : 3800);
  };
  // ---------- Modal ----------
  window.modal = (html, opts) => {
    opts = opts || {}; const m = document.createElement('div'); m.className = 'modal ' + (opts.cls || ''); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="scrim"></div><div class="box" tabindex="-1"><button class="icon-btn x" aria-label="Tutup">' + ic('x') + '</button>' + html + '</div>';
    document.body.appendChild(m); document.body.style.overflow = 'hidden';
    const close = () => { m.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', key); if (opts.onClose) opts.onClose(); };
    const key = (e) => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', key);
    m.querySelector('.scrim').onclick = close; m.querySelector('.x').onclick = close; m.querySelector('.box').focus();
    return { el: m, close };
  };
  window.copyText = async (t) => { try { await navigator.clipboard.writeText(t); return true; } catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (x) {} a.remove(); return ok; } };

  // ---------- API (satu pintu, dedupe, SWR) ----------
  const cfg = window.APP_CONFIG || {}, inflight = {};
  window.Api = {
    token: null, onAuthFail: null, perf: [],
    ready() { return cfg.API_URL && cfg.API_URL.indexOf('http') === 0; },
    async post(action, data, opt) {
      opt = opt || {};
      if (!this.ready()) return { success: false, message: 'URL API belum diatur di js/config.js', code: 'CONFIG' };
      const t0 = performance.now();
      try {
        const res = await fetch(cfg.API_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, data: data || {}, token: opt.token === undefined ? this.token || '' : opt.token }) });
        const j = await res.json(); this.perf.push({ action, ms: Math.round(performance.now() - t0), srv: j.ms }); if (this.perf.length > 60) this.perf.shift();
        if (j && j.code === 'AUTH' && this.onAuthFail && !opt.quiet) this.onAuthFail(j);
        return j;
      } catch (e) { return { success: false, message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', code: 'NET' }; }
    },
    /** GET bersama (dedupe permintaan identik yang sedang berjalan) */
    async get(action, params) {
      if (!this.ready()) return { success: false, message: 'URL API belum diatur di js/config.js', code: 'CONFIG' };
      const url = cfg.API_URL + (cfg.API_URL.indexOf('?') > -1 ? '&' : '?') + 'action=' + encodeURIComponent(action) + (params ? '&data=' + encodeURIComponent(JSON.stringify(params)) : ''), k = url;
      if (inflight[k]) return inflight[k];
      inflight[k] = (async () => { try { const r = await fetch(url, { redirect: 'follow' }); return await r.json(); } catch (e) { return { success: false, message: 'Tidak dapat terhubung ke server.', code: 'NET' }; } finally { delete inflight[k]; } })();
      return inflight[k];
    }
  };
})();
