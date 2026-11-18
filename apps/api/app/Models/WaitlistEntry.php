<?php

namespace App\Models;

use Database\Factories\WaitlistEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * One person on the waiting list: a name, an email and/or a WhatsApp number, and when they agreed to be told.
 *
 * @property string $name
 * @property ?string $email
 * @property ?string $whatsapp
 * @property string $source
 * @property string $locale
 * @property Carbon $consent_at
 * @property Carbon $created_at
 */
#[Guarded(['id'])]
#[Table('waitlist')]
class WaitlistEntry extends Model
{
    /** @use HasFactory<WaitlistEntryFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'consent_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    /**
     * Whether this email or number is on the list already.
     */
    public static function knows(?string $email, ?string $whatsapp): bool
    {
        return self::query()
            ->where(fn ($query) => $query
                ->when($email !== null, fn ($query) => $query->orWhere('email', $email))
                ->when($whatsapp !== null, fn ($query) => $query->orWhere('whatsapp', $whatsapp)))
            ->exists();
    }
}
