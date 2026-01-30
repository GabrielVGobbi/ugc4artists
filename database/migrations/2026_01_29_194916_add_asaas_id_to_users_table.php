<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration adds the external gateway ID column for the asaas payment gateway.
     * The column stores the customer ID from the payment gateway (e.g., 'cus_xxxxx' for Asaas).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('asaas_id')
                ->nullable()
                ->after('id')
                ->index()
                ->comment('asaas customer external ID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('asaas_id');
        });
    }
};