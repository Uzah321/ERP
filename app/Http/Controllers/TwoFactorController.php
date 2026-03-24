<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    /**
     * Show the 2FA setup page for the authenticated user.
     */
    public function setup()
    {
        $user   = Auth::user();
        $google = new Google2FA();

        // Generate a secret if the user doesn't have one yet
        if (!$user->google2fa_secret) {
            $secret = $google->generateSecretKey();
            $user->update(['google2fa_secret' => $secret]);
        } else {
            $secret = $user->google2fa_secret;
        }

        // Build the QR code URL (key URI format)
        $qrUrl = $google->getQRCodeUrl(
            config('app.name', 'Simbisa Asset Management'),
            $user->email,
            $secret
        );

        return Inertia::render('Auth/TwoFactorSetup', [
            'qrUrl'       => $qrUrl,
            'secret'      => $secret,
            'enabled'     => (bool) $user->two_factor_enabled,
            'confirmedAt' => $user->two_factor_confirmed_at?->format('d M Y H:i'),
        ]);
    }

    /**
     * Confirm and enable 2FA after user has scanned QR and entered the first code.
     */
    public function enable(Request $request)
    {
        $request->validate([
            'code' => 'required|string|digits:6',
        ]);

        $user   = Auth::user();
        $google = new Google2FA();

        $valid = $google->verifyKey($user->google2fa_secret, $request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'The verification code is incorrect. Please try again.']);
        }

        $user->update([
            'two_factor_enabled'     => true,
            'two_factor_confirmed_at'=> now(),
        ]);

        return redirect()->route('two-factor.setup')
            ->with('flash', ['success' => 'Two-factor authentication enabled successfully.']);
    }

    /**
     * Disable 2FA for the user.
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        Auth::user()->update([
            'two_factor_enabled'      => false,
            'two_factor_confirmed_at' => null,
            'google2fa_secret'        => null,
        ]);

        return redirect()->route('two-factor.setup')
            ->with('flash', ['success' => 'Two-factor authentication has been disabled.']);
    }

    /**
     * Show the verification challenge screen (after login, before dashboard).
     */
    public function challenge()
    {
        if (!session('2fa_required')) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Verify the 2FA code during login.
     */
    public function verify(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $user   = Auth::user();
        $google = new Google2FA();

        $valid = $google->verifyKey($user->google2fa_secret, $request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Invalid verification code.']);
        }

        // Mark session as 2FA-verified
        session()->forget('2fa_required');
        session(['2fa_verified' => true]);

        return redirect()->intended(route('dashboard'));
    }
}
