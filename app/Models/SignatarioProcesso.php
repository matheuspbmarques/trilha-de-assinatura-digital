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

    public function signatario()
    {
        return $this->belongsTo(Signatario::class, 'signatario_id');
    }

    public function processo()
    {
        return $this->belongsTo(Processo::class, 'processo_id');
    }
}
