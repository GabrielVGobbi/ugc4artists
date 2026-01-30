<?php

declare(strict_types=1);

namespace App\Modules\Payments\Checkout;

use App\Models\User;
use App\Modules\Payments\Core\DTOs\Payment\CreditCardHolderRequest;
use App\Modules\Payments\Core\DTOs\Payment\CreditCardRequest;
use App\Modules\Payments\Core\DTOs\Payment\CreditCardResult;
use App\Modules\Payments\Core\DTOs\Shared\AddressRequest;
use App\Modules\Payments\Core\DTOs\Split\SplitRuleRequest;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Events\PaymentCreated;
use App\Modules\Payments\Exceptions\GatewayException;
use App\Modules\Payments\Exceptions\InsufficientFundsException;
use App\Modules\Payments\Exceptions\PaymentException;
use App\Modules\Payments\GatewayRegistry;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Services\SettlementService;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Fluent builder for creating checkout/payment flows.
 *
 * Usage:
 * ```php
 * $payment = Checkout::for($user)
 *     ->billable($campaign)
 *     ->amount(10000)
 *     ->method(PaymentMethod::PIX)
 *     ->gateway('asaas')
 *     ->useWallet(true)
 *     ->meta(['campaign_id' => $campaign->id])
 *     ->create();
 * ```
 */
final class CheckoutBuilder
{
    private ?User $user = null;

    private ?Model $billable = null;

    private ?string $billableType = null;

    private ?string $billableId = null;

    private int $amountCents = 0;

    private string $currency = 'BRL';

    private ?string $gateway = null;

    private PaymentMethod $method = PaymentMethod::PIX;

    private bool $useWallet = true;

    private ?DateTimeInterface $dueDate = null;

    private ?string $description = null;

    private ?string $idempotencyKey = null;

    private array $meta = [];

    /**
     * @var SplitRuleRequest[]
     */
    private array $splits = [];

    private ?int $installments = null;

    private ?CreditCardRequest $creditCardData = null;

    private ?CreditCardHolderRequest $creditCardHolder = null;

    public function __construct(
        private GatewayRegistry $gateways,
        private SettlementService $settlement,
    ) {}

    /**
     * Set the user for the checkout.
     */
    public function for(User $user): self
    {
        $user = $user->loadMissing('addresses');
        $clone = clone $this;
        $clone->user = $user;

        return $clone;
    }

    /**
     * Set the billable model (what's being paid for).
     */
    public function billable(Model $billable): self
    {
        $clone = clone $this;
        $clone->billable = $billable;
        $clone->billableType = get_class($billable);
        $clone->billableId = (string) $billable->getKey();
        return $clone;
    }

    /**
     * Set billable by type and ID (alternative to billable()).
     */
    public function billableFor(string $type, string $id): self
    {
        $clone = clone $this;
        $clone->billable = null;
        $clone->billableType = $type;
        $clone->billableId = $id;

        return $clone;
    }

    /**
     * Set the amount in cents.
     */
    public function amount(int $amountCents): self
    {
        $clone = clone $this;
        $clone->amountCents = $amountCents;

        return $clone;
    }

    /**
     * Set the amount in decimal (reais).
     */
    public function amountDecimal(float $amount): self
    {
        return $this->amount((int) round($amount * 100));
    }

    /**
     * Set the currency (default: BRL).
     */
    public function currency(string $currency): self
    {
        $clone = clone $this;
        $clone->currency = strtoupper($currency);

        return $clone;
    }

    /**
     * Set the payment gateway.
     */
    public function gateway(string $gateway): self
    {
        $clone = clone $this;
        $clone->gateway = $gateway;

        return $clone;
    }

    /**
     * Set the payment method.
     */
    public function method(PaymentMethod|string $method): self
    {
        $clone = clone $this;
        $clone->method = $method instanceof PaymentMethod
            ? $method
            : PaymentMethod::tryFrom($method) ?? PaymentMethod::PIX;

        return $clone;
    }

    /**
     * Shortcut for PIX payment method.
     */
    public function pix(): self
    {
        return $this->method(PaymentMethod::PIX);
    }

