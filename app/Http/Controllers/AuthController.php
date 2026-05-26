<?php

namespace App\Http\Controllers;

use App\Http\Services\AuthService;
use Illuminate\Http\Request;
use Validator;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService;
    }

    public function signIn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'acesso' => ['required'],
            'senha' => ['required'],
        ], [
            'acesso.required' => 'Informe o seu acesso',
            'senha.required' => 'Informe a sua senha',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        return $this->authService->signIn($request);
    }

    public function signOut(Request $request)
    {
        $request->session()->remove('USUARIO_TOKEN');
        $request->session()->remove('USUARIO_ID');

        return redirect()->route('auth.sign-in');
    }
}
