<?php

declare(strict_types=1);

namespace App\Http\Requests\Wallet;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class DepositRequest extends FormRequest
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
        //TODO: colocar o min / max via constante de Item (Serviço)
        //      colocar o payment_method Enum
        //      validar cpf
        $rules = [
            'amount' => ['required',  'min:1'],
            'payment_method' => ['required', 'in:pix,card'],
            'name' => ['required', 'string', 'max:255'],
            'cpf' => ['required', 'string', 'max:18'],
            'address' => ['required', 'string', 'max:500'],
        ];

        if ($this->input('payment_method') === 'card') {
            $rules['card_number'] = ['required', 'string', 'max:19'];
            $rules['card_expiry'] = ['required', 'string', 'max:7'];
            $rules['card_cvv'] = ['required', 'string', 'max:4'];
        }

        return $rules;
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'amount' => amountToDec($this->amount),
            'cpf' => $this->validateCpfCnpj($this->cpf),
        ]);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'O valor é obrigatório.',
            'amount.numeric' => 'O valor deve ser um número.',
            'amount.min' => 'O valor mínimo é R$ 10,00.',
            'amount.max' => 'O valor máximo é R$ 5.000,00.',
            'payment_method.required' => 'O método de pagamento é obrigatório.',
            'payment_method.in' => 'Método de pagamento inválido.',
            'name.required' => 'O nome é obrigatório.',
            'cpf.required' => 'O CPF/CNPJ é obrigatório.',
            'address.required' => 'O endereço é obrigatório.',
            'card_number.required' => 'O número do cartão é obrigatório.',
            'card_expiry.required' => 'A validade do cartão é obrigatória.',
            'card_cvv.required' => 'O CVV é obrigatório.',
        ];
    }


    private function validateCpfCnpj($value)
    {
        if (!$value) {
            return null;
        }

        throw_if(
            !validarCpfCnpj($value),
            ValidationException::withMessages(['cpf' => 'Por favor digite um cpf válido'])
        );

        return only_numbers($value);
    }
}
