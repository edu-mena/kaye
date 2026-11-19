<?php

namespace App\Jobs;

use App\Enums\DeliveryStatus;
use App\Enums\MessageChannel;
use App\Mail\MessageMail;
use App\Models\MessageDelivery;
use App\Models\User;
use App\Notifications\PushNotice;
use App\Support\Consents;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Minishlink\WebPush\MessageSentReport;
use NotificationChannels\WebPush\WebPushChannel;
use Throwable;

/**
 * Sends one delivery. The consent is checked again here: it may have been withdrawn since the batch was made.
 * Tried once only: a retry after the email left would send it twice. The error kept is the exception's class,
 * never its text, which can carry the address.
 */
class SendDelivery implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $deliveryId) {}

    public function handle(WebPushChannel $push): void
    {
        $delivery = MessageDelivery::query()->with(['message', 'user', 'waitlistEntry'])->find($this->deliveryId);
        if ($delivery === null || $delivery->status !== DeliveryStatus::Queued) {
            return;
        }
        $message = $delivery->message;
        $person = $delivery->receiver();
        if ($person === null || ! Consents::allows($person, $message->channel, $message->purpose)) {
            $delivery->update(['status' => DeliveryStatus::Skipped]);

            return;
        }

        try {
            if ($message->channel === MessageChannel::Email) {
                Mail::to((string) $person->noticeEmail())->send(new MessageMail($person, $message));
            } else {
                assert($person instanceof User);
                $locale = $person->noticeLocale();
                $reports = $push->send($person, new PushNotice($message->text('subject', $locale), $message->text('body', $locale), $message->url ?? '/'));
                if (! collect($reports)->contains(fn (MessageSentReport $report): bool => $report->isSuccess())) {
                    $delivery->update(['status' => DeliveryStatus::Failed, 'error' => 'no live push subscription']);

                    return;
                }
            }
        } catch (Throwable $error) {
            $delivery->update(['status' => DeliveryStatus::Failed, 'error' => $error::class]);

            return;
        }

        $delivery->update(['status' => DeliveryStatus::Sent, 'sent_at' => now()]);
    }
}
