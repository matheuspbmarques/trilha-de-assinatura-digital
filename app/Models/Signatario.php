<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $nome
 * @property string $email
 * @property string $cargo
 * @property string $setor
 * @property bool $ativo
 * @property string $created_at
 * @property string $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereAtivo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereCargo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereNome($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereSetor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Signatario whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Guarded(['nome', 'email', 'cargo', 'setor', 'ativo'])]
class Signatario extends Model {
    public $timestamps = false;
    public $keyType = 'string';
}
