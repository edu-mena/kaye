<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\Revision;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Revision>
 */
class RevisionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_type' => 'institution',
            'revisable_type' => (new Institution)->getMorphClass(),
            'slug' => fake()->unique()->slug(2),
            'changes' => ['phone' => '+244 222 000 000'],
            'source_url' => 'https://example.ao/contactos',
        ];
    }
}
