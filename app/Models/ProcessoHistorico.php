<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('processos_historico')]
#[Guarded(['processo_id', 'campo', 'descricao', 'created_at'])]
class ProcessoHistorico extends Model {}
