<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !$user->isActiveForAccess() || !$user->hasAnyRole($roles)) {
            abort(403, 'Unauthorized. You do not have access to this area.');
        }

        return $next($request);
    }
}