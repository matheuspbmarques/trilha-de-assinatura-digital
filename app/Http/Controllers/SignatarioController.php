<?php

namespace App\Http\Controllers;

use App\Http\Services\SignatarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SignatarioController
{
    private SignatarioService $signatarioService;

    public function __construct()
    {
        $this->signatarioService = new SignatarioService;
    }

    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => ['required'],
            'email' => ['required', 'email', 'unique:signatarios,email'],
            'cargo' => ['required'],
            'setor' => ['required'],
        ], [
            'nome.required' => 'Informe o nome do signatário',
            'email.required' => 'Informe o e-mail do signatário',
            'email.email' => 'O e-mail é invalido',
            'email.unique' => 'Este e-mail já está cadastrado',
            'cargo.required' => 'Informe o cargo do signatário',
            'setor.required' => 'Informe o setor/departamento do signatário',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        return $this->signatarioService->create($request);
    }

    public function getAll()
    {
        $signatarios = $this->signatarioService->getAll();

        return Inertia::render('dashboard/signatarios', [
            'signatarios' => $signatarios,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validator = Validator::make(array_merge($request->all(), ['id' => $id]), [
            'id' => ['required', 'uuid:4'],
            'nome' => ['required'],
            'email' => ['required', 'email', "unique:signatarios,email,{$id}"],
            'cargo' => ['required'],
            'setor' => ['required'],
            'ativo' => ['sometimes', 'boolean'],
        ], [
            'id.required' => 'Informe o ID do signatário',
            'id.uuid:4' => 'O ID é invalido',
            'nome.required' => 'Informe o nome do signatário',
            'email.required' => 'Informe o e-mail do signatário',
            'email.email' => 'O e-mail é invalido',
            'email.unique' => 'Este e-mail já está cadastrado',
            'cargo.required' => 'Informe o cargo do signatário',
            'setor.required' => 'Informe o setor/departamento do signatário',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        return $this->signatarioService->update($id, $request);
    }
}
