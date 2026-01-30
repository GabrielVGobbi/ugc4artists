<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();

            $table->string('provider'); // ex: asaas, iugu, stripe
            $table->string('provider_event_id')->nullable();

            $table->uuid('payment_uuid')->nullable();

            $table->string('event_type'); // ex: payment.confirmed, invoice.paid

            $table->json('payload');
            $table->json('headers')->nullable();

            $table->timestamp('processed_at')->nullable();

            $table->text('error_message')->nullable();

            $table->unsignedInteger('attempts')->default(0);

            $table->timestamps();

            // Índices úteis em produção
            $table->index(['provider', 'provider_event_id']);
            $table->index('payment_uuid');
            $table->index('event_type');
            $table->index('processed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
    }
};
