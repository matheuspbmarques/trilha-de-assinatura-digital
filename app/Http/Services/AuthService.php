<?php

namespace App\Http\Services;

use App\Http\Repositories\UsuarioRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthService {
    private UsuarioRepository $usuarioRepository;
    private JwtService $jwt;

    public function __construct() {
        $this->usuarioRepository = new UsuarioRepository();
        $this->jwt = new JwtService();
    }

    public function signIn(Request $request) {
        $acesso = $request->input('acesso');
        $senha = $request->input('senha');

        $usuario = $this->usuarioRepository->findByAcesso($acesso);

        if (!$usuario) {
            return back()->withErrors([
                'acesso' => 'Acesso não encontrado'
            ]);
        }

        $isSenhaRight = Hash::check($senha, $usuario->senha);

        if (!$isSenhaRight) {
            return back()->withErrors([
                'senha' => 'Senha inválida'
            ]);
        }

        $token = $this->jwt->sign($usuario->id);

        $request->session()->put('USUARIO_TOKEN', $token);

        return redirect()->route('dashboard.home');
    }
}
