<?php

namespace Tests\Feature;

use App\Enums\StatusDokumen;
use App\Models\Berkas;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BerkasTest extends TestCase
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

    public function test_operator_can_upload_berkas_for_checklist_item(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();
        $file = UploadedFile::fake()->create('as-built.pdf', 500, 'application/pdf');

        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => $file,
        ])->assertRedirect();

        $dokumenPaket = DokumenPaket::firstWhere([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
        ]);

        $this->assertNotNull($dokumenPaket);
        $this->assertSame(StatusDokumen::Ada, $dokumenPaket->status);

        $berkas = $dokumenPaket->berkasTerkini;
        $this->assertNotNull($berkas);
        $this->assertSame('as-built.pdf', $berkas->nama_asli);
        $this->assertSame(1, $berkas->versi);
        $this->assertTrue($berkas->is_terkini);
        $this->assertSame('diajukan', $berkas->status_verifikasi->value);
        Storage::disk('local')->assertExists($berkas->file_path);
    }

    public function test_uploading_new_version_supersedes_the_previous_one(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => UploadedFile::fake()->create('v1.pdf', 100, 'application/pdf'),
        ]);
        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => UploadedFile::fake()->create('v2.pdf', 100, 'application/pdf'),
        ]);

        $dokumenPaket = DokumenPaket::firstWhere([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
        ]);

        $this->assertSame(2, $dokumenPaket->berkas()->count());
        $this->assertSame(1, $dokumenPaket->berkas()->where('is_terkini', true)->count());

        $terkini = $dokumenPaket->berkasTerkini;
        $this->assertSame('v2.pdf', $terkini->nama_asli);
        $this->assertSame(2, $terkini->versi);
    }

    public function test_upload_rejects_disallowed_mime_type(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => UploadedFile::fake()->create('virus.exe', 10, 'application/x-msdownload'),
        ])->assertSessionHasErrors('file');
    }

    public function test_auditor_cannot_upload_berkas(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->auditor()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ])->assertForbidden();
    }

    public function test_pengawas_cannot_upload_berkas(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->pengawas()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ])->assertForbidden();
    }

    protected function uploadedBerkas(): Berkas
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->operator()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem();

        $this->post(route('paket.dokumen.berkas.store', ['paket' => $paket, 'checklistDokumen' => $item]), [
            'file' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ]);

        return DokumenPaket::firstWhere([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
        ])->berkasTerkini;
    }

    public function test_pengawas_can_verify_a_berkas(): void
    {
        $berkas = $this->uploadedBerkas();
        $this->actingAs(User::factory()->pengawas()->create());

        $this->patch(route('berkas.verify', $berkas), [
            'keputusan' => 'diverifikasi',
        ])->assertRedirect();

        $berkas->refresh();
        $this->assertSame('diverifikasi', $berkas->status_verifikasi->value);
        $this->assertNotNull($berkas->verified_by);
        $this->assertNotNull($berkas->verified_at);
        $this->assertSame(
            StatusDokumen::Ada,
            $berkas->attachable->fresh()->status,
        );
    }

    public function test_rejecting_a_berkas_reverts_dokumen_status_to_belum(): void
    {
        $berkas = $this->uploadedBerkas();
        $this->actingAs(User::factory()->pengawas()->create());

        $this->patch(route('berkas.verify', $berkas), [
            'keputusan' => 'ditolak',
            'catatan_verifikasi' => 'Scan buram, mohon unggah ulang.',
        ])->assertRedirect();

        $berkas->refresh();
        $this->assertSame('ditolak', $berkas->status_verifikasi->value);
        $this->assertSame(
            StatusDokumen::Belum,
            $berkas->attachable->fresh()->status,
        );
    }

    public function test_rejecting_without_a_note_fails_validation(): void
    {
        $berkas = $this->uploadedBerkas();
        $this->actingAs(User::factory()->pengawas()->create());

        $this->patch(route('berkas.verify', $berkas), [
            'keputusan' => 'ditolak',
        ])->assertSessionHasErrors('catatan_verifikasi');
    }

    public function test_operator_cannot_verify_berkas(): void
    {
        $berkas = $this->uploadedBerkas();
        $this->actingAs(User::factory()->operator()->create());

        $this->patch(route('berkas.verify', $berkas), [
            'keputusan' => 'diverifikasi',
        ])->assertForbidden();
    }

    public function test_any_authenticated_role_can_download_a_berkas(): void
    {
        $berkas = $this->uploadedBerkas();
        $this->actingAs(User::factory()->auditor()->create());

        $this->get(route('berkas.download', $berkas))->assertOk();
    }

    public function test_guests_cannot_download_a_berkas(): void
    {
        $berkas = $this->uploadedBerkas();
        $this->app['auth']->guard()->logout();

        $this->get(route('berkas.download', $berkas))
            ->assertRedirect(route('login'));
    }
}
