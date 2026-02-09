<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transfers', function (Blueprint $table) {
            // Custom fields for transfer management
            $table->text('description')->nullable()->after('extra');

            // Cancellation tracking
            $table->timestamp('cancelled_at')->nullable()->after('description');
            $table->foreignId('cancelled_by')->nullable()->after('cancelled_at')
                ->constrained('users')->nullOnDelete();

            // Soft deletes for audit trail
            $table->softDeletes();

            // Indexes for querying
            $table->index('cancelled_at');
        });
    }

    public function down(): void
    {
        Schema::table('transfers', function (Blueprint $table) {
            $table->dropForeign(['cancelled_by']);
            $table->dropIndex(['cancelled_at']);

            $table->dropColumn([
                'description',
                'cancelled_at',
                'cancelled_by',
                'deleted_at',
            ]);
        });
    }
};
