<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @property string $id
 * @property string $processo_id
 * @property string|null $usuario_id
 * @property string|null $signatario_id
 * @property string $acao
 * @property string $descricao
 * @property array|null $dados_anteriores
 * @property array|null $dados_novos
 * @property string $created_at
 */
#[Table('processos_auditoria')]
#[Guarded(['processo_id', 'usuario_id', 'signatario_id', 'acao', 'descricao', 'dados_anteriores', 'dados_novos', 'created_at'])]
class ProcessoAuditoria extends Model
{
    public $timestamps = false;

    public $incrementing = false;

    public $keyType = 'string';

    protected $casts = [
        'dados_anteriores' => 'array',
        'dados_novos' => 'array',
    ];

    /**
     * Helper para registrar auditorias.
     */
    public static function registrar(
        string $processoId,
        string $acao,
        string $descricao,
        ?string $usuarioId = null,
        ?string $signatarioId = null,
        ?array $dadosAnteriores = null,
        ?array $dadosNovos = null
    ): self {
        $auditoria = new self;
        $auditoria->id = (string) Str::uuid();
        $auditoria->processo_id = $processoId;
        $auditoria->usuario_id = $usuarioId;
        $auditoria->signatario_id = $signatarioId;
        $auditoria->acao = $acao;
        $auditoria->descricao = $descricao;
        $auditoria->dados_anteriores = $dadosAnteriores;
        $auditoria->dados_novos = $dadosNovos;
        $auditoria->created_at = now();
        $auditoria->save();

        return $auditoria;
    }

    public function processo()
    {
        return $this->belongsTo(Processo::class, 'processo_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function signatario()
    {
        return $this->belongsTo(Signatario::class, 'signatario_id');
    }
}
