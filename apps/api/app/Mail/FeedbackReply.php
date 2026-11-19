<?php

namespace App\Mail;

use App\Enums\ConsentKind;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * The team's answer to a critique, an idea or a bug, written in the panel.
 */
class FeedbackReply extends NoticeMail
{
    public function __construct(User $user, public Feedback $feedback, public string $reply)
    {
        parent::__construct($user);
    }

    public function consentKind(): ConsentKind
    {
        return ConsentKind::EmailService;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->say('feedback.subject'));
    }

    public function content(): Content
    {
        return $this->markdownView('mail.feedback-reply', ['original' => $this->feedback->message, 'reply' => $this->reply]);
    }
}
