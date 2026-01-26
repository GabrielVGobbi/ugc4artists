<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wallet\DepositRequest;
use App\Http\Resources\UserResource;
use App\Services\Wallet\WalletService;
use App\Supports\TheOneResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletAppController extends Controller
{
    public function __construct(
        private readonly WalletService $walletService
    ) {}

    /**
     * Display wallet page with balance and transactions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $walletData = $this->walletService->getWalletData($user);

        return Inertia::render('app/wallet/index', [
            'wallet' => $walletData,
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
    public function addBalanceCheckout(DepositRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        // Prepare metadata
        $meta = [
            'description' => 'Depósito via ' . ($validated['payment_method'] === 'pix' ? 'PIX' : 'Cartão de Crédito'),
            'payment_method' => $validated['payment_method'],
            'name' => $validated['name'],
            'cpf' => $validated['cpf'],
            'address' => $validated['address'],
        ];

        // Process deposit
        $this->walletService->addBalanceCheckout($user, $validated['amount'], $meta);

        if ($request->expectsJson()) {
            return TheOneResponse::ok([
                'message' => 'Saldo adicionado com sucesso!',
                'data' => new UserResource($user)
            ]);
        }

        return redirect()->route('app.wallet.index')
            ->with('success', 'Saldo adicionado com sucesso!');
    }
}
