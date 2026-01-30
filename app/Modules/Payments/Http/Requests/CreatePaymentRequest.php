<?php

namespace App\Modules\Payments\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'billable_type' => ['required', 'string'], // ex: App\Models\Campaign
            'billable_id' => ['required', 'string'],
            'amount_cents' => ['required', 'integer', 'min:1'],
            'currency' => ['nullable', 'string', 'size:3'],
            'gateway' => ['nullable', Rule::in(['asaas', 'iugu'])],
            'use_wallet' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
