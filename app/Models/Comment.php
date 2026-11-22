<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Database\Factories\CommentFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A comment on a piece of news, a company or a simulation. Hidden after 3 reports. See `comments` in docs/base-de-dados.md.
 *
 * @property int $id
 * @property int $user_id
 * @property string $subject_type
 * @property string $subject_id
 * @property string $body
 * @property int $reports_count
 * @property ?Carbon $hidden_at
 * @property Carbon $created_at
 */
#[Guarded(['id'])]
class Comment extends Model
{
    /** @use HasFactory<CommentFactory> */
    use BelongsToUser, HasFactory;

    public const SUBJECTS = ['news', 'company', 'simulation'];

    /** Reports that hide a comment until the team looks at it. */
    public const HIDING_REPORTS = 3;

    public const MAX_LENGTH = 500;

    /**
     * @param  Builder<static>  $query
     */
    public function scopeVisible(Builder $query): void
    {
        $query->whereNull('hidden_at');
    }
}
