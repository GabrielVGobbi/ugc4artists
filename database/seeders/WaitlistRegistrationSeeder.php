<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use App\Models\WaitlistRegistration;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class WaitlistRegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        WaitlistRegistration::factory()->count(50)->create();

        // Opcional: cria um registro "fixo" para facilitar testes
        WaitlistRegistration::factory()->create([
            'stage_name' => 'DJ Seeder',
            'instagram_handle' => '@djseeder',
            'contact_email' => 'djseeder@example.com',
            'artist_types' => ['dj', 'producer'],
            'participation_types' => ['show', 'collab'],
            'creation_availability' => 'weekly',
            'terms_accepted_at' => now(),
        ]);
    }
}
