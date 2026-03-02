<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * User Detail Resource - For show pages with complete user information
 */
class UserDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'phone_formatted' => $this->phone ? mask_phone($this->phone) : null,
            'document' => $this->document,
            'document_formatted' => $this->document ? mask_cpf($this->document) : null,
            'avatar' => $this->avatar,
            'bio' => $this->bio,

            // Account details
            'account_type' => $this->account_type?->value,
            'account_type_label' => $this->account_type?->getLabelText(),
            'account_type_color' => $this->account_type?->getLabelColor(),
            'account_type_icon' => $this->account_type?->getIcon(),

            // Status
            'email_verified_at' => $this->email_verified_at?->toDateTimeString(),
            'email_verified' => $this->email_verified_at !== null,
            'onboarding_completed_at' => $this->onboarding_completed_at?->toDateTimeString(),
            'onboarding_completed' => $this->onboarding_completed_at !== null,

            // Timestamps
            'created_at' => $this->created_at?->toDateTimeString(),
            'created_at_human' => $this->created_at?->diffForHumans(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'updated_at_human' => $this->updated_at?->diffForHumans(),

            // Financial
            'balance' => toCurrency($this->balanceFloat),
            'balance_float' => $this->balanceFloat,

            // Counts
            'campaigns_count' => $this->whenCounted('campaigns'),
            'campaign_transactions_count' => $this->whenCounted('campaignTransactions'),
            'account_statements_count' => $this->whenCounted('accountStatements'),

            // Relationships
            'onboarding_profile' => $this->whenLoaded('onboardingProfile', function () {
                return [
                    'role' => $this->onboardingProfile?->role,
                    // Add other onboarding profile fields as needed
                ];
            }),
        ];
    }
}
