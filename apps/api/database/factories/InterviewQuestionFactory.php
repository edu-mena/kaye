<?php

namespace Database\Factories;

use App\Models\InterviewQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InterviewQuestion>
 */
class InterviewQuestionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'text' => ['pt' => fake()->sentence()],
            'goal' => ['pt' => fake()->sentence()],
            'model' => ['pt' => fake()->sentence()],
            'mistakes' => ['pt' => []],
        ];
    }
}
