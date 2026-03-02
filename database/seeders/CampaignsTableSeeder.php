<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Comprehensive Campaign Seeder with varied realistic scenarios
 *
 * Creates campaigns across all statuses, types, and configurations
 * to properly test the admin panel and user interfaces.
 */
class CampaignsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have users to attach campaigns to
        $users = User::whereNotNull('id')->take(3)->get();

        if ($users->isEmpty()) {
            $users = collect([
                User::factory()->brand()->create(),
                User::factory()->brand()->create(),
                User::factory()->artist()->create(),
            ]);
        }

        $user1 = $users[0];
        $user2 = $users->count() > 1 ? $users[1] : $user1;
        $user3 = $users->count() > 2 ? $users[2] : $user1;

        // ─────────────────────────────────────────────────────────────────────
        // DRAFT Campaigns (4)
        // ─────────────────────────────────────────────────────────────────────

        // Complete draft ready to submit
        Campaign::factory()
            ->draft()
            ->withMusic()
            ->withFilters()
            ->premium()
            ->for($user1, 'user')
            ->create([
                'name' => 'Divulgação Musical - Summer Vibes 2026',
            ]);

        // Incomplete draft (no filters, basic plan)
        Campaign::factory()
            ->draft()
            ->withoutFilters()
            ->basic()
            ->lowBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Campanha de Teste - Rascunho',
            ]);

        // UGC campaign draft
        Campaign::factory()
            ->draft()
            ->ugc()
            ->withoutMusic()
            ->mediumBudget()
            ->for($user1, 'user')
            ->create([
                'name' => 'UGC - Produto de Beleza Natural',
            ]);

        // Influencer collab draft
        Campaign::factory()
            ->draft()
            ->collab()
            ->withShipping()
            ->withInvoice()
            ->for($user3, 'user')
            ->create([
                'name' => 'Colaboração Influencers - Moda Sustentável',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // AWAITING_PAYMENT Campaigns (2)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->awaitingPayment()
            ->influencer()
            ->highlight()
            ->withFilters()
            ->for($user1, 'user')
            ->create([
                'name' => 'Lançamento App - Aguardando PIX',
            ]);

        Campaign::factory()
            ->awaitingPayment()
            ->ugc()
            ->premium()
            ->highBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Black Friday 2026 - Pagamento Pendente',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // UNDER_REVIEW Campaigns (3)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->underReview()
            ->influencer()
            ->withMusic()
            ->withFilters()
            ->mediumBudget()
            ->for($user1, 'user')
            ->create([
                'name' => 'Review - Música Indie Brasileira',
            ]);

        Campaign::factory()
            ->underReview()
            ->profile()
            ->withResponsible()
            ->highBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Em Análise - Campanha Corporativa',
            ]);

        Campaign::factory()
            ->underReview()
            ->ugc()
            ->withoutFilters()
            ->basic()
            ->for($user3, 'user')
            ->create([
                'name' => 'Validação - Conteúdo Lifestyle',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // PENDING Campaigns (2) - Older review status
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->pending()
            ->influencer()
            ->withFilters()
            ->mediumBudget()
            ->for($user1, 'user')
            ->create([
                'name' => 'Pendente - Tecnologia & Games',
            ]);

        Campaign::factory()
            ->pending()
            ->ugc()
            ->lowBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Aguardando Análise - Produto Digital',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // APPROVED Campaigns (4)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->approved()
            ->influencer()
            ->withMusic()
            ->premium()
            ->highBudget()
            ->withFilters()
            ->for($user1, 'user')
            ->create([
                'name' => 'Aprovada - Festival de Música Eletrônica',
            ]);

        Campaign::factory()
            ->approved()
            ->profile()
            ->highlight()
            ->mediumBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'OK - Campanha Beauty & Skincare',
            ]);

        Campaign::factory()
            ->approved()
            ->ugc()
            ->basic()
            ->withShipping()
            ->for($user3, 'user')
            ->create([
                'name' => 'Aprovada - Unboxing Produtos Tech',
            ]);

        Campaign::factory()
            ->approved()
            ->collab()
            ->withInvoice()
            ->highBudget()
            ->for($user1, 'user')
            ->create([
                'name' => 'Campanha Aprovada - Marca de Luxo',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // SENT_TO_CREATORS Campaigns (3)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->sentToCreators()
            ->openForApplications()
            ->influencer()
            ->withFilters()
            ->premium()
            ->for($user1, 'user')
            ->create([
                'name' => 'Ativo - Divulgação Plataforma Streaming',
            ]);

        Campaign::factory()
            ->sentToCreators()
            ->openForApplications()
            ->ugc()
            ->mediumBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Recrutando - Conteúdo Gastronomia',
            ]);

        Campaign::factory()
            ->sentToCreators()
            ->closedApplications()
            ->profile()
            ->highBudget()
            ->for($user3, 'user')
            ->create([
                'name' => 'Encerrado - Campanha Fitness 2026',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // IN_PROGRESS Campaigns (3)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->inProgress()
            ->influencer()
            ->withMusic()
            ->premium()
            ->withFilters()
            ->highBudget()
            ->for($user1, 'user')
            ->create([
                'name' => 'Em Produção - Lançamento Álbum 2026',
            ]);

        Campaign::factory()
            ->inProgress()
            ->ugc()
            ->highlight()
            ->mediumBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Produzindo - Reviews de Produto',
            ]);

        Campaign::factory()
            ->inProgress()
            ->collab()
            ->withShipping()
            ->for($user1, 'user')
            ->create([
                'name' => 'Ativo - Parceria Fashion Brand',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // COMPLETED Campaigns (2)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->completed()
            ->influencer()
            ->premium()
            ->withFilters()
            ->highBudget()
            ->for($user1, 'user')
            ->create([
                'name' => 'Finalizada - Campanha Verão 2025',
            ]);

        Campaign::factory()
            ->completed()
            ->ugc()
            ->basic()
            ->lowBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Concluída - Teste de Produto Beta',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // REFUSED Campaigns (2)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->refused()
            ->influencer()
            ->withFilters()
            ->for($user2, 'user')
            ->create([
                'name' => 'Recusada - Conteúdo Inapropriado',
            ]);

        Campaign::factory()
            ->refused()
            ->ugc()
            ->for($user3, 'user')
            ->create([
                'name' => 'Negada - Informações Incompletas',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // CANCELLED Campaigns (2)
        // ─────────────────────────────────────────────────────────────────────

        Campaign::factory()
            ->cancelled()
            ->influencer()
            ->mediumBudget()
            ->for($user1, 'user')
            ->create([
                'name' => 'Cancelada - Mudança de Estratégia',
            ]);

        Campaign::factory()
            ->cancelled()
            ->ugc()
            ->lowBudget()
            ->for($user2, 'user')
            ->create([
                'name' => 'Cancelada por Cliente - Budget Issue',
            ]);

        // ─────────────────────────────────────────────────────────────────────
        // ADDITIONAL Random Campaigns (10+) for bulk testing
        // ─────────────────────────────────────────────────────────────────────

        // Mix of everything
        Campaign::factory()
            ->count(5)
            ->for($user1, 'user')
            ->create();

        Campaign::factory()
            ->count(5)
            ->for($user2, 'user')
            ->create();

        Campaign::factory()
            ->count(5)
            ->for($user3, 'user')
            ->create();

        $this->command->info('✅ Created ' . Campaign::count() . ' campaigns with varied statuses and configurations');
    }
}
