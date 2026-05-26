<?php

namespace Database\Seeders;

use App\Models\Processo;
use App\Models\ProcessoHistorico;
use App\Models\SignatarioProcesso;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AlignSeederData extends Seeder
{
    /**
     * Run the database seeds to align existing processes with status histories and signatory responses.
     */
    public function run(): void
    {
        $this->command->info("Aligning seeded processes with realistic signatory metadata...");

        $totalUpdated = 0;

        Processo::chunk(100, function ($processos) use (&$totalUpdated) {
            foreach ($processos as $processo) {
                // Clear out existing random history to write logical, clean, sequenced history
                ProcessoHistorico::where('processo_id', $processo->id)->delete();

                $signatariosAssoc = SignatarioProcesso::where('processo_id', $processo->id)
                    ->orderBy('ordem_assinatura', 'asc')
                    ->get();

                if ($signatariosAssoc->isEmpty()) {
                    continue;
                }

                $createdAt = \Carbon\Carbon::parse($processo->created_at);
                $updatedAt = \Carbon\Carbon::parse($processo->updated_at);

                // 1. Recreate initial history logs
                $histCriacao = new ProcessoHistorico();
                $histCriacao->id = (string) Str::uuid();
                $histCriacao->processo_id = $processo->id;
                $histCriacao->campo = 'status';
                $histCriacao->descricao = 'Processo criado com status: Pendente';
                $histCriacao->created_at = $createdAt;
                $histCriacao->save();

                $histTransicao = new ProcessoHistorico();
                $histTransicao->id = (string) Str::uuid();
                $histTransicao->processo_id = $processo->id;
                $histTransicao->campo = 'status';
                $histTransicao->descricao = 'Status alterado para: Em aprovação. Iniciando fluxo de assinaturas.';
                $histTransicao->created_at = $createdAt;
                $histTransicao->save();

                if ($processo->status === 'Aprovado') {
                    // All signatarios approved
                    $currTime = clone $createdAt;
                    $diffSec = max(0, $updatedAt->timestamp - $createdAt->timestamp);
                    // Distribute response times incrementally among signatories
                    $stepSec = $signatariosAssoc->count() > 0 ? (int)($diffSec / $signatariosAssoc->count()) : 0;

                    foreach ($signatariosAssoc as $index => $assoc) {
                        $respondidoEm = (clone $createdAt)->addSeconds($stepSec * ($index + 1));
                        
                        $assoc->status = 'Aprovado';
                        $assoc->respondido_em = $respondidoEm;
                        $assoc->token_expira_em = (clone $respondidoEm)->addDays(7);
                        $assoc->token = (string) Str::random(64);
                        $assoc->ip_requisicao = '192.168.1.' . rand(2, 254);
                        $assoc->user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
                        $assoc->save();

                        // Add history log for each signature
                        $histSig = new ProcessoHistorico();
                        $histSig->id = (string) Str::uuid();
                        $histSig->processo_id = $processo->id;
                        $histSig->campo = 'status';
                        $histSig->descricao = 'Processo assinado por ' . $assoc->signatario->nome;
                        $histSig->created_at = $respondidoEm;
                        $histSig->save();
                    }

                    // Add final approval history log
                    $histAprovacao = new ProcessoHistorico();
                    $histAprovacao->id = (string) Str::uuid();
                    $histAprovacao->processo_id = $processo->id;
                    $histAprovacao->campo = 'status';
                    $histAprovacao->descricao = 'Status do processo alterado para: Aprovado (todos os signatários assinaram)';
                    $histAprovacao->created_at = $updatedAt;
                    $histAprovacao->save();

                } elseif ($processo->status === 'Reprovado') {
                    // One signatory rejected, previous ones approved, remaining pending
                    $numSignatarios = $signatariosAssoc->count();
                    $rejectIndex = rand(0, $numSignatarios - 1);

                    $rejectionTime = $updatedAt;
                    $diffSec = max(0, $rejectionTime->timestamp - $createdAt->timestamp);
                    $stepSec = ($rejectIndex + 1) > 0 ? (int)($diffSec / ($rejectIndex + 1)) : 0;

                    foreach ($signatariosAssoc as $index => $assoc) {
                        if ($index < $rejectIndex) {
                            // Approved
                            $respondidoEm = (clone $createdAt)->addSeconds($stepSec * ($index + 1));
                            $assoc->status = 'Aprovado';
                            $assoc->respondido_em = $respondidoEm;
                            $assoc->token_expira_em = (clone $respondidoEm)->addDays(7);
                            $assoc->token = (string) Str::random(64);
                            $assoc->ip_requisicao = '192.168.1.' . rand(2, 254);
                            $assoc->user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
                            $assoc->save();

                            $histSig = new ProcessoHistorico();
                            $histSig->id = (string) Str::uuid();
                            $histSig->processo_id = $processo->id;
                            $histSig->campo = 'status';
                            $histSig->descricao = 'Processo assinado por ' . $assoc->signatario->nome;
                            $histSig->created_at = $respondidoEm;
                            $histSig->save();

                        } elseif ($index === $rejectIndex) {
                            // Rejected
                            $justificativas = [
                                'Cláusula de rescisão contratual divergente do negociado.',
                                'Valor global informado necessita de ajuste de alíquotas.',
                                'Cronograma de entrega de etapas está irrealista.',
                                'Nome da empresa parceira incorreto na qualificação.',
                                'Falta o anexo descritivo técnico obrigatório.',
                                'Assinatura inválida no documento enviado.',
                            ];
                            $assoc->status = 'Reprovado';
                            $assoc->respondido_em = $rejectionTime;
                            $assoc->token_expira_em = (clone $rejectionTime)->addDays(7);
                            $assoc->token = (string) Str::random(64);
                            $assoc->justificativa = $justificativas[array_rand($justificativas)];
                            $assoc->ip_requisicao = '192.168.1.' . rand(2, 254);
                            $assoc->user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
                            $assoc->save();

                            // Rejection history log
                            $histReprovacao = new ProcessoHistorico();
                            $histReprovacao->id = (string) Str::uuid();
                            $histReprovacao->processo_id = $processo->id;
                            $histReprovacao->campo = 'status';
                            $histReprovacao->descricao = 'Status do processo alterado para: Reprovado (por signatário: ' . $assoc->signatario->nome . ' - Justificativa: ' . $assoc->justificativa . ')';
                            $histReprovacao->created_at = $rejectionTime;
                            $histReprovacao->save();

                        } else {
                            // Pending
                            $assoc->status = 'Pendente';
                            $assoc->respondido_em = null;
                            $assoc->token_expira_em = null;
                            $assoc->token = null;
                            $assoc->justificativa = null;
                            $assoc->ip_requisicao = null;
                            $assoc->user_agent = null;
                            $assoc->save();
                        }
                    }

                } elseif ($processo->status === 'Em aprovação') {
                    // Some approved, some pending
                    $numSignatarios = $signatariosAssoc->count();
                    if ($processo->fluxo_sequencial) {
                        $approvedCount = rand(0, $numSignatarios - 1);
                        $currTime = clone $createdAt;
                        foreach ($signatariosAssoc as $index => $assoc) {
                            if ($index < $approvedCount) {
                                // Approved
                                $currTime = (clone $currTime)->addDays(rand(1, 3));
                                $assoc->status = 'Aprovado';
                                $assoc->respondido_em = $currTime;
                                $assoc->token_expira_em = (clone $currTime)->addDays(7);
                                $assoc->token = (string) Str::random(64);
                                $assoc->ip_requisicao = '192.168.1.' . rand(2, 254);
                                $assoc->user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
                                $assoc->save();

                                $histSig = new ProcessoHistorico();
                                $histSig->id = (string) Str::uuid();
                                $histSig->processo_id = $processo->id;
                                $histSig->campo = 'status';
                                $histSig->descricao = 'Processo assinado por ' . $assoc->signatario->nome;
                                $histSig->created_at = $currTime;
                                $histSig->save();
                            } elseif ($index === $approvedCount) {
                                // Next up - pending with token
                                $assoc->status = 'Pendente';
                                $assoc->respondido_em = null;
                                $assoc->token = (string) Str::random(64);
                                $assoc->token_expira_em = now()->addDays(7);
                                $assoc->justificativa = null;
                                $assoc->ip_requisicao = null;
                                $assoc->user_agent = null;
                                $assoc->save();
                            } else {
                                // Future - pending without token
                                $assoc->status = 'Pendente';
                                $assoc->respondido_em = null;
                                $assoc->token = null;
                                $assoc->token_expira_em = null;
                                $assoc->justificativa = null;
                                $assoc->ip_requisicao = null;
                                $assoc->user_agent = null;
                                $assoc->save();
                            }
                        }
                    } else {
                        // Parallel flow
                        foreach ($signatariosAssoc as $index => $assoc) {
                            if (rand(0, 1) === 1) {
                                // Approved
                                $respondidoEm = (clone $createdAt)->addDays(rand(1, 3));
                                $assoc->status = 'Aprovado';
                                $assoc->respondido_em = $respondidoEm;
                                $assoc->token_expira_em = (clone $respondidoEm)->addDays(7);
                                $assoc->token = (string) Str::random(64);
                                $assoc->ip_requisicao = '192.168.1.' . rand(2, 254);
                                $assoc->user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
                                $assoc->save();

                                $histSig = new ProcessoHistorico();
                                $histSig->id = (string) Str::uuid();
                                $histSig->processo_id = $processo->id;
                                $histSig->campo = 'status';
                                $histSig->descricao = 'Processo assinado por ' . $assoc->signatario->nome;
                                $histSig->created_at = $respondidoEm;
                                $histSig->save();
                            } else {
                                // Pending
                                $assoc->status = 'Pendente';
                                $assoc->respondido_em = null;
                                $assoc->token = (string) Str::random(64);
                                $assoc->token_expira_em = now()->addDays(7);
                                $assoc->justificativa = null;
                                $assoc->ip_requisicao = null;
                                $assoc->user_agent = null;
                                $assoc->save();
                            }
                        }
                    }

                } else {
                    // Pendente / Cancelado: all pending and reset
                    foreach ($signatariosAssoc as $index => $assoc) {
                        $assoc->status = 'Pendente';
                        $assoc->respondido_em = null;
                        $assoc->token = null;
                        $assoc->token_expira_em = null;
                        $assoc->justificativa = null;
                        $assoc->ip_requisicao = null;
                        $assoc->user_agent = null;
                        $assoc->save();
                    }
                }

                $totalUpdated++;
            }
        });

        $this->command->info("Successfully aligned {$totalUpdated} processes and associated signatory data.");
    }
}
