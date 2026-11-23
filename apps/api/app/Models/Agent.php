<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use Database\Factories\AgentFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A Kayé agent: a human-resources technician or a professional approved by Kayé who writes simulations. Only what the
 * agent authorised is stored. See `agents` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Agent extends Model
{
    /** @use HasFactory<AgentFactory> */
    use HasContentStatus, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verified_at' => 'date',
            'consent_at' => 'date',
        ];
    }

    /**
     * @return HasMany<Simulation, $this>
     */
    public function simulations(): HasMany
    {
        return $this->hasMany(Simulation::class);
    }
}
