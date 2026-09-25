# akun-try-out-tka

# Akun Try Out TKA - Lembimjar Neutron Yogyakarta 🚀

Aplikasi web statis (*serverless*) berbasis HTML, CSS, dan JavaScript yang dirancang khusus untuk mendistribusikan informasi kredensial akun peserta Try Out (User ID, Password, Token Wajib, Token Minat) secara cepat, ringan, dan mudah tanpa memerlukan *backend* atau *database*.

Aplikasi ini dioptimalkan untuk di-host secara gratis menggunakan **GitHub Pages** dengan pendekatan *Static CMS* (Data JSON).

## ✨ Fitur Utama

### 👦 Sisi Peserta (Halaman Publik)
* **Tanpa Login:** Peserta tidak perlu login untuk melihat akun, cukup mencari nama mereka.
* **Pencarian Cerdas:** Pencarian nama baru akan memicu hasil setelah minimal 3 karakter diketik (mencegah *dumping* data).
* **Validasi Keamanan:** Peringatan "SweetAlert" agar peserta memastikan mereka tidak salah memilih nama.
* **One-Click Copy:** Tombol salin untuk masing-masing kredensial (User ID, Password, Token) atau salin semua sekaligus.
* **Integrasi Link:** Tombol untuk langsung membuka link pengerjaan Try Out di tab baru.

### 👨‍💻 Sisi Admin (Panel Kontrol)
* **Login Statis:** Gerbang masuk aman berbasis *Session Storage* browser.
* **API Data Sekolah:** Pencarian otomatis data sekolah (NPSN, Nama, Alamat) terintegrasi dengan API Kemdikbud (`sekolah.devapi.id`), lengkap dengan fitur *fallback* manual.
* **Pengaturan Jadwal TO:** Konfigurasi link Try Out, tanggal, waktu buka/tutup, durasi, dan Token.
* **Import Excel (XLSX):** Membaca data peserta langsung dari file Excel dan menampilkannya di *DataTables* yang interaktif tanpa perlu koneksi server.
* **Generate JSON:** Sistem akan mengubah data inputan Admin menjadi file `.json` siap unduh.

## 🛠️ Teknologi yang Digunakan

* **Struktur & Styling:** HTML5, Tailwind CSS (via CDN), Google Fonts (Nunito).
* **Interaktivitas:** Vanilla JavaScript (ES6+).
* **Libraries Utama:** 
  * [SweetAlert2](https://sweetalert2.github.io/) (Pop-up modern)
  * [SheetJS / xlsx](https://sheetjs.com/) (Membaca file Excel di sisi *client*)
  * [DataTables](https://datatables.net/) (Tabel data admin interaktif)
  * [jQuery](https://jquery.com/) (Kebutuhan khusus DataTables)
* **Hosting / Deployment:** GitHub Pages.

## 📂 Struktur Direktori

```text
akun-try-out-tka/
│
├── index.html                 # Halaman utama (Pencarian akun peserta)
│
├── assets/
│   ├── css/
│   │   ├── style.css          # Styling custom publik
│   │   └── admin.css          # Styling custom admin
│   ├── js/
│   │   ├── app.js             # Global script (UI responsif mobile)
│   │   ├── public.js          # Logika halaman peserta
│   │   ├── admin.js           # Logika login & auth admin
│   │   ├── sekolah.js         # Logika fetch API sekolah
│   │   └── peserta.js         # Logika baca Excel & TO
│   └── img/
│       └── logo.png           # Logo aplikasi/lembaga
│
├── pages/
│   └── admin/
│       ├── login.html         # Halaman login admin
│       ├── dashboard.html     # Dashboard utama admin
│       ├── sekolah.html       # Halaman pengaturan sekolah
│       └── peserta.html       # Halaman pengaturan TO & import peserta
│
└── src/
    ├── admin_user.json        # Data kredensial login admin
    ├── data_sekolah.json      # Data output informasi sekolah
    ├── data_tryout.json       # Data output konfigurasi TO
    └── data_peserta.json      # Data output akun peserta
