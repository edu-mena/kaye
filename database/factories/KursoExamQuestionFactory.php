<?php

namespace Database\Factories;

use App\Models\Kurso;
use App\Models\KursoExamQuestion;
use App\Models\KursoUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KursoExamQuestion>
 */
class KursoExamQuestionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'kurso_id' => Kurso::factory(),
            'kurso_unit_id' => KursoUnit::factory(),
            'kind' => 'choice',
            'prompt' => fake()->sentence(),
            'options' => ['a', 'b'],
            'answer' => 0,
        ];
    }
}
