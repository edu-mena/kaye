<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use App\Enums\MessageChannel;
use App\Enums\MessagePurpose;
use App\Enums\MessageStatus;
use App\Enums\MessageTemplate;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\MessageFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A notice or the news, by email or push, to an audience. See `messages` in docs/base-de-dados.md.
 *
 * `audience`: `provinces` and `areas` (lists, empty = everyone), `waitlist` (also the waiting list, service
 * emails only) and `users` (only these accounts: the deadline reminders).
 *
 * @property int $id
 * @property ?string $key
 * @property MessageChannel $channel
 * @property MessagePurpose $purpose
 * @property MessageTemplate $template
 * @property array<string, string> $subject By locale: {"pt": …, "en": …, "fr": …}.
 * @property array<string, string> $body By locale; a missing language falls back to Portuguese.
 * @property ?string $url
 * @property array{provinces?: list<string>, areas?: list<string>, waitlist?: bool, users?: list<int>} $audience
 * @property MessageStatus $status
 * @property ?Carbon $sent_at
 */
#[Guarded(['id'])]
class Message extends Model
{
    /** @use HasFactory<MessageFactory> */
    use HasFactory, LogsContentChanges;

    protected $attributes = [
        'status' => 'draft',
        'audience' => '{}',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'channel' => MessageChannel::class,
            'purpose' => MessagePurpose::class,
            'template' => MessageTemplate::class,
            'status' => MessageStatus::class,
            'subject' => 'array',
            'body' => 'array',
            'audience' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<MessageDelivery, $this>
     */
    public function deliveries(): HasMany
    {
        return $this->hasMany(MessageDelivery::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** The subject or body in one language, Portuguese when it has none. */
    public function text(string $field, string $locale): string
    {
        $texts = $field === 'subject' ? $this->subject : $this->body;
        $value = $texts[$locale] ?? '';

        return $value !== '' ? $value : ($texts['pt'] ?? '');
    }

    /**
     * How many deliveries are in one status: the report in the panel.
     */
    public function deliveriesIn(DeliveryStatus $status): int
    {
        return $this->deliveries()->where('status', $status)->count();
    }
}
