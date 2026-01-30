<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'document' => mask_cpf($this->document, true),
            'phone' => mask_phone($this->phone, true),
            'account_type' => $this->account_type?->getLabelText(),
            'avatar' => $this->avatar,

            'balance' => $this->when(
                (auth()->check() && auth()->id() === $this->id) || auth()->user()->hasRole('developer'),
                fn() => toCurrency($this->balanceFloat)
            ),
        ];
    }
}
