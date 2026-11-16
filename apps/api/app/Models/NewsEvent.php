<?php

namespace App\Models;

use App\Models\Concerns\LogsContentChanges;
use Database\Factories\NewsEventFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The event of a news item of kind "eventos" (NewsEvent): when, where and how to get in. See `events` in docs/base-de-dados.md.
 */
#[Table('events')]
#[Guarded(['id'])]
class NewsEvent extends Model
{
    /** @use HasFactory<NewsEventFactory> */
    use HasFactory, LogsContentChanges;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
            'formats' => 'array',
            'free' => 'boolean',
            'register' => 'array',
            'unconfirmed' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<News, $this>
     */
    public function news(): BelongsTo
    {
        return $this->belongsTo(News::class);
    }
}
