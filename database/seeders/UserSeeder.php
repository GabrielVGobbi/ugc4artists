<?php

namespace Database\Seeders;

use App\Models\User;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ─────────────────────────────────────────────────────────────────────────
        // Admin Users (for testing)
        // ─────────────────────────────────────────────────────────────────────────

        $this->createAdminUsers();

        // ─────────────────────────────────────────────────────────────────────────
        // Artist Users (20 users)
        // ─────────────────────────────────────────────────────────────────────────

        // Artists with complete profiles
        User::factory()
            ->count(10)
            ->artist()
            ->withAvatar()
            ->create();

            //Creators with complete profiles
        User::factory()
            ->count(10)
            ->creator()
            ->create();

        // Artists with pending onboarding
        User::factory()
            ->count(5)
            ->artist()
            ->pendingOnboarding()
            ->create();

        // Artists with unverified email
        User::factory()
            ->count(3)
            ->artist()
            ->unverified()
            ->create();

        // Artists without document
        User::factory()
            ->count(2)
            ->artist()
            ->withoutDocument()
            ->create();

        // ─────────────────────────────────────────────────────────────────────────
        // Brand Users (15 users)
        // ─────────────────────────────────────────────────────────────────────────

        // Brands with complete profiles
        User::factory()
            ->count(8)
            ->brand()
            ->withAvatar()
            ->create();

        // Brands with pending onboarding
        User::factory()
            ->count(4)
            ->brand()
            ->pendingOnboarding()
            ->create();

        // Brands with unverified email
        User::factory()
            ->count(3)
            ->brand()
            ->unverified()
            ->create();

        // ─────────────────────────────────────────────────────────────────────────
        // Creator Users (15 users)
        // ─────────────────────────────────────────────────────────────────────────

        // Creators with complete profiles
        User::factory()
            ->count(7)
            ->creator()
            ->withAvatar()
            ->create();

        // Creators with pending onboarding
        User::factory()
            ->count(4)
            ->creator()
            ->pendingOnboarding()
            ->create();

        // Creators without phone
        User::factory()
            ->count(2)
            ->creator()
            ->withoutPhone()
            ->create();

        // Creators with unverified email
        User::factory()
            ->count(2)
            ->creator()
            ->unverified()
            ->create();

        // ─────────────────────────────────────────────────────────────────────────
        // Mixed States (Edge Cases)
        // ─────────────────────────────────────────────────────────────────────────

        // User without document and phone
        User::factory()
            ->count(2)
            ->artist()
            ->withoutDocument()
            ->withoutPhone()
            ->create();

        // User unverified + pending onboarding
        User::factory()
            ->count(3)
            ->brand()
            ->unverified()
            ->pendingOnboarding()
            ->create();

        // User with minimal data
        User::factory()
            ->count(2)
            ->creator()
            ->unverified()
            ->pendingOnboarding()
            ->withoutDocument()
            ->withoutPhone()
            ->create();

        $this->command->info('');
        $this->command->info('✅ Users seeded successfully!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('📊 Statistics:');
        $this->command->info('   Total users: ' . User::count());
        $this->command->info('   🎨 Artists: ' . User::where('account_type', UserRoleType::ARTIST)->count());
        $this->command->info('   🏢 Brands: ' . User::where('account_type', UserRoleType::BRAND)->count());
        $this->command->info('   🎬 Creators: ' . User::where('account_type', UserRoleType::CREATOR)->count());
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('');
    }

    /**
     * Create admin users for testing
     */
    protected function createAdminUsers(): void
    {
        // Admin 1 - Generic admin
        if (!User::where('email', 'super@admin.com')->exists()) {
            User::create([
                'name' => 'Admin',
                'email' => 'super@admin.com',
                'password' => Hash::make('superadmin'),
                'email_verified_at' => now(),
                'onboarding_completed_at' => now(),
                'account_type' => UserRoleType::ARTIST,
                'phone' => '11999999999',
                'document' => '12345678901',
                'bio' => 'Usuário administrador do sistema',
            ]);

            $this->command->info('✅ Admin 1 created: super@admin.com / superadmin');
        } else {
            $this->command->warn('⚠️  Admin 1 already exists, skipping...');
        }

        // Admin 2 - Your personal admin
        if (!User::where('email', 'gabriel.gobbi15@gmail.com')->exists()) {
            User::create([
                'name' => 'Gobbi G',
                'email' => 'gabriel.gobbi15@gmail.com',
                'google_id' => '113649688551427830914',
                'password' => Hash::make('superadmin'),
                'email_verified_at' => now(),
                'onboarding_completed_at' => now(),
                'account_type' => UserRoleType::ARTIST,
                'document' => '46562227801',
                'phone' => '11971590068',
                'avatar' => 'https://lh3.googleusercontent.com/a/ACg8ocKp_-kEYe5y-keoPSHdjIV0PelDNCfUN5TrbEW0ybxarIA1Gww=s96-c',
                'bio' => 'Desenvolvedor e administrador do sistema',
            ]);

            $this->command->info('✅ Admin 2 created: gabriel.gobbi15@gmail.com / superadmin');
        } else {
            $this->command->warn('⚠️  Admin 2 already exists, skipping...');
        }

        // Test users for each type
        $testUsers = [
            [
                'name' => 'Artista Teste',
                'email' => 'artist@test.com',
                'account_type' => UserRoleType::ARTIST,
                'bio' => 'Artista de teste com perfil completo',
            ],
            [
                'name' => 'Marca Teste',
                'email' => 'brand@test.com',
                'account_type' => UserRoleType::BRAND,
                'bio' => 'Marca de teste com perfil completo',
            ],
            [
                'name' => 'Criador Teste',
                'email' => 'creator@test.com',
                'account_type' => UserRoleType::CREATOR,
                'bio' => 'Criador de teste com perfil completo',
            ],
        ];

        foreach ($testUsers as $userData) {
            if (!User::where(function ($query) use ($userData) {
                $query->where('email', $userData['email'])->orWhere('document', '98765432101');
            })->exists()) {
                User::create([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'onboarding_completed_at' => now(),
                    'account_type' => $userData['account_type'],
                    'phone' => '11987654321',
                    'document' => '98765432101',
                    'bio' => $userData['bio'],
                    'avatar' => 'https://i.pravatar.cc/150?u=' . $userData['email'],
                ]);

                $this->command->info('✅ Test user created: ' . $userData['email'] . ' / password');
            } else {
                $this->command->warn('⚠️  Test user ' . $userData['email'] . ' already exists, skipping...');
            }
        }
    }
}
