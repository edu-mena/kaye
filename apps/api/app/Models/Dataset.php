<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\DatasetFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A whole document read at once: the Mercado figures, the psychotechnical lists, the provinces. See `datasets` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Dataset extends Model
{
    /** @use HasFactory<DatasetFactory> */
    use HasContentStatus, HasFactory, LogsContentChanges;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
            'computed_at' => 'datetime',
        ];
    }
}
