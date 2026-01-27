<?php

declare(strict_types=1);

namespace App\Supports\Traits;

use App\Models\Address;

trait HasAddresses
{
    /**
     * Relacionamento: um serviço pode ter vários endereços.
     */
    public function addresses()
    {
        return $this->morphMany(Address::class, 'addressable');
    }
}
