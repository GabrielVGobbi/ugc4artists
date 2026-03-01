<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\AccountStatementResource;
use App\Http\Resources\UserResource;
use App\Models\AccountStatement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccountApiController extends Controller
{
    public function me(Request $request)
    {
        return new UserResource(Auth::user());
    }

    /**
     * Get unified bank statement (extrato bancário) for authenticated user.
     */
    public function statement(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 30), 100);
        $type = $request->get('type');
        $category = $request->get('category');
        $paymentMethod = $request->get('payment_method');
        $status = $request->get('status');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = AccountStatement::byUser()
            ->with(['statementable', 'payment:uuid,status,payment_method'])
            ->latest('created_at');

        // Filters
        if ($type) {
            $query->byType($type);
        }

        if ($category) {
            $query->byCategory($category);
        }

        if ($paymentMethod) {
            $query->byPaymentMethod($paymentMethod);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($dateFrom || $dateTo) {
            $query->dateRange($dateFrom, $dateTo);
        }

        $statements = $query->paginate($perPage);

        // Calculate summary for the filtered period
        $summary = $this->calculateSummary($query->clone());

        return response()->json([
            'success' => true,
            'data' => AccountStatementResource::collection($statements),
            'summary' => $summary,
            'meta' => [
                'current_page' => $statements->currentPage(),
                'last_page' => $statements->lastPage(),
                'per_page' => $statements->perPage(),
                'total' => $statements->total(),
            ],
        ]);
    }

    /**
     * Get account summary with breakdown by category.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        // Current wallet balance (from Bavix Wallet)
        $currentBalance = $user->wallet?->balanceFloat ?? 0;

        // This month stats
        $thisMonth = $this->getPeriodStats(now()->startOfMonth(), now());

        // Last 30 days stats
        $last30Days = $this->getPeriodStats(now()->subDays(30), now());

        // Breakdown by category (all time, completed only)
        $breakdownByCategory = AccountStatement::byUser()
            ->completed()
            ->select('category', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get()
            ->map(fn($item) => [
                'category' => $item->category,
                'category_label' => (new AccountStatement(['category' => $item->category]))->category_label,
                'total' => (float) $item->total,
                'count' => $item->count,
            ]);

        return response()->json([
            'success' => true,
            'current_balance' => $currentBalance,
            'formatted_balance' => $currentBalance,
            'this_month' => $thisMonth,
            'last_30_days' => $last30Days,
            'breakdown_by_category' => $breakdownByCategory,
        ]);
    }

    /**
     * Calculate summary for a query.
     */
    protected function calculateSummary($query): array
    {
        $user = request()->user();

        $stats = $query->completed()
            ->selectRaw('
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_in,
                SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as total_out
            ')
            ->first();

        $totalIn = (float) ($stats->total_in ?? 0);
        $totalOut = abs((float) ($stats->total_out ?? 0));
        $periodBalance = $totalIn - $totalOut;

        return [
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'period_balance' => $periodBalance,
            'current_balance' => amountToDec($user->wallet?->balanceFloat) ?? 0,
        ];
    }

    /**
     * Get stats for a specific period.
     */
    protected function getPeriodStats($from, $to): array
    {
        $stats = AccountStatement::byUser()
            ->completed()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('
                SUM(CASE WHEN type = "deposit" THEN amount ELSE 0 END) as deposits,
                SUM(CASE WHEN type = "service_payment" THEN ABS(amount) ELSE 0 END) as payments,
                SUM(CASE WHEN type = "refund" THEN amount ELSE 0 END) as refunds
            ')
            ->first();

        $deposits = (float) ($stats->deposits ?? 0);
        $payments = (float) ($stats->payments ?? 0);
        $refunds = (float) ($stats->refunds ?? 0);
        $net = $deposits + $refunds - $payments;

        return [
            'deposits' => $deposits,
            'payments' => $payments,
            'refunds' => $refunds,
            'net' => $net,
        ];
    }
}
