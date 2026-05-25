<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SignatarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('pt_BR');

        $setores = ['TI', 'Financeiro', 'RH', 'Jurídico', 'Vendas', 'Operações', 'Marketing', 'Diretoria', 'Logística', 'Desenvolvimento'];
        $cargos = ['Analista', 'Gerente', 'Diretor', 'Coordenador', 'Assistente', 'Especialista', 'Supervisor', 'Estagiário'];

        for ($i = 0; $i < 200; $i++) {
            $signatario = new \App\Models\Signatario();
            $signatario->id = (string) \Illuminate\Support\Str::uuid();
            $signatario->nome = $faker->name;
            $signatario->email = $faker->unique()->safeEmail;
            $signatario->cargo = $faker->randomElement($cargos) . ' de ' . $faker->randomElement($setores);
            $signatario->setor = $faker->randomElement($setores);
            $signatario->ativo = $faker->boolean(90); // 90% chance of being active
            
            // Randomize creation dates to populate dashboard/metrics beautifully
            $createdAt = $faker->dateTimeBetween('-6 months', 'now');
            $signatario->created_at = $createdAt;
            $signatario->updated_at = $faker->dateTimeBetween($createdAt, 'now');
            $signatario->save();

            // 0 to 5 history entries
            $historyCount = rand(0, 5);
            for ($h = 0; $h < $historyCount; $h++) {
                $campo = $faker->randomElement(['nome', 'email', 'cargo', 'setor', 'ativo']);
                $descricao = match($campo) {
                    'nome' => "Nome alterado para " . $faker->name,
                    'email' => "E-mail alterado para " . $faker->unique()->safeEmail,
                    'cargo' => "Cargo alterado para " . $faker->randomElement($cargos) . ' de ' . $faker->randomElement($setores),
                    'setor' => "Setor alterado para " . $faker->randomElement($setores),
                    'ativo' => "Status alterado para " . ($faker->boolean ? 'ativo' : 'inativo'),
                };

                $historico = new \App\Models\SignatarioHistorico();
                $historico->id = (string) \Illuminate\Support\Str::uuid();
                $historico->signatario_id = $signatario->id;
                $historico->campo = $campo;
                $historico->descricao = $descricao;
                $historico->created_at = $faker->dateTimeBetween($createdAt, 'now');
                $historico->save();
            }
        }

    }
}
