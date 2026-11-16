<?php

namespace Database\Factories;

use App\Models\News;
use App\Models\NewsEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NewsEvent>
 */
class NewsEventFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'news_id' => News::factory(),
            'starts_on' => fake()->date(),
            'venue' => fake()->streetName(),
            'city' => 'Luanda',
            'formats' => ['palestra'],
        ];
    }
}
