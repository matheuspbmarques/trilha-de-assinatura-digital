<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Hidden;

/**
 * @property string $id
 * @property string $acesso
 * @property string $senha
 * @property string $created_at
 * @property string $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario whereAcesso($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario whereSenha($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Usuario whereUpdatedAt($value)
 * @mixin \Eloquent
 * @mixin IdeHelperUsuario
 */
#[Guarded(['acesso', 'senha'])]
#[Hidden(['senha'])]
class Usuario extends Model
{
    public $timestamps = false;
    public $keyType = 'string';
}
