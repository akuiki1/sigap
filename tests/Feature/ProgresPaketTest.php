<?php

namespace Tests\Feature;

use App\Models\Paket;
use App\Models\ProgresPaket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProgresPaketTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    protected function validPayload(): array
    {
        return [
            'tanggal' => '2026-07-20',
            'persentase' => 20,
            'keterangan' => 'Pekerjaan pondasi selesai.',
            'foto' => [
                UploadedFile::fake()->create('progres-1.jpg', 200, 'image/jpeg'),
                UploadedFile::fake()->create('progres-2.jpg', 200, 'image/jpeg'),
            ],
        ];
    }

    public function test_operator_can_record_a_progres_entry_with_photos(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.progres.store', $paket), $this->validPayload())
            ->assertRedirect();

        $progres = ProgresPaket::firstWhere('paket_id', $paket->id);

        $this->assertNotNull($progres);
        $this->assertSame(20, $progres->persentase);
        $this->assertSame('2026-07-20', $progres->tanggal->toDateString());
        $this->assertSame('diajukan', $progres->status_verifikasi->value);
        $this->assertSame(2, $progres->foto()->count());
    }

    public function test_recording_progres_requires_at_least_one_photo(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $payload = $this->validPayload();
        unset($payload['foto']);

        $this->post(route('paket.progres.store', $paket), $payload)
            ->assertSessionHasErrors('foto');
    }

    public function test_recording_progres_rejects_non_image_files(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $payload = $this->validPayload();
        $payload['foto'] = [UploadedFile::fake()->create('laporan.pdf', 100, 'application/pdf')];

        $this->post(route('paket.progres.store', $paket), $payload)
            ->assertSessionHasErrors('foto.0');
    }

    public function test_auditor_cannot_record_progres(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->auditor()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.progres.store', $paket), $this->validPayload())
            ->assertForbidden();
    }

    public function test_pengawas_cannot_record_progres(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->pengawas()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.progres.store', $paket), $this->validPayload())
            ->assertForbidden();
    }

    protected function recordedProgres(): ProgresPaket
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.progres.store', $paket), $this->validPayload());

        return ProgresPaket::firstWhere('paket_id', $paket->id);
    }

    public function test_pengawas_can_verify_a_progres_entry(): void
    {
        $progres = $this->recordedProgres();
        $this->actingAs(User::factory()->pengawas()->create());

        $this->patch(route('progres.verify', $progres), [
            'keputusan' => 'diverifikasi',
        ])->assertRedirect();

        $progres->refresh();
        $this->assertSame('diverifikasi', $progres->status_verifikasi->value);
        $this->assertNotNull($progres->diverifikasi_by);
        $this->assertNotNull($progres->diverifikasi_pada);
    }

    public function test_rejecting_a_progres_entry_requires_a_note(): void
    {
        $progres = $this->recordedProgres();
        $this->actingAs(User::factory()->pengawas()->create());

        $this->patch(route('progres.verify', $progres), [
            'keputusan' => 'ditolak',
        ])->assertSessionHasErrors('catatan_verifikasi');
    }

    public function test_operator_cannot_verify_progres(): void
    {
        $progres = $this->recordedProgres();
        $this->actingAs(User::factory()->operator()->create());

        $this->patch(route('progres.verify', $progres), [
            'keputusan' => 'diverifikasi',
        ])->assertForbidden();
    }
}
