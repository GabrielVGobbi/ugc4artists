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
        Schema::table('account_statements', function (Blueprint $table) {
            // Previne duplicatas de service payments para o mesmo serviço
            $table->unique(
                ['statementable_type', 'statementable_id', 'type', 'category'],
                'unique_service_statement'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('account_statements', function (Blueprint $table) {
            $table->dropUnique('unique_service_statement');
        });
    }
};
