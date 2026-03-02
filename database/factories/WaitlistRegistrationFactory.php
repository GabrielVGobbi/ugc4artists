<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\WaitlistRegistration;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends Factory<WaitlistRegistration>
 */
class WaitlistRegistrationFactory extends Factory
{
    protected $model = WaitlistRegistration::class;

    public function definition(): array
    {
        $artistTypesPool = [
            'dj',
            'producer',
            'singer',
            'rapper',
            'instrumentalist',
            'band',
            'composer',
            'songwriter',
            'dancer',
            'visual_artist',
        ];

        $participationTypesPool = [
            'show',
            'festival',
            'collab',
            'workshop',
            'residency',
            'content',
            'dj_set',
        ];

        $creationAvailabilityPool = [
            'daily',
            'weekly',
            'biweekly',
            'monthly',
            'sporadic',
        ];

        $stageName = $this->faker->unique()->name();

        $artistTypes = $this->faker->randomElements(
            $artistTypesPool,
            $this->faker->numberBetween(1, 3)
        );

        $participationTypes = $this->faker->randomElements(
            $participationTypesPool,
            $this->faker->numberBetween(1, 3)
        );

        $termsAccepted = $this->faker->boolean(90) ? $this->faker->dateTimeBetween('-60 days', 'now') : null;
        $emailSent = $termsAccepted && $this->faker->boolean(60)
            ? $this->faker->dateTimeBetween($termsAccepted, 'now')
            : null;

        return [
            'stage_name' => $stageName,

            'instagram_handle' => $this->faker->boolean(75)
                ? '@' . $this->faker->unique()->userName()
                : null,

            'youtube_handle' => $this->faker->boolean(45)
                ? $this->faker->unique()->userName()
                : null,

            'tiktok_handle' => $this->faker->boolean(55)
                ? '@' . $this->faker->unique()->userName()
                : null,

            'contact_email' => $this->faker->unique()->safeEmail(),

            'artist_types' => $artistTypes,

            // Se cair no caso de "other", preenche texto; caso contrário, null
            'other_artist_type' => in_array('visual_artist', $artistTypes, true) && $this->faker->boolean(20)
                ? $this->faker->jobTitle()
                : null,

            'main_genre' => $this->faker->randomElement([
                'Pop',
                'Rock',
                'Hip Hop',
                'Funk',
                'Sertanejo',
                'MPB',
                'Electronic',
                'House',
                'Techno',
                'Reggaeton',
                'R&B',
                'Indie',
            ]),

            'participation_types' => $participationTypes,

            'portfolio_link' => $this->faker->boolean(65)
                ? $this->faker->url()
                : null,

            'city_state' => $this->faker->randomElement([
                'São Paulo/SP',
                'Rio de Janeiro/RJ',
                'Belo Horizonte/MG',
                'Curitiba/PR',
                'Porto Alegre/RS',
                'Salvador/BA',
                'Recife/PE',
                'Fortaleza/CE',
                'Brasília/DF',
                'Florianópolis/SC',
            ]),

            'creation_availability' => $this->faker->randomElement($creationAvailabilityPool),

            'terms_accepted_at' => now(),
            'email_sent_at' => $emailSent,
        ];
    }

    /**
     * Estado: força termos aceitos.
     */
    public function termsAccepted(): static
    {
        return $this->state(fn() => [
            'terms_accepted_at' => now(),
        ]);
    }

    /**
     * Estado: força email enviado (e garante termos aceitos).
     */
    public function emailSent(): static
    {
        return $this->state(fn() => [
            'terms_accepted_at' => now(),
            'email_sent_at' => now(),
        ]);
    }
}
