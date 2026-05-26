<?php

namespace App\Http\Controllers;

use App\Http\Services\ProcessoService;
use App\Models\Signatario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ProcessoController
{
    private ProcessoService $processoService;

    public function __construct()
    {
        $this->processoService = new ProcessoService;
    }

    /**
     * Display a listing of processes for the user.
     *
     * @return Response
     */
    public function getAll(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');

        // Fetch processes using service layer with default 12 items per page
        $processos = $this->processoService->getPaginatedForUsuario($usuarioId, 12);

        // Fetch all active signatories
        $signatarios = Signatario::where('ativo', true)->orderBy('nome', 'asc')->get();

        return Inertia::render('dashboard/processos', [
            'processos' => $processos,
            'signatarios' => $signatarios,
        ]);
    }

    /**
     * Store a newly created process.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => ['required', 'string', 'max:256'],
            'descricao' => ['required', 'string', 'max:1024'],
            'categoria' => ['required', 'string', 'max:256'],
            'arquivo' => ['required', 'file', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
            'fluxo_sequencial' => ['sometimes', 'boolean'],
            'signatarios' => ['required', 'array', 'min:1'],
            'signatarios.*' => ['required', 'uuid', 'exists:signatarios,id'],
        ], [
            'titulo.required' => 'O título do processo é obrigatório.',
            'titulo.max' => 'O título não pode ter mais de 256 caracteres.',
            'descricao.required' => 'A descrição do processo é obrigatória.',
            'descricao.max' => 'A descrição não pode ter mais de 1024 caracteres.',
            'categoria.required' => 'A categoria do processo é obrigatória.',
            'categoria.max' => 'A categoria não pode ter mais de 256 caracteres.',
            'arquivo.required' => 'O arquivo do processo é obrigatório.',
            'arquivo.file' => 'O arquivo enviado não é válido.',
            'arquivo.mimes' => 'O arquivo deve ser um PDF ou uma imagem (JPEG, PNG, JPG).',
            'arquivo.max' => 'O arquivo não pode ter mais de 5MB.',
            'signatarios.required' => 'Selecione pelo menos um signatário para o processo.',
            'signatarios.min' => 'Selecione pelo menos um signatário para o processo.',
            'signatarios.*.exists' => 'Um ou mais signatários selecionados são inválidos.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $usuarioId = $request->session()->get('USUARIO_ID');
        if (! $usuarioId) {
            abort(401, 'Não autorizado');
        }

        $file = $request->file('arquivo');
        $path = $file->store('processos', 'public');
        $url = \Illuminate\Support\Facades\Storage::disk('public')->url($path);

        $fluxoSequencial = filter_var($request->input('fluxo_sequencial', false), FILTER_VALIDATE_BOOLEAN);
        $signatarios = $request->input('signatarios', []);

        $this->processoService->create(
            $usuarioId,
            $request->input('titulo'),
            $request->input('descricao'),
            $request->input('categoria'),
            $url,
            $fluxoSequencial,
            $signatarios
        );

        return back();
    }
}
