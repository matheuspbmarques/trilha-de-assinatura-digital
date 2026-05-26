<?php

namespace App\Http\Controllers;

use App\Models\Processo;
use App\Models\Signatario;
use App\Models\SignatarioProcesso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class RelatorioController
{
    /**
     * Gera dados consolidados para relatórios gerenciais e exibe a tela de relatórios.
     */
    public function index(Request $request)
    {
        $usuarioId = $request->session()->get('USUARIO_ID');
        if (!$usuarioId) {
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

        // 1. Relatório de processos por status
        $statusData = Processo::where('usuario_id', $usuarioId)
            ->whereBetween('created_at', [$dataInicio, $dataFim])
            ->select('status', DB::raw('count(*) as qty'))
            ->groupBy('status')
            ->get();

        $totalStatusProcessos = $statusData->sum('qty');
        $statusReport = $statusData->map(function ($item) use ($totalStatusProcessos) {
            return [
                'status' => $item->status,
                'quantidade' => (int) $item->qty,
                'percentual' => $totalStatusProcessos > 0 ? round(($item->qty / $totalStatusProcessos) * 100, 1) : 0,
            ];
        })->toArray();

        // Garantir que todos os status apareçam (mesmo com 0)
        $allStatuses = ['Pendente', 'Em aprovação', 'Aprovado', 'Reprovado', 'Cancelado'];
        $statusReportMap = collect($statusReport)->keyBy('status');
        $finalStatusReport = [];
        foreach ($allStatuses as $st) {
            if ($statusReportMap->has($st)) {
                $finalStatusReport[] = $statusReportMap->get($st);
            } else {
                $finalStatusReport[] = [
                    'status' => $st,
                    'quantidade' => 0,
                    'percentual' => 0.0,
                ];
            }
        }

        // 2. Relatório de produtividade por signatário
        // Carregar todas as respostas de signatários correspondentes a processos do usuário no período
        $responses = DB::table('signatarios_processos')
            ->join('processos', 'signatarios_processos.processo_id', '=', 'processos.id')
            ->join('signatarios', 'signatarios_processos.signatario_id', '=', 'signatarios.id')
            ->where('processos.usuario_id', $usuarioId)
            ->whereBetween('signatarios_processos.respondido_em', [$dataInicio, $dataFim])
            ->select(
                'signatarios.id as signatario_id',
                'signatarios.nome',
                'signatarios.cargo',
                'signatarios.setor',
                'signatarios_processos.status',
                'signatarios_processos.respondido_em',
                'signatarios_processos.token_expira_em',
                'processos.created_at as processo_created_at'
            )
            ->get();

        // Agregar dados em PHP para máxima compatibilidade com bancos diferentes e precisão no cálculo
        $signatariosStats = [];
        foreach ($responses as $row) {
            $sigId = $row->signatario_id;
            if (!isset($signatariosStats[$sigId])) {
                $signatariosStats[$sigId] = [
                    'nome' => $row->nome,
                    'cargo' => $row->cargo,
                    'setor' => $row->setor,
                    'aprovacoes' => 0,
                    'reprovacoes' => 0,
                    'total_tempo' => 0,
                    'respostas_count' => 0,
                ];
            }

            if ($row->status === 'Aprovado') {
                $signatariosStats[$sigId]['aprovacoes']++;
            } elseif ($row->status === 'Reprovado') {
                $signatariosStats[$sigId]['reprovacoes']++;
            }

            // O convite iniciou quando o token foi gerado (token_expira_em - 7 dias), fallback para criação do processo
            $activationTime = $row->token_expira_em 
                ? strtotime($row->token_expira_em) - (7 * 86400) 
                : strtotime($row->processo_created_at);

            $responseTime = strtotime($row->respondido_em) - $activationTime;
            if ($responseTime > 0) {
                $signatariosStats[$sigId]['total_tempo'] += $responseTime;
                $signatariosStats[$sigId]['respostas_count']++;
            }
        }

        $produtividadeReport = [];
        foreach ($signatariosStats as $sigId => $stats) {
            $avgSeconds = $stats['respostas_count'] > 0 ? $stats['total_tempo'] / $stats['respostas_count'] : 0;
            
            // Formatador legível
            $tempoMedio = 'N/A';
            if ($avgSeconds > 0) {
                if ($avgSeconds < 60) {
                    $tempoMedio = round($avgSeconds) . 's';
                } elseif ($avgSeconds < 3600) {
                    $tempoMedio = round($avgSeconds / 60) . 'm';
                } elseif ($avgSeconds < 86400) {
                    $tempoMedio = round($avgSeconds / 3600) . 'h';
                } else {
                    $days = (int) floor($avgSeconds / 86400);
                    $hours = (int) round(($avgSeconds % 86400) / 3600);
                    $tempoMedio = $days . ($days === 1 ? ' dia' : ' dias') . ($hours > 0 ? ' e ' . $hours . 'h' : '');
                }
            }

            $produtividadeReport[] = [
                'signatario_id' => $sigId,
                'nome' => $stats['nome'],
                'cargo' => $stats['cargo'],
                'setor' => $stats['setor'],
                'aprovacoes' => $stats['aprovacoes'],
                'reprovacoes' => $stats['reprovacoes'],
                'tempo_medio' => $tempoMedio,
                'tempo_medio_seconds' => $avgSeconds,
            ];
        }

        // Ordenar por volume total de respostas
        usort($produtividadeReport, function ($a, $b) {
            return ($b['aprovacoes'] + $b['reprovacoes']) <=> ($a['aprovacoes'] + $a['reprovacoes']);
        });

        // 3. Relatório de processos por período
        $periodProcessos = Processo::where('usuario_id', $usuarioId)
            ->where(function ($query) use ($dataInicio, $dataFim) {
                $query->whereBetween('created_at', [$dataInicio, $dataFim])
                      ->orWhereBetween('updated_at', [$dataInicio, $dataFim]);
            })
            ->select('id', 'status', 'created_at', 'updated_at')
            ->get();

        $periodReportMap = [];
        
        // Inicializar slots de datas de acordo com o agrupamento para evitar lacunas
        $curr = clone $dataInicio;
        while ($curr <= $dataFim) {
            $key = '';
            if ($agrupamento === 'dia') {
                $key = $curr->format('d/m/y');
                $curr = $curr->addDay();
            } elseif ($agrupamento === 'semana') {
                $key = 'S' . $curr->weekOfYear . '/' . $curr->format('y');
                $curr = $curr->addWeek();
            } else { // mes
                $key = ucfirst($curr->translatedFormat('M/y'));
                $curr = $curr->addMonth();
            }
            $periodReportMap[$key] = [
                'periodo' => $key,
                'criados' => 0,
                'concluidos' => 0,
            ];
        }

        foreach ($periodProcessos as $proc) {
            $createdCarbon = Carbon::parse($proc->created_at);
            $updatedCarbon = Carbon::parse($proc->updated_at);

            // Adiciona contagem para "Criados"
            if ($createdCarbon >= $dataInicio && $createdCarbon <= $dataFim) {
                $keyCreated = '';
                if ($agrupamento === 'dia') {
                    $keyCreated = $createdCarbon->format('d/m/y');
                } elseif ($agrupamento === 'semana') {
                    $keyCreated = 'S' . $createdCarbon->weekOfYear . '/' . $createdCarbon->format('y');
                } else {
                    $keyCreated = ucfirst($createdCarbon->translatedFormat('M/y'));
                }
                if (isset($periodReportMap[$keyCreated])) {
                    $periodReportMap[$keyCreated]['criados']++;
                }
            }

            // Adiciona contagem para "Concluídos" (Aprovado ou Reprovado)
            if (in_array($proc->status, ['Aprovado', 'Reprovado']) && $updatedCarbon >= $dataInicio && $updatedCarbon <= $dataFim) {
                $keyConcluded = '';
                if ($agrupamento === 'dia') {
                    $keyConcluded = $updatedCarbon->format('d/m/y');
                } elseif ($agrupamento === 'semana') {
                    $keyConcluded = 'S' . $updatedCarbon->weekOfYear . '/' . $updatedCarbon->format('y');
                } else {
                    $keyConcluded = ucfirst($updatedCarbon->translatedFormat('M/y'));
                }
                if (isset($periodReportMap[$keyConcluded])) {
                    $periodReportMap[$keyConcluded]['concluidos']++;
                }
            }
        }

        $periodoReport = array_values($periodReportMap);

        // 4. Relatório de reprovações
        $reprovacoes = DB::table('signatarios_processos')
            ->join('processos', 'signatarios_processos.processo_id', '=', 'processos.id')
            ->join('signatarios', 'signatarios_processos.signatario_id', '=', 'signatarios.id')
            ->where('processos.usuario_id', $usuarioId)
            ->where('signatarios_processos.status', 'Reprovado')
            ->whereBetween('signatarios_processos.respondido_em', [$dataInicio, $dataFim])
            ->select(
                'processos.titulo as processo_titulo',
                'signatarios.nome as signatario_nome',
                'signatarios_processos.respondido_em as data_reprovacao',
                'signatarios_processos.justificativa'
            )
            ->orderBy('signatarios_processos.respondido_em', 'desc')
            ->get();

        return Inertia::render('dashboard/relatorios', [
            'filters' => [
                'data_inicio' => $dataInicio->format('Y-m-d'),
                'data_fim' => $dataFim->format('Y-m-d'),
                'agrupamento' => $agrupamento,
            ],
            'statusReport' => $finalStatusReport,
            'produtividadeReport' => $produtividadeReport,
            'periodoReport' => $periodoReport,
            'reprovacoesReport' => $reprovacoes,
        ]);
    }
}
