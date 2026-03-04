<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Update all campaigns with 'pending' status to 'under_review'.
     * This migration is part of the campaign status simplification,
     * where PENDING and UNDER_REVIEW statuses are merged into a single
     * UNDER_REVIEW status.
     */
    public function up(): void
    {
        // Update any campaigns with 'pending' status to 'under_review'
        DB::table('campaigns')
            ->where('status', 'pending')
            ->update([
                'status' => 'under_review',
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     *
     * Revert under_review status back to pending if needed.
     * Note: This rollback may not be perfect as we cannot determine
     * which campaigns were originally 'pending' vs 'under_review'.
     */
    public function down(): void
    {
        // Optionally revert under_review back to pending
        // Commented out to avoid data loss - only uncomment if absolutely needed
        // DB::table('campaigns')
        //     ->where('status', 'under_review')
        //     ->update([
        //         'status' => 'pending',
        //         'updated_at' => now(),
        //     ]);
    }
};
