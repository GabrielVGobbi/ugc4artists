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
use Illuminate\Database\Eloquent\Relations\HasMany;
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
    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'user_id', 'id');
    }

    public function campaignTransactions(): HasMany
    {
        return $this->hasMany(CampaignTransaction::class);
    }

    public function accountStatements(): HasMany
    {
        return $this->hasMany(AccountStatement::class);
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

    /**
     * Scope to apply dynamic filters
     */
    public function scopeFiltered($query, array $filters)
    {
        // Account type filter (single or multiple)
        if (isset($filters['account_type'])) {
            $accountTypes = is_array($filters['account_type']) ? $filters['account_type'] : [$filters['account_type']];
            $query->whereIn('account_type', $accountTypes);
        }

        // Email verified filter
        if (isset($filters['email_verified'])) {
            if ($filters['email_verified'] === 'verified' || $filters['email_verified'] === true) {
                $query->whereNotNull('email_verified_at');
            } elseif ($filters['email_verified'] === 'unverified' || $filters['email_verified'] === false) {
                $query->whereNull('email_verified_at');
            }
        }

        // Onboarding completed filter
        if (isset($filters['onboarding_completed'])) {
            if ($filters['onboarding_completed'] === 'completed' || $filters['onboarding_completed'] === true) {
                $query->whereNotNull('onboarding_completed_at');
            } elseif ($filters['onboarding_completed'] === 'pending' || $filters['onboarding_completed'] === false) {
                $query->whereNull('onboarding_completed_at');
            }
        }

        // Has document filter
        if (isset($filters['has_document'])) {
            if ($filters['has_document'] === true || $filters['has_document'] === '1') {
                $query->whereNotNull('document');
            } elseif ($filters['has_document'] === false || $filters['has_document'] === '0') {
                $query->whereNull('document');
            }
        }

        // Has phone filter
        if (isset($filters['has_phone'])) {
            if ($filters['has_phone'] === true || $filters['has_phone'] === '1') {
                $query->whereNotNull('phone');
            } elseif ($filters['has_phone'] === false || $filters['has_phone'] === '0') {
                $query->whereNull('phone');
            }
        }

        return $query;
    }

    public function hasValidDocumentAndPhone(): bool
    {
        return filled($this->document) && filled($this->phone);
    }

    public function campaignsTotals()
    {
        return $this->campaigns->count();
    }
}
