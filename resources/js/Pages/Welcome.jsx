import { Head, Link } from '@inertiajs/react';

const features = [
    { label: 'Asset Register',      desc: 'Full lifecycle tracking from acquisition to disposal' },
    { label: 'Procurement Chain',   desc: 'CAPEX, Purchase Orders, Goods Receipts & Invoices' },
    { label: 'Maintenance Tracking',desc: 'Preventive schedules and warranty reminders' },
    { label: 'Reports & Exports',   desc: 'CSV, Sage and executive summary exports' },
    { label: 'Two-Factor Auth',     desc: 'TOTP-based 2FA for every user account' },
    { label: 'Audit Trail',         desc: 'Per-asset history timeline with change diffs' },
    { label: 'Software Licences',   desc: 'Seat tracking with expiry alerts' },
    { label: 'Department Rollup',   desc: 'Asset counts and values by department' },
];

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="ASSETLINQ - Enterprise Asset Management" />
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">

                {/* -- Header -- */}
                <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-bold tracking-tight">
                            ASSET<span className="text-indigo-400">LINQ</span>
                        </span>
                    </div>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-indigo-500/30"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 text-white/80 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-indigo-500/30"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* -- Hero -- */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Enterprise Asset Management System
                    </div>

                    <h1 className="text-white text-5xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
                        Manage Every Asset.<br />
                        <span className="text-indigo-400">End to End.</span>
                    </h1>

                    <p className="text-slate-300 text-lg mt-6 max-w-2xl leading-relaxed">
                        ASSETLINQ streamlines the full asset lifecycle, from procurement and allocation
                        to maintenance, auditing, and disposal, in one unified platform.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                        <Link
                            href={auth.user ? route('dashboard') : route('login')}
                            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-xl shadow-indigo-500/40 transition text-base"
                        >
                            {auth.user ? 'Go to Dashboard' : 'Sign In'}
                        </Link>
                        {!auth.user && (
                            <Link
                                href={route('register')}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition text-base"
                            >
                                Create Account
                            </Link>
                        )}
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 w-full max-w-5xl">
                        {features.map((f) => (
                            <div
                                key={f.label}
                                className="flex flex-col items-start gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition"
                            >
                                    <span className="text-white text-sm font-semibold">{f.label}</span>
                                <span className="text-slate-400 text-xs leading-relaxed">{f.desc}</span>
                            </div>
                        ))}
                    </div>
                </main>

                {/* -- Footer -- */}
                <footer className="px-8 py-5 border-t border-white/10 text-center text-slate-500 text-xs">
                    &copy; {new Date().getFullYear()} ASSETLINQ. All rights reserved.
                </footer>
            </div>
        </>
    );
}
