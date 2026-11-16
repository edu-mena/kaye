<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LinksToCareers;
use Database\Factories\FreeCourseFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A free online course (FreeCourse). See `free_courses` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class FreeCourse extends Model
{
    /** @use HasFactory<FreeCourseFactory> */
    use HasContentStatus, HasFactory, LinksToCareers;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'languages' => 'array',
            'areas' => 'array',
            'hours' => 'float',
            'price_usd' => 'float',
            'sources' => 'array',
        ];
    }
}
