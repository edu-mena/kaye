<?php

namespace Database\Factories;

use App\Models\WaitlistEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WaitlistEntry>
 */
class WaitlistEntryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'email' => fake()->unique()->safeEmail(),
            'whatsapp' => '+2449'.fake()->unique()->numerify('########'),
            'source' => 'landing',
            'locale' => 'pt',
            'consent_at' => now(),
        ];
    }
}
