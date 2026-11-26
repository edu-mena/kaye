<?php

namespace App\Messaging;

use App\Enums\MessageChannel;
use App\Mail\MessageMail;
use App\Models\Contracts\ReceivesNotices;
use App\Models\Message;
use App\Models\User;
use App\Notifications\PushNotice;
use App\Support\AuditLog;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\Mail;
use NotificationChannels\WebPush\WebPushChannel;

/**
 * "Enviar teste" on a campaign (Comunicação): the message goes only to the person signed in to the panel, in the
 * language they choose, with "[Teste]" in the subject. Nothing is counted in the campaign's deliveries and the
 * campaign stays a draft.
 */
final class TestSend
{
    public function __construct(private readonly WebPushChannel $push) {}

    /**
     * @return bool false when there was nowhere to send it (a push test without this browser subscribed)
     */
    public function send(Message $message, User $staff, string $locale): bool
    {
        $recipient = self::as($staff, $locale);
        if ($message->channel === MessageChannel::Email) {
            Mail::to((string) $staff->email)->send(new class($recipient, $message) extends MessageMail
            {
                public function envelope(): Envelope
                {
                    return new Envelope(subject: '[Teste] '.$this->message->text('subject', $this->recipient->noticeLocale()));
                }
            });
        } else {
            if (! $staff->pushSubscriptions()->exists()) {
                return false;
            }
            $this->push->send($staff, new PushNotice('[Teste] '.$message->text('subject', $locale), $message->text('body', $locale), $message->url ?? '/'));
        }
        AuditLog::admin('message_test_sent', $message, ['channel' => $message->channel->value, 'locale' => $locale]);

        return true;
    }

    /** The staff member, reading in the language of the test. */
    private static function as(User $staff, string $locale): ReceivesNotices
    {
        return new readonly class($staff, $locale) implements ReceivesNotices
        {
            public function __construct(private User $staff, private string $locale) {}

            public function noticeRecipient(): string
            {
                return $this->staff->noticeRecipient();
            }

            public function noticeEmail(): ?string
            {
                return $this->staff->noticeEmail();
            }

            public function noticeLocale(): string
            {
                return $this->locale;
            }

            public function canReceiveMarketing(): bool
            {
                return true;
            }
        };
    }
}
