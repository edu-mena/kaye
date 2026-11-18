<?php

namespace App\Messaging;

use App\Enums\DeliveryStatus;
use App\Enums\MessageChannel;
use App\Enums\MessageStatus;
use App\Jobs\SendDelivery;
use App\Models\Contracts\ReceivesNotices;
use App\Models\Message;
use App\Models\MessageDelivery;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Support\Facades\Config;

/**
 * Puts the messages being sent on the queue, in batches (`php artisan kaye:send-messages`, every minute): each
 * channel sends at most its hourly limit, so the hosting's SMTP never refuses us. One delivery per message and
 * person (a unique key): running twice, or at the same time, never sends the same message twice.
 */
final class Sender
{
    /**
     * @return int How many deliveries went on the queue.
     */
    public function run(): int
    {
        $queued = 0;
        foreach (Message::query()->where('status', MessageStatus::Sending)->orderBy('id')->get() as $message) {
            $queued += $this->batch($message);
        }

        return $queued;
    }

    private function batch(Message $message): int
    {
        $budget = $this->budget($message->channel);
        if ($budget === 0) {
            return 0;
        }

        $people = [
            ...Audience::users($message)->orderBy('id')->limit($budget)->get()->all(),
            ...Audience::waitlist($message)->orderBy('id')->limit($budget)->get()->all(),
        ];
        $queued = 0;
        foreach (array_slice($people, 0, $budget) as $person) {
            $queued += $this->queue($message, $person) ? 1 : 0;
        }

        // Nobody left to reach and nothing waiting on the queue: the message is done.
        if (count($people) < $budget && ! $message->deliveries()->where('status', DeliveryStatus::Queued)->exists()) {
            $message->update(['status' => MessageStatus::Sent, 'sent_at' => now()]);
        }

        return $queued;
    }

    private function queue(Message $message, ReceivesNotices $person): bool
    {
        $delivery = MessageDelivery::query()->createOrFirst(
            ['message_id' => $message->id, 'recipient' => $person->noticeRecipient()],
            [
                'user_id' => $person instanceof User ? $person->id : null,
                'waitlist_id' => $person instanceof WaitlistEntry ? $person->id : null,
                'channel' => $message->channel,
                'status' => DeliveryStatus::Queued,
            ],
        );
        if (! $delivery->wasRecentlyCreated) {
            return false;
        }
        SendDelivery::dispatch($delivery->id);

        return true;
    }

    /** What is left of this channel's hourly limit. */
    private function budget(MessageChannel $channel): int
    {
        $limit = Config::integer("kaye.notices.hourly_limit.{$channel->value}");
        $used = MessageDelivery::query()->where('channel', $channel)->where('created_at', '>=', now()->subHour())->count();

        return max(0, $limit - $used);
    }
}
