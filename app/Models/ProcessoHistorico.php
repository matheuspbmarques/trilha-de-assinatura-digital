<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $processo_id
 * @property string $campo
 * @property string $descricao
 * @property string $created_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico whereCampo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico whereDescricao($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProcessoHistorico whereProcessoId($value)
 * @mixin \Eloquent
 */
#[Table('processos_historico')]
#[Guarded(['processo_id', 'campo', 'descricao', 'created_at'])]
class ProcessoHistorico extends Model {
    public $timestamps = false;
}
