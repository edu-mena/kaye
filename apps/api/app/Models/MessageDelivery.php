<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use App\Enums\MessageChannel;
use App\Models\Concerns\BelongsToUser;
use App\Models\Contracts\ReceivesNotices;
use Database\Factories\MessageDeliveryFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One person's copy of a message. See `message_deliveries` in docs/base-de-dados.md.
 *
 * @property int $id
 * @property int $message_id
 * @property string $recipient
 * @property ?int $user_id
 * @property ?int $waitlist_id
 * @property MessageChannel $channel
 * @property DeliveryStatus $status
 * @property ?string $error
 * @property ?Carbon $sent_at
 * @property-read Message $message
 * @property-read ?User $user
 * @property-read ?WaitlistEntry $waitlistEntry
 */
#[Guarded(['id'])]
class MessageDelivery extends Model
{
    /** @use HasFactory<MessageDeliveryFactory> */
    use BelongsToUser, HasFactory;

    protected $attributes = [
        'status' => 'queued',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'channel' => MessageChannel::class,
            'status' => DeliveryStatus::class,
            'sent_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Message, $this>
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * @return BelongsTo<WaitlistEntry, $this>
     */
    public function waitlistEntry(): BelongsTo
    {
        return $this->belongsTo(WaitlistEntry::class, 'waitlist_id');
    }

    /** The account or the waiting list entry; null when it was deleted in the meantime. */
    public function receiver(): ?ReceivesNotices
    {
        return $this->user ?? $this->waitlistEntry;
    }
}
