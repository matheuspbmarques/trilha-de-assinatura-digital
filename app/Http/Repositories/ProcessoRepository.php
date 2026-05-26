<?php

namespace App\Http\Repositories;

use App\Jobs\SendApprovalEmailJob;
use App\Models\Processo;
use App\Models\ProcessoHistorico;
use App\Models\SignatarioProcesso;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessoRepository
{
    /**
     * Get paginated processes for a user.
     *
     * @return LengthAwarePaginator
     */
    public function paginateByUsuarioId(string $usuarioId, int $perPage = 12)
    {
        return Processo::where('usuario_id', $usuarioId)
            ->with(['historico', 'signatariosAssoc.signatario'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create a new process and associate signatories.
     */
    public function createNew(
        string $usuarioId,
        string $titulo,
        string $descricao,
        string $categoria,
        string $url,
        bool $fluxoSequencial,
        array $signatarios
    ) {
        return DB::transaction(function () use ($usuarioId, $titulo, $descricao, $categoria, $url, $fluxoSequencial, $signatarios) {
            $processo = new Processo;
            $processo->id = (string) Str::uuid();
            $processo->usuario_id = $usuarioId;
            $processo->titulo = $titulo;
            $processo->descricao = $descricao;
            $processo->status = 'Pendente';
            $processo->categoria = $categoria;
            $processo->url = $url;
            $processo->fluxo_sequencial = $fluxoSequencial;
            $processo->created_at = now();
            $processo->updated_at = now();
            $processo->save();

            // Grava histórico de criação
            $histCriacao = new ProcessoHistorico;
            $histCriacao->id = (string) Str::uuid();
            $histCriacao->processo_id = $processo->id;
            $histCriacao->campo = 'status';
            $histCriacao->descricao = 'Processo criado com status: Pendente';
            $histCriacao->created_at = now();
            $histCriacao->save();

            // Transiciona para "Em aprovação"
            $processo->status = 'Em aprovação';
            $processo->updated_at = now();
            $processo->save();

            $histTransicao = new ProcessoHistorico;
            $histTransicao->id = (string) Str::uuid();
            $histTransicao->processo_id = $processo->id;
            $histTransicao->campo = 'status';
            $histTransicao->descricao = 'Status alterado para: Em aprovação. Iniciando fluxo de assinaturas.';
            $histTransicao->created_at = now();
            $histTransicao->save();

            $createdRelations = [];
            foreach ($signatarios as $index => $signatarioId) {
                $relation = new SignatarioProcesso;
                $relation->id = (string) Str::uuid();
                $relation->signatario_id = $signatarioId;
                $relation->processo_id = $processo->id;
                $relation->ordem_assinatura = $fluxoSequencial ? ($index + 1) : null;
                $relation->status = 'Pendente';
                $relation->created_at = now();
                $relation->save();
                $createdRelations[] = $relation;
            }

            // Dispara e-mails assíncronos
            if ($fluxoSequencial) {
                // Se sequencial, gera token e dispara apenas para o primeiro
                $firstRelation = $createdRelations[0];
                $firstRelation->token = (string) Str::random(64);
                $firstRelation->token_expira_em = now()->addDays(7);
                $firstRelation->save();

                SendApprovalEmailJob::dispatch($firstRelation->id);
            } else {
                // Se paralelo, gera token e dispara para todos
                foreach ($createdRelations as $relation) {
                    $relation->token = (string) Str::random(64);
                    $relation->token_expira_em = now()->addDays(7);
                    $relation->save();

                    SendApprovalEmailJob::dispatch($relation->id);
                }
            }

            return $processo;
        });
    }
}
