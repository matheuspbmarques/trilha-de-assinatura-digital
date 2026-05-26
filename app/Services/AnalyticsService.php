<?php

namespace App\Services;

use App\Models\Processo;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Calcula as métricas resumidas para o dashboard.
     */
    public function getDashboardMetrics(string $usuarioId, int $diasAtraso): array
    {
        $total = Processo::where('usuario_id', $usuarioId)->count();
        $pendentes = Processo::where('usuario_id', $usuarioId)->where('status', 'Pendente')->count();
        $emAprovacao = Processo::where('usuario_id', $usuarioId)->where('status', 'Em aprovação')->count();
        $aprovados = Processo::where('usuario_id', $usuarioId)->where('status', 'Aprovado')->count();
        $reprovados = Processo::where('usuario_id', $usuarioId)->where('status', 'Reprovado')->count();

        $tempoMedioInfo = $this->getTempoMedioAprovacao($usuarioId);

        return [
            'total' => $total,
            'pendentes' => $pendentes,
            'em_aprovacao' => $emAprovacao,
            'aprovados' => $aprovados,
            'reprovados' => $reprovados,
            'tempo_medio' => $tempoMedioInfo['formatted'],
        ];
    }

    /**
     * Retorna os processos pendentes ou em aprovação que estão atrasados.
     */
    public function getAtrasadosProcessos(string $usuarioId, int $diasAtraso): Collection
    {
        return Processo::where('usuario_id', $usuarioId)
            ->whereIn('status', ['Pendente', 'Em aprovação'])
            ->where('created_at', '<=', now()->subDays($diasAtraso))
            ->with(['historico', 'signatariosAssoc.signatario'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Calcula o tempo médio de aprovação global dos processos aprovados.
     */
    public function getTempoMedioAprovacao(string $usuarioId, ?Carbon $dataInicio = null, ?Carbon $dataFim = null): array
    {
        $query = DB::table('processos')
            ->join('processos_historico', 'processos.id', '=', 'processos_historico.processo_id')
            ->where('processos.usuario_id', $usuarioId)
            ->where('processos.status', 'Aprovado')
            ->where('processos_historico.campo', 'status')
            ->where('processos_historico.descricao', 'like', '%Aprovado%');

        if ($dataInicio) {
            $query->where('processos_historico.created_at', '>=', $dataInicio);
        }
        if ($dataFim) {
            $query->where('processos_historico.created_at', '<=', $dataFim);
        }

        $approvedData = $query->select('processos.created_at as created_at', 'processos_historico.created_at as approved_at')
            ->get();

        $totalSeconds = 0;
        $countApproved = $approvedData->count();
        foreach ($approvedData as $item) {
            $totalSeconds += strtotime($item->approved_at) - strtotime($item->created_at);
        }
        $avgSeconds = $countApproved > 0 ? ($totalSeconds / $countApproved) : 0;

        return [
            'seconds' => $avgSeconds,
            'formatted' => $this->formatSecondsToDashboardInterval($avgSeconds),
            'count' => $countApproved,
        ];
    }

    /**
     * Retorna a distribuição de processos por status no período.
     */
    public function getStatusDistribuicao(string $usuarioId, Carbon $dataInicio, Carbon $dataFim): array
    {
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

        // Garantir que todos os status possíveis apareçam
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

        return $finalStatusReport;
    }

    /**
     * Retorna a distribuição de processos por categoria no período (Qual categoria possui maior volume?).
     */
    public function getCategoriasVolume(string $usuarioId, ?Carbon $dataInicio = null, ?Carbon $dataFim = null): array
    {
        $query = DB::table('processos')
            ->where('usuario_id', $usuarioId);

        if ($dataInicio && $dataFim) {
            $query->whereBetween('created_at', [$dataInicio, $dataFim]);
        }

        $categoryData = $query->select('categoria', DB::raw('count(*) as qty'))
            ->groupBy('categoria')
            ->orderByDesc('qty')
            ->get();

        $total = $categoryData->sum('qty');

        return $categoryData->map(function ($item) use ($total) {
            return [
                'categoria' => $item->categoria,
                'quantidade' => (int) $item->qty,
                'percentual' => $total > 0 ? round(($item->qty / $total) * 100, 1) : 0,
            ];
        })->toArray();
    }

    /**
     * Retorna o relatório de produtividade de signatários no período (Quais signatários mais aprovam/reprovam).
     */
    public function getSignatariosProductivity(string $usuarioId, Carbon $dataInicio, Carbon $dataFim): array
    {
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

        $signatariosStats = [];
        foreach ($responses as $row) {
            $sigId = $row->signatario_id;
            if (! isset($signatariosStats[$sigId])) {
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

            $produtividadeReport[] = [
                'signatario_id' => $sigId,
                'nome' => $stats['nome'],
                'cargo' => $stats['cargo'],
                'setor' => $stats['setor'],
                'aprovacoes' => $stats['aprovacoes'],
                'reprovacoes' => $stats['reprovacoes'],
                'tempo_medio' => $this->formatSecondsToSignatoryInterval($avgSeconds),
                'tempo_medio_seconds' => $avgSeconds,
            ];
        }

        // Ordenar por volume total de respostas
        usort($produtividadeReport, function ($a, $b) {
            return ($b['aprovacoes'] + $b['reprovacoes']) <=> ($a['aprovacoes'] + $a['reprovacoes']);
        });

        return $produtividadeReport;
    }

    /**
     * Retorna a série histórica de quantidade de processos criados/concluídos por período.
     */
    public function getVolumePorPeriodo(string $usuarioId, Carbon $dataInicio, Carbon $dataFim, string $agrupamento): array
    {
        $periodProcessos = Processo::where('usuario_id', $usuarioId)
            ->where(function ($query) use ($dataInicio, $dataFim) {
                $query->whereBetween('created_at', [$dataInicio, $dataFim])
                    ->orWhereBetween('updated_at', [$dataInicio, $dataFim]);
            })
            ->select('id', 'status', 'created_at', 'updated_at')
            ->get();

        $periodReportMap = [];

        $curr = clone $dataInicio;
        while ($curr <= $dataFim) {
            $key = '';
            if ($agrupamento === 'dia') {
                $key = $curr->format('d/m/y');
                $curr = $curr->addDay();
            } elseif ($agrupamento === 'semana') {
                $key = 'S'.$curr->weekOfYear.'/'.$curr->format('y');
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

            if ($createdCarbon >= $dataInicio && $createdCarbon <= $dataFim) {
                $keyCreated = '';
                if ($agrupamento === 'dia') {
                    $keyCreated = $createdCarbon->format('d/m/y');
                } elseif ($agrupamento === 'semana') {
                    $keyCreated = 'S'.$createdCarbon->weekOfYear.'/'.$createdCarbon->format('y');
                } else {
                    $keyCreated = ucfirst($createdCarbon->translatedFormat('M/y'));
                }
                if (isset($periodReportMap[$keyCreated])) {
                    $periodReportMap[$keyCreated]['criados']++;
                }
            }

            if (in_array($proc->status, ['Aprovado', 'Reprovado']) && $updatedCarbon >= $dataInicio && $updatedCarbon <= $dataFim) {
                $keyConcluded = '';
                if ($agrupamento === 'dia') {
                    $keyConcluded = $updatedCarbon->format('d/m/y');
                } elseif ($agrupamento === 'semana') {
                    $keyConcluded = 'S'.$updatedCarbon->weekOfYear.'/'.$updatedCarbon->format('y');
                } else {
                    $keyConcluded = ucfirst($updatedCarbon->translatedFormat('M/y'));
                }
                if (isset($periodReportMap[$keyConcluded])) {
                    $periodReportMap[$keyConcluded]['concluidos']++;
                }
            }
        }

        return array_values($periodReportMap);
    }

    /**
     * Retorna a lista detalhada de reprovações de processos no período.
     */
    public function getReprovacoesDetalhadas(string $usuarioId, Carbon $dataInicio, Carbon $dataFim): Collection
    {
        return DB::table('signatarios_processos')
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
    }

    /**
     * Formata segundos para o padrão visual do Dashboard.
     */
    public function formatSecondsToDashboardInterval(float $avgSeconds): string
    {
        if ($avgSeconds <= 0) {
            return 'N/A';
        }

        if ($avgSeconds < 60) {
            return round($avgSeconds).' seg';
        }

        $minutes = $avgSeconds / 60;
        if ($minutes < 60) {
            return round($minutes).' min';
        }

        $hours = $minutes / 60;
        $totalHours = (int) round($hours);
        if ($totalHours < 24) {
            return $totalHours.' horas';
        }

        $days = (int) floor($totalHours / 24);
        $remHours = $totalHours % 24;

        return $days.' '.($days === 1 ? 'dia' : 'dias').($remHours > 0 ? ' e '.$remHours.'h' : '');
    }

    /**
     * Formata segundos para o padrão visual do Relatório de Signatários.
     */
    public function formatSecondsToSignatoryInterval(float $avgSeconds): string
    {
        if ($avgSeconds <= 0) {
            return 'N/A';
        }

        if ($avgSeconds < 60) {
            return round($avgSeconds).'s';
        }

        if ($avgSeconds < 3600) {
            return round($avgSeconds / 60).'m';
        }

        if ($avgSeconds < 86400) {
            return round($avgSeconds / 3600).'h';
        }

        $days = (int) floor($avgSeconds / 86400);
        $hours = (int) round(($avgSeconds % 86400) / 3600);

        return $days.($days === 1 ? ' dia' : ' dias').($hours > 0 ? ' e '.$hours.'h' : '');
    }
}
