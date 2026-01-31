<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\OnlyNumber;
use App\Modules\Payments\Core\Traits\HasPayments;
use App\Modules\Permissions\Traits\HasPermissionsTrait;
use App\Supports\Enums\Users\UserRoleType;
use App\Supports\Traits\GenerateUuidTrait;
use App\Supports\Traits\HasAddresses;
use App\Supports\Traits\HasNotificationSettings;
use Bavix\Wallet\Interfaces\Customer;
use Bavix\Wallet\Interfaces\Wallet;
use Bavix\Wallet\Traits\CanConfirm;
use Bavix\Wallet\Traits\CanPay;
use Bavix\Wallet\Traits\HasWallet;
use Bavix\Wallet\Traits\HasWalletFloat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements Wallet, Customer
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory,
        GenerateUuidTrait,
        Notifiable,
        TwoFactorAuthenticatable,
        HasPermissionsTrait,
        HasApiTokens,
        SoftDeletes,

        HasPayments,
        HasAddresses,
        HasNotificationSettings,
        HasWalletFloat,
        HasWallet,
        CanPay,
        CanConfirm;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'document',
        'password',
        'google_id',
        'avatar',
        'bio',
        'asaas_id',
        'email_verified_at',
        'onboarding_completed_at',
        'account_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'balance'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'account_type' => UserRoleType::class,
            'document' => OnlyNumber::class,
            'phone' => OnlyNumber::class,
        ];
    }

    /**
     * Retorna o perfil de onboarding do usuário.
     */
    public function onboardingProfile(): HasOne
    {
        return $this->hasOne(OnboardingProfile::class);
    }

    /**
     * Verifica se o onboarding foi completado.
     */
    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }

    /**
     * Retorna o role do usuário (artist, creator, brand).
     */
    public function getRole(): ?string
    {
        return $this->onboardingProfile?->role;
    }

    /**
     * Scope to filter by specific type
     */
    public function scopeByType($query, UserRoleType $type)
    {
        return $query->where('account_type', $type);
    }

    public function hasValidDocumentAndPhone(): bool
    {
        return filled($this->document) && filled($this->phone);
    }
}
