<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

#[Guarded(['titulo', 'descricao', 'status', 'usuario_id', 'categoria', 'url'])]
class Processo extends Model {
    public $timestamps = false;
}
