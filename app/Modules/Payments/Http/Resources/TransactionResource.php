<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            'type' => $this->type,
            'amount' => $this->amount,
            'amount_float' => $this->amountFloat,
            'amount_float_formatted' => toCurrency($this->amountFloat),
            'confirmed' => (bool) $this->confirmed,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
        ];
    }
}
