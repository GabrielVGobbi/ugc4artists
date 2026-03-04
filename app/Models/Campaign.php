<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CampaignStatus;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use App\Supports\Traits\GenerateUniqueSlugTrait;
use App\Supports\Traits\GenerateUuidTrait;
use Bavix\Wallet\Interfaces\ProductInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Bavix\Wallet\Interfaces\Customer;
use Bavix\Wallet\Traits\HasWallet;
use Illuminate\Support\Str;

class Campaign extends Model implements ProductInterface
{
    use HasFactory;
    use GenerateUuidTrait;
    use GenerateUniqueSlugTrait;
    use SoftDeletes;
    use HasWallet;

    public $searchable = ['name', 'description', 'brand_instagram'];

    /**
     * Default attribute values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => CampaignStatus::DRAFT,
        'kind' => 'influencers',
        'influencer_post_mode' => 'profile',
        'briefing_mode' => 'has_briefing',
        'creator_profile_type' => 'both',
        'filter_gender' => 'both',
        'requires_product_shipping' => false,
        'requires_invoice' => false,
        'slots_to_approve' => 1,
        'price_per_influencer' => 500,
        'publication_plan' => 'basic',
        'publication_fee' => 0,
        'publication_wallet_amount' => 0,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'kind',
        'influencer_post_mode',
        'music_platform',
        'music_link',
        'product_or_service',
        'objective',
        'objective_tags',
        'briefing_mode',
        'description',
        'terms_accepted',
        'creator_profile_type',
        'content_platforms',
        'audio_format',
        'video_duration_min',
        'video_duration_max',
        'filter_age_min',
        'filter_age_max',
        'filter_gender',
        'filter_niches',
        'filter_states',
        'filter_min_followers',
        'requires_product_shipping',
        'applications_open_date',
        'applications_close_date',
        'payment_date',
        'slots_to_approve',
        'price_per_influencer',
        'requires_invoice',
        'cover_image',
        'brand_instagram',
        'publication_plan',
        'publication_fee',
        'publication_wallet_amount',
        'publication_paid_at',
        'publication_payment_method',
        'publication_payment_id',
        'responsible_name',
        'responsible_cpf',
        'responsible_phone',
        'responsible_email',
        'use_my_data',
        'status',
        'submitted_at',
        'reviewed_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'reviewed_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CampaignStatus::class,
            'objective_tags' => 'array',
            'content_platforms' => 'array',
            'filter_niches' => 'array',
            'filter_states' => 'array',
            'terms_accepted' => 'boolean',
            'requires_product_shipping' => 'boolean',
            'requires_invoice' => 'boolean',
            'use_my_data' => 'boolean',
            'applications_open_date' => 'date',
            'applications_close_date' => 'date',
            'payment_date' => 'date',
            'price_per_influencer' => 'decimal:2',
            'publication_fee' => 'decimal:2',
            'publication_wallet_amount' => 'decimal:2',
            'publication_paid_at' => 'datetime',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    protected $appends = ['total_budget', 'status_label', 'status_color', 'status_icon', 'cover_image_url'];

    /**
     * Slug source field
     */
    protected string $slugSourceField = 'name';

