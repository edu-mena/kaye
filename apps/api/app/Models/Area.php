<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use Database\Factories\AreaFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * One of the 13 areas of the Mercado (MarketArea). See `areas` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Area extends Model
{
    /** @use HasFactory<AreaFactory> */
    use HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name'];

    /**
     * @return HasMany<CareerGroup, $this>
     */
    public function groups(): HasMany
    {
        return $this->hasMany(CareerGroup::class);
    }
}
