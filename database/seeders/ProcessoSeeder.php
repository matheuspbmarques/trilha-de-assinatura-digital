<?php

namespace Database\Seeders;

use App\Models\Processo;
use App\Models\ProcessoHistorico;
use App\Models\Signatario;
use App\Models\SignatarioProcesso;
use App\Models\Usuario;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProcessoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Factory::create('pt_BR');

        // Get the test user
        $usuario = Usuario::where('acesso', 'test')->first();
        if (! $usuario) {
            $seeder = new CreateUsuarioSeeder;
            $seeder->run();
            $usuario = Usuario::where('acesso', 'test')->first();
        }

        $usuarioId = $usuario->id;

        // Get all signatories to associate with processes
        $signatarios = Signatario::all();
        if ($signatarios->isEmpty()) {
            $seeder = new SignatarioSeeder;
            $seeder->run();
            $signatarios = Signatario::all();
        }
        $signatarioIds = $signatarios->pluck('id')->toArray();

        $categorias = ['Contratos', 'Recursos Humanos', 'Financeiro', 'Jurídico', 'Compras', 'Vendas', 'Administrativo', 'Tecnologia'];
        $statusOptions = ['Pendente', 'Em aprovação', 'Aprovado', 'Reprovado', 'Cancelado'];

        $documentTypes = [
            'Contrato de Prestação de Serviços',
            'Aditivo de Contrato Trabalho',
            'Acordo de Confidencialidade (NDA)',
            'Termo de Homologação',
            'Proposta Comercial',
            'Relatório de Auditoria',
            'Orçamento de Compras',
            'Termo de Quitação',
            'Autorização de Pagamento',
            'Declaração de Conformidade',
        ];

        for ($i = 0; $i < 1000; $i++) {
            $processo = new Processo;
            $processo->id = (string) Str::uuid();
            $processo->usuario_id = $usuarioId;
            $processo->titulo = $faker->randomElement($documentTypes).' - '.$faker->company;
            $processo->descricao = $faker->sentence(10);
            $processo->status = $faker->randomElement($statusOptions);
            $processo->categoria = $faker->randomElement($categorias);
            $processo->url = 'https://example.com/docs/'.$faker->uuid.'.pdf';

            // Randomize creation date
            $createdAt = $faker->dateTimeBetween('-6 months', 'now');
            $processo->created_at = $createdAt;
            $processo->updated_at = $faker->dateTimeBetween($createdAt, 'now');
            $processo->save();

            // Associate with 1 to 4 random signatories
            $assocCount = rand(1, 4);
            $selectedSignatarios = $faker->randomElements($signatarioIds, min($assocCount, count($signatarioIds)));
            foreach ($selectedSignatarios as $signatarioId) {
                $relation = new SignatarioProcesso;
                $relation->id = (string) Str::uuid();
                $relation->signatario_id = $signatarioId;
                $relation->processo_id = $processo->id;
                $relation->created_at = $faker->dateTimeBetween($createdAt, 'now');
                $relation->save();
            }

            // 0 to 5 history entries
            $historyCount = rand(0, 5);
            for ($h = 0; $h < $historyCount; $h++) {
                $campo = $faker->randomElement(['titulo', 'descricao', 'status', 'categoria', 'url']);
                $descricao = match ($campo) {
                    'titulo' => 'Título alterado para: '.$faker->randomElement($documentTypes).' - '.$faker->company,
                    'descricao' => 'Descrição atualizada para: '.$faker->sentence(8),
                    'status' => 'Status alterado para: '.$faker->randomElement($statusOptions),
                    'categoria' => 'Categoria alterada para: '.$faker->randomElement($categorias),
                    'url' => 'URL do documento atualizada para: https://example.com/docs/'.$faker->uuid.'.pdf',
                };

                $historico = new ProcessoHistorico;
                $historico->id = (string) Str::uuid();
                $historico->processo_id = $processo->id;
                $historico->campo = $campo;
                $historico->descricao = $descricao;
                $historico->created_at = $faker->dateTimeBetween($createdAt, 'now');
                $historico->save();
            }
        }

    }
}
