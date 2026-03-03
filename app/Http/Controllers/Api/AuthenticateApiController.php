<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthenticateApiController extends Controller
{
    public function auth(LoginRequest $request)
    {
        $request->authenticate();

        if ($request->expectsJson()) {

            $token = Auth::user()->createToken('api');

            return response()->json([
                'token' => $token->plainTextToken,
                'user' => new UserResource(Auth::user()),
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => new UserResource(Auth::user()),
            'message' => 'Login realizado com sucesso',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }
}
