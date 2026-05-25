<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
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
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProcesso {}
}

namespace App\Models{
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
	#[\AllowDynamicProperties]
	class IdeHelperProcessoHistorico {}
}

namespace App\Models{
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
	#[\AllowDynamicProperties]
	class IdeHelperSignatario {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $signatario_id
 * @property string $campo
 * @property string $descricao
 * @property string $created_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereCampo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereDescricao($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SignatarioHistorico whereSignatarioId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperSignatarioHistorico {}
}

namespace App\Models{
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
 */
	#[\AllowDynamicProperties]
	class IdeHelperUsuario {}
}

namespace App\Models{
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
 */
	#[\AllowDynamicProperties]
	class IdeHelperUsuarioHistorico {}
}

