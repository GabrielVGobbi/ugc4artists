<?php

namespace Database\Factories;

use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
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
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => $this->generateBrazilianPhone(),
            'document' => $this->generateCPF(),
            'email_verified_at' => now(),
            'onboarding_completed_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'account_type' => fake()->randomElement([
                UserRoleType::ARTIST,
                UserRoleType::BRAND,
                UserRoleType::CREATOR,
            ]),
            'avatar' => null,
            'bio' => fake()->boolean(70) ? fake()->sentence(20) : null,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user is an artist.
     */
    public function artist(): static
    {
        return $this->state(fn(array $attributes) => [
            'account_type' => UserRoleType::ARTIST,
            'bio' => fake()->sentence(15) . ' Artista profissional com experiência em diversas áreas.',
        ]);
    }

    /**
     * Indicate that the user is a brand.
     */
    public function brand(): static
    {
        return $this->state(fn(array $attributes) => [
            'account_type' => UserRoleType::BRAND,
            'bio' => fake()->sentence(15) . ' Marca focada em criar conteúdo de qualidade.',
        ]);
    }

    /**
     * Indicate that the user is a creator.
     */
    public function creator(): static
    {
        return $this->state(fn(array $attributes) => [
            'account_type' => UserRoleType::CREATOR,
            'bio' => fake()->sentence(15) . ' Criador de conteúdo digital.',
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user has not completed onboarding.
     */
    public function pendingOnboarding(): static
    {
        return $this->state(fn(array $attributes) => [
            'onboarding_completed_at' => null,
        ]);
    }

    /**
     * Indicate that the user has no document.
     */
    public function withoutDocument(): static
    {
        return $this->state(fn(array $attributes) => [
            'document' => null,
        ]);
    }

    /**
     * Indicate that the user has no phone.
     */
    public function withoutPhone(): static
    {
        return $this->state(fn(array $attributes) => [
            'phone' => null,
        ]);
    }

    /**
     * Indicate that the user has an avatar.
     */
    public function withAvatar(): static
    {
        return $this->state(fn(array $attributes) => [
            'avatar' => 'https://i.pravatar.cc/150?u=' . fake()->uuid(),
        ]);
    }

    public function withType($type): static
    {
        return $this->state(fn(array $attributes) => [
            'account_type' => UserRoleType::tryFrom($type),
        ]);
    }


    /**
     * Indicate that the model does not have two-factor authentication configured.
     */
    public function withoutTwoFactor(): static
    {
        return $this->state(fn(array $attributes) => [
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);
    }

    /**
     * Generate a valid Brazilian CPF.
     */
    protected function generateCPF(): string
    {
        $n1 = rand(0, 9);
        $n2 = rand(0, 9);
        $n3 = rand(0, 9);
        $n4 = rand(0, 9);
        $n5 = rand(0, 9);
        $n6 = rand(0, 9);
        $n7 = rand(0, 9);
        $n8 = rand(0, 9);
        $n9 = rand(0, 9);

        $d1 = $n9 * 2 + $n8 * 3 + $n7 * 4 + $n6 * 5 + $n5 * 6 + $n4 * 7 + $n3 * 8 + $n2 * 9 + $n1 * 10;
        $d1 = 11 - ($d1 % 11);
        if ($d1 >= 10) {
            $d1 = 0;
        }

        $d2 = $d1 * 2 + $n9 * 3 + $n8 * 4 + $n7 * 5 + $n6 * 6 + $n5 * 7 + $n4 * 8 + $n3 * 9 + $n2 * 10 + $n1 * 11;
        $d2 = 11 - ($d2 % 11);
        if ($d2 >= 10) {
            $d2 = 0;
        }

        return sprintf('%d%d%d%d%d%d%d%d%d%d%d', $n1, $n2, $n3, $n4, $n5, $n6, $n7, $n8, $n9, $d1, $d2);
    }

    /**
     * Generate a valid Brazilian phone number.
     */
    protected function generateBrazilianPhone(): string
    {
        $ddd = fake()->randomElement(['11', '21', '31', '41', '51', '61', '71', '81', '85', '91']);
        $prefix = fake()->randomElement(['9', '8', '7']);
        $number = fake()->numerify('####-####');

        return $ddd . $prefix . str_replace('-', '', $number);
    }
}
