import { Link } from '@inertiajs/react';

const checkIcon = (
    <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const highlights = [
    'Full procurement chain tracking',
    'QR code asset labels',
    'Maintenance scheduling & warranty alerts',
    'Comprehensive audit trail',
];

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex">

            {/* ── Left brand panel ── */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 w-fit">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <span className="text-white text-xl font-bold tracking-tight">
                        ASSET<span className="text-indigo-400">LINQ</span>
                    </span>
                </Link>

                {/* Tagline */}
                <div>
                    <h2 className="text-white text-4xl font-extrabold leading-tight">
                        Enterprise Asset<br />Management,<br />
                        <span className="text-indigo-400">Simplified.</span>
                    </h2>
                    <p className="text-slate-400 mt-4 text-base leading-relaxed max-w-sm">
                        Track, manage, and optimise your entire asset portfolio from
                        procurement to disposal — all in one place.
                    </p>

                    <ul className="mt-8 space-y-3">
                        {highlights.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                                {checkIcon}
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-slate-600 text-xs">
                    &copy; {new Date().getFullYear()} ASSETLINQ. All rights reserved.
                </p>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">

                {/* Mobile logo */}
                <Link href="/" className="lg:hidden flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <span className="text-slate-800 text-lg font-bold tracking-tight">
                        ASSET<span className="text-indigo-600">LINQ</span>
                    </span>
                </Link>

                {/* Form card */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200 px-8 py-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
