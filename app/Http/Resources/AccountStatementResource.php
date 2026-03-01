<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\AccountStatement
 */
class AccountStatementResource extends JsonResource
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

            // Type and Category
            'type' => $this->type,
            'type_label' => $this->type_label,
            'category' => $this->category,
            'category_label' => $this->category_label,

            // Amounts
            'amount' => (float) $this->amount,
            'wallet_amount' => (float) $this->wallet_amount,
            'gateway_amount' => (float) $this->gateway_amount,
            'formatted_amount' => $this->formatted_amount,

            // Payment Details
            'payment_method' => $this->payment_method,
            'gateway' => $this->gateway,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'status_color' => $this->status_color,

            // Description
            'description' => $this->description,

            // Service (polymorphic)
            'service' => $this->when($this->statementable, function () {
                $service = $this->statementable;
                return [
                    'type' => class_basename($this->statementable_type),
                    'id' => $service->id ?? null,
                    'uuid' => $service->uuid ?? null,
                    'name' => $service->name ?? $service->title ?? null,
                    'slug' => $service->slug ?? null,
                ];
            }),

            // Payment
            'payment' => $this->when($this->payment_id, function () {
                return [
                    'uuid' => $this->payment?->uuid,
                    'status' => $this->payment?->status?->value,
                    'payment_method' => $this->payment?->payment_method?->value,
                ];
            }),

            // Breakdown (from meta)
            'breakdown' => $this->meta,

            // Flags
            'is_income' => $this->isIncome(),
            'is_expense' => $this->isExpense(),

            // Timestamps
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
