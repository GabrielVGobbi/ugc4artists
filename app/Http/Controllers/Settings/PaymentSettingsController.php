<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingsController extends Controller
{
    /**
     * Show the payment settings form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $address = $user->defaultAddress();

        return Inertia::render('settings/payments', [
            'address' => $address,
            'hasAsaasAccount' => filled($user->asaas_id),
        ]);
    }
}
