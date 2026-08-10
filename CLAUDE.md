# SIGAP

Sistem pencatatan proyek gedung **Dinas PUPR Cipta Karya Kab. Hulu Sungai Tengah**. Laravel 13 + Inertia + React (TypeScript) + shadcn/ui. Bahasa domain (tabel, kolom, komponen, komentar) memakai **bahasa Indonesia**; kode framework tetap Inggris.

## Perintah

```bash
composer run dev          # server + vite + queue (port 8000)
php artisan test --filter=NamaTest   # iterasi cepat
composer test             # gate lengkap: pint + phpstan + seluruh test
```

Gate sebelum sesuatu dianggap selesai: **PHPStan 0 error + Pint bersih + test hijau**.

## Jangan dibaca / diedit

- `resources/js/routes/**` dan `resources/js/actions/**` — hasil generate Laravel Wayfinder, gitignored, ribuan baris. Impor saja (`import { index } from '@/routes/paket'`), jangan pernah buka atau ubah.
- `resources/js/components/ui/**` — komponen shadcn bawaan. Komponen milik proyek ada di `resources/js/components/cipta-karya/**`.

## Konvensi

- **Enum**: PHP enum backed string di `app/Enums/`, selalu punya `label()` dan `values()`. Kolom DB bertipe string biasa, bukan enum MySQL.
- **Mass assignment**: atribut `#[Fillable([...])]` di atas kelas model, bukan properti `$fillable`.
- **Komentar** menjelaskan *kenapa*, bukan *apa*. Ditulis dalam bahasa Indonesia.
- **Properti user turunan** diekspos lewat accessor + `#[Appends]` di `App\Models\User` (`role_label`, `is_admin`), lalu dipakai langsung di React — **jangan** menghitung ulang logika peran di TypeScript.
- **MySQL di semua environment.** DB dev `sigap`, DB test `sigap_testing`.
- **Dependensi seminimal mungkin** — sebelum menambah paket, cek dulu apakah bisa ditulis sendiri dengan wajar.
- Seeder bersifat **idempoten**: pola `if (Model::query()->exists()) { return; }` atau cek per-baris, karena seeder dijalankan ulang di DB dev yang sudah berisi data.

## Peran & otorisasi

`App\Enums\Role` cuma dua: `admin` dan `operator`, dan **satu-satunya bedanya adalah kelola akun** (`Role::bisaKelolaUser()` → `is_admin`). Seluruh data paket — input, unggah, verifikasi, sampai hapus paket — terbuka untuk keduanya, jadi policy data (`PaketPolicy`, `BerkasPolicy`, `ProgresPaketPolicy`, `TitikKoordinatPaketPolicy`) mengembalikan `true` dan gerbang sebenarnya tinggal middleware `auth`. Policy-nya tetap dipertahankan sebagai tempat berlabuh kalau pembatasan per-paket kelak muncul; **jangan** menambah pengecekan peran baru di luar `UserPolicy` tanpa alasan yang jelas. Peran `pengawas` & `auditor` pernah ada tapi dihapus: di dinas, yang menginput dan yang memverifikasi ternyata orang yang sama.

Kolom `users.role` **tidak fillable** (diset eksplisit di `UserController`), default `operator`.

**Pendaftaran mandiri ditutup** — `Features::registration()` dimatikan di `config/fortify.php`, jadi akun hanya lahir dari layar Pengguna (`/pengguna`, admin saja). Konsekuensinya harus selalu ada minimal satu admin, dan itu dijaga dua tempat: `UserPolicy::update`/`delete` menolak sasaran diri sendiri, dan `ProfileDeleteRequest` menolak admin terakhir menghapus profilnya sendiri. Akun yang namanya sudah melekat di berkas/progres/koordinat **tidak bisa dihapus** — foreign key-nya RESTRICT, jadi `UserController::destroy` menolaknya lebih awal dengan pesan, bukan galat 500. Belum ada konsep "nonaktif" untuk staf yang pindah.

Otorisasi tetap ditegakkan di **dua lapis**: Policy/FormRequest di backend, **dan** penyembunyian menu di frontend lewat `is_admin`. Keduanya wajib — backend saja tidak cukup untuk UX, frontend saja tidak aman.

## Arsitektur yang perlu diketahui

