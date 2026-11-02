# Landing Page Sekolah + PPDB Online

Website profil sekolah (SD/SMP/SMA) dengan pendaftaran PPDB online, panel admin, notifikasi WhatsApp/Email, dan CRM.
Frontend statis (HTML/CSS/JS murni) di **GitHub Pages**; backend **Google Apps Script** sebagai REST API; database **Google Sheets**; berkas di **Google Drive**.

> 📘 Pasang langkah demi langkah: **[PANDUAN-INSTALASI.md](PANDUAN-INSTALASI.md)**

## Struktur repository (folder ini = root repo)

```
index.html          ← website publik (hash-routing: #/berita, #/daftar, #/status …)
admin.html          ← panel admin (noindex)
css/style.css       ← token desain (Academic Prestige) + komponen publik + efek
css/admin.css       ← layout panel admin
js/config.js        ← ✏️ SATU-SATUNYA berkas yang perlu diedit: API_URL
js/icons.js         ← ikon + ilustrasi bawaan data dummy
js/util.js          ← escape anti-XSS, Markdown aman, toast, modal, klien API
js/formui.js        ← renderer field formulir (publik & pratinjau Form Builder)
js/fx.js            ← slideshow otomatis, kartu menyala, tilt, hitung angka, riak
js/bee.js           ← lebah interaktif
js/ppdb.js          ← formulir bertahap, sukses/token, cek status
js/public.js        ← router & seluruh section situs publik, FAB WhatsApp, tema
js/admin-core.js    ← sesi, login Google/darurat, layout, komponen admin
js/admin-a.js       ← Dashboard, Konten (CRUD generik), Pengaturan, Pengguna
js/admin-b.js       ← Periode, Form Builder, Pendaftar
js/admin-c.js       ← Notifikasi, WhatsApp Blast, Log, CRM
```

## Konfigurasi

Edit `js/config.js`:

```js
window.APP_CONFIG = { API_URL: 'https://script.google.com/macros/s/XXXX/exec', VERSION: '1.0.0' };
```

Tidak ada kunci rahasia di repository ini. Semua rahasia (token Fonnte, Client ID, rahasia sesi, hash sandi darurat) berada di *Script Properties* Apps Script.

## Deploy

```bash
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
Lalu **Settings → Pages → Deploy from a branch → main / (root)**.
Jalankan perintah di atas **di folder yang berisi `index.html`** (jangan di folder induk).

## Memperbarui
```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```
