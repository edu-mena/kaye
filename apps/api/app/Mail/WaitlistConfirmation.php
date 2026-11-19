<?php

namespace App\Mail;

use App\Enums\ConsentKind;
use App\Models\WaitlistEntry;
use App\Support\NoticeLinks;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * "Confirma o teu email": the double opt-in of the waiting list. Nothing else reaches the address before it.
 */
class WaitlistConfirmation extends NoticeMail
{
    public function __construct(public WaitlistEntry $entry)
    {
        parent::__construct($entry);
    }

    public function consentKind(): ConsentKind
    {
        return ConsentKind::EmailService;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->say('confirm.subject'));
    }

    public function content(): Content
    {
        return $this->markdownView('mail.confirm', ['name' => $this->entry->name, 'confirmUrl' => NoticeLinks::confirm($this->entry)]);
    }
}
