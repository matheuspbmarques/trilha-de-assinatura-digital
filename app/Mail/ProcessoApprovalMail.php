<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProcessoApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $signatarioNome;
    public string $processoTitulo;
    public string $processoDescricao;
    public string $urlAssinatura;

    /**
     * Create a new message instance.
     */
    public function __construct(string $signatarioNome, string $processoTitulo, string $processoDescricao, string $token)
    {
        $this->signatarioNome = $signatarioNome;
        $this->processoTitulo = $processoTitulo;
        $this->processoDescricao = $processoDescricao;
        $this->urlAssinatura = route('processos.validar', ['token' => $token]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Solicitação de Assinatura: ' . $this->processoTitulo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.processo_approval',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
