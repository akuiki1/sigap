<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\Berkas;
use App\Models\ProgresPaket;
use App\Models\TitikKoordinatPaket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola akun pengguna — satu-satunya layar yang tertutup untuk operator
 * (lihat App\Policies\UserPolicy). Cakupannya sengaja sempit: buat akun, ubah
 * peran, hapus akun. Nama, email, dan kata sandi tetap diurus pemiliknya
 * sendiri lewat halaman Pengaturan.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        /** @var User $aku */
        $aku = $request->user();

        return Inertia::render('pengguna/index', [
            // Urut peran lalu nama: 'admin' < 'operator' secara alfabet, jadi
            // admin selalu muncul di atas tanpa perlu pengurutan khusus.
            'pengguna' => User::query()
                ->orderBy('role')
                ->orderBy('name')
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role->value,
                    'role_label' => $u->role->label(),
                    'diri_sendiri' => $u->is($aku),
                    // Hak akses dihitung di sini lewat policy, bukan diulang di
                    // TypeScript — aturannya cuma boleh hidup di satu tempat.
                    'boleh_ubah' => $aku->can('update', $u),
                    'boleh_hapus' => $aku->can('delete', $u),
                    'dibuat_pada' => $u->created_at?->translatedFormat('j M Y'),
                ])
                ->all(),
            'roleOptions' => array_map(
                fn (Role $role): array => ['value' => $role->value, 'label' => $role->label()],
                Role::cases(),
            ),
        ]);
    }

    public function store(UserStoreRequest $request): RedirectResponse
    {
        $pengguna = new User;
        $pengguna->fill($request->safe()->only(['name', 'email', 'password']));
        $pengguna->role = $request->peran();
        $pengguna->save();

        // Akun dibuat admin yang menjamin alamat surelnya, sementara route
        // aplikasi dijaga middleware `verified`. Tanpa ditandai terverifikasi
        // sejak awal, akun baru langsung mentok di layar "verifikasi email"
        // yang surelnya belum tentu terkirim di jaringan dinas.
        $pengguna->markEmailAsVerified();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Akun {$pengguna->name} berhasil dibuat.",
        ]);

        return to_route('pengguna.index');
    }

    public function update(UserUpdateRequest $request, User $pengguna): RedirectResponse
    {
        // `role` sengaja tidak fillable (lihat App\Models\User), jadi diset
        // eksplisit — bukan lewat fill()/update() dari payload.
        $pengguna->role = $request->peran();
        $pengguna->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Peran {$pengguna->name} diubah jadi {$pengguna->role->label()}.",
        ]);

        return to_route('pengguna.index');
    }

    public function destroy(User $pengguna): RedirectResponse
    {
        $this->authorize('delete', $pengguna);

        // Nama pengunggah/pelapor melekat permanen di berkas, entri progres,
        // dan titik koordinat sebagai jejak audit — foreign key-nya RESTRICT,
        // jadi penghapusan akan gagal di level database. Ditolak lebih awal
        // dengan alasan yang bisa dibaca, bukan dibiarkan jadi galat 500.
        if ($this->punyaJejak($pengguna)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Akun {$pengguna->name} tidak bisa dihapus karena namanya melekat pada berkas atau catatan progres yang sudah ada.",
            ]);

            return to_route('pengguna.index');
        }

        $nama = $pengguna->name;
        $pengguna->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Akun {$nama} berhasil dihapus.",
        ]);

        return to_route('pengguna.index');
    }

    /**
     * Apakah akun ini sudah pernah meninggalkan jejak yang menunjuk balik
     * ke dirinya? Mencakup kolom verifikator juga — nullable di database,
     * tapi tetap RESTRICT saat barisnya terisi.
     */
    private function punyaJejak(User $pengguna): bool
    {
        return Berkas::query()
            ->where('uploaded_by', $pengguna->id)
            ->orWhere('diverifikasi_by', $pengguna->id)
            ->exists()
            || ProgresPaket::query()
                ->where('dilaporkan_by', $pengguna->id)
                ->orWhere('diverifikasi_by', $pengguna->id)
                ->exists()
            || TitikKoordinatPaket::query()
                ->where('dicatat_by', $pengguna->id)
                ->exists();
    }
}
