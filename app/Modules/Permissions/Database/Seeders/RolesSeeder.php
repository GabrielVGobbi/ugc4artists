<?php

namespace App\Modules\Permissions\Database\Seeders;

use App\Models\User;
use App\Modules\Permissions\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Developer', 'slug' => 'developer', 'description' => 'Acesso total (super role)'],
            ['name' => 'Super Admin', 'slug' => 'super-admin', 'description' => 'Administração completa'],
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Administração padrão'],

            ['name' => 'Artista', 'slug' => 'artist', 'description' => 'Usuário Artista'],
            ['name' => 'Criador', 'slug' => 'creator', 'description' => 'Usuário Criador UGC'],
            ['name' => 'Marca', 'slug' => 'brand', 'description' => 'Usuário Marca / Empresa'],

        ];

        foreach ($roles as $role) {
            Role::query()->firstOrCreate(
                ['slug' => $role['slug']],
                ['name' => $role['name'], 'description' => $role['description']]
            );
        }

        $roleDev = Role::whereSlug('developer')->first();
        foreach (User::all() as $user) {
            $user->roles()->syncWithoutDetaching([$roleDev]);
        }
    }
}
