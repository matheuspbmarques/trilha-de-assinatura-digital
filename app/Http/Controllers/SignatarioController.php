<?php

namespace App\Http\Controllers;

use App\Http\Services\SignatarioService;
use Illuminate\Http\Request;

class SignatarioController
{
    private SignatarioService $signatarioService;

    public function __construct() {
        $this->signatarioService = new SignatarioService();
    }

    public function create(Request $request) {
        $request->validate([
            'nome' => ['required'],
            'email' => ['required', 'email'],
            'cargo' => ['required'],
            'setor' => ['required'],
        ]);

        return $this->signatarioService->create($request);
    }
}