- **`berkas`** — tabel lampiran polimorfik dipakai dua konsumen dengan semantik berbeda:
  - `dokumen_paket` (checklist dokumen) → **berversi**, `is_terkini` diarsipkan tiap unggah baru.
  - `progres_paket` (foto progres) → **tidak berversi**, semua foto satu entri berlaku sekaligus.
  Alias morph didaftarkan di `AppServiceProvider::configureDefaults`. File disimpan di disk privat `local`, diunduh lewat route `berkas.download` (streaming), bukan URL publik. Untuk dipratinjau di dalam halaman (PDF di `<iframe>`, foto di `<img>`) ada route kedua `berkas.preview` yang menyajikannya `inline` — disposisinya tidak bisa dua-duanya dalam satu respons. Jenis yang boleh inline dibatasi daftar putih PDF/JPEG/PNG di controller: menyajikan HTML/SVG unggahan secara inline berarti ia berjalan pada origin aplikasi.
- **Verifikasi** (`App\Enums\StatusVerifikasi`: `diajukan → diverifikasi | ditolak`):
  - Untuk dokumen: unggah otomatis menyetel `dokumen_paket.status = ada`; **menolak mengembalikannya ke `belum`**. Status verifikasi adalah lapisan tambahan, bukan gerbang.
  - Untuk progres: yang diverifikasi adalah **klaim persentasenya**, bukan tiap foto. `berkas.status_verifikasi` pada foto progres sengaja tidak dipakai.
  - Menolak wajib menyertakan `catatan_verifikasi`.
  - Polanya dibagikan lewat `App\Models\Concerns\DapatDiverifikasi` (casts, kolom mass-assignment, relasi `diverifikasiOleh`, `tandaiVerifikasi()`) dan `App\Http\Requests\VerifikasiRequest` (aturan validasi + `keputusan()`). Konsumen baru cukup `use DapatDiverifikasi` di model dan `extends VerifikasiRequest` dengan satu method `subjek()`. Kolomnya seragam di semua tabel: `status_verifikasi`, `catatan_verifikasi`, `diverifikasi_by`, `diverifikasi_pada`. Efek samping khas tiap model tetap di controller masing-masing.

