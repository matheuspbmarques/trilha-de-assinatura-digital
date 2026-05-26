<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendApprovalEmailJob implements ShouldQueue
{
    use Queueable;

    private string $signatarioProcessoId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $signatarioProcessoId)
    {
        $this->signatarioProcessoId = $signatarioProcessoId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $relation = \App\Models\SignatarioProcesso::with(['signatario', 'processo'])->find($this->signatarioProcessoId);

        if (!$relation) {
            return;
        }

        // Se já não estiver pendente, não envia e-mail
        if ($relation->status !== 'Pendente') {
            return;
        }

        // Gera token se não existir
        if (!$relation->token) {
            $relation->token = \Illuminate\Support\Str::random(64);
            $relation->token_expira_em = now()->addDays(7);
            $relation->save();
        }

        // Envia o e-mail
        \Illuminate\Support\Facades\Mail::to($relation->signatario->email)->send(
            new \App\Mail\ProcessoApprovalMail(
                $relation->signatario->nome,
                $relation->processo->titulo,
                $relation->processo->descricao,
                $relation->token
            )
        );

        // Log no terminal para acompanhamento visual do desenvolvedor (requisito do usuário)
        $fromAddress = config('mail.from.address', 'hello@example.com');
        $fromName = config('mail.from.name', 'Trilha de Assinatura Digital');
        $linkAssinatura = route('processos.validar', ['token' => $relation->token]);

        $logMsg = "\n======================================================================\n" .
                  "📧 [E-MAIL DE ASSINATURA DISPARADO]\n" .
                  " - De: {$fromName} <{$fromAddress}>\n" .
                  " - Para: {$relation->signatario->nome} <{$relation->signatario->email}>\n" .
                  " - Documento: {$relation->processo->titulo}\n" .
                  " - Descrição: {$relation->processo->descricao}\n" .
                  " - Link de Assinatura: {$linkAssinatura}\n" .
                  " - Expiração do Link: {$relation->token_expira_em}\n" .
                  "======================================================================\n\n";

        if (defined('STDOUT')) {
            fwrite(STDOUT, $logMsg);
        } else {
            echo $logMsg;
        }
    }
}
