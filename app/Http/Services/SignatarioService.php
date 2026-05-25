<?php

namespace App\Http\Services;

use App\Http\Repositories\SignatarioRepository;
use Illuminate\Http\Request;

class SignatarioService {
    private SignatarioRepository $signatarioRepository;

    public function __construct() {
        $this->signatarioRepository = new SignatarioRepository();
    }

    public function create(Request $request) {
        $nome = $request->input('nome');
        $email = $request->input('email');
        $cargo = $request->input('cargo');
        $setor = $request->input('setor');

        $this->signatarioRepository->createNew($nome, $email, $cargo, $setor);

        return back();
    }
}