- **Kerangka layar** — semua halaman Cipta Karya dibungkus `CiptaKaryaShell` (`components/cipta-karya/shell.tsx`): kanvas hangat `ckColors.canvas` dengan satu panel putih membulat yang mengambang di atasnya, berisi `CiptaKaryaTopbar` lalu `<main>`. Jangan menyusun ulang chrome-nya per halaman — dulu pernah tersalin tujuh kali. Navigasinya **horizontal di topbar**, bukan sidebar (sidebar 246px dihapus supaya lebar penuh panel bisa dipakai grid kartu di Ringkasan); kontrol khas halaman seperti kolom cari masuk lewat prop `aksi`. Item menunya di `MENU` (`topbar.tsx`); yang bertanda `adminSaja` — sejauh ini cuma "Pengguna" — disaring pakai `auth.user.is_admin`. Halaman yang memakai shell ini **tidak boleh** dibungkus layout Inertia lagi: di `resources/js/app.tsx` defaultnya `null`, dan hanya `auth/*` (AuthLayout) yang disebut eksplisit. Dulu sebaliknya — defaultnya `AppLayout` dengan daftar pengecualian — dan halaman Pengguna yang baru langsung kebagian dua chrome bertumpuk: sidebar shadcn lama membungkus panel CK. Chrome lama itu (`AppLayout`, `AppShell`, `AppSidebar`, `Breadcrumbs`, `NavMain`/`NavUser`, `ui/sidebar`, `ui/breadcrumb`, beserta cookie `sidebar_state` dan prop `sidebarOpen`) sudah **dihapus seluruhnya** — jangan dihidupkan lagi; kalau butuh kerangka baru, turunkan dari `CiptaKaryaShell`. Yang menggulir adalah `<main>`, bukan panelnya — itu yang membuat topbar tetap diam dan `position: sticky` di dalam halaman tetap bekerja. Konsekuensi palet: kartu memakai garis rambut `ckColors.cardBorder`, **bukan** bayangan, karena isinya sudah berada di dalam panel yang berbayang.
- **Ringkasan** (`pages/dashboard.tsx`) berbentuk grid kartu paket (`components/cipta-karya/kartu-paket.tsx`), satu kartu per paket pada satu tahun anggaran, bersampul foto progres terbaru. Tahunnya dipilih lewat query string `?tahun=` dan **seluruh halaman ikut** — kartu maupun statistik di kepala; statistik lintas tahun di atas grid satu tahun terbaca sebagai angka yang tidak cocok. Chip status di sebelahnya sebaliknya murni sisi klien, tidak menyentuh server. Halaman "Mode audit" dulu berdiri sendiri hanya untuk menampilkan paket berstatus `menunggu_audit`; itu sekarang chip di sini, dan halamannya dihapus. Daftar "perlu ditindaklanjuti", tenggat terdekat, dan kurva agregat yang dulu berdiri sendiri dilebur jadi `sorot` — satu lencana per kartu berisi temuan paling mendesak paket itu (`DashboardController::sorotKartu`), yang sekaligus jadi dasar chip filter "Perlu perhatian". Kalau perlu menambah temuan baru, tambahkan jenjangnya di `sorotKartu`, jangan bikin daftar terpisah di bawah grid.
- **Pengaturan** (`pages/settings/*`) ikut `PengaturanShell` (`components/cipta-karya/pengaturan-shell.tsx`) — CiptaKaryaShell + tab Profil/Keamanan/Tampilan, tiap blok dibungkus `PengaturanSeksi`. Pintunya dari dropdown avatar, bukan `MENU`, jadi tak ada item topbar yang menyala (`active="pengaturan"` memang tidak punya pasangan di `MENU`). Tabnya route terpisah, bukan state: `/settings/security` dijaga middleware `RequirePassword` sendiri. Widget 2FA & passkey (`manage-two-factor.tsx`, `manage-passkeys.tsx`, `two-factor-setup-modal.tsx`, `passkey-*.tsx`) masih memakai kontrol shadcn di dalamnya dan **masih berbahasa Inggris** — yang dipindah ke gaya CK baru kerangka + form sederhananya (profil, ganti kata sandi, hapus akun). Kontrol form CK ada di `ck-dialog.tsx` (`CkField`, `CkInput`, `CkPasswordInput`, `CkButton`) meski namanya berbau dialog.
- **Detail paket** (`pages/paket/show.tsx`) berbentuk tiga tab — Ringkasan, Dokumen, Bangunan — dengan kepala lengket berisi judul, kode, aksi, dan lencana jumlah dokumen yang perlu ditindaklanjuti. Tab aktif disimpan di query string `?tab=`, bukan hanya state: kunjungan Inertia setelah unggah/verifikasi bisa memasang ulang komponen halaman, dan tanpa itu tabnya melompat balik ke Ringkasan. Isi tiap tab ada di `paket-ringkasan.tsx`, `paket-dokumen.tsx`, `paket-bangunan.tsx`; panel geser satu dokumen di `dokumen-panel.tsx`; peleburan `status` + `status_verifikasi` jadi satu keadaan tampilan ada di `dokumen-status.tsx` (`keadaanDokumen`) — jangan hitung ulang kombinasinya di tempat lain.

## Jebakan yang sudah pernah menggigit

1. **Kolom yang di-`update()` harus masuk `#[Fillable]`, bukan cuma kolom yang diisi saat `create()`.** Eloquent membuang kolom tak-fillable **diam-diam**, tanpa error. Kolom verifikasi pernah dua kali terlewat karena ini; sejak `DapatDiverifikasi` ada, kolom verifikasi didaftarkan trait lewat `mergeFillable()` sehingga tak bisa terlewat lagi — tapi jebakannya tetap berlaku untuk kolom lain. Catatan penting kalau bikin trait serupa: **atribut `#[Fillable]` milik trait TIDAK terbaca** oleh kelas pemakainya (`ReflectionClass::getAttributes()` tidak melihat atribut trait), jadi jalurnya wajib `mergeFillable()` di dalam `initialize{NamaTrait}()`.
2. **Migrasi baru harus dijalankan manual di DB dev**: `php artisan migrate` polos. Jangan pakai `--env=testing` — repo ini tidak punya `.env.testing`, jadi flag itu tetap menyasar DB dev. DB test diatur sepenuhnya oleh `phpunit.xml` dan dimigrasi otomatis oleh `RefreshDatabase`.
3. **Uji unggah file lewat browser** butuh byte asli sesuai magic number (JPEG diawali `0xFF 0xD8 0xFF` sebagai `Uint8Array`, bukan string JS) — validasi `mimes:` Laravel memeriksa isi file, bukan nama atau tipe deklarasi browser.
