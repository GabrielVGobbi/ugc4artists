<?php

namespace App\Modules\Permissions\Http\Middleware;

use App\Models\User;
use App\Modules\Permissions\Models\Permission;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role, ?string $permission = null)
    {
        #if (app()->isLocal()) {
        #    if (!$request->user()) {
        #        Auth::login(User::first());
        #    }
        #}

        // Verifica autenticação
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Verifica role
        if (!$request->user()->hasRole($role)) {
            abort(403, 'Acesso negado');
        }

        // Verifica permission (se fornecida)
        if ($permission !== null) {
            $perm = Permission::where('slug', $permission)->first();

            if (!$perm || !$request->user()->hasPermissionTo($perm)) {
                abort(403, 'Acesso negado');
            }
        }

        return $next($request);
    }
}
