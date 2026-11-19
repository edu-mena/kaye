<?php

namespace App\Mail;

use App\Enums\ConsentKind;
use App\Models\Contracts\ReceivesNotices;
use App\Support\NoticeLinks;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

/**
 * Every Kayé email: in the person's language, in the site's look (the `kaye` Markdown theme), with a signed
 * "deixar de receber" link in the footer and in the List-Unsubscribe headers, so the mail app's own
 * button works with one click and without signing in (RFC 8058).
 */
abstract class NoticeMail extends Mailable
{
    use Queueable, SerializesModels;

    /** resources/views/mail/kaye.css: the site's colours. */
    public $theme = 'kaye';

    public function __construct(public ReceivesNotices $recipient)
    {
        $this->locale($recipient->noticeLocale());
    }

    /** The consent this email depends on: the link withdraws it. */
    abstract public function consentKind(): ConsentKind;

    public function unsubscribeUrl(): string
    {
        return NoticeLinks::unsubscribe($this->recipient, $this->consentKind());
    }

    public function headers(): Headers
    {
        return new Headers(text: [
            'List-Unsubscribe' => '<'.$this->unsubscribeUrl().'>',
            'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
        ]);
    }

    /**
     * A Markdown view from resources/views/mail, with what every one of them shows.
     *
     * @param  view-string  $view
     * @param  array<string, mixed>  $with
     */
    protected function markdownView(string $view, array $with = []): Content
    {
        return new Content(markdown: $view, with: [
            ...$with,
            'locale' => $this->recipient->noticeLocale(),
            'unsubscribeUrl' => $this->unsubscribeUrl(),
        ]);
    }

    /**
     * A text from lang/<locale>/notices.php in the person's language.
     *
     * @param  array<string, string|int>  $replace
     */
    protected function say(string $key, array $replace = []): string
    {
        $text = __("notices.{$key}", $replace, $this->recipient->noticeLocale());

        return is_string($text) ? $text : $key;
    }
}
