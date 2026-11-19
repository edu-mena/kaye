<?php

namespace Database\Factories;

use App\Models\PublicCard;
use App\Support\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PublicCard>
 */
class PublicCardFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => Submission::randomId(),
            'secret_hash' => PublicCard::hashSecret('secret'),
            'card' => ['name' => fake()->name(), 'accent' => '#ffc000'],
        ];
    }
}
