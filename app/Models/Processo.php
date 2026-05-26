<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $usuario_id
 * @property string $titulo
 * @property string $descricao
 * @property string $status
 * @property string $categoria
 * @property string $url
 * @property string $created_at
 * @property string $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereCategoria($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereDescricao($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereTitulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Processo whereUsuarioId($value)
 *
 * @mixin \Eloquent
 * @mixin IdeHelperProcesso
 */
#[Guarded(['titulo', 'descricao', 'status', 'usuario_id', 'categoria', 'url'])]
class Processo extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    public $keyType = 'string';
}
