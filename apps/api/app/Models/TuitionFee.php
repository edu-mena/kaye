<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\TuitionFeeFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A published monthly fee (PublishedFee): of one offer, or the average of the licenciaturas. See `tuition_fees` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class TuitionFee extends Model
{
    /** @use HasFactory<TuitionFeeFactory> */
    use BelongsToInstitution, HasFactory, LogsContentChanges;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monthly_aoa' => 'integer',
            'source' => 'array',
        ];
    }

    /**
     * @return BelongsTo<CourseOffer, $this>
     */
    public function courseOffer(): BelongsTo
    {
        return $this->belongsTo(CourseOffer::class);
    }
}
