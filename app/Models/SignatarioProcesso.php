<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('signatarios_processos')]
#[Guarded(['signatario_id', 'processo_id', 'created_at'])]
class SignatarioProcesso extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    public $keyType = 'string';
}
