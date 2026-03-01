<?php

declare(strict_types=1);

namespace App\Http\Requests\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Services\UserService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CampaignCheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        if (!Auth::check()) {
            return false;
        }

        // Rate limit: 5 checkout attempts per minute per user
        $key = 'campaign-checkout-attempts:' . Auth::id();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'general' => "Muitas tentativas de checkout. Aguarde {$seconds} segundos e tente novamente.",
            ]);
        }

        RateLimiter::hit($key, 60); // 5 attempts per 60 seconds

        return true;
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $key = $this->route('key'); // nome do param da rota {key}
            if (! $key) return;

            $campaign = Campaign::byUser()->byKey($key)->first();

            if (! $campaign) {
                $validator->errors()->add('general', 'Campanha não encontrada.');
                return;
            }

            if (! $campaign->canBePaid()) {
                $validator->errors()->add('general', 'Esta campanha não pode ser paga. Verifique o status.');
            }

            // Se não vai usar wallet, payment_method é obrigatório
            $useWalletBalance = $this->input('use_wallet_balance', false);
            $paymentMethod = $this->input('payment_method');

            if (!$useWalletBalance && empty($paymentMethod)) {
                $validator->errors()->add('payment_method', 'Selecione um método de pagamento (PIX ou Cartão).');
            }
        });
    }

    /**
     * Get the validation rules that apply to the request.
     * service: 'wallet' = depósito na carteira (amount obrigatório); 'campaign' = checkout campanha (amount no backend).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        $rules = [
            'payment_method' => ['nullable', Rule::in(['pix', 'card', 'wallet'])],
            'phone' => ['required', 'celular_com_ddd'],
            'document' => ['required', 'string', 'max:18', 'formato_cpf_ou_cnpj'],
            'use_wallet_balance' => ['required', 'boolean'],
            'address_id' => [
                $this->addressRequired() ? 'required' : 'nullable',
                function ($attribute, $value, $fail) {
                    if (empty($value)) {
                        return;
                    }
                    $query = DB::table('addresses')
                        ->where('addressable_id', $this->user()->id)
                        ->where('addressable_type', get_class($this->user()));

                    if (Str::isUuid($value)) {
                        $query->where('uuid', $value);
                    } else {
                        $query->where('id', $value);
                    }

                    if (! $query->exists()) {
                        $fail('O endereço selecionado é inválido.');
                    }
                },
            ],
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
        $user = $this->user();

        $merge = [
            'phone' => format_phone($this->phone),
            'document' => format_cpf_cnpj($this->document),
        ];

        if ($user->hasValidDocumentAndPhone()) {
            $merge['phone'] = format_phone($user->phone);
            $merge['document'] = format_cpf_cnpj($user->document);
        }

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

    /**
     * Address is NOT required when paying only with wallet balance.
     * Required when using PIX or Card (even with partial wallet).
     */
    protected function addressRequired(): bool
    {
        $paymentMethod = $this->input('payment_method');

        // If has gateway payment method (pix/card), address is required
        if (!empty($paymentMethod)) {
            return true;
        }

        // If wallet-only (no payment_method), address is not required
        return false;
    }

    protected function passedValidation()
    {
        $validated = $this->validated();
        $user = $this->user();
        $userService = app(UserService::class);

        if (! empty($validated['document'])) {
            $userService->updateDocument($user, $validated['document']);
        }

        if (! empty($validated['phone'])) {
            $userService->updatePhone($user, $validated['phone']);
        }
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
            'payment_method.required' => 'Selecione um método de pagamento (PIX ou Cartão).',
            'payment_method.in' => 'Método de pagamento inválido. Escolha PIX ou Cartão.',
            'use_wallet_balance.required' => 'Informe se deseja usar o saldo da carteira.',
            'use_wallet_balance.boolean' => 'O campo de uso da carteira deve ser verdadeiro ou falso.',
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