    /**
     * Shortcut for credit card payment method.
     */
    public function creditCard(): self
    {
        return $this->method(PaymentMethod::CREDIT_CARD);
    }

    /**
     * Shortcut for boleto payment method.
     */
    public function boleto(): self
    {
        return $this->method(PaymentMethod::BOLETO);
    }

    /**
     * Set whether to use wallet balance.
     */
    public function useWallet(bool $useWallet = true): self
    {
        $clone = clone $this;
        $clone->useWallet = $useWallet;

        return $clone;
    }

    /**
     * Don't use wallet balance.
     */
    public function withoutWallet(): self
    {
        return $this->useWallet(false);
    }

    /**
     * Set the due date.
     */
    public function dueDate(DateTimeInterface $dueDate): self
    {
        $clone = clone $this;
        $clone->dueDate = $dueDate;

        return $clone;
    }

    /**
     * Set the due date in days from now.
     */
    public function dueDays(int $days): self
    {
        return $this->dueDate(now()->addDays($days));
    }

    /**
     * Set the description.
     */
    public function description(string $description): self
    {
        $clone = clone $this;
        $clone->description = $description;

        return $clone;
    }

    /**
     * Set the idempotency key.
     */
    public function idempotencyKey(string $key): self
    {
        $clone = clone $this;
        $clone->idempotencyKey = $key;

        return $clone;
    }

    /**
     * Set metadata.
     */
    public function meta(array $meta): self
    {
        $clone = clone $this;
        $clone->meta = array_merge($clone->meta, $meta);

        return $clone;
    }

    /**
     * Add a split rule.
     */
    public function split(string $walletId, ?int $fixedCents = null, ?float $percent = null): self
    {
        $clone = clone $this;
        $clone->splits[] = new SplitRuleRequest(
            walletId: $walletId,
            fixedValueCents: $fixedCents,
            percentageValue: $percent,
        );

        return $clone;
    }

    /**
     * Add multiple split rules.
     *
     * @param  SplitRuleRequest[]  $splits
     */
    public function splits(array $splits): self
    {
        $clone = clone $this;
        $clone->splits = array_merge($clone->splits, $splits);

        return $clone;
    }

    /**
     * Set installments for credit card.
     */
    public function installments(int $installments): self
    {
        $clone = clone $this;
        $clone->installments = $installments;

        return $clone;
    }

    public function getHolder()
    {
        return $this->user;
    }

    /**
     * Set credit card data for payment.
     */
    public function withCreditCard(
        string $number,
        string $holderName,
        string $expiryMonth,
        string $expiryYear,
        string $cvv
    ): self {
        $clone = clone $this;
        $clone->creditCardData = new CreditCardRequest(
            holderName: $holderName,
            number: $number,
            expiryMonth: $expiryMonth,
            expiryYear: $expiryYear,
            cvv: $cvv,
        );
        $clone->method = PaymentMethod::CREDIT_CARD;

        return $clone;
    }

    /**
     * Set credit card holder data (required for credit card payments).
     */
    public function withCardHolder(
        string $name,
        string $email,
        string $document,
        AddressRequest $address,
        ?string $phone = null
    ): self {
        $clone = clone $this;
        $clone->creditCardHolder = new CreditCardHolderRequest(
            name: $name,
            email: $email,
            document: $document,
            phone: $phone,
            address: $address,
        );

        return $clone;
    }

    /**
     * Set credit card data from array (alternative to withCreditCard + withCardHolder).
     */
    public function withCreditCardData(array $cardData, array $holderData, AddressRequest $address): self
    {
        return $this
            ->withCreditCard(
                number: $cardData['number'],
                holderName: $cardData['holder_name'] ?? $cardData['holderName'] ?? '',
                expiryMonth: $cardData['expiry_month'] ?? $cardData['expiryMonth'] ?? '',
                expiryYear: $cardData['expiry_year'] ?? $cardData['expiryYear'] ?? '',
                cvv: $cardData['cvv'] ?? $cardData['cvc'] ?? '',
            )
            ->withCardHolder(
                name: $holderData['name'] ?? '',
                email: $holderData['email'] ?? '',
                document: $holderData['document'] ?? $holderData['cpf'] ?? '',
                address: $address,
                phone: $holderData['phone'] ?? null,
            );
    }

