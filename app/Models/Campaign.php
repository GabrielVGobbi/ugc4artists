<?php

declare(strict_types=1);

namespace App\Models;

use App\Supports\Traits\GenerateUniqueSlugTrait;
use App\Supports\Traits\GenerateUuidTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Campaign extends Model
{
    use HasFactory;
    use GenerateUuidTrait;
    use GenerateUniqueSlugTrait;
    use SoftDeletes;

    public $searchable = ['name', 'description', 'brand_instagram'];

    /**
     * Default attribute values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'draft',
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
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    protected $appends = ['total_budget', 'status_label', 'cover_image_url'];

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

    // ─────────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────────

    public function getTotalBudgetAttribute(): float
    {
        return (float) $this->slots_to_approve * (float) $this->price_per_influencer;
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Rascunho',
            'pending_review' => 'Aguardando Revisão',
            'approved' => 'Aprovada',
            'rejected' => 'Rejeitada',
            'active' => 'Ativa',
            'paused' => 'Pausada',
            'completed' => 'Concluída',
            'cancelled' => 'Cancelada',
            default => ucfirst($this->status ?? ''),
        };
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

    public function scopeByStatus(Builder $query, string|array $status): Builder
    {
        if (is_array($status)) {
            return $query->whereIn('status', $status);
        }

        return $query->where('status', $status);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopePendingReview(Builder $query): Builder
    {
        return $query->where('status', 'pending_review');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereIn('status', ['approved', 'active']);
    }

    public function scopeOpenForApplications(Builder $query): Builder
    {
        return $query->where('status', 'active')
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

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPendingReview(): bool
    {
        return $this->status === 'pending_review';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft', 'rejected']);
    }

    public function canBeSubmitted(): bool
    {
        return $this->status === 'draft' && $this->isComplete();
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

    public function submit(): bool
    {
        if (!$this->canBeSubmitted()) {
            return false;
        }

        $this->update([
            'status' => 'pending_review',
            'submitted_at' => now(),
        ]);

        return true;
    }

    public function approve(?int $reviewerId = null): bool
    {
        if (!$this->isPendingReview()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'reviewed_by' => $reviewerId ?? auth()->id(),
        ]);

        return true;
    }

    public function reject(string $reason, ?int $reviewerId = null): bool
    {
        if (!$this->isPendingReview()) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $reason,
            'reviewed_by' => $reviewerId ?? auth()->id(),
        ]);

        return true;
    }

    public function activate(): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }

        $this->update(['status' => 'active']);

        return true;
    }

    public function pause(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $this->update(['status' => 'paused']);

        return true;
    }

    public function resume(): bool
    {
        if ($this->status !== 'paused') {
            return false;
        }

        $this->update(['status' => 'active']);

        return true;
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function incrementApplications(): void
    {
        $this->increment('applications_count');
    }
}
