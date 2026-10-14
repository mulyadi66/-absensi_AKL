# Rekap Absensi Siswa Digital (PresensiSiswa)

Aplikasi web modern untuk manajemen kehadiran dan rekapitulasi absensi siswa harian dan bulanan secara digital, mempermudah guru dan wali kelas dalam mencatat presensi, memantau riwayat kehadiran, serta mencetak laporan rekapitulasi bulanan berformat resmi (PDF & Excel) untuk pelaporan sekolah dan orang tua.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Hasil konfirmasi kebutuhan dari diskusi perencanaan (Phase 1):

- **Fokus Fitur Utama**: Sistem difokuskan secara mendalam pada input absensi harian yang efisien, manajemen multi-kelas, serta rekapitulasi kehadiran bulanan otomatis yang akurat. (Fitur WhatsApp disediakan dalam bentuk tautan praktis *Direct WhatsApp Web/App* ke wali murid untuk siswa yang tidak hadir, tanpa mewajibkan gateway API berbayar).
- **Format Laporan & Pencetakan**: Menyediakan dua format output:
  1. **Cetak PDF Resmi Standar Sekolah**: Format matriks absensi bulanan lengkap dengan Kop Surat sekolah yang dapat disesuaikan, persentase kehadiran (Hadir, Sakit, Izin, Alpa, Terlambat), dan kolom tanda tangan Wali Kelas serta Kepala Sekolah.
  2. **Ekspor Excel (XLSX / CSV)**: Data mentah dan rekapitulasi siap olah di aplikasi spreadsheet.
- **Cakupan Pengelolaan**: Multi-kelas dinamis (dapat menambah kelas, mengedit siswa, import/export data siswa batch, serta filter presensi berdasarkan tanggal, bulan, dan tahun ajaran).

---

### 1. Overview & Core Concept

- **Tujuan Aplikasi**: Menggantikan buku absensi kertas manual yang rawan rusak dan memakan waktu saat rekap bulanan dengan sistem presensi web digital interaktif.
- **Pengguna Utama**: Guru mata pelajaran, wali kelas, staf tata usaha sekolah, serta pimpinan sekolah/orang tua murid yang menerima laporan.
- **Nilai Tambah Utama**: 
  - Guru dapat mengabsen satu kelas dalam waktu kurang dari 1 menit dengan fitur *"Tandai Semua Hadir"* lalu tinggal mengubah siswa yang sakit/izin/alpa.
  - Perhitungan otomatis persentase kehadiran dan akumulasi rekapitulasi bulanan tanpa kalkulasi manual.
  - Cetak dokumen PDF yang rapi, berorientasi lanskap, dan langsung siap cetak atau simpan ke PDF dari browser.

---

### 2. User Experience & Visual Design

#### Alur Pengguna (User Flows):
1. **Dashboard Ringkasan**: Menampilkan metrik kehadiran hari ini (Total Siswa, Persentase Hadir, Sakit, Izin, Alpa), grafik tren kehadiran mingguan, dan pilihan akses cepat per kelas.
2. **Pencatatan Absensi Harian (Presensi View)**:
   - Pilih Kelas dan Tanggal.
   - Tabel interaktif siswa dengan tombol segmented status kehadiran: **H (Hadir)**, **S (Sakit)**, **I (Izin)**, **A (Alpa)**, **T (Terlambat)** + catatan keterangan.
   - Tombol satu klik: *"Semua Hadir"* untuk efisiensi waktu guru.
   - Tombol aksi cepat *"Hubungi Ortu (WA)"* yang otomatis membuka WhatsApp dengan draf pesan sopan bagi siswa yang berstatus Alpa/Sakit.
3. **Rekapitulasi Bulanan (Matrix Grid View)**:
   - Pemilihan Kelas, Bulan, dan Tahun.
   - Tampilan kisi matriks tanggal 1 s/d 31 (hari Minggu/libur ditandai secara visual).
   - Kolom total rekapitulasi (Total H, S, I, A, T) dan persentase kehadiran per siswa.
4. **Cetak & Ekspor Laporan**:
   - Tampilan Pratinjau Cetak (Print Preview Modal) berformat resmi dinas pendidikan/sekolah lengkap dengan kop sekolah, data periode, tabel matriks rapi, dan blok tanda tangan.
   - Tombol cetak langsung via dialog print browser (dioptimalkan dengan media CSS `@media print`) dan tombol unduh file spreadsheet.
5. **Manajemen Siswa & Kelas**:
   - Tambah/edit kelas dan daftar siswa (NISN, Nama, Jenis Kelamin, No. HP Wali Murid).
   - Contoh data awal (seed demo data) agar aplikasi langsung dapat dicoba secara instan.

#### Arah Visual & Desain UI:
- **Aesthetic Direction**: EdTech SaaS yang bersih, profesional, dan berfokus pada keterbacaan data tabel. Menghindari elemen visual berlebihan (anti-slop, zero-pill metadata).
- **Tipografi**:
  - Teks Utama & Antarmuka: `Plus Jakarta Sans` / modern sans-serif.
  - Angka & Data Metrik: `tabular-nums` atau `font-mono` untuk keselarasan vertikal nilai numerik pada tabel absensi.