    /**
     * Create the payment and return CheckoutResult.
     */
    public function create(): CheckoutResult
    {
        $this->validate();

        $gateway = $this->gateway ?? $this->gateways->getDefaultGateway();

        return DB::transaction(function () use ($gateway) {
            $walletApplied = $this->calculateWalletAmount();
            $gatewayAmount = $this->amountCents - $walletApplied;

            $payment = $this->createPaymentRecord($gateway, $walletApplied, $gatewayAmount);

            if ($walletApplied > 0) {
                $this->holdWalletAmount($payment, $walletApplied);
            }

            $checkoutResult = null;

            if ($gatewayAmount > 0) {
                $checkoutResult = $this->createGatewayCharge($payment, $gateway);
            }

            // If 100% wallet, settle immediately
            if ($gatewayAmount === 0) {
                $this->settlement->markPaid($payment, ['wallet_only' => true]);
                $payment->refresh();

                $checkoutResult = CheckoutResult::paidWithWallet($payment);
            }

            event(new PaymentCreated(
                payment: $payment->fresh(),
                context: ['source' => 'checkout_builder'],
            ));

            return $checkoutResult ?? CheckoutResult::pending($payment);
        });
    }

    /**
     * Validate the builder state.
     */
    protected function validate(): void
    {
        if (! $this->user) {
            throw new PaymentException('User is required for checkout.');
        }

        if (! $this->billableType || ! $this->billableId) {
            throw new PaymentException('Billable is required for checkout.');
        }

        if ($this->amountCents <= 0) {
            throw new PaymentException('Amount must be greater than zero.');
        }

        $gateway = $this->gateway ?? $this->gateways->getDefaultGateway();

        if (! $this->gateways->hasGateway($gateway)) {
            throw new PaymentException("Gateway '{$gateway}' is not available.");
        }
    }

    /**
     * Calculate wallet amount to apply.
     */
    protected function calculateWalletAmount(): int
    {
        if (! $this->useWallet) {
            return 0;
        }

        $balanceFloat = (float) $this->user->balanceFloat;
        $balanceCents = (int) round($balanceFloat * 100);

        return min($balanceCents, $this->amountCents);
    }

