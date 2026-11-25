<?php

namespace Database\Factories;

use App\Enums\StaffRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /** A TOTP secret for tests: the panel requires the second factor to be set up. */
    public const TOTP_SECRET = 'JBSWY3DPEHPK3PXP';

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
     * An admin who can sign in to the panel with a password (local only), with the second factor set up.
     */
    public function admin(): static
    {
        return $this->staff(StaffRole::Admin);
    }

    public function editor(): static
    {
        return $this->staff(StaffRole::Editor);
    }

    public function reviewer(): static
    {
        return $this->staff(StaffRole::Reviewer);
    }

    /**
     * A member of the team. Without the second factor (`withoutTotp`), the panel sends them to set it up.
     */
    public function staff(StaffRole $role): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => static::$password ??= Hash::make('password'),
            'app_authentication_secret' => self::TOTP_SECRET,
        ])->afterCreating(fn (User $user) => $user->assignRole($role->value));
    }

    public function withoutTotp(): static
    {
        return $this->state(fn (array $attributes) => ['app_authentication_secret' => null]);
    }
}
