<?php

namespace Database\Factories;

use App\Models\KursoCompletion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KursoCompletion>
 */
class KursoCompletionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'course' => 'contabilidade',
            'topic' => fake()->unique()->bothify('t##'),
            'completed_on' => now()->toDateString(),
            'score' => 0.8,
        ];
    }
}
