<?php

namespace App\Http\Repositories;

use App\Models\Usuario;

class UsuarioRepository
{
    public function findByAcesso(string $acesso)
    {
        return Usuario::whereAcesso($acesso)->first();
    }
}
