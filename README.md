# SIGAP

**Sistem Informasi Pencatatan Proyek Gedung** — Dinas PUPR Bidang Cipta Karya.

## Tech Stack

-   [Laravel 13](https://laravel.com) — backend framework
-   [Inertia.js](https://inertiajs.com) v3 — jembatan server-driven SPA
-   [React 19](https://react.dev) + TypeScript — frontend
-   [Tailwind CSS v4](https://tailwindcss.com) — styling (konfigurasi berbasis CSS di `resources/css/app.css`, tanpa `tailwind.config.js`)
-   [Radix UI](https://www.radix-ui.com) — primitif komponen aksesibel (dasar dari `components/ui/`)
-   [Laravel Wayfinder](https://github.com/laravel/wayfinder) — generator helper route & action TypeScript dari route Laravel
-   MySQL — database

## Menjalankan Proyek

```bash
composer install
npm install
php artisan migrate
npm run dev
```

Lalu jalankan server PHP di terminal terpisah:

```bash
php artisan serve
```

Atau, jika menggunakan Laragon dan virtual host `sigap.test` sudah di-reload, akses langsung lewat `http://sigap.test`.

Buat akun untuk login melalui halaman `/register`, atau isi `database/seeders/DatabaseSeeder.php` lalu jalankan `php artisan db:seed`.

## Konfigurasi Database

Proyek ini menggunakan MySQL di **dev, test, dan CI** — tidak ada SQLite di mana pun,
supaya perilaku database konsisten di semua lingkungan.

Salin `.env.example` ke `.env` (isinya sudah benar), lalu buat dua database:

```sql
CREATE DATABASE sigap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE sigap_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`sigap_testing` dipakai oleh test suite (dipaksa lewat `phpunit.xml`) agar
`RefreshDatabase` tidak pernah menghapus data development. Host, user, dan password
diambil dari `.env` masing-masing developer.

## Struktur Direktori Penting

```
app/Http/Controllers/
    DashboardController.php   # Halaman dashboard
    PaketController.php       # Data paket (index, create, show, edit)
    AuditController.php       # Mode audit

resources/js/
    actions/                  # Aksi controller ter-generate (Wayfinder)
    routes/                   # Helper route ter-generate (Wayfinder)
    components/
        ui/                    # Komponen UI atomik (lihat daftar di bawah)
        app-sidebar.tsx        # Sidebar navigasi utama
        nav-main.tsx           # Daftar menu sidebar
        nav-user.tsx           # Menu akun & logout
    layouts/
        app-layout.tsx         # Layout halaman terautentikasi (sidebar + breadcrumbs)
        auth-layout.tsx        # Layout halaman login/register
    pages/
        dashboard.tsx          # Statistik & paket terbaru
        paket/                 # index, create, edit, show
        audit/
            review.tsx          # Mode audit

routes/web.php                # Route utama (dashboard, paket, audit)
```

## Komponen UI (`resources/js/components/ui/`)

| Komponen | Deskripsi |
| --- | --- |
| `button.tsx` | Tombol dengan varian `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` dan ukuran `sm`/`default`/`lg`/`icon` |
| `card.tsx` | Kontainer konten dengan header, judul, deskripsi, isi, dan footer |
| `dialog.tsx` | Modal berbasis Radix Dialog (portal, overlay, animasi bawaan) |
| `table.tsx` | Primitif tabel (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, dst.) |
| `alert.tsx` | Notifikasi inline dengan varian `default`/`destructive` |
| `badge.tsx` | Label status kecil, varian `default`, `secondary`, `destructive`, `outline`, `success`, `warning` |
| `input.tsx` | Input teks bergaya form |
| `select.tsx` | Dropdown pilihan berbasis Radix Select |
| `textarea.tsx` | Input teks multi-baris |
| `label.tsx` | Label form |

Token warna identitas PUPR (`primary` `#004B87`, `primary-light` `#0066B3`, `primary-dark` `#00325A`, `warning` `#F5A623`) dan font Inter dikonfigurasi di `resources/css/app.css` (`@theme`) dan `vite.config.ts`.
