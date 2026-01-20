<?php

declare(strict_types=1);

namespace App\Http\Requests\Onboarding;

use Illuminate\Foundation\Http\FormRequest;

class SaveOnboardingProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Para salvar progresso parcial, a validação é muito permissiva
        // A validação rigorosa acontece apenas no CompleteOnboardingRequest
        return [
            'current_step' => ['required', 'integer', 'min:0'],
            'data' => ['required', 'array'],
            'data.*' => ['nullable'], // Aceita qualquer valor para os campos
        ];
    }
}
