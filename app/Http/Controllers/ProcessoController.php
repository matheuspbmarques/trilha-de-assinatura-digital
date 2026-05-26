<?php

namespace App\Http\Controllers;

use App\Http\Services\ProcessoService;
use Illuminate\Http\Request;
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

        return Inertia::render('dashboard/processos', [
            'processos' => $processos,
        ]);
    }
}
