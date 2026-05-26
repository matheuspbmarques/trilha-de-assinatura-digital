<?php

namespace App\Http\Controllers;

use App\Models\Processo;
use App\Models\Signatario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController
{
    /**
     * Exibe o dashboard com indicadores e listagem de processos com filtros.
     */
    public function index(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (!$usuarioId) {
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

        // 1. Contagens de indicadores
        $totalProcessos = Processo::where('usuario_id', $usuarioId)->count();
        $pendentesCount = Processo::where('usuario_id', $usuarioId)->where('status', 'Pendente')->count();
        $emAprovacaoCount = Processo::where('usuario_id', $usuarioId)->where('status', 'Em aprovação')->count();
        $aprovadosCount = Processo::where('usuario_id', $usuarioId)->where('status', 'Aprovado')->count();
        $reprovadosCount = Processo::where('usuario_id', $usuarioId)->where('status', 'Reprovado')->count();

        // 2. Tempo Médio de Aprovação (baseado no histórico, conforme Requisito 1.6 e instrução)
        // Buscamos o created_at do processo e o created_at do histórico onde o status vira 'Aprovado'
        $approvedData = DB::table('processos')
            ->join('processos_historico', 'processos.id', '=', 'processos_historico.processo_id')
            ->where('processos.usuario_id', $usuarioId)
            ->where('processos.status', 'Aprovado')
            ->where('processos_historico.campo', 'status')
            ->where('processos_historico.descricao', 'like', '%Aprovado%')
            ->select('processos.created_at as created_at', 'processos_historico.created_at as approved_at')
            ->get();

        $totalSeconds = 0;
        $countApproved = $approvedData->count();
        foreach ($approvedData as $item) {
            $totalSeconds += strtotime($item->approved_at) - strtotime($item->created_at);
        }
        $avgSeconds = $countApproved > 0 ? ($totalSeconds / $countApproved) : 0;

        $tempoMedioFormatado = 'N/A';
        if ($avgSeconds > 0) {
            if ($avgSeconds < 60) {
                $tempoMedioFormatado = round($avgSeconds) . ' seg';
            } else {
                $minutes = $avgSeconds / 60;
                if ($minutes < 60) {
                    $tempoMedioFormatado = round($minutes) . ' min';
                } else {
                    $hours = $minutes / 60;
                    $totalHours = (int) round($hours);
                    if ($totalHours < 24) {
                        $tempoMedioFormatado = $totalHours . ' horas';
                    } else {
                        $days = (int) floor($totalHours / 24);
                        $remHours = $totalHours % 24;
                        $tempoMedioFormatado = $days . ' ' . ($days === 1 ? 'dia' : 'dias') . ($remHours > 0 ? ' e ' . $remHours . 'h' : '');
                    }
                }
            }
        }

        // 3. Processos Atrasados / Alertas (Pendentes ou Em aprovação há mais de X dias)
        $atrasadosQuery = Processo::where('usuario_id', $usuarioId)
            ->whereIn('status', ['Pendente', 'Em aprovação'])
            ->where('created_at', '<=', now()->subDays($diasAtraso))
            ->with(['historico', 'signatariosAssoc.signatario'])
            ->orderBy('created_at', 'asc');

        $atrasados = $atrasadosQuery->get();

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
            'metrics' => [
                'total' => $totalProcessos,
                'pendentes' => $pendentesCount,
                'em_aprovacao' => $emAprovacaoCount,
                'aprovados' => $aprovadosCount,
                'reprovados' => $reprovadosCount,
                'tempo_medio' => $tempoMedioFormatado,
            ],
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
