<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Layar kelola akun — satu-satunya tempat peran benar-benar membedakan hak.
 */
class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, string>  $ubah
     * @return array<string, string>
     */
    protected function validPayload(array $ubah = []): array
    {
        return [
            'name' => 'Staf Baru',
            'email' => 'staf.baru@example.com',
            'password' => 'kata-sandi-rahasia',
            'password_confirmation' => 'kata-sandi-rahasia',
            'role' => Role::Operator->value,
            ...$ubah,
        ];
    }

    public function test_admin_can_see_the_user_list(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->get(route('pengguna.index'))->assertOk();
    }

    public function test_operator_cannot_touch_user_management(): void
    {
        $this->actingAs(User::factory()->operator()->create());
        $lain = User::factory()->operator()->create();

        $this->get(route('pengguna.index'))->assertForbidden();
        $this->post(route('pengguna.store'), $this->validPayload())->assertForbidden();
        $this->patch(route('pengguna.update', $lain), ['role' => Role::Admin->value])
            ->assertForbidden();
        $this->delete(route('pengguna.destroy', $lain))->assertForbidden();
    }

    public function test_guests_cannot_touch_user_management(): void
    {
        $this->get(route('pengguna.index'))->assertRedirect(route('login'));
    }

    public function test_admin_can_create_an_account(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->post(route('pengguna.store'), $this->validPayload())
            ->assertRedirect(route('pengguna.index'));

        $baru = User::query()->where('email', 'staf.baru@example.com')->first();

        $this->assertNotNull($baru);
        $this->assertSame(Role::Operator, $baru->role);
        // Ditandai terverifikasi sejak awal, kalau tidak akun baru langsung
        // mentok di layar verifikasi email yang surelnya belum tentu terkirim.
        $this->assertNotNull($baru->email_verified_at);
    }

    public function test_admin_can_create_another_admin(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->post(route('pengguna.store'), $this->validPayload([
            'role' => Role::Admin->value,
        ]))->assertRedirect();

        $this->assertSame(
            Role::Admin,
            User::query()->where('email', 'staf.baru@example.com')->first()->role,
        );
    }

    public function test_creating_an_account_rejects_an_unknown_role(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->post(route('pengguna.store'), $this->validPayload([
            'role' => 'pengawas',
        ]))->assertSessionHasErrors('role');
    }

    public function test_admin_can_change_another_users_role(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $target = User::factory()->operator()->create();

        $this->patch(route('pengguna.update', $target), ['role' => Role::Admin->value])
            ->assertRedirect(route('pengguna.index'));

        $this->assertSame(Role::Admin, $target->refresh()->role);
    }

    public function test_admin_cannot_change_their_own_role(): void
    {
        // Penjaga invarian "selalu ada minimal satu admin": tanpa ini, admin
        // terakhir bisa menurunkan dirinya sendiri dan mengunci semua orang.
        $aku = User::factory()->admin()->create();
        $this->actingAs($aku);

        $this->patch(route('pengguna.update', $aku), ['role' => Role::Operator->value])
            ->assertForbidden();

        $this->assertSame(Role::Admin, $aku->refresh()->role);
    }

    public function test_admin_cannot_delete_their_own_account_from_this_screen(): void
    {
        $aku = User::factory()->admin()->create();
        $this->actingAs($aku);

        $this->delete(route('pengguna.destroy', $aku))->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $aku->id]);
    }

    public function test_admin_can_delete_an_account_without_any_trace(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $target = User::factory()->operator()->create();

        $this->delete(route('pengguna.destroy', $target))
            ->assertRedirect(route('pengguna.index'));

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_an_account_that_uploaded_a_berkas_cannot_be_deleted(): void
    {
        // Foreign key uploaded_by bersifat RESTRICT: tanpa penjaga di
        // controller, penghapusan ini jadi galat 500, bukan pesan yang terbaca.
        $this->actingAs(User::factory()->admin()->create());
        $pengunggah = User::factory()->operator()->create();

        $item = ChecklistDokumen::create([
            'tahap' => 'Pelaksanaan konstruksi',
            'nama' => 'As-built drawing',
            'urutan' => 1,
            'wajib' => true,
        ]);

        $dokumen = DokumenPaket::create([
            'paket_id' => Paket::factory()->create()->id,
            'checklist_dokumen_id' => $item->id,
            'status' => 'ada',
        ]);

        // Lewat relasi morph, bukan Berkas::create langsung: attachable_type &
        // attachable_id sengaja tidak fillable dan akan diisi relasinya.
        $dokumen->berkas()->create([
            'versi' => 1,
            'is_terkini' => true,
            'file_path' => 'seed/contoh.pdf',
            'nama_asli' => 'contoh.pdf',
            'ukuran' => 10,
            'mime_type' => 'application/pdf',
            'uploaded_by' => $pengunggah->id,
        ]);

        $this->delete(route('pengguna.destroy', $pengunggah))
            ->assertRedirect(route('pengguna.index'));

        $this->assertDatabaseHas('users', ['id' => $pengunggah->id]);
    }

    public function test_the_last_admin_cannot_delete_their_own_profile(): void
    {
        // ProfileController::destroy adalah jalan keluar satu lagi yang bisa
        // menghabiskan admin terakhir — pendaftaran mandiri sudah ditutup.
        $aku = User::factory()->admin()->create();
        $this->actingAs($aku);

        $this->delete(route('profile.destroy'), ['password' => 'password'])
            ->assertSessionHasErrors('password');

        $this->assertDatabaseHas('users', ['id' => $aku->id]);
    }

    public function test_an_admin_can_delete_their_own_profile_when_another_admin_exists(): void
    {
        $aku = User::factory()->admin()->create();
        User::factory()->admin()->create();
        $this->actingAs($aku);

        $this->delete(route('profile.destroy'), ['password' => 'password'])
            ->assertRedirect('/');

        $this->assertDatabaseMissing('users', ['id' => $aku->id]);
    }
}
