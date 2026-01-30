<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->uuid('uuid')->unique();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Polymorphic (billable)
            $table->string('billable_type')->nullable();
            $table->string('billable_id')->nullable();

            $table->string('currency', 3)->default('BRL');

            $table->bigInteger('amount_cents');
            $table->bigInteger('wallet_applied_cents')->default(0);
            $table->bigInteger('gateway_amount_cents')->nullable();

            $table->string('status');
            $table->string('payment_method')->nullable();

            $table->string('url')->nullable();

            $table->string('gateway')->nullable();
            $table->string('gateway_reference')->nullable();

            $table->json('gateway_data')->nullable();
            $table->json('gateway_meta')->nullable();
            $table->json('gateway_payload')->nullable();
            $table->json('gateway_response')->nullable();

            $table->string('idempotency_key')->nullable()->unique();

            $table->unsignedBigInteger('hold_transaction_id')->nullable();

            $table->json('meta')->nullable();

            // Dates
            $table->date('due_date')->nullable();
            $table->date('paid_at')->nullable();
            $table->date('received_at')->nullable();
            $table->date('refund_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes úteis
            $table->index(['billable_type', 'billable_id']);
            $table->index('status');
            $table->index('gateway_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
