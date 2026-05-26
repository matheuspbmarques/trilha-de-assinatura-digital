<?php

namespace App\Http\Controllers;

use App\Models\Processo;
use App\Models\Signatario;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController
{
    /**
     * Exibe o dashboard com indicadores e listagem de processos com filtros.
     */
    public function index(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (! $usuarioId) {
            abort(401, 'Não autorizado');
        }

        // Parâmetros de filtro
        $diasAtraso = (int) $request->input('dias_atraso', 7);
        $status = $request->input('status');
        $categoria = $request->input('categoria');
        $signatarioId = $request->input('signatario_id');
        $dataInicio = $request->input('data_inicio');
        $dataFim = $request->input('data_fim');
        $apenasAtrasados = filter_var($request->input('apenas_atrasados', false), FILTER_VALIDATE_BOOLEAN);

        $analyticsService = new AnalyticsService;

        // 1. Contagens de indicadores e Tempo Médio de Aprovação obtidos do serviço
        $metrics = $analyticsService->getDashboardMetrics($usuarioId, $diasAtraso);

        // 3. Processos Atrasados / Alertas obtidos do serviço
        $atrasados = $analyticsService->getAtrasadosProcessos($usuarioId, $diasAtraso);

        // 4. Listagem Filtrada de Processos
        $listQuery = Processo::where('usuario_id', $usuarioId)
            ->with(['historico', 'signatariosAssoc.signatario']);

        if ($status) {
            $listQuery->where('status', $status);
        }

        if ($categoria) {
            $listQuery->where('categoria', $categoria);
        }

        if ($signatarioId) {
            $listQuery->whereHas('signatariosAssoc', function ($q) use ($signatarioId) {
                $q->where('signatario_id', $signatarioId);
            });
        }

        if ($dataInicio) {
            $listQuery->whereDate('created_at', '>=', $dataInicio);
        }

        if ($dataFim) {
            $listQuery->whereDate('created_at', '<=', $dataFim);
        }

        if ($apenasAtrasados) {
            $listQuery->whereIn('status', ['Pendente', 'Em aprovação'])
                ->where('created_at', '<=', now()->subDays($diasAtraso));
        }

        $processos = $listQuery->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        // 5. Dados Auxiliares para preenchimento dos filtros suspensos
        $signatarios = Signatario::where('ativo', true)->orderBy('nome', 'asc')->get();

        $categoriasUnicas = Processo::where('usuario_id', $usuarioId)
            ->distinct()
            ->pluck('categoria')
            ->toArray();

        $defaultCategories = ['Contratos', 'Recursos Humanos', 'Financeiro', 'Jurídico', 'Compras', 'Vendas', 'Administrativo', 'Tecnologia'];
        $categorias = array_unique(array_merge($categoriasUnicas, $defaultCategories));
        sort($categorias);

        return Inertia::render('dashboard/home', [
            'metrics' => $metrics,
            'filters' => [
                'status' => $status,
                'categoria' => $categoria,
                'signatario_id' => $signatarioId,
                'data_inicio' => $dataInicio,
                'data_fim' => $dataFim,
                'dias_atraso' => $diasAtraso,
                'apenas_atrasados' => $apenasAtrasados,
            ],
            'processos' => $processos,
            'atrasados' => $atrasados,
            'signatarios' => $signatarios,
            'categorias' => $categorias,
        ]);
    }
}
