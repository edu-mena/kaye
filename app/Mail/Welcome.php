<?php

namespace App\Mail;

use App\Enums\ConsentKind;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * "Bem-vindo ao Kayé": sent once, when the waiting list's email is confirmed.
 */
class Welcome extends NoticeMail
{
    public function consentKind(): ConsentKind
    {
        return ConsentKind::EmailService;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->say('welcome.subject'));
    }

    public function content(): Content
    {
        return $this->markdownView('mail.welcome', ['siteUrl' => url('/')]);
    }
}
