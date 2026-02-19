<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_approved_creators', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('campaign_id')->constrained('campaigns')->cascadeOnDelete();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['campaign_id', 'creator_id']);
            $table->index(['creator_id', 'campaign_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_approved_creators');
    }
};
