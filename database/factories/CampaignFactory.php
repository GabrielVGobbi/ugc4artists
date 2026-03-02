<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Campaign>
 */
class CampaignFactory extends Factory
{
    protected $model = Campaign::class;

    /**
     * Music platforms for realistic data
     */
    protected const MUSIC_PLATFORMS = [
        'spotify' => 'https://open.spotify.com/track/',
        'youtube' => 'https://www.youtube.com/watch?v=',
        'deezer' => 'https://www.deezer.com/track/',
        'other' => null,
    ];

    /**
     * Brazilian states
     */
    protected const BR_STATES = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES', 'PA', 'AM', 'MA'];

    /**
     * Content niches for campaigns
     */
    protected const NICHES = [
        'musica', 'moda', 'beleza', 'games', 'tecnologia', 'lifestyle',
        'fitness', 'gastronomia', 'viagens', 'humor', 'educacao',
        'marketing_digital', 'criadores', 'entretenimento', 'pets',
    ];

    /**
     * Campaign name templates
     */
    protected const CAMPAIGN_TEMPLATES = [
        'Divulgação de Música - %s',
        'Campanha %s - Lançamento',
        'Promoção %s',
        'Alcance Orgânico - %s',
        'Campanha Creators %s',
        'Divulgação Digital %s',
        '%s - Marketing de Influência',
        'Projeto %s',
    ];

    /**
     * Product/Service examples
     */
    protected const PRODUCTS = [
        'Aplicativo de música streaming',
        'Plataforma de criação de conteúdo',
        'Serviço de marketing digital',
        'Produto de beleza natural',
        'Curso online de produção musical',
        'Software de edição de vídeo',
        'Marca de roupas sustentáveis',
        'Serviço de delivery gourmet',
    ];

