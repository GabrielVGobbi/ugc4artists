<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use App\Traits\HasFilterableList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentApiController extends Controller
{
    use HasFilterableList;

    /**
     * List payments with filters, search, and pagination
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return $this->listResource(
            Payment::class,
            PaymentResource::class,
            [
                'searchable' => ['uuid', 'gateway_reference', 'user.name', 'user.email'],
                'filterable' => ['status', 'payment_method', 'gateway', 'user_id'],
                'sortable' => ['created_at', 'amount_cents', 'paid_at', 'status'],
                'with' => ['user:id,name,email,avatar'],
                'defaultSort' => 'created_at',
                'defaultDirection' => 'desc',
            ]
        );
    }

    /**
     * Get payment statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = [
            'total' => Payment::count(),
            'total_amount' => Payment::sum('amount_cents') / 100,
            'by_status' => Payment::query()
                ->selectRaw('status, COUNT(*) as count, SUM(amount_cents) as total')
                ->groupBy('status')
                ->get()
                ->map(fn($item) => [
                    'status' => $item->status->value,
                    'label' => $item->status->getLabelText(),
                    'count' => $item->count,
                    'total' => $item->total / 100,
                ]),
            'by_method' => Payment::query()
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount_cents) as total')
                ->whereNotNull('payment_method')
                ->groupBy('payment_method')
                ->get()
                ->map(fn($item) => [
                    'method' => $item->payment_method->value,
                    'label' => $item->payment_method->getLabelText(),
                    'count' => $item->count,
                    'total' => $item->total / 100,
                ]),
        ];

        return response()->json($stats);
    }
}
