<?php

namespace App\Console\Commands;

use App\Services\AnalyticsExportService;
use Illuminate\Console\Command;

class ConsolidateAnalytics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analytics:consolidate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Consolida a base analítica e gera arquivos para o Datalake';

    /**
     * Execute the console command.
     */
    public function handle(AnalyticsExportService $exportService)
    {
        $this->info('Iniciando consolidação dos dados analíticos...');
        
        $result = $exportService->consolidate();
        
        $this->info("Consolidação concluída! {$result['count']} registros consolidados na tabela processos_analiticos.");

        $this->info('Iniciando simulação de particionamento no Datalake...');
        $partitionResult = $exportService->simulateDatalakePartition();
        $this->info('Particionamento concluído! Diretórios gerados:');
        foreach ($partitionResult['partitions'] as $partition) {
            $this->line(" - {$partition}");
        }

        return self::SUCCESS;
    }
}
