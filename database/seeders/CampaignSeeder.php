<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Campaign;
use App\Models\User;
use App\Supports\Enums\Users\UserRoleType;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        // Usa um usuário existente ou cria um
        $user = User::where('id', 2)->first() ?? User::factory()->create();

        Campaign::create([
            'user_id' => $user->id,

            // Básico
            'name' => 'Divulgação de Música - Bean Music',
            'kind' => 'influencers', // ugc | influencers
            'influencer_post_mode' => 'profile', // profile | collab

            // Música / conteúdo
            'music_platform' => 'spotify',
            'music_link' => 'https://open.spotify.com/track/123456789',
            'product_or_service' => 'Plataforma Bean Music para criação e gestão de campanhas com creators.',
            'objective' => 'Divulgar a música e aumentar streams através de creators no TikTok.',
            'objective_tags' => [
                'divulgar_musica',
                'gerar_streams',
                'alcance'
            ],

            // Briefing
            'briefing_mode' => 'has_briefing', // has_briefing | create_for_me
            'description' => <<<TEXT
A música já foi lançada oficialmente.

O criador terá liberdade criativa para criar o conteúdo, desde que:
- Utilize a música como trilha sonora
- Explique rapidamente o que é a Bean Music
- Inclua CTA para conhecer a plataforma

Formato preferencial: vídeo vertical estilo TikTok.
TEXT,
            'terms_accepted' => true,

            // Perfil do creator
            'creator_profile_type' => 'both', // influencer | page | both
            'content_platforms' => [
                'tiktok',
                'instagram'
            ],
            'audio_format' => 'music', // music | narration
            'video_duration_min' => 15,
            'video_duration_max' => 60,

            // Filtros opcionais
            'filter_age_min' => 18,
            'filter_age_max' => 35,
            'filter_gender' => 'both',
            'filter_niches' => [
                'musica',
                'marketing_digital',
                'criadores'
            ],
            'filter_states' => [
                'SP',
                'RJ',
                'MG'
            ],
            'filter_min_followers' => 10000,

            // Cronograma
            'requires_product_shipping' => false,
            'applications_open_date' => Carbon::now()->addDays(1),
            'applications_close_date' => Carbon::now()->addDays(12),
            'payment_date' => Carbon::now()->addDays(15),

            // Orçamento
            'slots_to_approve' => 2,
            'price_per_influencer' => 5000.00,
            'requires_invoice' => false,

            // Branding
            'cover_image' => 'campaigns/bean-music-cover.png',
            'brand_instagram' => '@beanmusic',

            // Publicação
            'publication_plan' => 'premium', // basic | highlight | premium
            'publication_fee' => 49.90,

            // Responsável interno
            'responsible_name' => 'Gabriel Gobbi',
            'responsible_cpf' => '46562227801',
            'responsible_phone' => '+5511961234567',
            'responsible_email' => 'gabriel@beanmusic.com',

            // Status e controle
            'status' => 'draft', // draft | submitted | approved | rejected
            'submitted_at' => Carbon::now(),

            // Revisão (nulo inicialmente)
            'approved_at' => null,
            'rejected_at' => null,
            'rejection_reason' => null,
            'reviewed_by' => null,
        ]);
    }
}
