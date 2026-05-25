<?php

namespace App\Http\Services;

use App\Http\Repositories\UsuarioRepository;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;

class AuthService {
    private UsuarioRepository $usuarioRepository;
    private JwtService $jwt;

    public function __construct() {
        $this->usuarioRepository = new UsuarioRepository();
        $this->jwt = new JwtService();
    }

    public function signIn(Request $request): Response | RedirectResponse {
        $acesso = $request->input('acesso');
        $senha = $request->input('senha');

        $usuario = $this->usuarioRepository->findByAcesso($acesso);

        if (!$usuario) {
            return response("Usuáro com acesso $acesso, não foi encontrado", 404);
        }

        $isSenhaRight = Hash::check($senha, $usuario->senha);

        if ($isSenhaRight) {
            $token = $this->jwt->sign($usuario->id);

            $request->session()->put('USUARIO_TOKEN', $token);

            return redirect()->route('dashboard.home');
        }

        return response('Acesso ou senha, incorreto', 403);
    }
}