    // ─────────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approvedCreators(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'campaign_approved_creators', 'campaign_id', 'creator_id')
            ->withTimestamps();
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'billable');
    }

    public function campaignTransactions()
    {
        return $this->hasMany(CampaignTransaction::class);
    }

    /**
     * Obtém o pagamento pendente mais recente da campanha (PIX aguardando).
     */
    public function getLatestPendingPayment(): ?Payment
    {
        return $this->payments()
            ->whereIn('status', [PaymentStatus::PENDING, PaymentStatus::REQUIRES_ACTION])
            ->where('created_at', '>=', now()->subHours(24))
            ->orderByDesc('created_at')
            ->first();
    }

    /**
     * Verifica se a campanha já possui pagamento confirmado.
     */
    public function hasPaidPayment(): bool
    {
        return $this->payments()
            ->where('status', PaymentStatus::PAID)
            ->exists();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────────

    public function getTotalBudgetAttribute(): float
    {
        return (float) $this->slots_to_approve * (float) $this->price_per_influencer;
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status->getLabelText();
    }

    public function getStatusColorAttribute(): string
    {
        return $this->status->getLabelColor();
    }

    public function getStatusIconAttribute(): string
    {
        return $this->status->getIcon();
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (!$this->cover_image) {
            return null;
        }

        if (str_starts_with($this->cover_image, 'http')) {
            return $this->cover_image;
        }

        return asset('storage/' . $this->cover_image);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────────

    public function scopeByToken(Builder $query, $tokenId = null): Builder
    {
        $identifier = $tokenId;

        if (Str::isUuid($identifier)) {
            $query->where('uuid', $identifier);
        } else {
            $query->where('id', $identifier);
        }

        return $query;
    }

    public function scopeByUser(Builder $query, ?int $userId = null): Builder
    {
        return $query->where('user_id', $userId ?? auth()->id());
    }

    public function scopeByKey(Builder $query, string $key): Builder
    {
        return $query->where(function ($q) use ($key) {
            $q->where('uuid', $key)
                ->orWhere('id', $key)
                ->orWhere('slug', $key);
        });
    }

    public function scopeByStatus(Builder $query, CampaignStatus|array $status): Builder
    {
        if (is_array($status)) {
            return $query->whereIn('status', $status);
        }

        return $query->where('status', $status);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            CampaignStatus::APPROVED,
            CampaignStatus::SENT_TO_CREATORS,
            CampaignStatus::IN_PROGRESS,
        ]);
    }

    public function scopeAwaitingPayment(Builder $query): Builder
    {
        return $query->where('status', CampaignStatus::AWAITING_PAYMENT);
    }

    public function scopeSentToCreators(Builder $query): Builder
    {
        return $query->where('status', CampaignStatus::SENT_TO_CREATORS);
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', CampaignStatus::IN_PROGRESS);
    }

    public function scopeOpenForApplications(Builder $query): Builder
    {
        return $query->where('status', CampaignStatus::SENT_TO_CREATORS)
            ->where('applications_open_date', '<=', now())
            ->where('applications_close_date', '>=', now());
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (!$term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('brand_instagram', 'like', "%{$term}%");
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Methods
    // ─────────────────────────────────────────────────────────────────────────────

    // ── Status Checkers (delegam para o enum) ─────────────────────────────────

    public function isDraft(): bool
    {
        return $this->status->isDraft();
    }

    public function isAwaitingPayment(): bool
    {
        return $this->status->isAwaitingPayment();
    }

    public function isSentToCreators(): bool
    {
        return $this->status->isSentToCreators();
    }

    public function isUnderReview(): bool
    {
        return $this->status->isUnderReview();
    }

    public function isInProgress(): bool
    {
        return $this->status->isInProgress();
    }

    public function isCompleted(): bool
    {
        return $this->status->isCompleted();
    }

    public function isCancelled(): bool
    {
        return $this->status->isCancelled();
    }

    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    public function canBeEdited(): bool
    {
        return $this->status->canBeEdited();
    }

    public function canBePaid(): bool
    {
        return $this->status->canBePaid();
    }

    public function canBeSubmitted(): bool
    {
        return $this->isDraft() && $this->isComplete();
    }

    public function isComplete(): bool
    {
        // Campos obrigatórios para submissão
        return !empty($this->name)
            && !empty($this->description)
            && !empty($this->applications_open_date)
            && !empty($this->applications_close_date)
            && $this->slots_to_approve > 0
            && $this->price_per_influencer > 0
            && !empty($this->brand_instagram);
    }

    // ── Status Transitions ──────────────────────────────────────────────────────

    /**
     * Transição genérica com validação via enum.
     *
     * @throws \InvalidArgumentException se a transição for inválida
     */
    public function transitionTo(CampaignStatus $newStatus, array $extraFields = []): bool
    {
        $this->status->transitionTo($newStatus);

        $fields = array_merge(
            ['status' => $newStatus],
            $this->buildStatusTimestampFields($newStatus),
            $extraFields
        );

        return $this->update($fields);
    }

    /**
     * DRAFT → AWAITING_PAYMENT (checkout via PIX iniciado)
     */
    public function markAwaitingPayment(): bool
    {
        return $this->transitionTo(CampaignStatus::AWAITING_PAYMENT, [
            'submitted_at' => now(),
        ]);
    }

    /**
     * DRAFT|AWAITING_PAYMENT → UNDER_REVIEW (pagamento confirmado)
     */
    public function submit(): bool
    {
        if (!$this->isComplete()) {
            return false;
        }

        return $this->transitionTo(CampaignStatus::UNDER_REVIEW, [
            'reviewed_at' =>  now(),
            'publication_paid_at' => $this->publication_paid_at ?? now(),
        ]);
    }

    /**
     * SENT_TO_CREATORS → IN_PROGRESS (creators selecionados e trabalhando)
     */
    public function start(): bool
    {
        return $this->transitionTo(CampaignStatus::IN_PROGRESS, [
            'started_at' => now(),
        ]);
    }

    /**
     * IN_PROGRESS → COMPLETED (entregas finalizadas)
     */
    public function complete(): bool
    {
        return $this->transitionTo(CampaignStatus::COMPLETED, [
            'completed_at' => now(),
        ]);
    }

    /**
     * Qualquer status (exceto COMPLETED) → CANCELLED
     */
    public function cancel(?string $reason = null): bool
    {
        return $this->transitionTo(CampaignStatus::CANCELLED, array_filter([
            'cancelled_at' => now(),
            'rejection_reason' => $reason,
        ]));
    }

    /**
     * CANCELLED → DRAFT (reabrir campanha)
     */
    public function reopen(): bool
    {
        return $this->transitionTo(CampaignStatus::DRAFT, [
            'cancelled_at' => null,
            'rejection_reason' => null,
        ]);
    }

    /**
     * AWAITING_PAYMENT → DRAFT (pagamento falhou/expirou)
     */
    public function revertToDraft(): bool
    {
        return $this->transitionTo(CampaignStatus::DRAFT, [
            'submitted_at' => null,
            'reviewed_at' => null,
        ]);
    }

    /**
     * Build timestamp fields based on the target status.
     */
    protected function buildStatusTimestampFields(CampaignStatus $status): array
    {
        return match ($status) {
            CampaignStatus::AWAITING_PAYMENT => ['submitted_at' => now()],
            CampaignStatus::UNDER_REVIEW => ['reviewed_at' => now()],
            CampaignStatus::APPROVED => ['approved_at' => now()],
            CampaignStatus::REFUSED => ['rejected_at' => now()],
            CampaignStatus::SENT_TO_CREATORS => ['publication_paid_at' => now()],
            CampaignStatus::IN_PROGRESS => ['started_at' => now()],
            CampaignStatus::COMPLETED => ['completed_at' => now()],
            CampaignStatus::CANCELLED => ['cancelled_at' => now()],
            default => [],
        };
    }

    // ── Payment Hooks (chamado pelo SettlementService via webhook) ─────────────

    /**
     * Hook chamado quando pagamento é confirmado (via webhook ou gateway).
     * Transiciona AWAITING_PAYMENT → UNDER_REVIEW.
     */
    public function onPaymentPaid(Payment $payment): void
    {
        if (!$this->isAwaitingPayment()) {
            return;
        }

        $this->update([
            'publication_paid_at' => now(),
            'publication_payment_method' => $payment->payment_method->value,
            'publication_payment_id' => $payment->uuid,
        ]);

        $this->submit();
    }

    /**
     * Hook chamado quando pagamento falha ou é cancelado (via webhook).
     * Reverte AWAITING_PAYMENT → DRAFT.
     */
    public function onPaymentFailed(Payment $payment): void
    {
        if (!$this->isAwaitingPayment()) {
            return;
        }

        $this->revertToDraft();
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function incrementApplications(): void
    {
        $this->increment('applications_count');
    }

    public function getAmountProduct(Customer $customer): int|string
    {
        return 100;
    }

    public function getMetaProduct(): ?array
    {
        return [
            'title' => $this->name,
            'description' => 'Campanha #' . $this->name,
        ];
    }
}
