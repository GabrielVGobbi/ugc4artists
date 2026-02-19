<?php

declare(strict_types=1);

namespace App\Http\Requests\Campaign;

use Illuminate\Foundation\Http\FormRequest;

class RefuseCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reason_for_refusal' => ['required', 'string', 'min:5', 'max:2000'],
        ];
    }

    public function reason(): string
    {
        return trim((string) $this->input('reason_for_refusal'));
    }
}
