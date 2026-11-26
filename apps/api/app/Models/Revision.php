<?php

namespace App\Models;

use App\Enums\RevisionStatus;
use Database\Factories\RevisionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A change proposed to one catalogue row, by the AI or a person: the new values, the old ones, the source and a
 * note. Nothing reaches the row until a reviewer approves it (`App\Content\Revisions`). The revisions of a row,
 * approved or not, are its history. See `revisions` in docs/base-de-dados.md.
 *
 * @property int $id
 * @property string $content_type A key of `App\Content\ContentTypes`
 * @property string $revisable_type
 * @property ?int $revisable_id Empty: a new row
 * @property string $slug
 * @property ?int $ai_task_id
 * @property ?int $author_id
 * @property array<string, mixed> $changes Column => new value
 * @property ?array<string, mixed> $original Column => value when proposed
 * @property string $source_url
 * @property ?string $note
 * @property RevisionStatus $status
 * @property ?int $reviewed_by
 * @property ?Carbon $reviewed_at
 * @property ?string $rejection_reason
 * @property Carbon $created_at
 */
#[Guarded(['id'])]
class Revision extends Model
{
    /** @use HasFactory<RevisionFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => 'pending',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => RevisionStatus::class,
            'changes' => 'array',
            'original' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @return BelongsTo<AiTask, $this>
     */
    public function aiTask(): BelongsTo
    {
        return $this->belongsTo(AiTask::class);
    }

    public function isNewRow(): bool
    {
        return $this->revisable_id === null;
    }

    /**
     * Every revision of one row, the newest first: its history.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOf(Builder $query, Model $record): Builder
    {
        return $query->where('revisable_type', $record->getMorphClass())->where('revisable_id', $record->getKey())->latest('id');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', RevisionStatus::Pending->value);
    }
}
