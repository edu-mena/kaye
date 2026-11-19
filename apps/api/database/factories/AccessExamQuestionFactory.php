<?php

namespace Database\Factories;

use App\Models\AccessExamQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccessExamQuestion>
 */
class AccessExamQuestionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'subject' => 'matematica',
            'topic' => 'algebra',
            'level' => 'easy',
            'text' => fake()->sentence(),
            'options' => ['a', 'b', 'c', 'd'],
            'answer' => 0,
            'explanation' => fake()->sentence(),
        ];
    }
}
