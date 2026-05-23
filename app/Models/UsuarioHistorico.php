<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;

#[Table('usuarios_historico')]
#[Guarded(['usuario_id', 'campo', 'descricao'])]
class UsuarioHistorico extends Model {
    public $timestamps = false;
}
