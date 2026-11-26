<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * To the team (ADMIN_EMAILS) when the queue is stuck. Never queued: it is the queue that is stuck. In Portuguese,
 * the team's language; no personal data, only counts.
 */
class QueueStuckAlert extends Mailable
{
    public function __construct(public readonly int $pending, public readonly int $minutes, public readonly int $failed) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Kayé: a fila está parada');
    }

    public function content(): Content
    {
        return new Content(htmlString: '<p>A fila do Kayé está parada: há '.$this->pending.' trabalhos à espera e o mais antigo espera há '
            .$this->minutes.' minutos ('.$this->failed.' falhados no total).</p><p>Os emails e o push não estão a sair. '
            .'Vê o cron no hPanel e docs/observabilidade.md ("A fila encravou").</p>');
    }
}
