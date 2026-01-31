<?php

declare(strict_types=1);

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NotificationSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $channelRule = Rule::in(['push', 'email', 'both']);

        return [
            'new_campaigns' => ['sometimes', 'boolean'],
            'payments_received' => ['sometimes', 'boolean'],
            'system_updates' => ['sometimes', 'boolean'],
            'performance_tips' => ['sometimes', 'boolean'],
            'new_campaigns_channel' => ['sometimes', 'string', $channelRule],
            'payments_channel' => ['sometimes', 'string', $channelRule],
            'system_updates_channel' => ['sometimes', 'string', $channelRule],
            'performance_tips_channel' => ['sometimes', 'string', $channelRule],
        ];
    }
}
