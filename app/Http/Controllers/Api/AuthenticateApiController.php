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

        $token = Auth::user()->createToken('api');

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => new UserResource(Auth::user()),
        ]);
    }
}
