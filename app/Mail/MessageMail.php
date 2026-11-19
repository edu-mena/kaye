<?php

namespace App\Mail;

use App\Enums\ConsentKind;
use App\Enums\MessageChannel;
use App\Enums\MessageTemplate;
use App\Models\Contracts\ReceivesNotices;
use App\Models\Message;
use App\Models\News;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * One message of a campaign or a reminder, by email: a notice, the weekly digest of the news, or a saved
 * deadline coming up. The subject and the text are the message's, in the person's language.
 */
class MessageMail extends NoticeMail
{
    /** How many news items the digest lists. */
    private const DIGEST_ITEMS = 6;

    public function __construct(ReceivesNotices $recipient, public Message $message)
    {
        parent::__construct($recipient);
    }

    public function consentKind(): ConsentKind
    {
        return ConsentKind::for(MessageChannel::Email, $this->message->purpose);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->message->text('subject', $this->recipient->noticeLocale()));
    }

    public function content(): Content
    {
        $locale = $this->recipient->noticeLocale();
        $with = [
            'body' => $this->message->text('body', $locale),
            'url' => url($this->message->url ?? '/'),
        ];

        return match ($this->message->template) {
            MessageTemplate::Digest => $this->markdownView('mail.digest', [...$with, 'news' => $this->latestNews($locale)]),
            MessageTemplate::Deadline => $this->markdownView('mail.deadline', $with),
            MessageTemplate::Notice => $this->markdownView('mail.notice', $with),
        };
    }

    /**
     * The news published in the last 7 days, newest first.
     *
     * @return list<array{title: string, summary: string}>
     */
    private function latestNews(string $locale): array
    {
        return array_values(News::query()->published()->where('date', '>=', now()->subDays(7)->toDateString())
            ->orderByDesc('date')->limit(self::DIGEST_ITEMS)->get()
            ->map(fn (News $news): array => [
                'title' => self::translated($news, 'title', $locale),
                'summary' => self::translated($news, 'summary', $locale),
            ])->all());
    }

    private static function translated(News $news, string $field, string $locale): string
    {
        $value = $news->getTranslation($field, $locale);

        return is_string($value) ? $value : '';
    }
}
