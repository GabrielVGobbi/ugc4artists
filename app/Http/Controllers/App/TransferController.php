<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransferRequest;
use App\Http\Resources\TransferResource;
use App\Modules\Payments\Exceptions\InsufficientFundsException;
use App\Services\Transfer\TransferService;
use App\Supports\TheOneResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransferController extends Controller
{
    public function __construct(
        private readonly TransferService $transferService
    ) {}

    /**
     * Display transfers list page.
     */
    public function index(Request $request): Response|AnonymousResourceCollection
    {
        $user = $request->user();

        $filters = [
            'type' => $request->string('type', 'all')->toString(),
            'search' => $request->string('search')->trim()->toString(),
            'per_page' => $request->integer('per_page', 10),
        ];

        $transfers = $this->transferService->getUserTransfers($user, $filters);

        // Return JSON for API requests
        if ($request->expectsJson()) {
            return TransferResource::collection($transfers);
        }

        return Inertia::render('app/transfers/index', [
            'transfers' => TransferResource::collection($transfers),
            'filters' => $filters,
        ]);
    }

    /**
     * Show create transfer form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('app/transfers/create', [
            'balance' => $user->balanceInt,
            'balance_formatted' => toCurrency($user->balanceInt / 100),
        ]);
    }

    /**
     * Store a new transfer.
     */
    public function store(TransferRequest $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $recipient = $request->getRecipient();

        if (! $recipient) {
            if ($request->expectsJson()) {
                return TheOneResponse::unprocessable('Usuário de destino não encontrado.');
            }

            return back()->withErrors([
                'to_user_id' => 'Usuário de destino não encontrado.',
            ]);
        }

        try {
            $transfer = $this->transferService->transfer(
                from: $user,
                to: $recipient,
                amount: (int) $validated['amount'],
                meta: [
                    'description' => $validated['description'] ?? null,
                ]
            );

            // Handle JSON request (API)
            if ($request->expectsJson()) {
                return TheOneResponse::created([
                    'message' => 'Transferência realizada com sucesso!',
                    'data' => new TransferResource($transfer->load(['withdraw.wallet.holder', 'deposit.wallet.holder'])),
                ]);
            }

            // Handle Inertia request
            return redirect()->route('app.transfers.show', $transfer->uuid)
                ->with('success', 'Transferência realizada com sucesso!');

        } catch (InsufficientFundsException $e) {
            if ($request->expectsJson()) {
                return TheOneResponse::unprocessable($e->getMessage());
            }

            return back()->withErrors([
                'amount' => $e->getMessage(),
            ])->withInput();

        } catch (ValidationException $e) {
            if ($request->expectsJson()) {
                return TheOneResponse::unprocessable($e->getMessage(), $e->errors());
            }

            return back()->withErrors($e->errors())->withInput();
        }
    }

    /**
     * Display transfer details page.
     */
    public function show(Request $request, string $uuid): Response|JsonResponse
    {
        $user = $request->user();

        $transfer = $this->transferService->findTransfer($uuid);

        if (! $transfer) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Transferência não encontrada.'], 404);
            }

            abort(404, 'Transferência não encontrada.');
        }

        // Verify the user is involved in this transfer (sender or receiver)
        $fromWallet = $transfer->withdraw?->wallet;
        $toWallet = $transfer->deposit?->wallet;

        $isInvolved = ($fromWallet && $fromWallet->holder_id === $user->id)
            || ($toWallet && $toWallet->holder_id === $user->id);

        if (! $isInvolved) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Você não tem permissão para visualizar esta transferência.'], 403);
            }

            abort(403, 'Você não tem permissão para visualizar esta transferência.');
        }

        // Handle JSON request (API)
        if ($request->expectsJson()) {
            return response()->json([
                'data' => new TransferResource($transfer),
            ]);
        }

        return Inertia::render('app/transfers/show', [
            'transfer' => new TransferResource($transfer),
        ]);
    }

    /**
     * Cancel a transfer (soft delete with balance restoration).
     */
    public function destroy(Request $request, string $uuid): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        $transfer = $this->transferService->findTransfer($uuid);

        if (! $transfer) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Transferência não encontrada.'], 404);
            }

            return back()->withErrors([
                'transfer' => 'Transferência não encontrada.',
            ]);
        }

        // Check if user can cancel
        if (! $this->transferService->canCancel($transfer, $user)) {
            $message = 'Você não tem permissão para cancelar esta transferência ou ela já foi cancelada.';

            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 403);
            }

            return back()->withErrors([
                'transfer' => $message,
            ]);
        }

        try {
            $cancelledTransfer = $this->transferService->cancel($transfer, $user);

            if ($request->expectsJson()) {
                return TheOneResponse::ok([
                    'message' => 'Transferência cancelada com sucesso.',
                    'data' => new TransferResource($cancelledTransfer->load(['withdraw.wallet.holder', 'deposit.wallet.holder'])),
                ]);
            }

            return redirect()->route('app.transfers.index')
                ->with('success', 'Transferência cancelada com sucesso.');

        } catch (ValidationException $e) {
            if ($request->expectsJson()) {
                // Return 409 Conflict for already cancelled transfers
                $statusCode = str_contains($e->getMessage(), 'já foi cancelada') ? 409 : 422;
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => $e->errors(),
                ], $statusCode);
            }

            return back()->withErrors($e->errors());
        }
    }
}
