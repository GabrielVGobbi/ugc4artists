<?php

declare(strict_types=1);

namespace App\Http\Requests\Campaign;

use Illuminate\Foundation\Http\FormRequest;

class ApproveCampaignRequest extends FormRequest
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
            #'creator_ids' => ['required', 'array', 'min:1'],
            #'creator_ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ];
    }

    /**
     * @return int[]
     */
    public function creatorIds(): array
    {
        return [];
        #return array_values(array_unique(array_map('intval', $this->input('creator_ids', []))));
    }
}
