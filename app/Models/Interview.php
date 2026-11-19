<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Database\Factories\InterviewFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * An interview practice sent for review (value offer, 2.2.1). `candidate` (name, birth year, contact) is
 * encrypted at rest, and the whole row goes after 12 months (`model:prune`, scheduled in routes/console.php).
 *
 * @property string $public_id
 * @property string $area
 * @property ?string $career_slug
 * @property ?string $career_name
 * @property string $locale
 * @property Carbon $started_at
 * @property array<string, mixed> $candidate
 * @property list<array<string, mixed>> $answers
 * @property string $status
 * @property Carbon $created_at
 */
#[Guarded(['id'])]
class Interview extends Model
{
    /** @use HasFactory<InterviewFactory> */
    use BelongsToUser, HasFactory, MassPrunable;

    public const KEPT_MONTHS = 12;

    protected $attributes = [
        'status' => 'received',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'candidate' => 'encrypted:array',
            'answers' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return Builder<self>
     */
    public function prunable(): Builder
    {
        return self::query()->where('created_at', '<', now()->subMonths(self::KEPT_MONTHS));
    }
}
