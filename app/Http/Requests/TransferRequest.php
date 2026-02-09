<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Form request validation for transfer operations.
 */
class TransferRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();

        return [
            'to_user_id' => [
                'required',
                function ($attribute, $value, $fail) use ($user) {
                    // Find recipient by UUID or ID
                    $query = User::query();

                    if (Str::isUuid($value)) {
                        $query->where('uuid', $value);
                    } else {
                        $query->where('id', $value);
                    }

                    $recipient = $query->first();

                    if (!$recipient) {
                        $fail('Usuário de destino não encontrado.');
                        return;
                    }

                    // Prevent self-transfer
                    if ($recipient->id === $user->id) {
                        $fail('Não é possível transferir para você mesmo.');
                        return;
                    }
                },
            ],
            'amount' => [
                'required',
                'numeric',
                'min:1',
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        $merge = [];

        // Convert amount from formatted string to cents if provided
        if ($this->amount) {
            $merge['amount'] = amountToDec($this->amount);
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    /**
     * Get the recipient user after validation passes.
     */
    public function getRecipient(): ?User
    {
        $value = $this->validated()['to_user_id'];

        $query = User::query();

        if (Str::isUuid($value)) {
            return $query->where('uuid', $value)->first();
        }

        return $query->where('id', $value)->first();
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'to_user_id.required' => 'O destinatário é obrigatório.',
            'amount.required' => 'O valor é obrigatório.',
            'amount.numeric' => 'O valor deve ser um número.',
            'amount.min' => 'O valor mínimo para transferência é R$ 0,01.',
            'description.string' => 'A descrição deve ser um texto.',
            'description.max' => 'A descrição não pode ter mais de 500 caracteres.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'to_user_id' => 'destinatário',
            'amount' => 'valor',
            'description' => 'descrição',
        ];
    }
}
