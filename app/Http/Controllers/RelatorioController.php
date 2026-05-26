<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RelatorioController
{
    /**
     * Gera dados consolidados para relatórios gerenciais e exibe a tela de relatórios.
     */
    public function index(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (! $usuarioId) {
            abort(401, 'Não autorizado');
        }

        Carbon::setLocale('pt_BR');

        // 0. Filtros de Período
        $dataInicioRaw = $request->input('data_inicio');
        $dataFimRaw = $request->input('data_fim');
        $agrupamento = $request->input('agrupamento', 'dia'); // dia, semana, mes

        // Default: últimos 30 dias
        $dataInicio = $dataInicioRaw ? Carbon::parse($dataInicioRaw)->startOfDay() : now()->subDays(30)->startOfDay();
        $dataFim = $dataFimRaw ? Carbon::parse($dataFimRaw)->endOfDay() : now()->endOfDay();

        $analyticsService = new AnalyticsService;

        $statusReport = $analyticsService->getStatusDistribuicao($usuarioId, $dataInicio, $dataFim);
        $produtividadeReport = $analyticsService->getSignatariosProductivity($usuarioId, $dataInicio, $dataFim);
        $periodoReport = $analyticsService->getVolumePorPeriodo($usuarioId, $dataInicio, $dataFim, $agrupamento);
        $reprovacoesReport = $analyticsService->getReprovacoesDetalhadas($usuarioId, $dataInicio, $dataFim);
        $categoriaReport = $analyticsService->getCategoriasVolume($usuarioId, $dataInicio, $dataFim);

        return Inertia::render('dashboard/relatorios', [
            'filters' => [
                'data_inicio' => $dataInicio->format('Y-m-d'),
                'data_fim' => $dataFim->format('Y-m-d'),
                'agrupamento' => $agrupamento,
            ],
            'statusReport' => $statusReport,
            'produtividadeReport' => $produtividadeReport,
            'periodoReport' => $periodoReport,
            'reprovacoesReport' => $reprovacoesReport,
            'categoriaReport' => $categoriaReport,
        ]);
    }
}
