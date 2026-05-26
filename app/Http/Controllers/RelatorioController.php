<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use App\Services\AnalyticsExportService;
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

        $datalakeSimulation = $request->session()->get('datalake_simulation');
        $successMsg = $request->session()->get('success');

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
            'datalakeSimulation' => $datalakeSimulation,
            'successMsg' => $successMsg,
        ]);
    }

    /**
     * Triga a consolidação da base analítica.
     */
    public function consolidar(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (! $usuarioId) {
            abort(401, 'Não autorizado');
        }

        $exportService = new AnalyticsExportService();
        $result = $exportService->consolidate();

        return redirect()->back()->with('success', "Base analítica consolidada com sucesso! {$result['count']} registros processados.");
    }

    /**
     * Triga a simulação de exportação particionada para o datalake.
     */
    public function simularDatalake(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (! $usuarioId) {
            abort(401, 'Não autorizado');
        }

        $exportService = new AnalyticsExportService();
        $result = $exportService->simulateDatalakePartition();

        return redirect()->back()->with('datalake_simulation', [
            'success' => true,
            'partitions' => $result['partitions'],
            'count' => $result['count'],
        ]);
    }

    /**
     * Download de dados em CSV.
     */
    public function downloadCsv(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (! $usuarioId) {
            abort(401, 'Não autorizado');
        }

        $exportService = new AnalyticsExportService();
        $data = $exportService->getConsolidatedData($usuarioId);
        $csvContent = $exportService->generateCsvContent($data);

        return response($csvContent)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="processos_analiticos.csv"');
    }

    /**
     * Download de dados em JSON.
     */
    public function downloadJson(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (! $usuarioId) {
            abort(401, 'Não autorizado');
        }

        $exportService = new AnalyticsExportService();
        $data = $exportService->getConsolidatedData($usuarioId);

        return response()->json($data)
            ->header('Content-Disposition', 'attachment; filename="processos_analiticos.json"');
    }
}
