<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Tipo de perfil: artist, creator, brand
            $table->string('role', 32);
            
            // Campos comuns
            $table->string('display_name', 60);
            $table->string('country', 5)->default('BR');
            $table->string('state', 2)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('primary_language', 10)->default('pt-BR');
            
            // Dados específicos do perfil (JSON)
            $table->json('profile_data')->nullable();
            
            // Links sociais
            $table->json('links')->nullable();
            
            // Origem/Source (marketing)
            $table->string('source', 50)->nullable();
            
            // Expectativa/Feedback final
            $table->text('expectation')->nullable();
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_profiles');
    }
};
