# SIGAP

Sistem pencatatan proyek gedung **Dinas PUPR Cipta Karya Kab. Hulu Sungai Tengah**. Laravel 12 + Inertia + React (TypeScript) + shadcn/ui. Bahasa domain (tabel, kolom, komponen, komentar) memakai **bahasa Indonesia**; kode framework tetap Inggris.

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
- **Properti user turunan** diekspos lewat accessor + `#[Appends]` di `App\Models\User` (`role_label`, `can_input`, `can_verify`, `is_admin`), lalu dipakai langsung di React — **jangan** menghitung ulang logika peran di TypeScript.
- **MySQL di semua environment.** DB dev `sigap`, DB test `sigap_testing`.
- **Dependensi seminimal mungkin** — sebelum menambah paket, cek dulu apakah bisa ditulis sendiri dengan wajar.
- Seeder bersifat **idempoten**: pola `if (Model::query()->exists()) { return; }` atau cek per-baris, karena seeder dijalankan ulang di DB dev yang sudah berisi data.

## Peran & otorisasi

`App\Enums\Role`: `admin`, `operator`, `pengawas`, `auditor`. Kolom `users.role` **tidak fillable**, default `auditor` (least privilege).

Otorisasi ditegakkan di **dua lapis**: Policy/FormRequest di backend, **dan** penyembunyian tombol di frontend lewat `can_input`/`can_verify`/`is_admin`. Keduanya wajib — backend saja tidak cukup untuk UX, frontend saja tidak aman.

Belum ada: layar kelola user (peran hanya bisa diubah lewat tinker).

## Arsitektur yang perlu diketahui

- **`berkas`** — tabel lampiran polimorfik dipakai dua konsumen dengan semantik berbeda:
  - `dokumen_paket` (checklist dokumen) → **berversi**, `is_terkini` diarsipkan tiap unggah baru.
  - `progres_paket` (foto progres) → **tidak berversi**, semua foto satu entri berlaku sekaligus.
  Alias morph didaftarkan di `AppServiceProvider::configureDefaults`. File disimpan di disk privat `local`, diunduh lewat route `berkas.download` (streaming), bukan URL publik.
- **Verifikasi** (`App\Enums\StatusVerifikasi`: `diajukan → diverifikasi | ditolak`):
  - Untuk dokumen: unggah otomatis menyetel `dokumen_paket.status = ada`; **menolak mengembalikannya ke `belum`**. Status verifikasi adalah lapisan tambahan, bukan gerbang.
  - Untuk progres: yang diverifikasi adalah **klaim persentasenya**, bukan tiap foto. `berkas.status_verifikasi` pada foto progres sengaja tidak dipakai.
  - Menolak wajib menyertakan `catatan_verifikasi`.
  - Polanya dibagikan lewat `App\Models\Concerns\DapatDiverifikasi` (casts, kolom mass-assignment, relasi `diverifikasiOleh`, `tandaiVerifikasi()`) dan `App\Http\Requests\VerifikasiRequest` (aturan validasi + `keputusan()`). Konsumen baru cukup `use DapatDiverifikasi` di model dan `extends VerifikasiRequest` dengan satu method `subjek()`. Kolomnya seragam di semua tabel: `status_verifikasi`, `catatan_verifikasi`, `diverifikasi_by`, `diverifikasi_pada`. Efek samping khas tiap model tetap di controller masing-masing.

## Jebakan yang sudah pernah menggigit

1. **Kolom yang di-`update()` harus masuk `#[Fillable]`, bukan cuma kolom yang diisi saat `create()`.** Eloquent membuang kolom tak-fillable **diam-diam**, tanpa error. Kolom verifikasi pernah dua kali terlewat karena ini; sejak `DapatDiverifikasi` ada, kolom verifikasi didaftarkan trait lewat `mergeFillable()` sehingga tak bisa terlewat lagi — tapi jebakannya tetap berlaku untuk kolom lain. Catatan penting kalau bikin trait serupa: **atribut `#[Fillable]` milik trait TIDAK terbaca** oleh kelas pemakainya (`ReflectionClass::getAttributes()` tidak melihat atribut trait), jadi jalurnya wajib `mergeFillable()` di dalam `initialize{NamaTrait}()`.
2. **Migrasi baru harus dijalankan manual di DB dev**: `php artisan migrate` polos. Jangan pakai `--env=testing` — repo ini tidak punya `.env.testing`, jadi flag itu tetap menyasar DB dev. DB test diatur sepenuhnya oleh `phpunit.xml` dan dimigrasi otomatis oleh `RefreshDatabase`.
3. **Uji unggah file lewat browser** butuh byte asli sesuai magic number (JPEG diawali `0xFF 0xD8 0xFF` sebagai `Uint8Array`, bukan string JS) — validasi `mimes:` Laravel memeriksa isi file, bukan nama atau tipe deklarasi browser.
