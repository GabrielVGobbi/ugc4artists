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
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Notification preferences
            $table->boolean('new_campaigns')->default(true);
            $table->boolean('payments_received')->default(true);
            $table->boolean('system_updates')->default(true);
            $table->boolean('performance_tips')->default(true);

            // Channel preferences
            $table->enum('new_campaigns_channel', ['push', 'email', 'both'])->default('both');
            $table->enum('payments_channel', ['push', 'email', 'both'])->default('push');
            $table->enum('system_updates_channel', ['push', 'email', 'both'])->default('email');
            $table->enum('performance_tips_channel', ['push', 'email', 'both'])->default('push');

            $table->timestamps();

            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
