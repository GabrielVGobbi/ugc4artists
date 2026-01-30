<?php

declare(strict_types=1);

namespace App\Http\Requests\Wallet;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

/**
 * Depositar dinheiro (pay)
 * @deprecated usar App\Http\Requests\Checkout\CheckoutRequest
 */
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
        $this->user();

        $rules = [
            'amount' => ['required'],
            'payment_method' => ['required',  'in:pix,card'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'celular_com_ddd'],
            'document' => ['required', 'string', 'max:18', 'formato_cpf_ou_cnpj'],
            'address' => ['sometimes', 'string', 'max:500'],
            #'save_cpf' => ['sometimes', 'boolean'],
        ];

        if ($this->input('payment_method') === 'card') {
            // Card data
            $rules['card_number'] = ['required', 'string', 'min:13', 'max:19'];
            $rules['card_expiry'] = ['required', 'string', 'regex:/^\d{2}[\/\-]\d{2,4}$/'];
            $rules['card_cvv'] = ['required', 'string', 'min:3', 'max:4'];
            $rules['card_holder_name'] = ['required', 'string', 'max:255'];

            // Card holder data (required by Asaas)
            #$rules['card_holder_email'] = ['required', 'email', 'max:255'];
            #$rules['card_holder_document'] = ['required', 'string', 'max:18'];
            #$rules['card_holder_postal_code'] = ['required', 'string', 'max:9'];
            #$rules['card_holder_address_number'] = ['required', 'string', 'max:10'];
            #$rules['card_holder_phone'] = ['nullable', 'string', 'max:20'];
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
        $merge = [
            'amount' => amountToDec($this->amount),
            'phone' => format_phone($this->phone),
            'document' => format_cpf_cnpj($this->document),
        ];

        // Clean card number (remove spaces and dashes)
        if ($this->card_number) {
            $merge['card_number'] = preg_replace('/[\s\-]/', '', $this->card_number);
        }

        // Clean card holder document
        if ($this->card_holder_document) {
            $merge['card_holder_document'] = $this->validateCpfCnpj($this->card_holder_document);
        }

        // Clean postal code
        if ($this->card_holder_postal_code) {
            $merge['card_holder_postal_code'] = preg_replace('/\D/', '', $this->card_holder_postal_code);
        }

        // Clean phone
        if ($this->card_holder_phone) {
            $merge['card_holder_phone'] = preg_replace('/\D/', '', $this->card_holder_phone);
        }

        $this->merge($merge);
    }

    protected function passedValidation()
    {
        $this->validated();
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
            'amount.min' => 'O valor mínimo é R$ 200,00.',
            'payment_method.required' => 'O método de pagamento é obrigatório.',
            'payment_method.in' => 'Método de pagamento inválido.',
            'name.required' => 'O nome é obrigatório.',
            'cpf.required' => 'O CPF/CNPJ é obrigatório.',
            // Card validation messages
            'card_number.required' => 'O número do cartão é obrigatório.',
            'card_number.min' => 'O número do cartão deve ter pelo menos 13 dígitos.',
            'card_expiry.required' => 'A validade do cartão é obrigatória.',
            'card_expiry.regex' => 'A validade deve estar no formato MM/AA ou MM/AAAA.',
            'card_cvv.required' => 'O CVV é obrigatório.',
            'card_cvv.min' => 'O CVV deve ter pelo menos 3 dígitos.',
            // Card holder validation messages
            'card_holder_name.required' => 'O nome do titular do cartão é obrigatório.',
            'card_holder_email.required' => 'O e-mail do titular é obrigatório.',
            'card_holder_email.email' => 'O e-mail do titular deve ser válido.',
            'card_holder_document.required' => 'O CPF/CNPJ do titular é obrigatório.',
            'card_holder_postal_code.required' => 'O CEP do titular é obrigatório.',
            'card_holder_address_number.required' => 'O número do endereço do titular é obrigatório.',
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
