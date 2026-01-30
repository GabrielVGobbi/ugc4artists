<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('addresses')->insert([
            'id' => 1,
            'uuid' => '6c2d2690-892e-434a-9f43-e323cebb0f39',
            'addressable_type' => 'App\Models\User',
            'addressable_id' => 2,
            'name' => 'cads',
            'street' => 'Alameda das Margaridas',
            'number' => '1',
            'neighborhood' => '1',
            'district' => null,
            'city' => 'Santana de Parnaíba',
            'state' => 'SP',
            'zipcode' => '06539270',
            'complement' => null,
            'country' => 'BR',
            'is_default' => true,
            'created_at' => '2026-01-29 20:25:30',
            'updated_at' => '2026-01-29 20:25:30',
            'deleted_at' => null,
        ]);
    }
}
