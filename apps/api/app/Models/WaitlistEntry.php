<?php

namespace App\Models;

use App\Models\Contracts\ReceivesNotices;
use App\Support\BlindIndex;
use Database\Factories\WaitlistEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * One person on the waiting list: a name, an email and/or a WhatsApp number, and when they agreed to be told.
 * The proof of each consent is in `consents` (`waitlist_id`); the email one waits for the double opt-in.
 *
 * @property int $id
 * @property string $name
 * @property ?string $email
 * @property ?string $whatsapp
 * @property ?string $email_hash
 * @property ?string $whatsapp_hash
 * @property string $source
 * @property string $locale
 * @property Carbon $consent_at
 * @property ?Carbon $confirmed_at
 * @property ?Carbon $unsubscribed_at
 * @property Carbon $created_at
 */
#[Guarded(['id', 'email_hash', 'whatsapp_hash'])]
#[Table('waitlist')]
class WaitlistEntry extends Model implements ReceivesNotices
{
    /** @use HasFactory<WaitlistEntryFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Encrypted at rest; found through their hashes (`email_hash`, `whatsapp_hash`).
            'email' => 'encrypted',
            'whatsapp' => 'encrypted',
            'consent_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<Consent, $this>
     */
    public function consents(): HasMany
    {
        return $this->hasMany(Consent::class, 'waitlist_id');
    }

    /**
     * Whether this email or number is on the list already.
     */
    public static function knows(?string $email, ?string $whatsapp): bool
    {
        if ($email === null && $whatsapp === null) {
            return false;
        }

        return self::query()
            ->where(fn ($query) => $query
                ->when($email !== null, fn ($query) => $query->orWhere('email_hash', BlindIndex::of('email', $email)))
                ->when($whatsapp !== null, fn ($query) => $query->orWhere('whatsapp_hash', BlindIndex::of('whatsapp', $whatsapp))))
            ->exists();
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithEmail(Builder $query, string $email): Builder
    {
        return $query->where('email_hash', BlindIndex::of('email', $email));
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithWhatsapp(Builder $query, string $whatsapp): Builder
    {
        return $query->where('whatsapp_hash', BlindIndex::of('whatsapp', $whatsapp));
    }

    /** The hashes follow the values, whoever writes them. */
    protected static function booted(): void
    {
        static::saving(function (self $entry): void {
            $entry->email_hash = BlindIndex::of('email', $entry->email);
            $entry->whatsapp_hash = BlindIndex::of('whatsapp', $entry->whatsapp);
        });
    }

    public function noticeRecipient(): string
    {
        return "waitlist:{$this->id}";
    }

    public function noticeEmail(): ?string
    {
        return $this->email;
    }

    public function noticeLocale(): string
    {
        return $this->locale;
    }

    /** The list never asks for an age: news (marketing) never reaches it. */
    public function canReceiveMarketing(): bool
    {
        return false;
    }
}
