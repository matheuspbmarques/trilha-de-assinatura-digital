<?php

namespace App\Services;

use App\Models\ProcessoAnalitico;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AnalyticsExportService
{
    /**
     * Obter dados consolidados, opcionalmente filtrados por usuário.
     */
    public function getConsolidatedData(?string $usuarioId = null): array
    {
        $query = DB::table('processos')
            ->leftJoin('signatarios_processos', 'processos.id', '=', 'signatarios_processos.processo_id')
            ->leftJoin('signatarios', 'signatarios_processos.signatario_id', '=', 'signatarios.id')
            ->select([
                'processos.id as processo_id',
                'processos.usuario_id as usuario_id',
                'processos.titulo as titulo',
                'processos.categoria as categoria',
                'processos.status as status_processo',
                'processos.created_at as data_criacao',
                'signatarios.id as signatario_id',
                'signatarios.nome as signatario_nome',
                'signatarios.cargo as signatario_cargo',
                'signatarios_processos.respondido_em as data_resposta',
                'signatarios_processos.status as tipo_resposta',
                'signatarios_processos.justificativa as justificativa_reprovacao',
                'signatarios_processos.token_expira_em'
            ]);

        if ($usuarioId) {
            $query->where('processos.usuario_id', $usuarioId);
        }

        $rows = $query->get();
        $consolidated = [];

        foreach ($rows as $row) {
            $tempo_resposta_em_horas = null;
            if ($row->data_resposta) {
                $activationTime = $row->token_expira_em
                    ? strtotime($row->token_expira_em) - (7 * 86400)
                    : strtotime($row->data_criacao);
                $diff = strtotime($row->data_resposta) - $activationTime;
                $tempo_resposta_em_horas = $diff > 0 ? round($diff / 3600, 2) : 0.0;
            }

            $consolidated[] = [
                'processo_id' => $row->processo_id,
                'usuario_id' => $row->usuario_id,
                'titulo' => $row->titulo,
                'categoria' => $row->categoria,
                'status' => $row->status_processo,
                'signatario_id' => $row->signatario_id,
                'signatario_nome' => $row->signatario_nome,
                'signatario_cargo' => $row->signatario_cargo,
                'data_criacao' => $row->data_criacao,
                'data_resposta' => $row->data_resposta,
                'tipo_resposta' => $row->tipo_resposta,
                'tempo_resposta_em_horas' => $tempo_resposta_em_horas,
                'justificativa_reprovacao' => $row->justificativa_reprovacao,
            ];
        }

        return $consolidated;
    }

    /**
     * Consolidar dados no banco de dados (tabela processos_analiticos) e no storage padrão.
     */
    public function consolidate(): array
    {
        $data = $this->getConsolidatedData();

        // 1. Atualizar Tabela Analítica no Banco
        ProcessoAnalitico::truncate();
        
        $chunks = array_chunk($data, 100);
        foreach ($chunks as $chunk) {
            $insertData = array_map(function ($row) {
                return array_merge($row, [
                    'id' => DB::raw('gen_random_uuid()'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }, $chunk);
            DB::table('processos_analiticos')->insert($insertData);
        }

        // 2. Exportar arquivos consolidados para o Datalake
        $this->exportToStorage($data);

        return [
            'success' => true,
            'count' => count($data),
        ];
    }

    /**
     * Exportar dados consolidados em arquivos JSON e CSV no diretório do Datalake.
     */
    public function exportToStorage(array $data): void
    {
        // 1. JSON
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        Storage::disk('local')->put('datalake/processos_analiticos.json', $json);

        // 2. CSV
        $csv = $this->generateCsvContent($data);
        Storage::disk('local')->put('datalake/processos_analiticos.csv', "\xEF\xBB\xBF" . $csv);
    }

    /**
     * Simular exportação particionada para o Datalake.
     */
    public function simulateDatalakePartition(): array
    {
        $data = $this->getConsolidatedData();
        $generatedFiles = [];

        foreach ($data as $row) {
            $date = Carbon::parse($row['data_criacao']);
            $year = $date->format('Y');
            $month = $date->format('m');
            $day = $date->format('d');

            $folderPath = "datalake/partition_year={$year}/partition_month={$month}/partition_day={$day}";
            $jsonPath = "{$folderPath}/processos.json";
            
            // Append or overwrite partitioned JSON
            $existing = [];
            if (Storage::disk('local')->exists($jsonPath)) {
                $existing = json_decode(Storage::disk('local')->get($jsonPath), true) ?: [];
            }
            
            // Avoid duplicate records inside the partition file during simulation
            $existing = array_filter($existing, function ($item) use ($row) {
                return !($item['processo_id'] === $row['processo_id'] && $item['signatario_id'] === $row['signatario_id']);
            });

            $existing[] = $row;
            
            Storage::disk('local')->put($jsonPath, json_encode(array_values($existing), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            // Generate/update CSV for this partition
            $csvPath = "{$folderPath}/processos.csv";
            $csv = $this->generateCsvContent($existing);
            Storage::disk('local')->put($csvPath, "\xEF\xBB\xBF" . $csv);

            if (!in_array($folderPath, $generatedFiles)) {
                $generatedFiles[] = $folderPath;
            }
        }

        return [
            'success' => true,
            'partitions' => $generatedFiles,
            'count' => count($data)
        ];
    }

    /**
     * Gerar conteúdo de arquivo CSV.
     */
    public function generateCsvContent(array $data): string
    {
        $headers = [
            'processo_id', 'titulo', 'categoria', 'status', 'signatario_id',
            'signatario_nome', 'signatario_cargo', 'data_criacao', 'data_resposta',
            'tipo_resposta', 'tempo_resposta_em_horas', 'justificativa_reprovacao'
        ];

        $output = fopen('php://temp', 'r+');
        fputcsv($output, $headers, ';', '"', '\\');

        foreach ($data as $row) {
            fputcsv($output, [
                $row['processo_id'],
                $row['titulo'],
                $row['categoria'],
                $row['status'],
                $row['signatario_id'],
                $row['signatario_nome'],
                $row['signatario_cargo'],
                $row['data_criacao'],
                $row['data_resposta'],
                $row['tipo_resposta'],
                $row['tempo_resposta_em_horas'],
                $row['justificativa_reprovacao']
            ], ';', '"', '\\');
        }

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }
}
