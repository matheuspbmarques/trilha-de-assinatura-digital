<?php

namespace App\Http\Controllers;

use App\Http\Services\SignatarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SignatarioController
{
    private SignatarioService $signatarioService;

    public function __construct() {
        $this->signatarioService = new SignatarioService();
    }

    public function create(Request $request) {
        $validator = Validator::make($request->all(), [
            'nome' => ['required'],
            'email' => ['required', 'email'],
            'cargo' => ['required'],
            'setor' => ['required'],
        ], [
            'nome.required' => 'Informe o nome do signatário',
            'email.required' => 'Informe o e-mail do signatário',
            'email.email' => 'O e-mail é invalido',
            'cargo.required' => 'Informe o cargo do signatário',
            'setor.required' => 'Informe o setor/departamento do signatário',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        return $this->signatarioService->create($request);
    }
}
