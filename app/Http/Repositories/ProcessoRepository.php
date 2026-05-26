<?php

namespace App\Http\Repositories;

use App\Models\Processo;
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
        // TODO(security): Ensure query retrieves only processes owned by the authenticated user to prevent IDOR.
        return Processo::where('usuario_id', $usuarioId)
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
            $processo = new Processo();
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

            foreach ($signatarios as $index => $signatarioId) {
                $relation = new SignatarioProcesso();
                $relation->id = (string) Str::uuid();
                $relation->signatario_id = $signatarioId;
                $relation->processo_id = $processo->id;
                $relation->ordem_assinatura = $fluxoSequencial ? ($index + 1) : null;
                $relation->created_at = now();
                $relation->save();
            }

            return $processo;
        });
    }
}
