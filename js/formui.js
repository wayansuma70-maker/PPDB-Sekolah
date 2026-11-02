/* Renderer field formulir — dipakai formulir publik & pratinjau Form Builder admin */
(function () {
  const TIPE_LABEL = { text: 'Teks singkat', textarea: 'Paragraf', number: 'Angka', email: 'Email', tel: 'Telepon / WhatsApp', date: 'Tanggal', select: 'Dropdown', radio: 'Pilihan tunggal', checkbox: 'Kotak centang', file: 'Unggah berkas' };
  const TIPE_IKON = { text: 'edit', textarea: 'list', number: 'chart', email: 'mail', tel: 'phone', date: 'calendar', select: 'chevron-down', radio: 'target', checkbox: 'check', file: 'upload' };
  const FormUI = window.FormUI = { TIPE_LABEL, TIPE_IKON };

  FormUI.groups = function (fields) {
    const g = [], idx = {};
    (fields || []).forEach((f) => { const n = f.bagian || 'Data Pendaftar'; if (idx[n] === undefined) { idx[n] = g.length; g.push({ nama: n, fields: [] }); } g[idx[n]].fields.push(f); });
    return g;
  };
  const isFull = (f) => f.tipe === 'textarea' || f.tipe === 'checkbox' || (f.tipe === 'radio' && (f.opsi.length > 3 || f.opsi.some((o) => o.length > 16)));

  /** o: {value, error, disabled, file} */
  FormUI.field = function (f, o) {
    o = o || {}; const id = 'f_' + f.kunci, v = o.value === undefined ? '' : o.value, dis = o.disabled ? ' disabled' : '', va = f.validasi || {};
    const lab = '<label for="' + id + '">' + esc(f.label) + (f.wajib ? ' <span class="req">*</span>' : '') + '</label>';
    let inp = '';
    switch (f.tipe) {
      case 'textarea': inp = '<textarea class="ta" id="' + id + '" name="' + esc(f.kunci) + '" rows="3" maxlength="' + (va.max || 2000) + '" placeholder="' + esc(f.placeholder) + '"' + dis + '>' + esc(v) + '</textarea>'; break;
      case 'select': inp = '<select class="sel" id="' + id + '" name="' + esc(f.kunci) + '"' + dis + '><option value="">Pilih…</option>' + f.opsi.map((x) => '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>').join('') + '</select>'; break;
      case 'radio': {
        const seg = !isFull(f);
        inp = seg ? '<div class="seg" role="radiogroup" aria-label="' + esc(f.label) + '">' + f.opsi.map((x) => '<label><input type="radio" name="' + esc(f.kunci) + '" value="' + esc(x) + '"' + (x === v ? ' checked' : '') + dis + '><span>' + esc(x) + '</span></label>').join('') + '</div>'
          : '<div style="display:grid;gap:8px">' + f.opsi.map((x) => '<label class="chk"><input type="radio" name="' + esc(f.kunci) + '" value="' + esc(x) + '"' + (x === v ? ' checked' : '') + dis + '><span>' + esc(x) + '</span></label>').join('') + '</div>';
        return '<div class="fld' + (seg ? '' : ' full') + '" data-k="' + esc(f.kunci) + '"><span class="lb">' + esc(f.label) + (f.wajib ? ' <span class="req">*</span>' : '') + '</span>' + inp + FormUI.meta(f, o) + '</div>';
      }
      case 'checkbox': {
        const arr = Array.isArray(v) ? v : [];
        return '<div class="fld full" data-k="' + esc(f.kunci) + '"><span class="lb">' + (f.opsi.length > 1 ? esc(f.label) + (f.wajib ? ' <span class="req">*</span>' : '') : '') + '</span><div style="display:grid;gap:8px">' + f.opsi.map((x) => '<label class="chk"><input type="checkbox" name="' + esc(f.kunci) + '" value="' + esc(x) + '"' + (arr.indexOf(x) > -1 ? ' checked' : '') + dis + '><span>' + (f.opsi.length === 1 ? '<b style="color:var(--heading)">' + esc(f.label) + (f.wajib ? ' <span class="req">*</span>' : '') + '</b><br>' : '') + esc(x) + '</span></label>').join('') + '</div>' + FormUI.meta(f, o, true) + '</div>';
      }
      case 'file': {
        const fl = o.file, jenis = (va.jenis || ['pdf', 'jpg', 'png']).map((j) => j.toUpperCase()).join('/');
        const body = fl
          ? '<button type="button" class="rm" data-rm="' + esc(f.kunci) + '" aria-label="Hapus berkas">' + ic('x') + '</button>' + (fl.preview ? '<img class="thumb" src="' + fl.preview + '" alt="">' : ic('file')) + '<b>' + esc(fl.name) + '</b><small>' + Math.round(fl.size / 1024) + ' KB · siap diunggah</small>'
          : ic('cloud') + '<b>Tarik berkas atau klik untuk memilih</b><small>' + esc(jenis) + ' · maks. ' + (va.maks_mb || 2) + ' MB</small>';
        return '<div class="fld" data-k="' + esc(f.kunci) + '"><span class="lb" style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span>' + esc(f.label) + '</span><span class="pill ' + (f.wajib ? 'gold' : '') + '">' + (f.wajib ? 'Wajib' : 'Opsional') + '</span></span>' +
          '<div class="drop' + (fl ? ' ok' : '') + '" data-drop="' + esc(f.kunci) + '">' + body + (o.disabled ? '' : '<input type="file" id="' + id + '" data-file="' + esc(f.kunci) + '" accept="' + (va.jenis || []).map((j) => j === 'pdf' ? '.pdf,application/pdf' : j === 'jpg' ? '.jpg,.jpeg,image/jpeg' : '.png,image/png').join(',') + '" aria-label="' + esc(f.label) + '">') + '</div>' + FormUI.meta(f, o) + '</div>';
      }
      default: {
        const type = f.tipe === 'tel' ? 'tel' : f.tipe === 'email' ? 'email' : f.tipe === 'number' ? 'number' : f.tipe === 'date' ? 'date' : 'text';
        inp = '<input class="in" id="' + id + '" name="' + esc(f.kunci) + '" type="' + type + '"' + (f.tipe === 'tel' ? ' inputmode="tel" autocomplete="tel"' : f.tipe === 'email' ? ' autocomplete="email"' : '') + (f.tipe === 'number' && va.min !== undefined ? ' min="' + va.min + '"' : '') + (f.tipe === 'number' && va.max !== undefined ? ' max="' + va.max + '"' : '') + (va.max && f.tipe === 'text' ? ' maxlength="' + va.max + '"' : '') + ' placeholder="' + esc(f.placeholder) + '" value="' + esc(v) + '"' + dis + '>';
      }
    }
    return '<div class="fld' + (isFull(f) ? ' full' : '') + '" data-k="' + esc(f.kunci) + '">' + lab + inp + FormUI.meta(f, o) + '</div>';
  };
  FormUI.meta = function (f, o) {
    return (o.error ? '<div class="em">' + ic('alert') + esc(o.error) + '</div>' : '<div class="em" hidden></div>') + (f.bantuan ? '<div class="hlp">' + esc(f.bantuan) + '</div>' : '');
  };
  /** Validasi sisi klien (cermin server). v = nilai, fl = berkas */
  FormUI.validate = function (f, v, fl) {
    const va = f.validasi || {}, L = f.label;
    if (f.tipe === 'file') return !fl && f.wajib ? L + ' wajib diunggah.' : '';
    if (f.tipe === 'checkbox') return f.wajib && !(v && v.length) ? L + ' wajib dicentang.' : '';
    const s = String(v == null ? '' : v).trim();
    if (!s) return f.wajib ? L + ' wajib diisi.' : '';
    if (f.tipe === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return 'Format email tidak valid.';
    if (f.tipe === 'tel' && !/^08\d{8,12}$/.test(window.hp08(s))) return 'Nomor tidak valid (contoh 08123456789).';
    if (f.tipe === 'number') { const n = Number(s); if (isNaN(n)) return L + ' harus berupa angka.'; if (va.min !== undefined && n < va.min) return L + ' minimal ' + va.min + '.'; if (va.max !== undefined && n > va.max) return L + ' maksimal ' + va.max + '.'; return ''; }
    if ((f.tipe === 'select' || f.tipe === 'radio') && f.opsi.indexOf(s) === -1) return L + ' tidak valid.';
    if (f.tipe === 'text' || f.tipe === 'textarea') {
      if (va.min !== undefined && s.length < va.min) return L + ' minimal ' + va.min + ' karakter.';
      if (va.max !== undefined && s.length > va.max) return L + ' maksimal ' + va.max + ' karakter.';
      if (va.pola) { try { if (!new RegExp(va.pola).test(s)) return L + ' formatnya belum sesuai.'; } catch (e) {} }
    }
    return '';
  };
  window.hp08 = (v) => { let s = String(v == null ? '' : v).replace(/[^0-9+]/g, '').replace(/^\+/, ''); if (!s) return ''; if (s.indexOf('62') === 0) s = '0' + s.slice(2); else if (s[0] === '8') s = '0' + s; return s; };
  window.hp62 = (v) => { const s = hp08(v); return s ? (s[0] === '0' ? '62' + s.slice(1) : s) : ''; };
})();
