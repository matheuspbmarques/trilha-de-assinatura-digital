<?php

namespace App\Http\Controllers;

use App\Http\Services\SignatarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use OpenApi\Attributes as OA;

class SignatarioController
{
    private SignatarioService $signatarioService;

    public function __construct()
    {
        $this->signatarioService = new SignatarioService;
    }

    #[OA\Post(
        path: "/signatarios",
        summary: "Cadastrar signatário",
        description: "Cria um novo signatário no sistema com nome, e-mail, cargo e setor.",
        tags: ["Signatários"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/x-www-form-urlencoded",
                schema: new OA\Schema(
                    required: ["nome", "email", "cargo", "setor"],
                    properties: [
                        new OA\Property(property: "nome", type: "string", description: "Nome completo do signatário"),
                        new OA\Property(property: "email", type: "string", format: "email", description: "E-mail único do signatário"),
                        new OA\Property(property: "cargo", type: "string", description: "Cargo/função do signatário"),
                        new OA\Property(property: "setor", type: "string", description: "Setor/departamento do signatário")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 302,
                description: "Redirecionamento para a página anterior após a criação, ou de volta com erros de validação."
            )
        ]
    )]
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

    public function getAll(Request $request)
    {
        $signatarios = $this->signatarioService->getPaginated(12);

        return Inertia::render('dashboard/signatarios', [
            'signatarios' => $signatarios,
        ]);
    }

    #[OA\Put(
        path: "/signatarios/{id}",
        summary: "Atualizar signatário",
        description: "Atualiza as informações de um signatário existente.",
        tags: ["Signatários"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "UUID v4 do signatário",
                schema: new OA\Schema(type: "string", format: "uuid")
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "application/x-www-form-urlencoded",
                schema: new OA\Schema(
                    required: ["nome", "email", "cargo", "setor"],
                    properties: [
                        new OA\Property(property: "nome", type: "string", description: "Nome completo do signatário"),
                        new OA\Property(property: "email", type: "string", format: "email", description: "E-mail do signatário"),
                        new OA\Property(property: "cargo", type: "string", description: "Cargo/função do signatário"),
                        new OA\Property(property: "setor", type: "string", description: "Setor/departamento do signatário"),
                        new OA\Property(property: "ativo", type: "boolean", description: "Status de ativação do signatário", default: true)
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 302,
                description: "Redirecionamento após a atualização do signatário, ou de volta com erros de validação."
            )
        ]
    )]
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

