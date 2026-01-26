<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Wallet\WalletService;
use App\Supports\TheOneResponse;
use Illuminate\Auth\Events\Validated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{

    public function __construct(private WalletService $walletService) {}

    public function myWallet(Request $request)
    {
        return Inertia::render("app/wallet/index", []);
    }

    public function deposit(Request $request, $userUuid)
    {
        request()->validate([
            'amount' => 'required|min:1',
            'meta' => 'nullable|array|max:255',
        ]);

        if (!$user = User::whereUuid($userUuid)->first()) {
            return TheOneResponse::notFound(
                __('Record not found'),
                'admin.users.index'
            );
        }

        $this->walletService->deposit(
            $user,
            $request->input('amount'),
            $request->input('meta', null),
        );

        return TheOneResponse::ok(
            ['user' => new UserResource($user)],
            'admin/dashboard'
        );
    }
    public function withdraw(Request $request, $userUuid)
    {
        request()->validate([
            'amount' => 'required|min:1',
            'meta' => 'nullable|array|max:255',
        ]);

        if (!$user = User::whereUuid($userUuid)->first()) {
            return TheOneResponse::notFound(
                __('Record not found'),
                'admin.users.index'
            );
        }

        $this->walletService->withdraw(
            $user,
            $request->input('amount'),
            $request->input('meta', null),
        );

        return TheOneResponse::ok(
            ['userData' => new UserResource($user)],
            'admin/dashboard'
        );
    }
}
