<?php

namespace App\Models;

use App\Enums\AiTaskStatus;
use Database\Factories\AiTaskFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * One research asked to the AI in the panel ("Pesquisar com IA"). Run by `RunAiTask` in the queue; what it finds
 * becomes revisions, never published content. See `ai_tasks` in docs/base-de-dados.md.
 *
 * @property int $id
 * @property string $kind
 * @property string $content_type
 * @property ?string $target_slug
 * @property string $prompt
 * @property AiTaskStatus $status
 * @property ?string $result
 * @property ?list<string> $sources
 * @property string $model
 * @property int $input_tokens
 * @property int $output_tokens
 * @property int $web_searches
 * @property string $cost_usd
 * @property ?int $requested_by
 * @property ?Carbon $started_at
 * @property ?Carbon $finished_at
 * @property ?string $error
 * @property Carbon $created_at
 */
#[Guarded(['id'])]
class AiTask extends Model
{
    /** @use HasFactory<AiTaskFactory> */
    use HasFactory;

    protected $attributes = [
        'kind' => 'research',
        'status' => 'queued',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => AiTaskStatus::class,
            'sources' => 'array',
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'web_searches' => 'integer',
            'cost_usd' => 'decimal:4',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * @return HasMany<Revision, $this>
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(Revision::class);
    }
}
