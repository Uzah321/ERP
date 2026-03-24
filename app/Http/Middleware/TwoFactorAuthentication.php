<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorAuthentication
{
    /**
     * Redirect users who have 2FA enabled and haven't verified this session yet.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->two_factor_enabled) {
            // Skip the 2FA challenge routes themselves to avoid redirect loop
            if ($request->routeIs('two-factor.*')) {
                return $next($request);
            }

            if (!session('2fa_verified')) {
                session(['2fa_required' => true]);
                return redirect()->route('two-factor.challenge');
            }
        }

        return $next($request);
    }
}
