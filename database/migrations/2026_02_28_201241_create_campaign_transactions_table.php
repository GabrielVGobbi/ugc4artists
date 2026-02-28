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
        Schema::create('campaign_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            // Relations
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('payment_id')->nullable()->constrained('payments', 'uuid')->nullOnDelete();

            // Transaction type
            $table->enum('type', ['wallet_only', 'gateway_only', 'mixed'])->index();
            $table->enum('status', ['completed', 'pending', 'failed'])->default('pending')->index();

            // Amounts (in decimal format for easy querying and display)
            $table->decimal('campaign_cost', 10, 2)->default(0); // slots * price_per_influencer
            $table->decimal('publication_fee', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0); // campaign_cost + publication_fee
            $table->decimal('wallet_amount', 10, 2)->default(0); // amount paid with wallet
            $table->decimal('gateway_amount', 10, 2)->default(0); // amount paid via gateway

            // Payment details
            $table->string('payment_method')->nullable(); // pix, credit_card, wallet
            $table->string('gateway')->nullable(); // asaas, etc

            // Metadata (stores full CheckoutCalculation breakdown)
            $table->json('meta')->nullable();

            // Timestamps
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Indexes for efficient queries
            $table->index(['user_id', 'created_at']);
            $table->index(['campaign_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_transactions');
    }
};
