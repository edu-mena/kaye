<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseOffer;
use App\Models\Institution;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseOffer>
 */
class CourseOfferFactory extends Factory
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
            'name' => ['pt' => fake()->words(3, true)],
            'level' => 'licenciatura',
            'groups' => [],
        ];
    }
}
