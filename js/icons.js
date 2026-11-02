/* Ikon (gaya garis 24×24) + ilustrasi bawaan "ph:" untuk data dummy */
(function () {
  const I = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    user: '<path d="M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M17 21v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    graduation: '<path d="M22 10 12 5 2 10l10 5zM6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7.5 15h9"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    medal: '<circle cx="12" cy="15" r="6"/><path d="M8.2 3 6 9.3M15.8 3 18 9.3M10 3h4M12 12v6M9.5 15h5"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    ball: '<circle cx="12" cy="12" r="10"/><path d="m12 7 4 3-1.5 5h-5L8 10zM12 2v5M16 10l5-1.5M14.5 15l3 4.5M9.5 15l-3 4.5M8 10 3 8.5"/>',
    building: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 11h.01M15 11h.01M12 11h.01"/>',
    library: '<path d="M3 21h18M4 21V10M9 21V10M15 21V10M20 21V10M2 10l10-7 10 7z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 3v4M17 5h4M5 17v4M3 19h4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>', 'chevron-down': '<path d="m6 9 6 6 6-6"/>', 'chevron-left': '<path d="m15 18-6-6 6-6"/>', 'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>', 'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>', 'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    cloud: '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.5 12 3.5 3.5 0 0 0 6 19zM12 12v6M9 15l3-3 3 3"/>',
    trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 5.1-5.9M9.9 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    grip: '<path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" stroke-width="3.2"/>',
    whatsapp: '<path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1.2-1.2-1.8-1-.8.7c-.8-.4-1.6-1.2-2-2l.7-.8-1-1.8z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
    tiktok: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9-9M16 8l3 3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    chart: '<path d="M12 20V10M18 20V4M6 20v-4"/>', pie: '<path d="M21.2 15.9A10 10 0 1 1 8 2.8M22 12A10 10 0 0 0 12 2v10z"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 8a5 5 0 0 1 0 8"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    menu: '<path d="M3 12h18M3 6h18M3 18h18"/>', layers: '<path d="m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    bus: '<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16M8 21v-4M16 21v-4M8 14h.01M16 14h.01"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 20h.01"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 17-9 17zM4 21c4-8 8-11 12-13"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>', lightbulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.6 1 1.4 1 2.3h6c0-.9.4-1.7 1-2.3A7 7 0 0 0 12 2z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    wand: '<path d="m15 4 5 5L9 20l-5-5zM4 4l2 2M14 3l1 2M20 14l-2 1M5 9 3 10"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', merge: '<path d="M8 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM8 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM22 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM5 9v6M8 6c6 0 8 3 8 6M8 18c6 0 8-3 8-6"/>',
    id: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.2"/><path d="M13 10h5M13 14h4M5 17c.7-1.6 2-2 3-2s2.3.4 3 2"/>',
    rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9s-2.1-.8-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-4 12.9 12.9 0 0 1 11-6c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2zM9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    play: '<path d="m6 4 14 8-14 8z"/>', pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>', zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>', power: '<path d="M18.4 6.6a9 9 0 1 1-12.8 0M12 2v10"/>'
  };
  const WA_FILL = '<path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.9 1.2 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/>';
  window.ICONS = I;
  window.ic = function (n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (I[n] || I.star) + '</svg>'; };
  window.icWA = function (cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + WA_FILL + '</svg>'; };

  // ---- Ilustrasi bawaan (dipakai oleh data dummy: gambar_id = "ph:ikon:varian") ----
  const PAL = [['#14305a', '#2b5aa6', '#f5b301'], ['#0f2a4d', '#1e6f8f', '#ffd25a'], ['#1b2f6b', '#6a4bc4', '#f5b301'], ['#12384a', '#168a7a', '#ffd25a'], ['#3a1f5c', '#b24a8a', '#ffc94d']];
  window.Art = {
    svg: function (icon, n) {
      n = n || 1; const p = PAL[(n - 1) % PAL.length], g = I[icon] || I.star, ox = [78, 20, 60, 35, 88][(n - 1) % 5];
      let dots = ''; for (let i = 0; i < 9; i++) dots += '<circle cx="' + (60 + i * 90) + '" cy="' + (60 + (i % 3) * 20) + '" r="' + (3 + (i % 3)) + '" fill="#fff" opacity="' + (0.06 + (i % 4) * 0.03) + '"/>';
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient><radialGradient id="r" cx="' + ox / 100 + '" cy=".15" r=".65"><stop offset="0" stop-color="' + p[2] + '" stop-opacity=".6"/><stop offset="1" stop-color="' + p[2] + '" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="800" height="520" fill="url(#g)"/><rect width="800" height="520" fill="url(#r)"/>' + dots +
        '<g stroke="#fff" fill="none" opacity=".1" stroke-width="2"><circle cx="' + (140 + n * 90) + '" cy="420" r="150"/><circle cx="' + (700 - n * 60) + '" cy="90" r="110"/><path d="M0 430 Q200 360 400 430 T800 410"/></g>' +
        '<circle cx="400" cy="250" r="128" fill="#fff" opacity=".1"/><circle cx="400" cy="250" r="96" fill="#fff" opacity=".1"/>' +
        '<g transform="translate(400 250) rotate(' + ((n - 3) * 3) + ') scale(6.6) translate(-12 -12)" stroke="#fff" stroke-width="1.15" fill="none" stroke-linecap="round" stroke-linejoin="round">' + g + '</g>' +
        '<path d="M0 470 Q200 430 400 470 T800 460 V520 H0z" fill="#fff" opacity=".07"/></svg>';
    },
    uri: function (icon, n) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(this.svg(icon, n)); }
  };
  /** id → URL gambar (dummy "ph:", URL penuh, atau ID file Drive) */
  window.imgUrl = function (id, w) {
    id = String(id || '').trim();
    if (!id) return Art.uri('building', 1);
    if (id.indexOf('ph:') === 0) { const p = id.split(':'); return Art.uri(p[1], +p[2] || 1); }
    if (/^https?:\/\//.test(id)) return id;
    return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w' + (w || 900);
  };
  window.imgList = function (s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); };
})();
