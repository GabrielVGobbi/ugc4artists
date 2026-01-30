<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
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
            'amount_cents' => $this->amount_cents,
            'wallet_applied_cents' => $this->wallet_applied_cents,
            'gateway_amount_cents' => $this->gateway_amount_cents,
            'currency' => $this->currency ?? 'BRL',
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->getLabelText(),
                'color' => $this->status->getLabelColor(),
                'is_final' => $this->status->isFinal(),
                'is_pending' => $this->status->isPending(),
            ],
            'payment_method' => $this->payment_method ? [
                'value' => $this->payment_method->value,
                'label' => $this->payment_method->getLabelText(),
                'color' => $this->payment_method->getLabelColor(),
                'icon' => $this->payment_method->getIcon(),
            ] : null,
            'meta' => [
                'description' => $this->meta['description'] ?? null,
            ],
            'due_date' => $this->due_date?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
