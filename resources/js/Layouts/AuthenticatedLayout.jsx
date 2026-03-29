import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ user: userProp, header, children }) {
    const { auth, ziggy } = usePage().props;
    const user = userProp ?? auth?.user;
    const currentUrl = ziggy?.location ?? window.location.href;

    const [expandedMenus, setExpandedMenus] = useState({
        main: true, procurement: true, operations: true, reports: true, settings: true,
    });
    const [activeFeatureModal, setActiveFeatureModal] = useState(null);

    const toggleMenu = (menu) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    const handleFeatureClick = (featureName) => setActiveFeatureModal(featureName);

    // Returns true if the current URL matches the given route name
    const isActive = (routeName, params) => {
        try { return currentUrl === route(routeName, params); } catch { return false; }
    };

    const NavLink = ({ href, icon, children: label }) => {
        const active = currentUrl.startsWith(href);
        return (
            <Link href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
                }`}>
                <span className={`shrink-0 ${active ? 'text-white' : 'text-gray-400'}`}>{icon}</span>
                <span className="truncate">{label}</span>
            </Link>
        );
    };

    const NavButton = ({ featureName, icon, children: label }) => (
        <button onClick={() => handleFeatureClick(featureName)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-slate-100 hover:text-gray-900 transition-all">
            <span className="shrink-0 text-gray-400">{icon}</span>
            <span className="truncate">{label}</span>
        </button>
    );

    const SectionHeader = ({ id, label, icon }) => (
        <button onClick={() => toggleMenu(id)}
            className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors">
            <span className="flex items-center gap-1.5">{icon}{label}</span>
            <svg className={`w-3 h-3 transition-transform ${expandedMenus[id] ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
        </button>
    );

    // Icons (inline SVGs kept small ??? 16??16)
    const ic = {
        grid:       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
        transfer:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>,
        request:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
        capex:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
        po:         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>,
        gr:         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>,
        invoice:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
        audit:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
        maintenance:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>,
        decommission:<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
        disposal:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
        software:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
        dashboard:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
        log:        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
        dept:       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
        report:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
        budget:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
        users:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
        vendor:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
        shield:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
        position:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
        archive:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>,
        allocation: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>,
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans text-sm">
            
            {/* TOP HEADER */}
            <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shrink-0 shadow-sm text-gray-700 select-none z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l1.66 4.34L16 8l-4.34 1.66L10 14l-1.66-4.34L4 8l4.34-1.66z"/></svg>
                    </div>
                    <span className="font-bold text-xl tracking-wide text-gray-900">ASSET<span className="font-light text-blue-600">LINQ</span></span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm font-medium text-gray-500">
                    <button onClick={() => handleFeatureClick('Home Hub')} className="hover:text-blue-600 transition-colors flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> Home</button>
                    <button onClick={() => handleFeatureClick('Help & Documentation')} className="hover:text-blue-600 transition-colors flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Help</button>
                    
                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
                    
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors text-gray-700">
                                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                    {(user && user.name ? user.name.charAt(0) : "G").toUpperCase()}
                                </div>
                                <span>{user && user.name ? user.name : "Guest"}</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </span>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs">
                                <p className="text-gray-500">Signed in as</p>
                                <p className="font-medium text-gray-900 truncate">{user && user.email ? user.email : "Guest"}</p>
                            </div>
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </header>

            {/* BODY Flex */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* SIDEBAR */}
                <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10">

                    {/* Search */}
                    <div className="px-3 pt-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 border border-transparent transition-all">
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input type="text" placeholder="Search..." className="flex-1 bg-transparent text-xs text-gray-700 border-none focus:ring-0 focus:outline-none placeholder-gray-400"/>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar">

                        {/* ?????? MAIN ?????? */}
                        <div>
                            <SectionHeader id="main" label="Main"
                                icon={<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>}
                            />
                            {expandedMenus.main && (
                                <div className="space-y-0.5">
                                    <NavLink href={route('dashboard')} icon={ic.grid}>Asset Register</NavLink>
                                    <NavLink href={route('transfers.index')} icon={ic.transfer}>Asset Transfers</NavLink>
                                    <NavLink href={route('admin.allocations.index')} icon={ic.allocation}>Asset Allocations</NavLink>
                                    <NavLink href={route('asset-requests.index')} icon={ic.request}>Asset Requests</NavLink>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100"/>

                        {/* ?????? PROCUREMENT ?????? */}
                        {user?.role === 'admin' && (
                            <div>
                                <SectionHeader id="procurement" label="Procurement"
                                    icon={<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/></svg>}
                                />
                                {expandedMenus.procurement && (
                                    <div className="space-y-0.5">
                                        <NavLink href={route('admin.capex.index')} icon={ic.capex}>CAPEX Forms</NavLink>
                                        <NavLink href={route('purchase-orders.index')} icon={ic.po}>Purchase Orders</NavLink>
                                        <NavLink href={route('goods-receipts.index')} icon={ic.gr}>Goods Receipts</NavLink>
                                        <NavLink href={route('invoices.index')} icon={ic.invoice}>Invoices &amp; Payments</NavLink>
                                        <NavLink href={route('admin.budget-tracking')} icon={ic.budget}>Budget vs. Actual</NavLink>
                                    </div>
                                )}
                            </div>
                        )}

                        {user?.role === 'admin' && <div className="border-t border-gray-100"/>}

                        {/* ?????? OPERATIONS ?????? */}
                        <div>
                            <SectionHeader id="operations" label="Operations"
                                icon={<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>}
                            />
                            {expandedMenus.operations && (
                                <div className="space-y-0.5">
                                    <NavLink href={route('audit.index')} icon={ic.audit}>Audit &amp; Inventory</NavLink>
                                    <NavLink href={route('maintenance.index')} icon={ic.maintenance}>Maintenance Tracking</NavLink>
                                    <NavLink href={route('admin.software-licences.index')} icon={ic.software}>Software Licences</NavLink>
                                    <NavLink href={route('decommission.log')} icon={ic.decommission}>Decommission Log</NavLink>
                                    <NavLink href={route('disposal.log')} icon={ic.disposal}>Disposal Certificates</NavLink>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100"/>

                        {/* ?????? REPORTS ?????? */}
                        <div>
                            <SectionHeader id="reports" label="Reports &amp; Analytics"
                                icon={<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>}
                            />
                            {expandedMenus.reports && (
                                <div className="space-y-0.5">
                                    {user?.role === 'admin'
                                        ? <NavLink href={route('admin.dashboard')} icon={ic.dashboard}>Executive Summary</NavLink>
                                        : <NavButton featureName="Executive Summary (Admin Only)" icon={ic.dashboard}>Executive Summary</NavButton>
                                    }
                                    <NavLink href={route('activity-log.index')} icon={ic.log}>Activity Log</NavLink>
                                    <NavLink href={route('department.rollup')} icon={ic.dept}>Department Rollup</NavLink>
                                    <NavLink href={route('reports.index')} icon={ic.report}>Export Reports</NavLink>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100"/>

                        {/* ?????? SETTINGS (admin only) ?????? */}
                        {user?.role === 'admin' && (
                            <div>
                                <SectionHeader id="settings" label="Settings"
                                    icon={<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>}
                                />
                                {expandedMenus.settings && (
                                    <div className="space-y-0.5">
                                        <NavLink href={route('admin.users.index')} icon={ic.users}>User Management</NavLink>
                                        <NavLink href={route('admin.departments.index')} icon={ic.dept}>Departments</NavLink>
                                        <NavLink href={route('admin.categories.index')} icon={ic.grid}>Categories</NavLink>
                                        <NavLink href={route('admin.locations.index')} icon={ic.dashboard}>Locations</NavLink>

                                        <NavLink href={route('admin.vendors.index')} icon={ic.vendor}>Vendors</NavLink>
                                        <NavLink href={route('admin.position-specs.index')} icon={ic.position}>Position Specifications</NavLink>
                                        <NavLink href={route('archive.utilities')} icon={ic.archive}>Archive Utilities</NavLink>
                                        <NavLink href={route('two-factor.setup')} icon={ic.shield}>Two-Factor Auth</NavLink>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings for non-admin: only 2FA */}
                        {user?.role !== 'admin' && (
                            <div>
                                <SectionHeader id="settings" label="Settings"
                                    icon={<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>}
                                />
                                {expandedMenus.settings && (
                                    <div className="space-y-0.5">
                                        <NavLink href={route('two-factor.setup')} icon={ic.shield}>Two-Factor Auth</NavLink>
                                    </div>
                                )}
                            </div>
                        )}

                    </nav>

                    {/* User card pinned to bottom */}
                    <div className="border-t border-gray-200 p-3">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {(user?.name?.charAt(0) ?? 'G').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{user?.name ?? 'Guest'}</p>
                                <p className="text-xs text-gray-400 truncate capitalize">{user?.role ?? '???'}</p>
                            </div>
                            <Link href={route('logout')} method="post" as="button"
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Log out">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT WINDOW */}
                <main className="flex-1 bg-slate-50 p-6 flex flex-col overflow-hidden relative">
                    
                    <div className="bg-white flex-1 border border-gray-200 shadow-md flex flex-col overflow-hidden relative rounded-xl">
                        
                        {/* Modern Secondary Toolbar */}
                        <div className="bg-white border-b border-gray-100 py-3 px-5 flex items-center justify-between text-sm shrink-0 select-none">
                            
                            <div className="flex items-center space-x-1">
                                <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <button className="p-1.5 rounded-md text-gray-300 cursor-not-allowed">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                                </button>
                                
                                <div className="h-5 w-px bg-gray-200 mx-3"></div>
                                
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Module</span>
                                    <select className="border border-gray-200 bg-gray-50 text-gray-700 text-sm py-1.5 px-3 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all">
                                        <option>Asset Registry Dashboard</option>
                                        <option>Quick Find...</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                  <button onClick={() => router.post(route('system.sync'))} className="flex items-center space-x-1.5 text-gray-600 hover:text-blue-600 cursor-pointer px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    <span>Sync</span>
                                </button>
                                <a href={route('reports.assets')} className="flex items-center space-x-1.5 text-gray-600 hover:text-blue-600 cursor-pointer px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                    <span>Export</span>
                                </a>
                            </div>
                        </div>

                        {/* Page Header Header */}
                        {header && (
                            <div className="bg-white border-b border-gray-200 p-4 shrink-0">
                                {header}
                            </div>
                        )}

                        {/* Page Children content -> Overflows natively inside the window! */}
                        <div className="flex-1 overflow-auto bg-white p-4">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            {/* Coming Soon Modal */}
            {activeFeatureModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Module Under Construction</h3>
                            <p className="text-sm text-center text-gray-500">
                                The <span className="font-semibold text-gray-700">{activeFeatureModal}</span> functionality is currently being built and will be available in a future update.
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-center border-t border-gray-100">
                            <button 
                                onClick={() => setActiveFeatureModal(null)}
                                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

