import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ user, header, children }) {
    const [expandedMenus, setExpandedMenus] = useState({ pinned: true, reports: true, operations: true, admin: true });
    const [activeFeatureModal, setActiveFeatureModal] = useState(null);

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleFeatureClick = (featureName) => {
        setActiveFeatureModal(featureName);
    };

    const sideBarLink = "w-full text-left block py-2 px-4 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors truncate cursor-pointer";

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
                
                {/* MODERN SIDEBAR */}
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 shadow-sm">
                    <div className="p-4 border-b border-gray-100">
                        <div className="bg-slate-100 flex items-center space-x-2 rounded-lg px-3 py-2 border border-transparent focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input type="text" placeholder="Search menu..." className="flex-1 bg-transparent w-full text-sm text-gray-700 border-none focus:ring-0 focus:outline-none p-0"/>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-4 pb-10 custom-scrollbar px-3 space-y-4">
                        {/* Pinned Tree */}
                        <div>
                            <div className="flex items-center px-3 py-2 cursor-pointer font-semibold text-gray-500 text-xs uppercase tracking-wider rounded-md hover:text-gray-900" onClick={() => toggleMenu('pinned')}>
                                <svg className={"w-3.5 h-3.5 mr-2 transition-transform text-gray-400 " + (expandedMenus?.pinned ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                Pinned
                            </div>
                            {expandedMenus.pinned && (
                                <div className="ml-2 mt-1 space-y-0.5">
                                    <Link href={route('dashboard')} className={sideBarLink}>Asset Management Grid</Link>
                                    <Link href={route('transfers.index')} className={sideBarLink}>Asset Transfer Review</Link>
                                </div>
                            )}
                        </div>

                        {/* Operations Tree */}
                        <div>
                            <div className="flex items-center px-3 py-2 cursor-pointer font-semibold text-gray-500 text-xs uppercase tracking-wider rounded-md hover:text-gray-900" onClick={() => toggleMenu('operations')}>
                                <svg className={"w-3.5 h-3.5 mr-2 transition-transform text-gray-400 " + (expandedMenus?.operations ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                Operations
                            </div>
                            {expandedMenus.operations && (
                                <div className="ml-2 mt-1 space-y-0.5">
                                    <Link href={route('transfers.index')} className={sideBarLink}>Asset Transfer Review</Link>
                                    <Link href={route('audit.index')} className={sideBarLink}>Audit & Inventory</Link>
                                    <Link href={route('maintenance.index')} className={sideBarLink}>Maintenance Tracking</Link>
                                      <Link href={route('decommission.log')} className={sideBarLink}>Decommission Log</Link>
                                      <Link href={route('disposal.log')} className={sideBarLink}>Disposal Certificates</Link>
                                      <Link href={route('archive.utilities')} className={sideBarLink}>Archive Utilities</Link>
                                </div>
                            )}
                        </div>

                        {/* Reports Tree */}
                        <div>
                            <div className="flex items-center px-3 py-2 cursor-pointer font-semibold text-gray-500 text-xs uppercase tracking-wider rounded-md hover:text-gray-900" onClick={() => toggleMenu('reports')}>
                                <svg className={"w-3.5 h-3.5 mr-2 transition-transform text-gray-400 " + (expandedMenus?.reports ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                Reports & Analytics
                            </div>
                            {expandedMenus.reports && (
                                <div className="ml-2 mt-1 space-y-0.5">
                                    {user?.role === 'admin' ? (
                                        <Link href={route('admin.dashboard')} className={sideBarLink}>Executive Summary Area</Link>
                                    ) : (
                                        <button onClick={() => handleFeatureClick('Executive Summary Area (Admin Only)')} className={sideBarLink}>Executive Summary Area</button>
                                    )}
                                      <Link href={route('activity-log.index')} className={sideBarLink}>Asset Activity Log Viewer</Link>
                                      <Link href={route('department.rollup')} className={sideBarLink}>Department Rollup</Link>
                                      <Link href={route('reports.index')} className={sideBarLink}>Export Reports</Link>
                                      <Link href={route('reports.maintenance')} className={sideBarLink}>Maintenance Report</Link>
                                </div>
                            )}
                        </div>

                        {/* Administration Tree (Admin Only) */}
                        {user?.role === 'admin' && (
                            <div>
                                <div className="flex items-center px-3 py-2 cursor-pointer font-semibold text-gray-500 text-xs uppercase tracking-wider rounded-md hover:text-gray-900" onClick={() => toggleMenu('admin')}>
                                    <svg className={"w-3.5 h-3.5 mr-2 transition-transform text-gray-400 " + (expandedMenus?.admin ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    Administration
                                </div>
                                {expandedMenus.admin && (
                                    <div className="ml-2 mt-1 space-y-0.5">
                                        <Link href={route('admin.users.index')} className={sideBarLink}>User Management</Link>
                                        <Link href={route('admin.departments.index')} className={sideBarLink}>Department Management</Link>
                                        <Link href={route('admin.vendors.index')} className={sideBarLink}>Vendor Management</Link>
                                        <Link href={route('admin.allocations.index')} className={sideBarLink}>Asset Allocations</Link>
                                        <Link href={route('asset-requests.index')} className={sideBarLink}>Asset Requests</Link>
                                        <Link href={route('admin.capex.index')} className={sideBarLink}>CAPEX Forms</Link>
                                        <Link href={route('admin.position-specs.index')} className={sideBarLink}>Position Specifications</Link>
                                    </div>
                                )}
                            </div>
                        )}

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