    /**
     * Create the payment record.
     */
    protected function createPaymentRecord(string $gateway, int $walletApplied, int $gatewayAmount): Payment
    {
        return Payment::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'billable_type' => $this->billableType,
            'billable_id' => $this->billableId,
            'currency' => $this->currency,
            'amount_cents' => $this->amountCents,
            'wallet_applied_cents' => $walletApplied,
            'gateway_amount_cents' => $gatewayAmount,
            'status' => PaymentStatus::PENDING,
            'gateway' => $gateway,
            'payment_method' => $this->method,
            'due_date' => $this->dueDate,
            'idempotency_key' => $this->idempotencyKey ?? (string) Str::uuid(),
            'meta' => array_merge($this->meta, [
                'description' => $this->description,
                'splits' => count($this->splits) > 0
                    ? array_map(fn($s) => $s->toArray(), $this->splits)
                    : null,
                'installments' => $this->installments,
            ]),
        ]);
    }

    /**
     * Hold wallet amount.
     */
    protected function holdWalletAmount(Payment $payment, int $walletApplied): void
    {
        try {
            $tx = $this->user->withdrawFloat($walletApplied / 100, [
                'type' => 'HOLD',
                'payment_uuid' => $payment->uuid,
            ]);

            $payment->update([
                'hold_transaction_id' => (string) ($tx->id ?? null),
            ]);
        } catch (\Throwable $e) {
            throw InsufficientFundsException::forWallet(
                requiredCents: $walletApplied,
                availableCents: (int) round((float) $this->user->balanceFloat * 100),
                paymentUuid: $payment->uuid,
            );
        }
    }

    /**
     * Create charge on gateway and return CheckoutResult.
     */
    protected function createGatewayCharge(Payment $payment, string $gateway): CheckoutResult
    {
        $driver = $this->gateways->driver($gateway);

        // Get or create customer with document from holder if available
        $customerDocument = $this->creditCardHolder?->document
            ?? $this->user->cpf
            ?? $this->user->document
            ?? null;

        $address = AddressRequest::fromArray($this->user->defaultAddress()->toArray());

        $customer = $driver->customers()->firstOrCreate(
            new \App\Modules\Payments\Core\DTOs\Customer\CustomerRequest(
                name: $this->user->name ?? 'Cliente',
                email: $this->user->email,
                document: $customerDocument,
                phone: $this->user->phone ?? null,
                externalReference: (string) $this->user->id,
                address: $address,
            ),
            $this->user
        );

        $chargeRequest = new \App\Modules\Payments\Core\DTOs\Payment\ChargeRequest(
            customerId: $customer->id,
            amountCents: $payment->gateway_amount_cents,
            method: $this->method,
            dueDate: $this->dueDate,
            description: $this->description ?? "Pagamento #{$payment->uuid}",
            externalReference: $payment->uuid,
            splits: $this->splits ?: null,
            installments: $this->installments,
        );

        $charge = $driver->payments()->createCharge($chargeRequest);

        $payment->update([
            'gateway_reference' => $charge->id,
            'url' => $charge->checkoutUrl,
            'gateway_payload' => $charge->requestPayload,
            'gateway_response' => $charge->raw,
            'meta' => array_merge($payment->meta ?? [], [
                'gateway' => [
                    'checkout_url' => $charge->checkoutUrl,
                    'qr_code_payload' => $charge->pix?->payload,
                    'qr_code_image' => $charge->pix?->encodedImage,
                    'boleto_url' => $charge->boleto?->url,
                ],
            ]),
        ]);

        // Handle credit card payment
        if ($this->method === PaymentMethod::CREDIT_CARD && $this->creditCardData && $this->creditCardHolder) {
            return $this->processCardPayment($payment, $driver, $charge->id);
        }

        // For PIX, return pending with QR code
        if ($this->method === PaymentMethod::PIX && $charge->pix) {
            return CheckoutResult::pendingPix($payment, $charge->pix, $charge->checkoutUrl);
        }

        // For other methods (boleto, etc.), return pending
        return CheckoutResult::pending($payment, $charge->checkoutUrl);
    }

    /**
     * Process credit card payment.
     */
    protected function processCardPayment(Payment $payment, $driver, string $chargeId): CheckoutResult
    {
        try {
            $cardResult = $driver->payments()->payWithCreditCard(
                $chargeId,
                $this->creditCardData,
                $this->creditCardHolder
            );

            // Update payment with card request/response history
            $payment->update([
                'gateway_payload' => array_merge(
                    $payment->gateway_payload ?? [],
                    ['creditCard' => $cardResult->requestPayload]
                ),
                'gateway_response' => array_merge(
                    $payment->gateway_response ?? [],
                    ['creditCard' => $cardResult->raw]
                ),
            ]);

            // Check if payment was approved
            $approvedStatuses = ['CONFIRMED', 'RECEIVED', 'PENDING'];
            $isApproved = in_array($cardResult->status, $approvedStatuses, true);

            $creditCardResult = CreditCardResult::fromAsaasResponse($cardResult->raw);

            if ($isApproved) {
                // Mark as paid if confirmed
                if (in_array($cardResult->status, ['CONFIRMED', 'RECEIVED'], true)) {
                    $this->settlement->markPaid($payment, [
                        'card_result' => $creditCardResult->toArray(),
                    ]);
                    $payment->refresh();
                }

                return CheckoutResult::forCreditCard($payment, $creditCardResult);
            }

            // Payment was declined
            $payment->update(['status' => PaymentStatus::FAILED]);

            return CheckoutResult::forCreditCard($payment, $creditCardResult);
        } catch (GatewayException $e) {
            // Payment was declined
            $payment->update(['status' => PaymentStatus::FAILED]);

            $creditCardResult = CreditCardResult::declined(
                errorMessage: $e->getMessage(),
                errorCode: $e->gatewayResponse['errors'][0]['code'] ?? null,
            );

            return CheckoutResult::forCreditCard($payment, $creditCardResult);
        }
    }
}