    /**
     * Objectives examples
     */
    protected const OBJECTIVES = [
        'Aumentar o reconhecimento da marca entre o público jovem',
        'Gerar tráfego qualificado para o site',
        'Aumentar o engajamento nas redes sociais',
        'Promover o lançamento de novo produto',
        'Divulgar música e aumentar streams nas plataformas',
        'Criar awareness sobre o serviço',
        'Converter seguidores em clientes',
        'Aumentar downloads do aplicativo',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $kind = fake()->randomElement(['ugc', 'influencers']);
        $isInfluencer = $kind === 'influencers';
        $brandName = fake()->company();
        $hasMusic = fake()->boolean(60);
        $musicPlatform = $hasMusic ? fake()->randomElement(array_keys(self::MUSIC_PLATFORMS)) : null;

        // Dates
        $openDate = Carbon::now()->addDays(fake()->numberBetween(1, 10));
        $closeDate = (clone $openDate)->addDays(fake()->numberBetween(7, 30));
        $paymentDate = (clone $closeDate)->addDays(fake()->numberBetween(3, 15));

        // Budget
        $slots = fake()->numberBetween(1, 10);
        $pricePerInfluencer = fake()->randomElement([300, 500, 750, 1000, 1500, 2000, 2500]);

        return [
            'user_id' => User::factory(),

            // Básico
            'name' => sprintf(
                fake()->randomElement(self::CAMPAIGN_TEMPLATES),
                $brandName
            ),
            'kind' => $kind,
            'influencer_post_mode' => $isInfluencer ? fake()->randomElement(['profile', 'collab']) : null,

            // Música / conteúdo
            'music_platform' => $musicPlatform,
            'music_link' => $musicPlatform && $musicPlatform !== 'other'
                ? self::MUSIC_PLATFORMS[$musicPlatform] . fake()->uuid()
                : null,
            'product_or_service' => fake()->randomElement(self::PRODUCTS),
            'objective' => fake()->randomElement(self::OBJECTIVES),
            'objective_tags' => fake()->randomElements(
                ['divulgar_musica', 'divulgar_clipe', 'divulgar_perfil', 'divulgar_trend', 'outros'],
                fake()->numberBetween(1, 3)
            ),

            // Briefing
            'briefing_mode' => fake()->randomElement(['has_briefing', 'create_for_me']),
            'description' => fake()->paragraphs(fake()->numberBetween(2, 4), true),
            'terms_accepted' => true,

            // Perfil do creator
            'creator_profile_type' => fake()->randomElement(['influencer', 'page', 'both']),
            'content_platforms' => fake()->randomElements(
                ['instagram', 'tiktok', 'youtube', 'youtube_shorts'],
                fake()->numberBetween(1, 3)
            ),
            'audio_format' => $hasMusic ? 'music' : fake()->randomElement(['music', 'narration', null]),
            'video_duration_min' => fake()->randomElement([15, 30, 45, 60]),
            'video_duration_max' => fake()->randomElement([60, 90, 120, 180]),

            // Filtros opcionais (30% chance de ter filtros)
            'filter_age_min' => fake()->boolean(30) ? fake()->numberBetween(16, 25) : null,
            'filter_age_max' => fake()->boolean(30) ? fake()->numberBetween(30, 50) : null,
            'filter_gender' => fake()->randomElement(['female', 'male', 'both']),
            'filter_niches' => fake()->boolean(40) ? fake()->randomElements(self::NICHES, fake()->numberBetween(1, 4)) : [],
            'filter_states' => fake()->boolean(30) ? fake()->randomElements(self::BR_STATES, fake()->numberBetween(1, 5)) : [],
            'filter_min_followers' => fake()->boolean(40) ? fake()->randomElement([1000, 5000, 10000, 25000, 50000, 100000]) : null,

            // Cronograma
            'requires_product_shipping' => fake()->boolean(20),
            'applications_open_date' => $openDate,
            'applications_close_date' => $closeDate,
            'payment_date' => $paymentDate,

            // Orçamento
            'slots_to_approve' => $slots,
            'price_per_influencer' => $pricePerInfluencer,
            'requires_invoice' => fake()->boolean(30),

            // Branding
            'cover_image' => fake()->boolean(70) ? 'campaigns/' . fake()->uuid() . '.jpg' : null,
            'brand_instagram' => '@' . strtolower(str_replace(' ', '', fake()->words(2, true))),

            // Publicação
            'publication_plan' => fake()->randomElement(['basic', 'highlight', 'premium']),
            'publication_fee' => fake()->randomElement([0, 29.90, 49.90]),

            // Responsável
            'responsible_name' => fake()->boolean(70) ? fake()->name() : null,
            'responsible_cpf' => fake()->boolean(70) ? $this->generateCPF() : null,
            'responsible_phone' => fake()->boolean(70) ? $this->generateBrazilianPhone() : null,
            'responsible_email' => fake()->boolean(70) ? fake()->safeEmail() : null,
            'use_my_data' => fake()->boolean(50),

            // Status (default: draft)
            'status' => CampaignStatus::DRAFT,
            'submitted_at' => null,
            'reviewed_at' => null,
            'started_at' => null,
            'completed_at' => null,
            'cancelled_at' => null,
            'approved_at' => null,
            'rejected_at' => null,
            'rejection_reason' => null,
            'reviewed_by' => null,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Status States
    // ─────────────────────────────────────────────────────────────────────────────

    public function draft(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::DRAFT,
            'submitted_at' => null,
            'reviewed_at' => null,
            'approved_at' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::PENDING,
            'submitted_at' => now()->subDays(fake()->numberBetween(1, 10)),
            'reviewed_at' => null,
            'approved_at' => null,
        ]);
    }

