<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\CampaignTransaction
 */
class CampaignTransactionResource extends JsonResource
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

            // Type and Status
            'type' => $this->type,
            'type_label' => $this->type_label,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'status_color' => $this->status_color,

            // Amounts
            'campaign_cost' => (float) $this->campaign_cost,
            'publication_fee' => (float) $this->publication_fee,
            'total_amount' => (float) $this->total_amount,
            'wallet_amount' => (float) $this->wallet_amount,
            'gateway_amount' => (float) $this->gateway_amount,

            // Formatted amounts
            'formatted_total' => $this->formatted_total,
            'formatted_wallet_amount' => $this->formatted_wallet_amount,
            'formatted_gateway_amount' => $this->formatted_gateway_amount,

            // Payment details
            'payment_method' => $this->payment_method,
            'gateway' => $this->gateway,

            // Relations
            'campaign' => [
                'id' => $this->campaign->id,
                'uuid' => $this->campaign->uuid,
                'name' => $this->campaign->name,
                'slug' => $this->campaign->slug,
                'status' => $this->campaign->status->value,
            ],

            'payment' => $this->when($this->payment_id, function () {
                return [
                    'uuid' => $this->payment?->uuid,
                    'status' => $this->payment?->status?->value,
                    'payment_method' => $this->payment?->payment_method?->value,
                ];
            }),

            // Metadata (full breakdown)
            'breakdown' => $this->meta,

            // Timestamps
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
