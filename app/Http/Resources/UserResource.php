<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

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
            'id' => auth()->user()->hasRole('admin') ? $this->id : $this->uuid,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'document' => mask_cpf($this->document, !auth()->user()?->hasRole('admin')),
            'phone' => mask_phone($this->phone, !auth()->user()?->hasRole('admin')),
            'account_type' => $this->account_type?->getLabelText(),
            'avatar' => $this->avatar,
            'balance' => $this->when(
                (auth()->check() && Auth::id() === $this->id) || auth()->user()->hasRole('developer'),
                fn() => toCurrency($this->balanceFloat)
            ),
            'created_at' => $this->created_at?->diffForHumans(),
        ];
    }
}
