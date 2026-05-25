<?php

namespace App\Http\Controllers;

use App\Http\Services\AuthService;
use Illuminate\Http\Request;

class AuthController {
    private AuthService $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    public function signIn(Request $request) {
        $request->validate([
            'acesso' => ['required'],
            'senha' => ['required'],
        ]);

        return $this->authService->signIn($request);
    }

    public function signOut(Request $request) {
        $request->session()->remove('USUARIO_TOKEN');
        $request->session()->remove('USUARIO_ID');

        return redirect()->route('auth.sign-in');
    }
}
