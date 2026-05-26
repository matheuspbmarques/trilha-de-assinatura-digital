<?php

namespace App\Http\Controllers;

use App\Jobs\SendApprovalEmailJob;
use App\Models\ProcessoHistorico;
use App\Models\SignatarioProcesso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProcessoAssinaturaController
{
    /**
     * Exibe a tela pública de validação/assinatura.
     */
    public function show(string $token)
    {
        $relation = SignatarioProcesso::where('token', $token)
            ->with(['signatario', 'processo.signatariosAssoc.signatario'])
            ->first();

        if (! $relation) {
            return Inertia::render('processos/validar', [
                'state' => 'invalid_token',
            ]);
        }

        $processo = $relation->processo;

        // 1. Processo já finalizado
        if (in_array($processo->status, ['Aprovado', 'Reprovado', 'Cancelado'])) {
            return Inertia::render('processos/validar', [
                'state' => 'process_completed',
                'processoStatus' => $processo->status,
                'relation' => $relation,
            ]);
        }

        // 2. Signatário já respondeu
        if ($relation->status !== 'Pendente') {
            return Inertia::render('processos/validar', [
                'state' => 'already_signed',
                'relation' => $relation,
            ]);
        }

        // 3. Link expirou
        if ($relation->token_expira_em && now()->gt($relation->token_expira_em)) {
            return Inertia::render('processos/validar', [
                'state' => 'expired',
                'relation' => $relation,
            ]);
        }

        // 4. Fluxo sequencial - verificar vez de assinar
        if ($processo->fluxo_sequencial) {
            $hasPreviousPending = SignatarioProcesso::where('processo_id', $processo->id)
                ->where('ordem_assinatura', '<', $relation->ordem_assinatura)
                ->where('status', 'Pendente')
                ->exists();

            if ($hasPreviousPending) {
                return Inertia::render('processos/validar', [
                    'state' => 'waiting_turn',
                    'relation' => $relation,
                ]);
            }
        }

        // 5. Pronto para assinar
        return Inertia::render('processos/validar', [
            'state' => 'valid',
            'relation' => $relation,
        ]);
    }

    /**
     * Processa a decisão de aprovação ou reprovação.
     */
    public function responder(string $token, Request $request)
    {
        $relation = SignatarioProcesso::where('token', $token)
            ->with(['signatario', 'processo'])
            ->first();

        if (! $relation) {
            abort(404, 'Token inválido');
        }

        $processo = $relation->processo;

        // Validações básicas de segurança na submissão
        if (in_array($processo->status, ['Aprovado', 'Reprovado', 'Cancelado'])) {
            return back()->withErrors(['error' => 'Este processo já foi finalizado.']);
        }

        if ($relation->status !== 'Pendente') {
            return back()->withErrors(['error' => 'Você já respondeu a este processo.']);
        }

        if ($relation->token_expira_em && now()->gt($relation->token_expira_em)) {
            return back()->withErrors(['error' => 'Este link de assinatura expirou.']);
        }

        if ($processo->fluxo_sequencial) {
            $hasPreviousPending = SignatarioProcesso::where('processo_id', $processo->id)
                ->where('ordem_assinatura', '<', $relation->ordem_assinatura)
                ->where('status', 'Pendente')
                ->exists();

            if ($hasPreviousPending) {
                return back()->withErrors(['error' => 'Ainda não é sua vez de assinar este processo.']);
            }
        }

        // Validação dos dados enviados
        $validator = Validator::make($request->all(), [
            'decisao' => ['required', 'string', 'in:Aprovado,Reprovado'],
            'justificativa' => [
                $request->input('decisao') === 'Reprovado' ? 'required' : 'nullable',
                'string',
                'max:1024',
            ],
        ], [
            'decisao.required' => 'A decisão é obrigatória.',
            'decisao.in' => 'Decisão inválida.',
            'justificativa.required' => 'A justificativa é obrigatória ao reprovar o processo.',
            'justificativa.max' => 'A justificativa não pode passar de 1024 caracteres.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        DB::transaction(function () use ($relation, $processo, $request) {
            $decisao = $request->input('decisao');
            $justificativa = $request->input('justificativa');

            // Atualiza status da assinatura
            $relation->status = $decisao;
            $relation->respondido_em = now();
            $relation->justificativa = $justificativa;
            $relation->ip_requisicao = $request->ip();
            $relation->user_agent = substr($request->userAgent() ?? '', 0, 255);
            $relation->save();

            // Grava no histórico a resposta do signatário
            $histAssinatura = new ProcessoHistorico;
            $histAssinatura->id = (string) Str::uuid();
            $histAssinatura->processo_id = $processo->id;
            $histAssinatura->campo = 'status';
            $histAssinatura->descricao = sprintf(
                'Signatário %s (%s) respondeu como: %s.%s (IP: %s)',
                $relation->signatario->nome,
                $relation->signatario->email,
                $decisao,
                $decisao === 'Reprovado' ? ' Justificativa: '.$justificativa : '',
                $request->ip()
            );
            $histAssinatura->created_at = now();
            $histAssinatura->save();

            // Atualiza status do processo
            if ($decisao === 'Reprovado') {
                $processo->status = 'Reprovado';
                $processo->updated_at = now();
                $processo->save();

                $histReprovacao = new ProcessoHistorico;
                $histReprovacao->id = (string) Str::uuid();
                $histReprovacao->processo_id = $processo->id;
                $histReprovacao->campo = 'status';
                $histReprovacao->descricao = 'Status do processo alterado para: Reprovado';
                $histReprovacao->created_at = now();
                $histReprovacao->save();
            } else {
                // Aprovado
                if ($processo->fluxo_sequencial) {
                    // Busca próximo signatário
                    $nextRelation = SignatarioProcesso::where('processo_id', $processo->id)
                        ->where('ordem_assinatura', $relation->ordem_assinatura + 1)
                        ->first();

                    if ($nextRelation) {
                        // Gera token para o próximo e dispara e-mail
                        $nextRelation->token = (string) Str::random(64);
                        $nextRelation->token_expira_em = now()->addDays(7);
                        $nextRelation->save();

                        SendApprovalEmailJob::dispatch($nextRelation->id);
                    } else {
                        // Todos assinaram
                        $processo->status = 'Aprovado';
                        $processo->updated_at = now();
                        $processo->save();

                        $histAprovacao = new ProcessoHistorico;
                        $histAprovacao->id = (string) Str::uuid();
                        $histAprovacao->processo_id = $processo->id;
                        $histAprovacao->campo = 'status';
                        $histAprovacao->descricao = 'Status do processo alterado para: Aprovado (todos os signatários assinaram)';
                        $histAprovacao->created_at = now();
                        $histAprovacao->save();
                    }
                } else {
                    // Paralelo: verifica se restam pendentes
                    $hasPending = SignatarioProcesso::where('processo_id', $processo->id)
                        ->where('status', 'Pendente')
                        ->exists();

                    if (! $hasPending) {
                        $processo->status = 'Aprovado';
                        $processo->updated_at = now();
                        $processo->save();

                        $histAprovacao = new ProcessoHistorico;
                        $histAprovacao->id = (string) Str::uuid();
                        $histAprovacao->processo_id = $processo->id;
                        $histAprovacao->campo = 'status';
                        $histAprovacao->descricao = 'Status do processo alterado para: Aprovado (todos os signatários assinaram)';
                        $histAprovacao->created_at = now();
                        $histAprovacao->save();
                    }
                }
            }
        });

        return back();
    }
}
