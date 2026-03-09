import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ user, header, children }) {
    const [expandedMenus, setExpandedMenus] = useState({ pinned: true, reports: true, operations: true });

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const sideBarLink = "block py-1 px-4 text-xs hover:bg-[#2c4ca3] hover:text-white truncate cursor-pointer";

    return (
        <div className="h-screen w-screen flex flex-col bg-[#e7e7e7] overflow-hidden font-sans text-sm">
            
            {/* TOP HEADER (Blue Link Style) */}
            <header className="bg-[#12235a] h-10 flex items-center justify-between px-4 shrink-0 text-white select-none">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l1.66 4.34L16 8l-4.34 1.66L10 14l-1.66-4.34L4 8l4.34-1.66z"/></svg>
                    <span className="font-bold text-lg tracking-widest">SIMBISA<span className="font-light">LINK</span></span>
                </div>
                
                <div className="flex items-center space-x-6 text-xs text-gray-300">
                    <button className="hover:text-white flex flex-col items-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> Home</button>
                    <button className="hover:text-white flex flex-col items-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Help</button>
                    
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-md cursor-pointer hover:text-white items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {user.name} ({user.role})
                            </span>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </header>

            {/* BODY Flex */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* BLUE SIDEBAR */}
                <aside className="w-64 bg-[#1e3c87] text-gray-200 flex flex-col shrink-0 border-t border-blue-800">
                    <div className="p-2 border-b border-blue-800">
                        <div className="bg-white flex items-center space-x-1 rounded px-2 py-1">
                            <input type="text" placeholder="Search..." className="flex-1 bg-transparent w-full text-xs text-black border-none focus:ring-0 focus:outline-none p-0"/>
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-2 pb-10 custom-scrollbar">
                        {/* Pinned Tree */}
                        <div>
                            <div className="flex items-center px-2 py-1 cursor-pointer font-bold text-white text-xs hover:bg-[#162f6b]" onClick={() => toggleMenu('pinned')}>
                                <svg className={"w-3 h-3 mr-1 transition-transform " + (expandedMenus?.pinned ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                Pinned
                            </div>
                            {expandedMenus.pinned && (
                                <div className="ml-4 mb-2">
                                    <Link href={route('dashboard')} className={sideBarLink}>1 Asset Management Grid</Link>
                                    <Link href={route('transfers.index')} className={sideBarLink}>2 Asset Transfer Review</Link>
                                    <Link href={route('dashboard')} className={sideBarLink}>3 Asset Entry Screen</Link>
                                </div>
                            )}
                        </div>

                        {/* Operations Tree */}
                        <div>
                            <div className="flex items-center px-2 py-1 cursor-pointer font-bold text-white text-xs hover:bg-[#162f6b]" onClick={() => toggleMenu('operations')}>
                                <svg className={"w-3 h-3 mr-1 transition-transform " + (expandedMenus?.pinned ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                Operations
                            </div>
                            {expandedMenus.operations && (
                                <div className="ml-4 mb-2">
                                    <div className={sideBarLink}>Maintenance Tracking</div>
                                    <div className={sideBarLink}>Decommission Log</div>
                                    <div className={sideBarLink}>Disposal Certificate Gener...</div>
                                    <div className={sideBarLink}>Archive Utilities</div>
                                </div>
                            )}
                        </div>

                        {/* Reports Tree */}
                        <div>
                            <div className="flex items-center px-2 py-1 cursor-pointer font-bold text-white text-xs hover:bg-[#162f6b]" onClick={() => toggleMenu('reports')}>
                                <svg className={"w-3 h-3 mr-1 transition-transform " + (expandedMenus?.pinned ? "rotate-90" : "")} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                Reports & Analytics
                            </div>
                            {expandedMenus.reports && (
                                <div className="ml-4 mb-2">
                                    {user.role === 'admin' && <Link href={route('admin.dashboard')} className={sideBarLink}>Executive Summary Area</Link>}
                                    <div className={sideBarLink}>Asset Activity Log Viewer</div>
                                    <div className={sideBarLink}>Department Rollup</div>
                                </div>
                            )}
                        </div>

                    </div>
                </aside>

                {/* MAIN CONTENT WINDOW Container (The typical Grey Background with White MDI inner document) */}
                <main className="flex-1 bg-[#e4e5e7] p-2 flex flex-col overflow-hidden relative">
                    
                    {/* Inner White 'Window' */}
                    <div className="bg-white flex-1 border border-gray-400 shadow-sm flex flex-col overflow-hidden relative rounded-sm">
                        
                        {/* Windows Title Bar Equivalent */}
                        <div className="bg-[#12235a] text-white px-2 py-1 flex items-center justify-between text-xs cursor-default">
                            <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM4 9a2 2 0 100 4h12a2 2 0 100-4H4zM4 15a2 2 0 100 4h12a2 2 0 100-4H4z"/></svg>
                                <span>Simbisa Brands ERP - Connected: {user.name}</span>
                            </div>
                            <div className="flex space-x-2 border border-blue-800 bg-[#0f1d4f] px-2 rounded opacity-50">
                                <span className="cursor-pointer">_</span>
                                <span className="cursor-pointer"></span>
                                <span className="cursor-pointer font-bold">X</span>
                            </div>
                        </div>

                        {/* MDI Secondary Toolbar */}
                        <div className="bg-[#f0f0f0] border-b border-gray-300 py-2 px-3 flex items-center space-x-4 text-xs shrink-0 select-none">
                            <div className="flex space-x-1 border border-gray-300 rounded px-1 py-1 bg-white">
                                <svg className="w-4 h-4 text-blue-800 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                                <svg className="w-4 h-4 text-gray-300 cursor-default" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600">Go To:</span>
                                <select className="border border-gray-300 text-xs py-1 rx-2 w-48 focus:ring-0 focus:outline-none">
                                    <option>Asset Registry Dashboard</option>
                                    <option>Quick Find...</option>
                                </select>
                            </div>
                            <div className="border-l border-gray-400 h-4 mx-2"></div>
                            <button className="flex items-center space-x-1 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-gray-200">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                <span>Refresh</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-gray-200">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                <span>Print List</span>
                            </button>
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
            
            <style>{
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a3680; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2c4ca3; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3d5fb5; }
            }</style>
        </div>
    );
}

