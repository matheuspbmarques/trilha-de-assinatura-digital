<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $signatario_id
 * @property string $campo
 * @property string $descricao
 * @property string $created_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereCampo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereDescricao($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereSignatarioId($value)
 *
 * @mixin \Eloquent
 * @mixin IdeHelperSignatarioHistorico
 */
#[Table('signatarios_historico')]
#[Guarded(['campo', 'descricao', 'created_at'])]
class SignatarioHistorico extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    public $keyType = 'string';
}
