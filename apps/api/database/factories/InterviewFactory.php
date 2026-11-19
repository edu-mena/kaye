<?php

namespace Database\Factories;

use App\Models\Interview;
use App\Support\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Interview>
 */
class InterviewFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'public_id' => Submission::randomId(),
            'area' => 'saude',
            'locale' => 'pt',
            'started_at' => now(),
            'candidate' => ['name' => fake()->firstName(), 'birthYear' => 2000, 'contact' => fake()->safeEmail(), 'guardianInformed' => false],
            'answers' => [['questionId' => 'q1', 'question' => 'Fala de ti', 'answer' => 'Olá', 'seconds' => 30, 'dictated' => false]],
        ];
    }
}
