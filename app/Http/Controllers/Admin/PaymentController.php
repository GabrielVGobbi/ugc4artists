<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Display payments listing page with filters
     */
    public function index(Request $request): Response
    {
        return Inertia::render('admin/payments/index', [
            'statusOptions' => PaymentStatus::options(),
            'methodOptions' => PaymentMethod::options(),
        ]);
    }

    /**
     * Display payment details
     */
    public function show(Payment $payment): Response
    {
        $payment->load(['user', 'billable']);

        return Inertia::render('admin/payments/show', [
            'paymentData' => new PaymentResource($payment),
        ]);
    }
}
