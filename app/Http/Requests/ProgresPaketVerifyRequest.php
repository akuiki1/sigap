<?php

namespace App\Http\Requests;

use App\Models\ProgresPaket;

class ProgresPaketVerifyRequest extends VerifikasiRequest
{
    protected function subjek(): ?ProgresPaket
    {
        $progresPaket = $this->route('progresPaket');

        return $progresPaket instanceof ProgresPaket ? $progresPaket : null;
    }
}
