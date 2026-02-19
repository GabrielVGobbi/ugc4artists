<?php

declare(strict_types=1);

namespace App\Http\Requests\Campaign;

use App\Enums\CampaignStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCampaignStatusRequest extends FormRequest
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
            'status' => ['required', Rule::enum(CampaignStatus::class)],
            'creator_ids' => ['sometimes', 'array', 'min:1'],
            'creator_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'reason_for_refusal' => ['sometimes', 'string', 'min:5', 'max:2000'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function messages(): array
    {
        return [
            'status.enum' => 'Status de campanha invalido.',
        ];
    }

    public function status(): CampaignStatus
    {
        return CampaignStatus::from((string) $this->input('status'));
    }

    /**
     * @return int[]
     */
    public function creatorIds(): array
    {
        return array_values(array_unique(array_map('intval', $this->input('creator_ids', []))));
    }

    public function reason(): ?string
    {
        $reason = $this->input('reason_for_refusal');

        return is_string($reason) ? trim($reason) : null;
    }
}
