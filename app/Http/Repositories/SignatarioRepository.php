<?php

namespace App\Http\Repositories;

use App\Models\Signatario;

class SignatarioRepository {
    public function createNew(string $nome, string $email, string $cargo, string $setor) {
        $newSignatario = new Signatario();

        $newSignatario->nome = $nome;
        $newSignatario->email = $email;
        $newSignatario->cargo = $cargo;
        $newSignatario->setor = $setor;

        $newSignatario->save();
    }
}
