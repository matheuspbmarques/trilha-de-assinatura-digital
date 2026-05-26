<?php

use App\Services\AnalyticsExportService;

test('it generates csv content correctly', function () {
    $service = new AnalyticsExportService();

    $data = [
        [
            'processo_id' => '123e4567-e89b-12d3-a456-426614174000',
            'titulo' => 'Processo Teste',
            'categoria' => 'Contratos',
            'status' => 'Aprovado',
            'signatario_id' => '98765432-1234-5678-9012-345678901234',
            'signatario_nome' => 'João Silva',
            'signatario_cargo' => 'Diretor',
            'data_criacao' => '2026-05-26 12:00:00',
            'data_resposta' => '2026-05-26 14:30:00',
            'tipo_resposta' => 'Aprovado',
            'tempo_resposta_em_horas' => 2.5,
            'justificativa_reprovacao' => null,
        ]
    ];

    $csv = $service->generateCsvContent($data);

    // Verify header and row are present
    expect($csv)->toContain('processo_id;titulo;categoria;status;signatario_id;signatario_nome;signatario_cargo;data_criacao;data_resposta;tipo_resposta;tempo_resposta_em_horas;justificativa_reprovacao');
    expect($csv)->toContain('123e4567-e89b-12d3-a456-426614174000;"Processo Teste";Contratos;Aprovado;98765432-1234-5678-9012-345678901234;"João Silva";Diretor;"2026-05-26 12:00:00";"2026-05-26 14:30:00";Aprovado;2.5;');
});
