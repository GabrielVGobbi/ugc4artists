<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaign_approved_creators', function (Blueprint $table): void {
            $table->string('content_url')->nullable()->after('creator_id');
            $table->text('notes')->nullable()->after('content_url');
            $table->timestamp('submitted_at')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('campaign_approved_creators', function (Blueprint $table): void {
            $table->dropColumn(['content_url', 'notes', 'submitted_at']);
        });
    }
};
