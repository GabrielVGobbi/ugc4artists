<?php

declare(strict_types=1);

namespace App\Modules\Payments\Contracts;

use App\Modules\Payments\DTO\RefundResult;
use App\Modules\Payments\Models\Payment;

interface RefundableInterface
{
    public function refundCharge(Payment $payment, ?int $amountCents = null): RefundResult;

    public function supportsPartialRefund(): bool;
}
