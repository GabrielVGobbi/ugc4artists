<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Informações Básicas
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('kind', ['ugc', 'influencers'])->default('influencers');
            $table->enum('influencer_post_mode', ['profile', 'collab'])->nullable();

            // Música / Conteúdo
            $table->enum('music_platform', ['spotify', 'youtube', 'deezer', 'other'])->nullable();
            $table->string('music_link')->nullable();

            // Produto/Serviço e Objetivo
            $table->text('product_or_service')->nullable();
            $table->text('objective')->nullable();
            $table->json('objective_tags')->nullable(); // ['divulgar_musica', 'divulgar_clipe', etc]

            // Briefing
            $table->enum('briefing_mode', ['has_briefing', 'create_for_me'])->default('has_briefing');
            $table->longText('description')->nullable();
            $table->boolean('terms_accepted')->default(false);

            // Perfil do Influencer
            $table->enum('creator_profile_type', ['influencer', 'page', 'both'])->default('both');
            $table->json('content_platforms')->nullable(); // ['instagram', 'tiktok', 'youtube', 'youtube_shorts']
            $table->enum('audio_format', ['music', 'narration'])->nullable();
            $table->integer('video_duration_min')->nullable();
            $table->integer('video_duration_max')->nullable();

            // Filtros/Restrições (Opcional)
            $table->integer('filter_age_min')->nullable();
            $table->integer('filter_age_max')->nullable();
            $table->enum('filter_gender', ['female', 'male', 'both'])->nullable();
            $table->json('filter_niches')->nullable();
            $table->json('filter_states')->nullable();
            $table->integer('filter_min_followers')->nullable();

            // Cronograma
            $table->boolean('requires_product_shipping')->default(false); //precisa enviar produto para a influencer?;
            $table->date('applications_open_date')->nullable();
            $table->date('applications_close_date')->nullable();
            $table->date('payment_date')->nullable();

            // Orçamento
            $table->integer('slots_to_approve')->default(1);
            $table->decimal('price_per_influencer', 12, 2)->default(0);
            $table->boolean('requires_invoice')->default(false);

            // Apresentação da Marca
            $table->string('cover_image')->nullable();
            $table->string('brand_instagram')->nullable();

            // Tipo de Publicação
            $table->enum('publication_plan', ['basic', 'highlight', 'premium'])->default('basic');
            $table->decimal('publication_fee', 10, 2)->default(0);
            $table->decimal('publication_wallet_amount', 10, 2)->default(0);
            $table->timestamp('publication_paid_at')->nullable();
            $table->enum('publication_payment_method', ['pix', 'card', 'wallet', 'mixed'])->nullable();
            $table->string('publication_payment_id')->nullable();

            // Responsável pela Campanha
            $table->string('responsible_name')->nullable();
            $table->string('responsible_cpf')->nullable();
            $table->string('responsible_phone')->nullable();
            $table->string('responsible_email')->nullable();
            $table->boolean('use_my_data')->default(false);

            // Status e Controle
            $table->enum('status', [
                'draft',           // Rascunho
                'pending_review',  // Aguardando revisão dos curadores
                'approved',        // Aprovada e ativa
                'rejected',        // Rejeitada pelos curadores
                'active',          // Ativa e aceitando inscrições
                'paused',          // Pausada temporariamente
                'completed',       // Concluída
                'cancelled',       // Cancelada
            ])->default('draft');

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();

            // Métricas
            $table->integer('applications_count')->default(0);
            $table->integer('approved_creators_count')->default(0);
            $table->integer('views_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['user_id', 'status']);
            $table->index(['status', 'applications_open_date']);
            $table->index('kind');
            $table->index('publication_plan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