- **Palet Warna**:
  - Netral: Bersih, latar belakang kanvas putih (`#FFFFFF`) dan permukaan abu-abu sangat lembut (`#F8FAFC`, border `#E2E8F0`).
  - Aksen Utama: Biru profesional institusi pendidikan (`#1D4ED8` / Tailwind `blue-700`).
  - Status Semantik Kehadiran:
    - Hadir: Emerald (`#059669` / `emerald-600`)
    - Izin: Biru Muda (`#0284C7` / `sky-600`)
    - Sakit: Oranye/Kuning hangat (`#D97706` / `amber-600`)
    - Alpa: Merah Tegas (`#DC2626` / `rose-600`)
    - Terlambat: Ungu netral (`#7C3AED` / `violet-600`)

---

### 3. Key Product Decisions & Trade-Offs

- **Penyimpanan Data Lokal Persisten (LocalStorage + Export/Import JSON)**:
  - *Keputusan*: Menggunakan state management terpusat yang otomatis tersimpan di LocalStorage peramban dengan fitur cadangan (backup) dan pemulihan (restore) berkas JSON.
  - *Alasan*: Pengguna dapat langsung memakai aplikasi di sekolah mana pun secara instan tanpa perlu repot login/konfigurasi server database berbayar, namun data tetap tersimpan aman dan tidak hilang saat refresh browser.
- **Mekanisme Cetak PDF Resmi**:
  - *Keputusan*: Menggunakan CSS Print Stylesheet khusus (`@media print`) yang presisi untuk kertas A4/F4 lanskap.
  - *Alasan*: Menghasilkan cetakan yang sangat tajam tanpa kompresi pixel (vektor teks asli peramban), kompatibel dengan fitur "Save as PDF" bawaan sistem operasi, dan tidak membebani browser dengan library PDF renderer yang berat atau sering error formatting.
- **Pesan Cepat WhatsApp (Click to Chat)**:
  - *Keputusan*: Menyertakan helper tombol WA cepat dengan template teks resmi: *"Yth. Bapak/Ibu Wali dari [Nama Siswa], kami menginformasikan bahwa ananda hari ini [Tanggal] tercatat [Status]..."*.
  - *Alasan*: Solusi paling aman, bebas biaya langganan API gateway, dan memberi wewenang pada guru untuk mengecek sebelum terkirim.

---

### 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    PresensiSiswa Web App                     │
├──────────────────────────────────────────────────────────────┤
│  Top Navigation: Brand · Kelas Active · Periode · Ekspor     │
├──────────────────────────────┬───────────────────────────────┤
│ Sidebar Navigation           │ Main Content Viewport         │
│  - Dashboard Ringkasan       │                               │
│  - Input Absensi Harian      │  [ Dynamic View Renderer ]    │
│  - Rekapitulasi Bulanan      │  - Daily Attendance Table     │
│  - Data Kelas & Siswa        │  - Monthly Matrix Grid        │
│  - Pengaturan & Kop Sekolah  │  - Official Print Preview     │
└──────────────────────────────┴───────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       Local State Store              Persistent Layer
     (Zustand / React State)       (LocalStorage + JSON Sync)
               │                               │
               ▼                               ▼
      Cetak PDF (@media print)       Ekspor Excel/Spreadsheet
```

#### Entitas Data Utama:
1. `ClassRoom`: ID, Nama Kelas (misal: "Kelas 7A"), Tingkat, Tahun Ajaran, Nama Wali Kelas.
2. `Student`: ID, ClassID, NISN/NIS, Nama Lengkap, Jenis Kelamin (L/P), Nama Wali, No HP Wali.
3. `AttendanceRecord`: ID, ClassID, StudentID, Tanggal (`YYYY-MM-DD`), Status (`hadir` | `sakit` | `izin` | `alpa` | `terlambat`), Catatan.
4. `SchoolProfile`: Nama Sekolah, NPSN, Alamat, Nama Kepala Sekolah, NIP Kepala Sekolah, NIP Wali Kelas, Logo/Kop.

---

### Langkah Implementasi Selanjutnya
Setelah rencana disetujui:
1. Menyiapkan struktur tipe data TypeScript dan state store persisten.
2. Membangun komponen UI: Header, Sidebar, Dashboard statistik kehadiran.
3. Membangun modul Input Absensi Harian dengan aksi cepat status dan WA link.
4. Membangun modul Rekapitulasi Bulanan berbentuk matriks kalender dan persentase kehadiran.
5. Membangun modul Dokumen Siap Cetak PDF (Kop Resmi & Tanda Tangan) dan ekspor spreadsheet.
6. Memverifikasi fungsionalitas dan memastikan aplikasi berjalan tanpa error kompilasi.
