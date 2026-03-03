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
            'user_id' => $this->user_id,

            // User relation
            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'avatar' => $this->user->avatar,
            ]),

            // Billable (polymorphic)
            'billable_type' => $this->billable_type,
            'billable_id' => $this->billable_id,
            'billable' => $this->whenLoaded('billable'),

            // Amounts
            'currency' => $this->currency,
            'amount_cents' => $this->amount_cents,
            'amount' => $this->amount_cents / 100,
            'amount_formatted' => 'R$ ' . number_format($this->amount_cents / 100, 2, ',', '.'),
            'wallet_applied_cents' => $this->wallet_applied_cents,
            'wallet_applied' => $this->wallet_applied_cents / 100,
            'gateway_amount_cents' => $this->gateway_amount_cents,
            'gateway_amount' => $this->gateway_amount_cents / 100,

            // Status
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->getLabelText(),
                'color' => $this->status->getLabelColor(),
                'icon' => $this->status->getIcon(),
            ],

            // Payment method
            'payment_method' => $this->payment_method ? [
                'value' => $this->payment_method->value,
                'label' => $this->payment_method->getLabelText(),
                'color' => $this->payment_method->getLabelColor(),
                'icon' => $this->payment_method->getIcon(),
            ] : null,

            // Gateway
            'gateway' => $this->gateway,
            'gateway_reference' => $this->gateway_reference,
            'url' => $this->url,

            // Dates
            'due_date' => $this->due_date?->toISOString(),
            'paid_at' => $this->paid_at?->toISOString(),
            'received_at' => $this->received_at?->toISOString(),
            'refund_at' => $this->refund_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),

            // Metadata
            'meta' => $this->meta,
            'idempotency_key' => $this->idempotency_key,

            // Gateway data (only in show view)
            'gateway_data' => $this->when($request->routeIs('*.show'), $this->gateway_data),
            'gateway_payload' => $this->when($request->routeIs('*.show'), $this->gateway_payload),
            'gateway_response' => $this->when($request->routeIs('*.show'), $this->gateway_response),
        ];
    }
}
