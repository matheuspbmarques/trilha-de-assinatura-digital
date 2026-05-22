<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('signatarios_historico')]
#[Guarded(['campo', 'descricao', 'created_at'])]
class SignatarioHistorico extends Model {}
