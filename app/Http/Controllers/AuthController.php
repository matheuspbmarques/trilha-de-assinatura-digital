<?php

namespace App\Http\Controllers;

use App\Http\Services\AuthService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Validator;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService;
    }

    #[OA\Post(
        path: "/auth/sign-in",
        summary: "Autenticar usuário",
        description: "Realiza a autenticação do usuário no sistema utilizando acesso (username/email) e senha.",
        tags: ["Autenticação"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/x-www-form-urlencoded",
                schema: new OA\Schema(
                    required: ["acesso", "senha"],
                    properties: [
                        new OA\Property(property: "acesso", type: "string", description: "O identificador de acesso do usuário"),
                        new OA\Property(property: "senha", type: "string", format: "password", description: "A senha do usuário")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 302,
                description: "Redirecionamento para o dashboard em caso de sucesso, ou de volta com erros de validação."
            )
        ]
    )]
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

    #[OA\Get(
        path: "/auth/sign-out",
        summary: "Deslogar usuário",
        description: "Encerra a sessão ativa do usuário e o redireciona para a página de login.",
        tags: ["Autenticação"],
        responses: [
            new OA\Response(
                response: 302,
                description: "Redirecionamento para a página de login."
            )
        ]
    )]
    public function signOut(Request $request)
    {
        $request->session()->remove('USUARIO_TOKEN');
        $request->session()->remove('USUARIO_ID');

        return redirect()->route('auth.sign-in');
    }
}

