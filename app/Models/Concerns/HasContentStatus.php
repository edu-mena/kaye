<?php

namespace App\Models\Concerns;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * The columns every content table shares (status, source, estimated, position) and their history.
 * See docs/base-de-dados.md, "Regras comuns".
 *
 * @property string $slug
 * @property ContentStatus $status
 * @property string|null $source_url
 * @property Carbon|null $source_checked_at
 * @property bool $estimated
 * @property int $position
 * @property Carbon|null $deleted_at
 */
trait HasContentStatus
{
    use FlushesPublicContent, LogsContentChanges, SoftDeletes;

    public function initializeHasContentStatus(): void
    {
        $this->mergeCasts([
            'status' => ContentStatus::class,
            'source_checked_at' => 'date',
            'estimated' => 'boolean',
            'position' => 'integer',
        ]);
        // Same defaults as the migration, so new models have them before a reload.
        $this->attributes += ['status' => ContentStatus::Draft->value, 'estimated' => false, 'position' => 0];
    }

    /**
     * Only what the public API may show.
     *
     * @param  Builder<static>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', ContentStatus::Published->value);
    }
}
