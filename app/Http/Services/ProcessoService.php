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

    /**
     * Create a new process.
     */
    public function create(
        string $usuarioId,
        string $titulo,
        string $descricao,
        string $categoria,
        string $url,
        bool $fluxoSequencial,
        array $signatarios
    ) {
        return $this->processoRepository->createNew(
            $usuarioId,
            $titulo,
            $descricao,
            $categoria,
            $url,
            $fluxoSequencial,
            $signatarios
        );
    }
}
