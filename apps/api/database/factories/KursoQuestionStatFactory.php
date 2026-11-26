<?php

namespace Database\Factories;

use App\Models\KursoQuestionStat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KursoQuestionStat>
 */
class KursoQuestionStatFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course' => 'contabilidade',
            'question_id' => fake()->unique()->bothify('t##-?-####'),
            'answered' => 10,
            'correct' => 6,
        ];
    }
}
