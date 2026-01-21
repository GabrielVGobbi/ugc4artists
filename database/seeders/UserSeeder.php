<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::forceCreate([
            'name' => 'Admin',
            'email' => 'super@admin.com',
            'password' => 'superadmin',
            'account_type' => UserRoleType::tryFrom('artist'),
        ]);

        DB::table('users')->insert([
            [
                'id' => 2,
                'name' => 'Gobbi G',
                'uuid' => uuid(),
                'email' => 'gabriel.gobbi15@gmail.com',
                'google_id' => '113649688551427830914',
                'email_verified_at' => '2026-01-20 23:32:15',
                'avatar' => 'https://lh3.googleusercontent.com/a/ACg8ocKp_-kEYe5y-keoPSHdjIV0PelDNCfUN5TrbEW0ybxarIA1Gww=s96-c',
                'created_at' => '2026-01-20 23:32:15',
                'updated_at' => '2026-01-20 23:32:44',
                'onboarding_completed_at' => '2026-01-20 23:32:44',
                'password' => Hash::make('superadmin'),
                'remember_token' => null,
                'account_type' => UserRoleType::tryFrom('artist')
            ],
        ]);
    }
}
