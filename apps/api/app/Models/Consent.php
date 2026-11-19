<?php

namespace App\Models;

use App\Enums\ConsentKind;
use App\Models\Concerns\BelongsToUser;
use Database\Factories\ConsentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Proof of one consent: what, which version of the text, when, where and from which (truncated) IP.
 * It belongs to an account or to someone only on the waiting list. Revoking keeps the row with `revoked_at`.
 *
 * @property ConsentKind $kind
 * @property string $version
 * @property ?string $source
 * @property ?string $ip_prefix
 * @property Carbon $granted_at
 * @property ?Carbon $confirmed_at
 * @property ?Carbon $revoked_at
 */
#[Fillable(['kind', 'version', 'source', 'ip_prefix', 'granted_at', 'confirmed_at', 'revoked_at'])]
class Consent extends Model
{
    /** @use HasFactory<ConsentFactory> */
    use BelongsToUser, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => ConsentKind::class,
            'granted_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<WaitlistEntry, $this>
     */
    public function waitlistEntry(): BelongsTo
    {
        return $this->belongsTo(WaitlistEntry::class, 'waitlist_id');
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('revoked_at');
    }
}
