<?php

namespace App\Models;

use App\Enums\ConsentKind;
use App\Models\Concerns\BelongsToUser;
use Database\Factories\ConsentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Proof of one consent: what, which version of the text, when. Revoking keeps the row with `revoked_at`.
 */
#[Fillable(['kind', 'version', 'granted_at', 'confirmed_at', 'revoked_at'])]
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
     * @param  Builder<self>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('revoked_at');
    }
}
