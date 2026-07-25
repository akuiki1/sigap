<?php

namespace Tests\Feature;

use App\Enums\StatusDokumen;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DokumenPaketTest extends TestCase
{
    use RefreshDatabase;

    protected function checklistItem(): ChecklistDokumen
    {
        return ChecklistDokumen::create([
            'tahap' => 'Pelaksanaan konstruksi',
            'nama' => 'As-built drawing',
            'urutan' => 1,
            'wajib' => true,
        ]);
    }

    public function test_checklist_item_cannot_be_marked_ada_without_a_berkas(): void
    {
        $this->actingAs(User::factory()->operator()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        $this->patch(route('paket.dokumen.update', ['paket' => $paket, 'checklistDokumen' => $item]))
            ->assertSessionHasErrors('status');

        $this->assertDatabaseMissing('dokumen_paket', [
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
            'status' => StatusDokumen::Ada->value,
        ]);
    }

    public function test_an_existing_belum_item_cannot_be_flipped_to_ada(): void
    {
        $this->actingAs(User::factory()->operator()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        DokumenPaket::create([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
            'status' => StatusDokumen::Belum,
        ]);

        $this->patch(route('paket.dokumen.update', ['paket' => $paket, 'checklistDokumen' => $item]))
            ->assertSessionHasErrors('status');

        $dokumen = DokumenPaket::firstWhere([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
        ]);

        $this->assertSame(StatusDokumen::Belum, $dokumen->status);
    }

    public function test_a_marked_item_can_be_reverted_to_belum(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        // Satu-satunya jalan menuju status "ada": unggah berkasnya.
        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => UploadedFile::fake()->create('as-built.pdf', 100, 'application/pdf'),
        ]);

        $dokumen = DokumenPaket::firstWhere([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
        ]);
        $this->assertSame(StatusDokumen::Ada, $dokumen->status);

        $this->patch(route('paket.dokumen.update', ['paket' => $paket, 'checklistDokumen' => $item]))
            ->assertRedirect();

        $this->assertSame(StatusDokumen::Belum, $dokumen->refresh()->status);
    }

    public function test_auditor_cannot_change_checklist_status(): void
    {
        $this->actingAs(User::factory()->auditor()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        $this->patch(route('paket.dokumen.update', ['paket' => $paket, 'checklistDokumen' => $item]))
            ->assertForbidden();
    }
}
