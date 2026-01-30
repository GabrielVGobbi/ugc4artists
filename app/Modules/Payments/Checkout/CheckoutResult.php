<?php

declare(strict_types=1);

namespace App\Modules\Payments\Checkout;

use App\Modules\Payments\Core\DTOs\Payment\CreditCardResult;
use App\Modules\Payments\Core\DTOs\Payment\PixQrCodeResponse;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;

/**
 * DTO for checkout result with payment details.
 */
class CheckoutResult
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_PAID = 'paid';

    public const STATUS_FAILED = 'failed';

    public function __construct(
        public Payment $payment,
        public string $status,
        public ?PixQrCodeResponse $pix = null,
        public ?CreditCardResult $card = null,
        public ?string $checkoutUrl = null,
        public ?string $invoiceUrl = null,
    ) {}

    /**
     * Create a pending result for PIX payment.
     */
    public static function pendingPix(
        Payment $payment,
        PixQrCodeResponse $pix,
        ?string $checkoutUrl = null,
    ): self {
        return new self(
            payment: $payment,
            status: self::STATUS_PENDING,
            pix: $pix,
            checkoutUrl: $checkoutUrl,
        );
    }

    /**
     * Create a result for credit card payment.
     */
    public static function forCreditCard(
        Payment $payment,
        CreditCardResult $card,
    ): self {
        return new self(
            payment: $payment,
            status: $card->approved ? self::STATUS_PAID : self::STATUS_FAILED,
            card: $card,
        );
    }

    /**
     * Create a pending result (generic).
     */
    public static function pending(
        Payment $payment,
        ?string $checkoutUrl = null,
    ): self {
        return new self(
            payment: $payment,
            status: self::STATUS_PENDING,
            checkoutUrl: $checkoutUrl,
        );
    }

    /**
     * Create a paid result (100% wallet).
     */
    public static function paidWithWallet(Payment $payment): self
    {
        return new self(
            payment: $payment,
            status: self::STATUS_PAID,
        );
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if payment is paid.
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Check if payment failed.
     */
    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Check if this is a PIX payment.
     */
    public function isPix(): bool
    {
        return $this->payment->payment_method === PaymentMethod::PIX;
    }

    /**
     * Check if this is a credit card payment.
     */
    public function isCreditCard(): bool
    {
        return $this->payment->payment_method === PaymentMethod::CREDIT_CARD;
    }

    /**
     * Get error message if failed.
     */
    public function getErrorMessage(): ?string
    {
        if ($this->card && ! $this->card->approved) {
            return $this->card->errorMessage;
        }

        return null;
    }

    /**
     * Convert to array for API responses.
     */
    public function toArray(): array
    {
        return [
            'payment_uuid' => $this->payment->uuid,
            'status' => $this->status,
            'payment_method' => $this->payment->payment_method->value,
            'amount_cents' => $this->payment->amount_cents,
            'pix' => $this->pix?->toArray(),
            'card' => $this->card?->toArray(),
            'checkout_url' => $this->checkoutUrl,
            'invoice_url' => $this->invoiceUrl,
        ];
    }
}
