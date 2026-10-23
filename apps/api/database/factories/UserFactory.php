<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'google_sub' => (string) fake()->unique()->numerify('1##################'),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'birth_year' => fake()->numberBetween(now()->year - 30, now()->year - 18),
            'province' => 'Luanda',
            'locale' => 'pt',
        ];
    }

    /**
     * A user between 14 and 17 years old.
     */
    public function minor(): static
    {
        return $this->state(fn (array $attributes) => [
            'birth_year' => fake()->numberBetween(now()->year - 17, now()->year - 14),
        ]);
    }

    /**
     * An admin who can sign in to the panel with a password (local only).
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Admin,
            'password' => static::$password ??= Hash::make('password'),
        ]);
    }
}
