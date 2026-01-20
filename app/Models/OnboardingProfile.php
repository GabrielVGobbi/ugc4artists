<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingProfile extends Model
{
    protected $fillable = [
        'user_id',
        'role',
        'display_name',
        'country',
        'state',
        'city',
        'primary_language',
        'profile_data',
        'links',
        'source',
        'expectation',
    ];

    protected function casts(): array
    {
        return [
            'profile_data' => 'array',
            'links' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isArtist(): bool
    {
        return $this->role === 'artist';
    }

    public function isCreator(): bool
    {
        return $this->role === 'creator';
    }

    public function isBrand(): bool
    {
        return $this->role === 'brand';
    }
}
