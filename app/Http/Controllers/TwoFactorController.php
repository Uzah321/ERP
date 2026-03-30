<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Contracts\Encryption\DecryptException;

class TwoFactorController extends Controller
{
    /**
     * Show the 2FA setup page for the authenticated user.
     */
    public function setup()
    {
        $user   = Auth::user();
        $google = new Google2FA();

        $secret = $this->resolveSecret($user);

        if (!$secret) {
            $secret = $google->generateSecretKey();
            $user->update(['google2fa_secret' => $secret]);
        }

        // Build the key URI for authenticator apps.
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
        $secret = $this->resolveSecret($user);

        if (! $secret) {
            return back()->withErrors(['code' => 'Your 2FA secret is invalid. Open 2FA setup and scan a new QR code.']);
        }

        $valid = $google->verifyKey($secret, $request->code);

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
        $request->validate(['code' => 'required|string|digits:6']);

        $user   = Auth::user();
        $google = new Google2FA();
        $secret = $this->resolveSecret($user);

        if (! $secret) {
            session()->forget('2fa_required');
            return redirect()->route('two-factor.setup')
                ->with('error', 'Your 2FA secret is invalid. Please set up 2FA again.');
        }

        $valid = $google->verifyKey($secret, $request->code);

        if (!$valid) {
            return back()->with('error', 'Invalid verification code. Please try again.');
        }

        // Mark session as 2FA-verified and regenerate session ID
        session()->forget('2fa_required');
        session(['2fa_verified' => true]);
        session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    private function resolveSecret($user): ?string
    {
        try {
            return $user->google2fa_secret;
        } catch (DecryptException $e) {
            logger()->warning('2FA secret decrypt failed for user ' . $user->id . ', resetting secret.', ['exception' => $e]);
            $user->forceFill([
                'google2fa_secret' => null,
                'two_factor_enabled' => false,
                'two_factor_confirmed_at' => null,
            ])->save();

            return null;
        }
    }
}
