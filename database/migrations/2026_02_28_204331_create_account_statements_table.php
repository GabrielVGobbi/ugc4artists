<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('account_statements', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Owner
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Polymorphic - serviço relacionado (Campaign, Subscription, Order, etc)
            $table->string('statementable_type')->nullable();
            $table->unsignedBigInteger('statementable_id')->nullable();

            // Tipo de movimentação
            $table->enum('type', ['deposit', 'service_payment', 'refund', 'withdrawal'])->index();
            $table->string('category')->index(); // wallet_deposit, campaign_payment, subscription_fee, etc

            // Valores (decimal para fácil visualização)
            $table->decimal('amount', 10, 2)->default(0); // Total (positivo=entrada, negativo=saída)
            $table->decimal('wallet_amount', 10, 2)->default(0); // Quanto veio/foi da wallet
            $table->decimal('gateway_amount', 10, 2)->default(0); // Quanto veio/foi do gateway

            // Detalhes do pagamento
            $table->string('payment_method')->nullable(); // wallet, pix, credit_card, mixed
            $table->string('gateway')->nullable(); // asaas, stripe, etc
            $table->foreignUuid('payment_id')->nullable()->constrained('payments', 'uuid')->nullOnDelete();

            // Status
            $table->enum('status', ['completed', 'pending', 'failed', 'refunded'])->default('pending')->index();

            // Metadata
            $table->string('description')->nullable();
            $table->json('meta')->nullable(); // Breakdown completo

            // Timestamps
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Índices para performance
            $table->index(['user_id', 'created_at']); // Queries de extrato por usuário
            $table->index(['statementable_type', 'statementable_id']); // Busca por serviço
            $table->index('created_at'); // Ordenação cronológica
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_statements');
    }
};
