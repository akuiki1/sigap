<?php

namespace Tests\Feature;

use App\Models\Paket;
use App\Models\TitikKoordinatPaket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TitikKoordinatPaketTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    protected function validPayload(): array
    {
        return [
            'label' => 'Gedung utama',
            'latitude' => -2.5836421,
            'longitude' => 115.3814752,
            'keterangan' => 'Titik diambil di depan pintu masuk.',
        ];
    }

    public function test_operator_can_mark_a_coordinate(): void
    {
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.koordinat.store', $paket), $this->validPayload())
            ->assertRedirect();

        $titik = TitikKoordinatPaket::firstWhere('paket_id', $paket->id);

        $this->assertNotNull($titik);
        $this->assertSame('Gedung utama', $titik->label);
        $this->assertEqualsWithDelta(-2.5836421, $titik->latitude, 0.0000001);
        $this->assertEqualsWithDelta(115.3814752, $titik->longitude, 0.0000001);
    }

    public function test_marking_a_coordinate_requires_label_and_position(): void
    {
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.koordinat.store', $paket), [])
            ->assertSessionHasErrors(['label', 'latitude', 'longitude']);
    }

    public function test_marking_a_coordinate_rejects_out_of_range_position(): void
    {
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $payload = $this->validPayload();
        $payload['latitude'] = 120;

        $this->post(route('paket.koordinat.store', $paket), $payload)
            ->assertSessionHasErrors('latitude');
    }

    public function test_auditor_cannot_mark_a_coordinate(): void
    {
        $this->actingAs(User::factory()->auditor()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.koordinat.store', $paket), $this->validPayload())
            ->assertForbidden();
    }

    public function test_pengawas_cannot_mark_a_coordinate(): void
    {
        $this->actingAs(User::factory()->pengawas()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.koordinat.store', $paket), $this->validPayload())
            ->assertForbidden();
    }

    protected function markedTitik(): TitikKoordinatPaket
    {
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.koordinat.store', $paket), $this->validPayload());

        return TitikKoordinatPaket::firstWhere('paket_id', $paket->id);
    }

    public function test_operator_can_delete_a_coordinate(): void
    {
        $titik = $this->markedTitik();

        $this->delete(route('koordinat.destroy', $titik))->assertRedirect();

        $this->assertDatabaseMissing('titik_koordinat_paket', ['id' => $titik->id]);
    }

    public function test_auditor_cannot_delete_a_coordinate(): void
    {
        $titik = $this->markedTitik();
        $this->actingAs(User::factory()->auditor()->create());

        $this->delete(route('koordinat.destroy', $titik))->assertForbidden();

        $this->assertDatabaseHas('titik_koordinat_paket', ['id' => $titik->id]);
    }

    public function test_alamat_can_be_saved_on_a_paket(): void
    {
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $this->put(route('paket.update', $paket), [
            ...$paket->only([
                'kode_paket', 'nama', 'nilai_kontrak', 'progres', 'tahun_anggaran',
            ]),
            'status' => $paket->status->value,
            'alamat' => 'Jl. Perwira No. 1, Barabai, Kab. Hulu Sungai Tengah',
        ])->assertRedirect();

        $this->assertSame(
            'Jl. Perwira No. 1, Barabai, Kab. Hulu Sungai Tengah',
            $paket->refresh()->alamat,
        );
    }
}