    public function underReview(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::UNDER_REVIEW,
            'submitted_at' => now()->subDays(fake()->numberBetween(2, 15)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(1, 5)),
            'approved_at' => null,
            'publication_paid_at' => now()->subDays(fake()->numberBetween(1, 5)),
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::APPROVED,
            'submitted_at' => now()->subDays(fake()->numberBetween(5, 20)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(2, 10)),
            'approved_at' => now()->subDays(fake()->numberBetween(1, 5)),
            'reviewed_by' => User::factory(),
        ]);
    }

    public function refused(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::REFUSED,
            'submitted_at' => now()->subDays(fake()->numberBetween(5, 20)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(2, 10)),
            'rejected_at' => now()->subDays(fake()->numberBetween(1, 5)),
            'rejection_reason' => fake()->randomElement([
                'Conteúdo inadequado para a plataforma',
                'Informações insuficientes sobre o produto',
                'Orçamento incompatível com o mercado',
                'Objetivos não claros da campanha',
                'Requisitos muito restritivos para creators',
            ]),
            'reviewed_by' => User::factory(),
        ]);
    }

    public function awaitingPayment(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::AWAITING_PAYMENT,
            'submitted_at' => now()->subHours(fake()->numberBetween(1, 48)),
            'reviewed_at' => null,
            'approved_at' => null,
        ]);
    }

    public function sentToCreators(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::SENT_TO_CREATORS,
            'submitted_at' => now()->subDays(fake()->numberBetween(10, 30)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(5, 20)),
            'approved_at' => now()->subDays(fake()->numberBetween(3, 15)),
            'publication_paid_at' => now()->subDays(fake()->numberBetween(3, 15)),
            'reviewed_by' => User::factory(),
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::IN_PROGRESS,
            'submitted_at' => now()->subDays(fake()->numberBetween(15, 45)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(10, 35)),
            'approved_at' => now()->subDays(fake()->numberBetween(8, 30)),
            'started_at' => now()->subDays(fake()->numberBetween(5, 20)),
            'publication_paid_at' => now()->subDays(fake()->numberBetween(8, 30)),
            'reviewed_by' => User::factory(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::COMPLETED,
            'submitted_at' => now()->subDays(fake()->numberBetween(30, 90)),
            'reviewed_at' => now()->subDays(fake()->numberBetween(25, 85)),
            'approved_at' => now()->subDays(fake()->numberBetween(20, 80)),
            'started_at' => now()->subDays(fake()->numberBetween(15, 60)),
            'completed_at' => now()->subDays(fake()->numberBetween(1, 10)),
            'publication_paid_at' => now()->subDays(fake()->numberBetween(20, 80)),
            'reviewed_by' => User::factory(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => CampaignStatus::CANCELLED,
            'submitted_at' => now()->subDays(fake()->numberBetween(5, 30)),
            'cancelled_at' => now()->subDays(fake()->numberBetween(1, 10)),
            'rejection_reason' => fake()->randomElement([
                'Cliente solicitou cancelamento',
                'Orçamento indisponível',
                'Mudança de estratégia da marca',
                'Problemas técnicos na plataforma',
            ]),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Type States
    // ─────────────────────────────────────────────────────────────────────────────

    public function ugc(): static
    {
        return $this->state(fn(array $attributes) => [
            'kind' => 'ugc',
            'influencer_post_mode' => null,
        ]);
    }

    public function influencer(): static
    {
        return $this->state(fn(array $attributes) => [
            'kind' => 'influencers',
            'influencer_post_mode' => fake()->randomElement(['profile', 'collab']),
        ]);
    }

    public function profile(): static
    {
        return $this->state(fn(array $attributes) => [
            'kind' => 'influencers',
            'influencer_post_mode' => 'profile',
        ]);
    }

    public function collab(): static
    {
        return $this->state(fn(array $attributes) => [
            'kind' => 'influencers',
            'influencer_post_mode' => 'collab',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Publication Plan States
    // ─────────────────────────────────────────────────────────────────────────────

    public function basic(): static
    {
        return $this->state(fn(array $attributes) => [
            'publication_plan' => 'basic',
            'publication_fee' => 0,
        ]);
    }

    public function highlight(): static
    {
        return $this->state(fn(array $attributes) => [
            'publication_plan' => 'highlight',
            'publication_fee' => 29.90,
        ]);
    }

    public function premium(): static
    {
        return $this->state(fn(array $attributes) => [
            'publication_plan' => 'premium',
            'publication_fee' => 49.90,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Configuration States
    // ─────────────────────────────────────────────────────────────────────────────

    public function withFilters(): static
    {
        return $this->state(fn(array $attributes) => [
            'filter_age_min' => fake()->numberBetween(16, 25),
            'filter_age_max' => fake()->numberBetween(30, 50),
            'filter_gender' => fake()->randomElement(['female', 'male', 'both']),
            'filter_niches' => fake()->randomElements(self::NICHES, fake()->numberBetween(2, 5)),
            'filter_states' => fake()->randomElements(self::BR_STATES, fake()->numberBetween(2, 8)),
            'filter_min_followers' => fake()->randomElement([5000, 10000, 25000, 50000, 100000]),
        ]);
    }

    public function withoutFilters(): static
    {
        return $this->state(fn(array $attributes) => [
            'filter_age_min' => null,
            'filter_age_max' => null,
            'filter_gender' => 'both',
            'filter_niches' => [],
            'filter_states' => [],
            'filter_min_followers' => null,
        ]);
    }

    public function withInvoice(): static
    {
        return $this->state(fn(array $attributes) => [
            'requires_invoice' => true,
        ]);
    }

    public function withShipping(): static
    {
        return $this->state(fn(array $attributes) => [
            'requires_product_shipping' => true,
        ]);
    }

    public function withMusic(): static
    {
        $platform = fake()->randomElement(['spotify', 'youtube', 'deezer']);
        return $this->state(fn(array $attributes) => [
            'music_platform' => $platform,
            'music_link' => self::MUSIC_PLATFORMS[$platform] . fake()->uuid(),
            'audio_format' => 'music',
        ]);
    }

    public function withoutMusic(): static
    {
        return $this->state(fn(array $attributes) => [
            'music_platform' => null,
            'music_link' => null,
            'audio_format' => null,
        ]);
    }

    public function withResponsible(): static
    {
        return $this->state(fn(array $attributes) => [
            'responsible_name' => fake()->name(),
            'responsible_cpf' => $this->generateCPF(),
            'responsible_phone' => $this->generateBrazilianPhone(),
            'responsible_email' => fake()->safeEmail(),
            'use_my_data' => false,
        ]);
    }

    public function withoutResponsible(): static
    {
        return $this->state(fn(array $attributes) => [
            'responsible_name' => null,
            'responsible_cpf' => null,
            'responsible_phone' => null,
            'responsible_email' => null,
            'use_my_data' => true,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Date States
    // ─────────────────────────────────────────────────────────────────────────────

    public function openForApplications(): static
    {
        $openDate = Carbon::now()->subDays(fake()->numberBetween(1, 5));
        $closeDate = Carbon::now()->addDays(fake()->numberBetween(5, 15));
        $paymentDate = (clone $closeDate)->addDays(fake()->numberBetween(3, 10));

        return $this->state(fn(array $attributes) => [
            'applications_open_date' => $openDate,
            'applications_close_date' => $closeDate,
            'payment_date' => $paymentDate,
        ]);
    }

    public function upcomingApplications(): static
    {
        $openDate = Carbon::now()->addDays(fake()->numberBetween(3, 15));
        $closeDate = (clone $openDate)->addDays(fake()->numberBetween(7, 20));
        $paymentDate = (clone $closeDate)->addDays(fake()->numberBetween(3, 10));

        return $this->state(fn(array $attributes) => [
            'applications_open_date' => $openDate,
            'applications_close_date' => $closeDate,
            'payment_date' => $paymentDate,
        ]);
    }

    public function closedApplications(): static
    {
        $openDate = Carbon::now()->subDays(fake()->numberBetween(20, 40));
        $closeDate = Carbon::now()->subDays(fake()->numberBetween(5, 15));
        $paymentDate = (clone $closeDate)->addDays(fake()->numberBetween(3, 10));

        return $this->state(fn(array $attributes) => [
            'applications_open_date' => $openDate,
            'applications_close_date' => $closeDate,
            'payment_date' => $paymentDate,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Budget States
    // ─────────────────────────────────────────────────────────────────────────────

    public function lowBudget(): static
    {
        return $this->state(fn(array $attributes) => [
            'slots_to_approve' => fake()->numberBetween(1, 3),
            'price_per_influencer' => fake()->randomElement([300, 400, 500]),
        ]);
    }

    public function mediumBudget(): static
    {
        return $this->state(fn(array $attributes) => [
            'slots_to_approve' => fake()->numberBetween(3, 7),
            'price_per_influencer' => fake()->randomElement([750, 1000, 1250, 1500]),
        ]);
    }

    public function highBudget(): static
    {
        return $this->state(fn(array $attributes) => [
            'slots_to_approve' => fake()->numberBetween(8, 15),
            'price_per_influencer' => fake()->randomElement([2000, 2500, 3000, 4000, 5000]),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────────

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
        $number = fake()->numerify('########');

        return '+55' . $ddd . $prefix . $number;
    }

    /**
     * Configure campaign after creation
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Campaign $campaign) {
            // Could add relations here if needed
        });
    }
}
