<?php

namespace Database\Factories;

use App\Models\WaitlistEntry;
use App\Support\Consents;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WaitlistEntry>
 */
class WaitlistEntryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'email' => fake()->unique()->safeEmail(),
            'whatsapp' => '+2449'.fake()->unique()->numerify('########'),
            'source' => 'landing',
            'locale' => 'pt',
            'consent_at' => now(),
        ];
    }

    /** With the consents the form records (the email still waiting for its double opt-in). */
    public function configure(): static
    {
        return $this->afterCreating(fn (WaitlistEntry $entry) => Consents::forWaitlist($entry, null));
    }

    /** The email confirmed (double opt-in done). */
    public function confirmed(): static
    {
        return $this->state(['confirmed_at' => now()])->afterCreating(
            fn (WaitlistEntry $entry) => $entry->consents()->where('kind', 'email_service')->update(['confirmed_at' => now()]),
        );
    }
}
