<?php

declare(strict_types=1);

namespace App\Http\Requests\Wallet;

use Illuminate\Foundation\Http\FormRequest;

class WithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'      => ['required', 'numeric', 'min:10'],
            'pix_key'     => ['required', 'string', 'max:255'],
            'pix_key_type' => ['required', 'string', 'in:cpf,cnpj,email,phone,random'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Informe o valor do saque.',
            'amount.min'      => 'O valor mínimo para saque é R$ 10,00.',
            'pix_key.required' => 'Informe a chave PIX.',
            'pix_key_type.required' => 'Selecione o tipo de chave PIX.',
            'pix_key_type.in' => 'Tipo de chave PIX inválido.',
        ];
    }
}
