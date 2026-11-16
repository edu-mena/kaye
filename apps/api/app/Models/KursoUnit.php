<?php

namespace App\Models;

use App\Models\Concerns\BelongsToKurso;
use App\Models\Concerns\HasContentStatus;
use Database\Factories\KursoUnitFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A unit of a Kurso; without content it shows as "Em breve". The slug is unique within its Kurso. See `kurso_units` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class KursoUnit extends Model
{
    /** @use HasFactory<KursoUnitFactory> */
    use BelongsToKurso, HasContentStatus, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'number' => 'integer',
            'outline' => 'array',
            'content' => 'array',
        ];
    }

    /**
     * @return HasMany<KursoExamQuestion, $this>
     */
    public function examQuestions(): HasMany
    {
        return $this->hasMany(KursoExamQuestion::class);
    }
}
