# 📘 Panduan Instalasi — Landing Page Sekolah + PPDB Online

Paket ini terdiri dari **dua bagian yang dipasang di dua tempat berbeda**:

| Bagian | Isi | Dipasang di | Berkas |
|---|---|---|---|
| **Backend** (otak & database) | API, penyimpanan data, notifikasi WhatsApp/email, CRM | **Google Apps Script** (gratis, akun Google Anda) | `Kode.gs` `Setup.gs` `Konten.gs` `Ppdb.gs` `Notifikasi.gs` `CRM.gs` `Migrasi.gs` + `appsscript.json` |
| **Frontend** (tampilan website + panel admin) | `index.html`, `admin.html`, `css/`, `js/` | **GitHub Pages** (gratis) | `landing-page-sekolah-frontend.zip` |

> ⏱ Perkiraan waktu: **45–60 menit** untuk pemasangan pertama. Kerjakan **berurutan** — Bagian A → B → C → D → E.

---

## Daftar Isi
- [Bagian A — Pasang Backend di Google Apps Script](#bagian-a--pasang-backend-di-google-apps-script)
- [Bagian B — Buat Google Client ID (agar bisa login dengan Google)](#bagian-b--buat-google-client-id)
- [Bagian C — Pasang Frontend di GitHub Pages](#bagian-c--pasang-frontend-di-github-pages)
- [Bagian D — Login pertama & pengisian awal](#bagian-d--login-pertama--pengisian-awal)
- [Bagian E — Uji coba menyeluruh (10 menit)](#bagian-e--uji-coba-menyeluruh)
- [Cara memakai fitur-fitur utama](#cara-memakai-fitur-fitur-utama)
- [Pemecahan masalah](#pemecahan-masalah)
- [Keamanan, kuota, dan batasan](#keamanan-kuota-dan-batasan)
- [Memperbarui aplikasi](#memperbarui-aplikasi)

---

## Bagian A — Pasang Backend di Google Apps Script

> 💡 Gunakan **akun Google milik sekolah** yang akan menjadi pemilik data (database Google Sheets, folder Google Drive, dan pengirim email akan atas nama akun ini).

### A1. Buat proyek Apps Script
1. Buka **https://script.google.com** → klik **Proyek baru** (*New project*).
2. Klik nama proyek di kiri atas (“Untitled project”) → ganti menjadi `PPDB Sekolah` → **Rename**.

### A2. Tampilkan berkas manifes
1. Klik ikon **⚙️ Setelan Proyek** (Project Settings) di sisi kiri.
2. Centang **“Tampilkan berkas manifes ‘appsscript.json’ di editor”** (*Show "appsscript.json" manifest file in editor*).
3. Kembali ke **Editor** (ikon `< >`).

### A3. Tempel 8 berkas (satu per satu)
Di panel **Berkas** (kiri) sudah ada `Kode.gs` berisi `function myFunction() {}`. Lakukan untuk **setiap** berkas yang saya kirim:

| Berkas yang saya kirim | Yang Anda lakukan di editor |
|---|---|
| `Kode.gs` | **Hapus semua isi** `Kode.gs` bawaan → tempel isi berkas ini |
| `Setup.gs` | Klik **＋** → **Skrip** → beri nama `Setup` → tempel |
| `Konten.gs` | **＋** → Skrip → nama `Konten` → tempel |
| `Ppdb.gs` | **＋** → Skrip → nama `Ppdb` → tempel |
| `Notifikasi.gs` | **＋** → Skrip → nama `Notifikasi` → tempel |
| `CRM.gs` | **＋** → Skrip → nama `CRM` → tempel |
| `Migrasi.gs` | **＋** → Skrip → nama `Migrasi` → tempel |
| `appsscript.json` | Klik berkas `appsscript.json` yang sudah ada → **hapus semua isinya** → tempel |

> ⚠️ Nama berkas tidak harus persis, tetapi **semua 7 berkas `.gs` harus ada**. Jika ada yang terlewat, setup akan menampilkan galat “is not defined”.
> Tekan **Ctrl+S** (💾) setelah menempel semuanya.

### A4. Jalankan setup otomatis (SEKALI)
1. Di bagian atas editor, pilih berkas **`Setup.gs`**.
2. Di dropdown fungsi (sebelah tombol ▶ **Jalankan**), pilih **`setupAppEnvironment`**.
3. Klik **▶ Jalankan**.
4. Muncul **“Perlu otorisasi”** → **Tinjau izin** → pilih akun Anda → jika muncul peringatan *“Google belum memverifikasi aplikasi ini”*: klik **Lanjutan (Advanced)** → **Buka PPDB Sekolah (tidak aman)** → **Izinkan**.
   *(Peringatan ini normal: aplikasi ini milik Anda sendiri, bukan aplikasi publik.)*
5. Tunggu hingga log di bawah menampilkan **“✅ Setup selesai.”** (±20–40 detik).

### A5. ⚠️ CATAT akses darurat — hanya tampil SEKALI
Di panel **Log eksekusi** (*Execution log*) akan muncul seperti:

```
🔐 AKSES DARURAT (catat SEKARANG — hanya tampil sekali, ganti setelah login pertama)
   Nama pengguna : darurat
   Kata sandi    : xxxxxxxxxxxxxxxx
   Halaman login : admin.html#darurat
```
**Salin kata sandi tersebut ke tempat aman** (pengelola kata sandi / catatan pribadi). Jika hilang: jalankan fungsi **`resetAksesDarurat`** untuk membuat yang baru.

Setup juga otomatis membuat:
- 📊 Spreadsheet **“🗃️ Database — School Profile & PPDB Hub”** (22 sheet) + folder Google Drive **“📁 School Profile & PPDB Hub”** (subfolder `Branding`, `Konten`, `Berkas_Pendaftar` — berkas pendaftar bersifat **privat**).
- Akun Anda sebagai **Superadmin** pertama.
- Data contoh (dummy) agar website langsung terlihat penuh. Bisa dihapus satu klik nanti.
- Trigger pemroses notifikasi (tiap 1 menit) dan perawatan harian.

> Aman dijalankan ulang kapan saja — tidak menimpa data maupun rahasia.

### A6. Terbitkan sebagai Aplikasi Web
1. Klik **Terapkan (Deploy)** → **Penerapan baru (New deployment)**.
2. Ikon ⚙️ di samping “Pilih jenis” → **Aplikasi web (Web app)**.
3. Isi:
   - **Deskripsi:** `v1`
   - **Jalankan sebagai (Execute as):** **Saya (Me)**
   - **Siapa yang memiliki akses (Who has access):** **Siapa saja (Anyone)**
4. Klik **Terapkan (Deploy)** → salin **URL aplikasi web** yang berakhiran **`/exec`**.

```
https://script.google.com/macros/s/AKfycb...panjang.../exec
```
Simpan URL ini — dipakai di Bagian C.

> ✅ **Uji cepat:** tempel URL itu di browser. Anda akan melihat teks JSON diawali `{"success":true,"data":{"setting":...`. Jika muncul halaman login Google / “Anda memerlukan akses”, ulangi A6 dan pastikan **Siapa saja (Anyone)**.

---

## Bagian B — Buat Google Client ID

Agar admin & panitia bisa login dengan tombol **“Masuk dengan Google”**. *(Bisa dilewati dulu: Anda tetap dapat masuk memakai akses darurat dan menyelesaikan bagian ini belakangan.)*

> Anda perlu tahu **alamat website** lebih dulu: `https://USERNAME.github.io` (USERNAME = nama pengguna GitHub Anda; lihat Bagian C1).

1. Buka **https://console.cloud.google.com** → login dengan akun yang sama.
2. Buat proyek: pilih menu proyek di atas → **Proyek baru** → nama `PPDB Sekolah` → **Buat**.
3. Menu ☰ → **APIs & Services** → **OAuth consent screen** (di tampilan baru: **Google Auth Platform**).
   - Jenis pengguna: **Eksternal (External)** → isi *nama aplikasi* (mis. “Panel Admin Sekolah”), *email dukungan*, *email kontak developer* → simpan.
   - Jika diminta, tambahkan akun Gmail panitia di **Test users** (atau **Publikasikan aplikasi** agar semua akun dapat dipakai).
4. **APIs & Services → Credentials (Kredensial) → ＋ Create credentials → OAuth client ID**.
   - **Application type:** **Web application**
   - **Name:** `Panel Admin`
   - **Authorized JavaScript origins** → **＋ Add URI**:
     - `https://USERNAME.github.io`  ← **hanya domain, tanpa `/nama-repo` dan tanpa garis miring di akhir**
     - *(opsional untuk uji lokal)* `http://localhost:8080`
   - **Authorized redirect URIs:** *kosongkan* (tidak dipakai).
   - Klik **Create**.
5. Salin **Client ID** (berakhiran `.apps.googleusercontent.com`). *Client Secret tidak diperlukan.*
6. Nanti, setelah login darurat (Bagian D): **Pengaturan → Keamanan & Akses → Google Client ID** → tempel → **Simpan**.

> ℹ️ Tampilan Google Cloud sering berubah; nama menu bisa sedikit berbeda, tetapi urutannya sama: *consent screen → OAuth client ID (Web) → origin → salin Client ID*.

---

## Bagian C — Pasang Frontend di GitHub Pages

> 📌 **Aturan emas:** folder hasil ekstraksi ZIP **adalah** folder yang di-`git init`. Jangan masuk lebih dalam, jangan naik satu tingkat. Di dalam folder itu, **`index.html` harus terlihat di baris paling atas**.

### C1. Siapkan akun & Git
- Belum punya akun? Daftar di **https://github.com**. *Username* Anda menjadi bagian alamat website (`username.github.io`) — pilih dengan sadar.
- Pasang **Git**: Windows → https://git-scm.com/download/win (pengaturan bawaan); Mac → ketik `git --version` di Terminal; Linux → `sudo apt install git`. Cek: `git --version`.
- Sekali seumur komputer:
  ```bash
  git config --global user.name "Nama Anda"
  git config --global user.email "email-akun-github@contoh.com"
  ```

### C2. Ekstrak ZIP dan isi alamat API  ⬅️ jangan lewati
1. Ekstrak **`landing-page-sekolah-frontend.zip`** → muncul folder **`landing-page-sekolah-frontend`**. Isinya harus seperti ini:
   ```
   landing-page-sekolah-frontend\        ← ✅ INILAH folder kerja (git init di sini)
   ├── index.html                        ← harus terlihat langsung di sini
   ├── admin.html
   ├── README.md
   ├── PANDUAN-INSTALASI.md
   ├── css\
   │   ├── style.css
   │   └── admin.css
   └── js\
       ├── config.js                     ← ✏️ akan diedit
       ├── icons.js  util.js  formui.js  fx.js  bee.js  ppdb.js  public.js
       └── admin-core.js  admin-a.js  admin-b.js  admin-c.js
   ```
2. Buka **`js/config.js`** dengan Notepad/VS Code. Ganti tulisan placeholder dengan URL `/exec` dari **A6**:
   ```js
   window.APP_CONFIG = {
     API_URL: 'https://script.google.com/macros/s/AKfycb...panjang.../exec',
     VERSION: '1.0.0'
   };
   ```
   Simpan. *(URL ini bukan rahasia; semua rahasia ada di server Apps Script.)*

### C3. Buat repository kosong
github.com → tombol **＋** → **New repository** → nama mis. `website-sekolah` → pilih **Public** → **JANGAN** centang README/.gitignore/license → **Create repository**. Biarkan halamannya terbuka.

### C4. Buka terminal DI folder yang benar
- **Windows:** buka folder `landing-page-sekolah-frontend` di File Explorer → klik **address bar** → ketik `powershell` → Enter.
- **Mac/Linux:** `cd /jalur/ke/landing-page-sekolah-frontend`

**Verifikasi dulu (wajib):**
```powershell
dir          # Windows PowerShell
ls -la       # Mac / Linux / Git Bash
```
✅ Harus tampil **`index.html`**, `admin.html`, folder `css`, folder `js`.
❌ Jika yang tampil hanya folder `landing-page-sekolah-frontend` (atau `frontend`/`backend`) → Anda **satu tingkat terlalu tinggi**: `cd landing-page-sekolah-frontend` dulu.
❌ Tidak boleh ada berkas `.gs` di sini.

### C5. Push — satu perintah per baris
```bash
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/website-sekolah.git
git push -u origin main
```
- Ada **titik** di `git add .` — jangan hilang.
- Saat diminta *Username* → username GitHub. *Password* → **Personal Access Token** (bukan kata sandi akun). Saat menempel token layar terlihat kosong — itu normal; tekan Enter.
- **Cara membuat token:** https://github.com/settings/tokens → *Generate new token (classic)* → centang **repo** → Generate → salin `ghp_...` (hanya tampil sekali).
- Alternatif tanpa terminal/token: **GitHub Desktop** → *Add Local Repository* → pilih folder → *Publish repository*.
- ⛔ **Jangan** memakai tombol “Upload files” di web GitHub — struktur folder `css/` dan `js/` akan rusak (CSS/JS 404).

### C6. Aktifkan GitHub Pages
Repo di github.com → **Settings → Pages**:

| Kolom | Isi |
|---|---|
| Source | **Deploy from a branch** |
| Branch | **main** · **/ (root)** |
| Enforce HTTPS | ✅ centang |

**Save** → tunggu 1–2 menit → muncul *“Your site is live at https://USERNAME.github.io/website-sekolah/”*.

- Website: `https://USERNAME.github.io/website-sekolah/`
- Panel admin: `https://USERNAME.github.io/website-sekolah/admin.html`

> ⚠️ **Origin untuk Bagian B** adalah `https://USERNAME.github.io` saja (tanpa `/website-sekolah`).
> Jika memakai *domain khusus* (mis. `ppdb.sekolahku.sch.id`), tambahkan domain itu juga ke *Authorized JavaScript origins*.

### C7. Cek tampil
Buka website. Jika kosong/galat tekan **F12 → Console**. Lihat [Pemecahan masalah](#pemecahan-masalah).

---

## Bagian D — Login pertama & pengisian awal

1. Buka `…/admin.html#darurat` → masuk dengan **darurat** + kata sandi dari A5.
2. **Pengaturan → Keamanan & Akses:**
   - Tempel **Google Client ID** (Bagian B) → **Simpan**.
   - **Ganti kredensial darurat** dengan nama pengguna & kata sandi baru (min. 12 karakter, huruf + angka). Catat di tempat aman.
3. Keluar, lalu buka `admin.html` → coba **“Masuk dengan Google”** memakai email Anda (sudah terdaftar sebagai Superadmin).
4. Tambah rekan panitia di **Role & Akses → Tambah Pengguna**:
   - **Superadmin** = semua fitur.
   - **Admin** = hanya *Pengaturan* dan *Role & Akses*.

### Daftar isian awal (urut yang disarankan)
| # | Menu | Yang diisi |
|---|---|---|
| 1 | Pengaturan Umum | Nama sekolah, tagline, logo, warna, akreditasi, statistik, embed peta |
| 2 | Kontak & Peta | Alamat, telepon, **nomor WhatsApp** (untuk tombol chat), email, sosial media |
| 3 | Hero & Slideshow | Ganti 3 slide contoh; unggah **beberapa foto** per slide |
| 4 | Profil, Keunggulan, Fasilitas, Prestasi, Kegiatan, Berita, Testimoni, Biaya | Ganti data contoh dengan data asli |
| 5 | Periode PPDB | Nama, tahun ajaran, tanggal buka/tutup, kuota, saklar |
| 6 | Form Builder | Sesuaikan isian formulir → **Simpan & Publikasikan** |
| 7 | Notifikasi → Konfigurasi | Token Fonnte, URL website, nyalakan WhatsApp/Email, uji kirim |
| 8 | Pengaturan → Zona Berbahaya | **Hapus Semua Data Dummy** setelah data asli siap |

---

## Bagian E — Uji coba menyeluruh

Lakukan ini sekali setelah pemasangan untuk memastikan semuanya terhubung (±10 menit):

1. ☐ Website terbuka, hero **berganti slide sendiri**, kartu fasilitas **menampilkan slideshow**.
2. ☐ Lebah muncul & mengikuti kursor; tombol 🐝 di navbar dapat mematikannya.
3. ☐ Tombol WhatsApp hijau mengambang → klik → pilihan obrolan → membuka `wa.me` ke nomor Anda.
4. ☐ Admin → **Periode PPDB** → pastikan status **Dibuka**.
5. ☐ Buka website → **Daftar PPDB** → isi formulir uji (unggah PDF/JPG kecil) → kirim → muncul **token**.
6. ☐ Admin → **Daftar Pendaftar** → data muncul, badge sidebar bertambah, **Detail → Berkas → Lihat** membuka berkas.
7. ☐ Website → **Cek Status** → tempel token → status tampil (nama disamarkan).
8. ☐ Admin → ubah status ke **Diverifikasi** (centang *kirim notifikasi*) → **Notifikasi → Log** → status *Terkirim* (jika WA/Email aktif).
9. ☐ Admin → **Periode PPDB → Tutup** → coba kirim formulir lagi: **harus ditolak** meskipun formulir terlihat.
10. ☐ Kembalikan saklar ke **Ikuti jadwal** / **Buka**.

---

## Cara memakai fitur-fitur utama

### 🖼️ Slideshow otomatis (hero & kartu)
Di form **Hero**, **Fasilitas**, **Prestasi**, **Kegiatan**, **Berita**: bidang *Gambar* menerima **banyak foto** (tombol **Tambah**, bisa pilih beberapa sekaligus, geser urutan dengan ‹). **1 foto = gambar diam; ≥2 foto = slideshow otomatis.** Foto dikompres otomatis dan disimpan di Google Drive sekolah (folder `Konten`).
Kecepatan hero: *Pengaturan → Tema & Efek → Interval slideshow hero*.

### 💬 Testimoni (kartu flip)
Menu **Testimoni**: isi *Kutipan singkat* (sisi depan) dan *Testimoni lengkap* (sisi belakang & pop-up). Kartu berputar bergantian otomatis; menyala mengikuti kursor; **klik** (atau Enter) membuka pop-up lengkap.

### 🐝 Lebah interaktif
Mengikuti kursor (atau jari di HP), hinggap saat kursor diam, berputar saat diklik. Pengunjung dapat mematikannya lewat ikon 🐝 di navbar (pilihan diingat). Admin dapat menonaktifkan total di *Pengaturan → Tema & Efek*. Pengunjung dengan pengaturan “kurangi gerakan” di perangkatnya otomatis tidak melihat lebah kecuali menyalakannya sendiri.

### 📆 Periode & kuota
Saklar tiga posisi: **Buka** (paksa buka) · **Ikuti jadwal** (otomatis sesuai tanggal) · **Tutup**. Kuota penuh = otomatis ditutup. Server **selalu** memeriksa ulang saat formulir dikirim.

### 🧩 Form Builder
Seret field di kolom kiri untuk mengurutkan; klik field untuk mengubah label, tipe, wajib, pilihan, validasi (min/maks/regex), dan aturan berkas (PDF/JPG/PNG, ukuran maks). Field ber-ID **`nama`, `email`, `no_wa` wajib ada** (dipakai notifikasi & cek status). Setiap simpan = **versi baru**; data pendaftar lama tetap tampil dengan label versinya.

### 🔔 Notifikasi WhatsApp & Email
1. Daftar di **fonnte.com** → sambungkan nomor WhatsApp sekolah → salin **token** perangkat.
2. Admin → **Notifikasi → Konfigurasi** → tempel token → **Simpan** → **Cek perangkat** → **Kirim uji** ke nomor Anda sendiri.
3. Isi **URL website** (agar tautan “Cek Status” ikut di pesan) → nyalakan saklar **WhatsApp** dan/atau **Email**.
4. Edit **Template** per peristiwa (pendaftaran masuk, diverifikasi, diterima, ditolak, cadangan); variabel: `{nama} {token} {status} {catatan} {periode} {link_cek} {institusi}`.

Pendaftar **tidak menunggu** pengiriman: pesan masuk antrean dan dikirim dalam hitungan detik–1 menit. Yang gagal dicoba ulang otomatis hingga 3×, lalu tampil di **Log** dengan tombol **Ulangi yang gagal**.

### 📣 WhatsApp Blast (pesan massal)
**Notifikasi → WhatsApp Blast**: pilih segmen/tag → *Muat Penerima* → tulis pesan (`{nama}`) → pilih **batch 10/20/50** dan **jeda** → mulai. Nomor tidak valid, ganda, **opt-out**, dan dummy otomatis dibuang. Blast tetap berjalan di server walau tab ditutup. 
> ⚠️ Kirim hanya ke kontak yang **setuju** dihubungi, mulai dari batch kecil, dan gunakan jeda ≥5 detik. Pesan massal ke nomor yang tidak mengenal Anda dapat membuat nomor WhatsApp diblokir.

### 👥 CRM Kontak
Satu daftar **Nama · Email · WhatsApp** dari pendaftar, wali, prospek (formulir “Kirim pesan” di website), staf, dan **Import CSV**. Fitur: tag, opt-out, **Cek WA** (apakah nomor terdaftar di WhatsApp), gabung duplikat, catat interaksi, ekspor Excel. Tag/opt-out/catatan **tidak pernah tertimpa** sinkronisasi.

### 📤 Ekspor Excel
Dashboard / Daftar Pendaftar / CRM → **Unduh Excel**. Dirakit di browser (membutuhkan internet untuk memuat pustaka SheetJS dari cdnjs).

### 🚚 Migrasi dari aplikasi lama
*Pengaturan → Migrasi Data*: tempel URL spreadsheet lama (harus bisa dibuka akun Anda) → pilih data → **Pindai** (tidak menulis apa pun) → periksa laporan → **Jalankan Import**. Kolom dibaca berdasarkan **nama header**; aman diulang (tidak menggandakan).

### 🧹 Menghapus data dummy
*Pengaturan → Zona Berbahaya → Hapus Semua Data Dummy*. Hanya baris bertanda dummy (termasuk pendaftar & kontak contoh) yang dihapus; **data asli, periode, dan skema formulir tidak tersentuh**.

---

## Pemecahan masalah

| Gejala | Penyebab | Solusi |
|---|---|---|
| Website tampil “**Website belum terhubung ke server**” | `API_URL` di `js/config.js` belum diisi | Isi URL `/exec` → `git add . && git commit -m "config" && git push` → Ctrl+Shift+R |
| Website kosong, Console: `CORS`/`Failed to fetch` | Aplikasi web tidak diset **Siapa saja (Anyone)**, atau URL bukan `/exec` | Terapkan ulang (A6); gunakan URL yang berakhiran `/exec` |
| Halaman **404** di GitHub Pages | `index.html` tidak di root repo (push dari folder induk) | Lihat repo di github.com: jika terlihat folder pembungkus, ulangi C4–C5 dari folder yang benar |
| Website tanpa gaya (polos), CSS/JS 404 | Berkas rata di root / diunggah via “Upload files” | Pakai terminal (C5); pastikan folder `css/` dan `js/` ada |
| `Password authentication is not supported` | Memakai kata sandi akun, bukan token | Buat **Personal Access Token** (C5) |
| `Updates were rejected` | Repo punya berkas yang tidak ada di lokal | `git pull --rebase origin main` lalu `git push` |
| Tombol Google tidak muncul / “Login Google belum dikonfigurasi” | Client ID belum diisi | Masuk darurat → Pengaturan → Keamanan |
| Google: **Error 400: origin_mismatch** | Origin belum didaftarkan / salah | Bagian B langkah 4: `https://USERNAME.github.io` (tanpa path & tanpa `/`) — tunggu beberapa menit setelah menyimpan |
| “**Email tidak terdaftar atau akses dinonaktifkan**” | Email belum ada di Role & Akses | Tambahkan lewat akun superadmin / akses darurat |
| Sandi darurat hilang | — | Editor Apps Script → jalankan `resetAksesDarurat` → lihat log |
| Akses darurat “dikunci sementara” | 5× salah dalam 15 menit | Tunggu 15 menit |
| Perubahan kode backend tidak berefek | Aplikasi web belum diterbitkan ulang | **Terapkan → Kelola penerapan → ✏️ → Versi baru → Terapkan** |
| Unggah gambar: “tidak dapat dibagikan publik” | Kebijakan Google Workspace melarang tautan publik | Atur berbagi folder `Konten` → *Siapa saja yang memiliki tautan* (atau minta admin Workspace mengizinkan) |
| Gambar admin tampil tetapi di website kosong | Berkas Drive belum publik | Sama seperti di atas |
| Notifikasi tidak terkirim | Saklar mati / token kosong / kuota Fonnte habis | Notifikasi → Konfigurasi → *Cek perangkat*; lihat pesan galat di **Log** |
| “Exceeded maximum execution time” / lambat sekali di pemakaian pertama | Apps Script “tidur” (cold start) | Wajar 2–5 dtk; trigger 1 menit menjaga tetap hangat. Cek: jalankan `cekPerforma` |
| Email tidak terkirim / kuota | Batas email harian Google (±100/hari akun biasa, ±1500 Workspace) | Lihat sisa kuota di Dashboard; gunakan WhatsApp untuk volume besar |
| Data hasil edit manual di Sheets belum tampil | Cache publik s.d. 15 menit | Ubah lewat panel admin (langsung segar), atau tunggu |
| Setup: `X is not defined` | Ada berkas `.gs` yang belum ditempel | Ulangi A3 (7 berkas) |

---

## Keamanan, kuota, dan batasan

**Keamanan (yang sudah diterapkan)**
- Token Fonnte, Client ID, rahasia sesi, dan hash sandi darurat disimpan di **Script Properties** (bukan di kode, Sheets, maupun frontend). Sheet `AppConfig` hanya catatan non-rahasia.
- Semua aksi admin diperiksa **di server** (token bertanda tangan HMAC, masa berlaku 12 jam, cek peran + status aktif tiap permintaan). Menyembunyikan menu hanyalah kosmetik.
- Formulir publik: validasi ulang di server, pemeriksaan **jenis berkas dari isi file** (bukan sekadar ekstensi), batas ukuran, honeypot anti-bot, pembatasan laju per perangkat dan global, cek duplikat, kuota dicek ulang di dalam kunci.
- Berkas pendaftar di Drive **privat**; hanya dapat dibuka lewat panel admin (dan tercatat di Audit Log).
- Cek Status hanya menampilkan nama **disamarkan**, status, dan catatan — tanpa email/NIK/WA — dengan pembatasan percobaan.
- Seluruh keluaran di-*escape* (anti-XSS); isi berita memakai Markdown ringan yang aman (tanpa HTML mentah).
- Audit Log mencatat aksi penting; kata sandi/token disamarkan otomatis.

**Kuota Google Apps Script (akun gratis, perkiraan)**
| Sumber daya | Batas harian | Catatan |
|---|---|---|
| Email (MailApp) | ±100 (Workspace ±1.500) | Dashboard menampilkan sisa kuota |
| UrlFetch (ke Fonnte) | 20.000 | Pengiriman WA digabung per batch |
| Waktu eksekusi trigger | 90 menit | Prosesor 1 menit sangat ringan |
| Ukuran sel Sheets | 5 juta sel | Cukup untuk ribuan pendaftar |

Mematikan trigger 1 menit (tetap berfungsi, hanya tanpa penghangat & pemroses latar): jalankan `matikanKeepWarm`; menyalakan lagi: `nyalakanKeepWarm`.

**Batasan yang perlu Anda ketahui**
- Gambar & berkas tampil lewat tautan thumbnail Google Drive (pihak Google dapat membatasi lalu lintas tinggi pada berkas yang sangat populer).
- WhatsApp via Fonnte adalah layanan pihak ketiga berbayar; fitur *Cek nomor WA* bergantung paket Fonnte Anda.
- Google Sign-In hanya berfungsi di alamat `https://` yang terdaftar sebagai *Authorized origin*.
- Lebah, flip, dan efek kilau memakai CSS/JS ringan; di HP lama dapat dimatikan oleh pengunjung (🐝) atau otomatis nonaktif pada mode “kurangi gerakan”.

---

## Memperbarui aplikasi

**Frontend** (tampilan): ubah berkas → dari folder proyek:
```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```
Tunggu 1–2 menit, lalu **Ctrl+Shift+R**.

**Backend** (kode `.gs`): tempel kode baru → **Ctrl+S** → **Terapkan → Kelola penerapan → ✏️ (edit) → Versi: Versi baru → Terapkan**. URL `/exec` **tidak berubah**. Lalu jalankan `setupAppEnvironment` sekali lagi bila ada versi baru yang menambah sheet/kolom (aditif & aman).

**Cadangan data:** Spreadsheet database ada di Google Drive Anda (*File → Buat salinan*) — lakukan berkala, terutama sebelum pembaruan besar.

---

## Lampiran — Struktur database (Google Sheets)

`Pengaturan` · `AppConfig` · `Hero` · `Profil` · `Keunggulan` · `Fasilitas` · `Prestasi` · `Kegiatan` · `Berita` · `Testimoni` · `Biaya` · `Kontak` · `Periode_PPDB` · `Form_Schema` · `Pendaftar` · `Notifikasi_Log` (antrean + riwayat) · `Template_Notifikasi` · `BlastWA` · `CRM_Kontak` · `CRM_Interaksi` · `Pengguna` · `Audit_Log`

Semua kolom berformat **teks** (nomor `08…` aman dari penghapusan nol di depan). Tambahkan kolom baru di sisi kanan bila perlu — kode membaca berdasarkan **nama header**, bukan urutan.
