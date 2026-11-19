<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCourse;
use App\Models\Concerns\BelongsToInstitution;
use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LinksToCareers;
use Database\Factories\ProgramFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * An offer with price, length and rating (Program); today only at "Exemplo" institutions. See `programs` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Program extends Model
{
    /** @use HasFactory<ProgramFactory> */
    use BelongsToCourse, BelongsToInstitution, HasContentStatus, HasFactory, LinksToCareers;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_months' => 'integer',
            'schedule' => 'array',
            'total_cost' => 'integer',
            'recognized' => 'boolean',
            'rating_average' => 'float',
            'rating_count' => 'integer',
            'image' => 'array',
        ];
    }
}
