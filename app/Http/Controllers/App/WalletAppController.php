<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CheckoutRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\UserResource;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Models\Payment;
use App\Services\UserService;
use App\Services\Wallet\WalletService;
use App\Supports\TheOneResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WalletAppController extends Controller
{
    public function __construct(
        private readonly WalletService $walletService,
        private readonly UserService $userService
    ) {}

    /**
     * Display wallet page with balance and transactions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $walletData = $this->walletService->getWalletData($user);
        $chartData = $this->walletService->getChartData($user);

        return Inertia::render('app/wallet/index', [
            'wallet' => $walletData,
            'chart' => $chartData,
        ]);
    }

    /**
     * Show add balance page.
     */
    public function create(): Response
    {
        return Inertia::render('app/wallet/add-balance');
    }

    /**
     * Process deposit to wallet.
     */
    public function addBalanceCheckout(CheckoutRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        // Build meta with all validated data
        $payload = array_merge($validated, [
            'description' => 'Depósito via ' . ($validated['payment_method'] === 'pix' ? 'PIX' : 'Cartão de Crédito'),
        ]);

        $result = $this->walletService->addBalanceCheckout(
            $user,
            (int) $validated['amount'],
            $payload
        );

        // Handle JSON request (API)
        if ($request->expectsJson()) {
            return $this->handleJsonResponse($result, $user);
        }

        // Handle Inertia request
        return $this->handleInertiaResponse($result);
    }

    /**
     * Handle JSON/API response.
     */
    protected function handleJsonResponse($result, $user)
    {
        if ($result->isPaid()) {
            return TheOneResponse::ok([
                'message' => 'Saldo adicionado com sucesso!',
                'status' => 'paid',
                'data' => new UserResource($user->fresh()),
            ]);
        }

        if ($result->isFailed()) {
            return TheOneResponse::unprocessable(
                $result->getErrorMessage() ?? 'Pagamento recusado.'
            );
        }

        // Pending - return checkout data
        return TheOneResponse::ok([
            'message' => 'Pagamento criado. Aguardando confirmação.',
            'status' => 'pending',
            'checkout' => $result->toArray(),
        ]);
    }

    /**
     * Handle Inertia response.
     */
    protected function handleInertiaResponse($result)
    {
        // Credit card paid immediately
        if ($result->isCreditCard() && $result->isPaid()) {
            return redirect()->route('app.payments.show', $result->payment->uuid)
                ->with('success', 'Saldo adicionado com sucesso!');
        }

        // Credit card failed
        if ($result->isCreditCard() && $result->isFailed()) {
            return back()->withErrors([
                'card' => $result->getErrorMessage() ?? 'Pagamento recusado. Verifique os dados do cartão.',
            ]);
        }

        // PIX - show QR code page
        if ($result->isPix()) {
            return redirect()->route('app.payments.show', $result->payment->uuid);
        }

        // Other methods - redirect to checkout URL or wallet
        if ($result->checkoutUrl) {
            return Inertia::location($result->checkoutUrl);
        }

        return redirect()->route('app.wallet.index')
            ->with('info', 'Pagamento criado. Aguardando confirmação.');
    }

    /**
     * Check payment status (for polling).
     */
    public function checkStatus(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();

        $status = $this->walletService->getPaymentStatus($uuid, $user);

        if (! $status) {
            return response()->json(['message' => 'Pagamento não encontrado.'], 404);
        }

        return response()->json(['data' => $status]);
    }


    /**
     * Show payment details page.
     */
    public function showPayment(Request $request, string $uuid): Response
    {
        $user = $request->user();

        $payment = Payment::where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $pixData = null;
        if ($payment->payment_method === PaymentMethod::PIX) {
            $pixData = [
                'payload' => $payment->meta['gateway']['qr_code_payload'] ?? null,
                'encoded_image' => $payment->meta['gateway']['qr_code_image'] ?? null,
            ];
        }

        return Inertia::render('app/wallet/payment-details', [
            'payment' => [
                'uuid' => $payment->uuid,
                'amount_cents' => $payment->amount_cents,
                'status' => $payment->status->value,
                'payment_method' => $payment->payment_method->value,
                'created_at' => $payment->created_at->toIso8601String(),
                'paid_at' => $payment->paid_at?->toIso8601String(),
            ],
            'pix' => $pixData,
            'checkout_url' => $payment->url,
        ]);
    }

    /**
     * List user payments with pagination and search (API).
     */
    public function payments(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $search = $request->string('search')->trim()->toString();

        $query = Payment::where('user_id', $user->id);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('uuid', 'like', "%{$search}%")
                    ->orWhere('gateway_reference', 'like', "%{$search}%")
                    ->orWhereRaw("JSON_EXTRACT(meta, '$.description') LIKE ?", ["%{$search}%"]);
            });
        }

        $payments = $query
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 10));

        return PaymentResource::collection($payments);
    }

    /**
     * Export user payments to CSV.
     */
    public function exportPayments(Request $request): StreamedResponse
    {
        $user = $request->user();
        $search = $request->string('search')->trim()->toString();

        $query = Payment::where('user_id', $user->id);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('uuid', 'like', "%{$search}%")
                    ->orWhere('gateway_reference', 'like', "%{$search}%")
                    ->orWhereRaw("JSON_EXTRACT(meta, '$.description') LIKE ?", ["%{$search}%"]);
            });
        }

        $payments = $query->orderByDesc('created_at')->get();

        $filename = 'pagamentos_' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($payments) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header
            fputcsv($handle, [
                'ID',
                'Data',
                'Descrição',
                'Método',
                'Status',
                'Valor (R$)',
                'Pago em',
            ], ';');

            // Data
            foreach ($payments as $payment) {
                fputcsv($handle, [
                    $payment->uuid,
                    $payment->created_at->format('d/m/Y H:i'),
                    $payment->meta['description'] ?? '-',
                    $payment->payment_method?->getLabelText() ?? '-',
                    $payment->status->getLabelText(),
                    number_format($payment->amount_cents / 100, 2, ',', '.'),
                    $payment->paid_at?->format('d/m/Y H:i') ?? '-',
                ], ';');
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
