<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Guarded(['acesso', 'senha'])]
#[Hidden(['senha'])]
class Usuario extends Model {
    public $timestamps = false;
}
