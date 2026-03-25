<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to ASSETLINQ</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%); padding: 40px 48px; text-align: center; }
        .logo-wrap { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 0; }
        .logo-icon { width: 40px; height: 40px; background: #6366f1; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; }
        .logo-icon svg { width: 22px; height: 22px; fill: none; stroke: #ffffff; stroke-width: 2; }
        .logo-text { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo-text span { color: #a5b4fc; }
        .header-tag { margin-top: 8px; display: inline-block; background: rgba(165,180,252,0.2); border: 1px solid rgba(165,180,252,0.3); color: #a5b4fc; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 99px; }
        .body { padding: 48px; }
        .greeting { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .intro { font-size: 15px; line-height: 1.7; color: #64748b; margin-bottom: 32px; }
        .features { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        .features h3 { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; }
        .feature-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .feature-item:last-child { margin-bottom: 0; }
        .feature-dot { width: 20px; height: 20px; background: #ede9fe; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .feature-dot svg { width: 10px; height: 10px; stroke: #6366f1; fill: none; stroke-width: 3; }
        .feature-text { font-size: 14px; color: #475569; line-height: 1.5; }
        .cta-wrap { text-align: center; margin-bottom: 32px; }
        .cta-btn { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 40px; border-radius: 10px; letter-spacing: 0.3px; }
        .cta-btn:hover { background: #4f46e5; }
        .divider { border: none; border-top: 1px solid #e2e8f0; margin: 0 0 24px; }
        .footer-note { font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center; }
        .footer-note a { color: #6366f1; text-decoration: none; }
        .email-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 48px; text-align: center; }
        .email-footer p { font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="wrapper">

    <!-- Header -->
    <div class="header">
        <div class="logo-wrap">
            <div class="logo-icon">
                <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
            </div>
            <span class="logo-text">ASSET<span>LINQ</span></span>
        </div>
        <div>
            <span class="header-tag">Enterprise Asset Management</span>
        </div>
    </div>

    <!-- Body -->
    <div class="body">
        <p class="greeting">Welcome, {{ $user->name }}!</p>
        <p class="intro">
            Your ASSETLINQ account has been created successfully. You now have access to the
            enterprise asset management system — designed to streamline the full lifecycle of
            your organisation's assets.
        </p>

        <!-- What you can do -->
        <div class="features">
            <h3>What you can do with ASSETLINQ</h3>

            @foreach ([
                'Track assets from procurement through to disposal',
                'Manage purchase orders, goods receipts, and invoices',
                'Schedule maintenance and receive warranty reminders',
                'Run reports and export data for financial review',
            ] as $item)
            <div class="feature-item">
                <div class="feature-dot">
                    <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                </div>
                <span class="feature-text">{{ $item }}</span>
            </div>
            @endforeach
        </div>

        <!-- CTA -->
        <div class="cta-wrap">
            <a href="{{ route('login') }}" class="cta-btn">Log In to ASSETLINQ</a>
        </div>

        <hr class="divider" />

        <p class="footer-note">
            Your registered email address is <strong>{{ $user->email }}</strong>.<br />
            If you did not create this account, please contact your system administrator immediately.
        </p>
    </div>

    <!-- Footer -->
    <div class="email-footer">
        <p>&copy; {{ date('Y') }} ASSETLINQ &mdash; Enterprise Asset Management System</p>
    </div>
</div>
</body>
</html>
