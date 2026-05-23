<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

#[Guarded(['nome', 'email', 'cargo', 'setor', 'ativo'])]
class Signatario extends Model {
    public $timestamps = false;
}
