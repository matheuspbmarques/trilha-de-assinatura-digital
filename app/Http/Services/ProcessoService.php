<?php

namespace App\Http\Services;

use App\Http\Repositories\ProcessoRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProcessoService
{
    private ProcessoRepository $processoRepository;

    public function __construct()
    {
        $this->processoRepository = new ProcessoRepository;
    }

    /**
     * Get paginated processes for a user.
     *
     * @return LengthAwarePaginator
     */
    public function getPaginatedForUsuario(string $usuarioId, int $perPage = 12)
    {
        return $this->processoRepository->paginateByUsuarioId($usuarioId, $perPage);
    }
}
