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
        $this->command->info('📊 Estatísticas:');
        $this->command->info('   Total de usuários: ' . User::count());
        $this->command->info('   🎨 Artistas:  ' . User::where('account_type', UserRoleType::ARTIST)->count());
        $this->command->info('   🏢 Marcas:    ' . User::where('account_type', UserRoleType::BRAND)->count());
        $this->command->info('   🎬 Criadores: ' . User::where('account_type', UserRoleType::CREATOR)->count());
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('🔑 Acessos fixos (senha: superadmin)');
        $this->command->info('   super@admin.com         → Admin');
        $this->command->info('   artist@test.com         → Artista');
        $this->command->info('   brand@test.com          → Marca');
        $this->command->info('   creator@test.com        → Criador');
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

        // Test users – one per account type, all with password "superadmin"
        $testUsers = [
            [
                'name'         => 'Artista Teste',
                'email'        => 'artist@test.com',
                'account_type' => UserRoleType::ARTIST,
                'phone'        => '11911111111',
                'document'     => '11111111111',
                'bio'          => 'Artista de teste com perfil completo',
            ],
            [
                'name'         => 'Marca Teste',
                'email'        => 'brand@test.com',
                'account_type' => UserRoleType::BRAND,
                'phone'        => '11922222222',
                'document'     => '22222222222',
                'bio'          => 'Marca de teste com perfil completo',
            ],
            [
                'name'         => 'Criador Teste',
                'email'        => 'creator@test.com',
                'account_type' => UserRoleType::CREATOR,
                'phone'        => '11933333333',
                'document'     => '33333333333',
                'bio'          => 'Criador de teste com perfil completo',
            ],
        ];

        foreach ($testUsers as $userData) {
            if (User::where('email', $userData['email'])->exists()) {
                $this->command->warn('⚠️  Usuário de teste já existe, pulando: ' . $userData['email']);
                continue;
            }

            User::create([
                'name'                    => $userData['name'],
                'email'                   => $userData['email'],
                'password'                => Hash::make('superadmin'),
                'email_verified_at'       => now(),
                'onboarding_completed_at' => now(),
                'account_type'            => $userData['account_type'],
                'phone'                   => $userData['phone'],
                'document'                => $userData['document'],
                'bio'                     => $userData['bio'],
                'avatar'                  => 'https://i.pravatar.cc/150?u=' . $userData['email'],
            ]);

            $this->command->info('✅ Usuário de teste criado: ' . $userData['email'] . ' / superadmin');
        }
    }
}
