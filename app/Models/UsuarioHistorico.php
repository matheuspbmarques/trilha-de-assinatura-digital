<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;

/**
 * @property int $id
 * @property string $usuario_id
 * @property string $campo
 * @property string $descricao
 * @property string $created_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico whereCampo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico whereDescricao($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UsuarioHistorico whereUsuarioId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperUsuarioHistorico
 */
#[Table('usuarios_historico')]
#[Guarded(['usuario_id', 'campo', 'descricao'])]
class UsuarioHistorico extends Model {
    public $timestamps = false;
}
