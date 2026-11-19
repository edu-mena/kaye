<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Institution;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Program>
 */
class ProgramFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(3),
            'institution_id' => Institution::factory(),
            'course_id' => Course::factory(),
            'name' => fake()->words(3, true),
            'level' => 'licenciatura',
            'duration_months' => 48,
            'schedule' => ['diurno'],
        ];
    }
}
