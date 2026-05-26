<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $processo_id
 * @property string $usuario_id
 * @property string $titulo
 * @property string $categoria
 * @property string $status
 * @property string|null $signatario_id
 * @property string|null $signatario_nome
 * @property string|null $signatario_cargo
 * @property string $data_criacao
 * @property string|null $data_resposta
 * @property string|null $tipo_resposta
 * @property float|null $tempo_resposta_em_horas
 * @property string|null $justificativa_reprovacao
 * @property string $created_at
 * @property string $updated_at
 */
class ProcessoAnalitico extends Model
{
    protected $table = 'processos_analiticos';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = true;

    protected $guarded = [];
}
