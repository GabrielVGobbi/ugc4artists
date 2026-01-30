<?php

namespace App\Modules\Payments\Models;

use Bavix\Wallet\Models\Transaction;

class WalletTransaction extends Transaction
{
    public function onPaymentPaid(\App\Modules\Payments\Models\Payment $payment): void
    {
        dd('oi');
    }
}
