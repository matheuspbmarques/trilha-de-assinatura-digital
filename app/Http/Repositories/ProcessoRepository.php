<?php

namespace App\Http\Repositories;

use App\Models\Processo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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
}
