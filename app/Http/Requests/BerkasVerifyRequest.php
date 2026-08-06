<?php

namespace App\Http\Requests;

use App\Models\Berkas;

class BerkasVerifyRequest extends VerifikasiRequest
{
    protected function subjek(): ?Berkas
    {
        $berkas = $this->route('berkas');

        return $berkas instanceof Berkas ? $berkas : null;
    }
}
