import React, { Suspense, lazy, useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Header,
    HeaderContainer,
    HeaderGlobalBar,
    HeaderMenuButton,
    HeaderName,
    Content,
} from '@carbon/react';
import { safeRoute } from '@/utils/ziggy';
const AppSideNav = lazy(() => import('@/Components/Layout/AppSideNav'));

const prefetchPage = (href) => {
    router.prefetch(href, {}, { method: 'get' });
};

const navigateWithoutReload = (event, href) => {
    event.preventDefault();
    router.visit(href);
};

export default function AuthenticatedLayout({ user: userProp, header, children }) {
    const { auth, ziggy } = usePage().props;
    const user = userProp ?? auth?.user;
    const currentUrl = ziggy?.location ?? window.location.href;
    const dashboardHref = safeRoute('dashboard') ?? '/dashboard';
    const settingsHref = safeRoute('settings.index') ?? '/settings';

    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <HeaderContainer
                render={({ isSideNavExpanded, onClickSideNavExpand }) => (
                    <>
                        <Header aria-label="ASSETLINQ">
                            <HeaderMenuButton
                                aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
                                onClick={onClickSideNavExpand}
                                isActive={isSideNavExpanded}
                            />
                            <HeaderName
                                href={dashboardHref}
                                prefix=""
                                onClick={(event) => navigateWithoutReload(event, dashboardHref)}
                                onMouseEnter={() => prefetchPage(dashboardHref)}
                                onFocus={() => prefetchPage(dashboardHref)}
                            >
                                ASSET<span style={{ fontWeight: 300, color: 'var(--cds-link-primary)' }}>LINQ</span>
                            </HeaderName>

                            <HeaderGlobalBar>
                                <div ref={dropdownRef} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setProfileOpen((o) => !o)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            height: '3rem',
                                            padding: '0 0.75rem',
                                            color: 'var(--cds-text-inverse)',
                                            background: 'none',
                                            border: 'none',
                                            borderLeft: '1px solid var(--cds-border-inverse)',
                                            cursor: 'pointer',
                                        }}
                                        aria-label="Open profile menu"
                                        aria-expanded={profileOpen}
                                    >
                                        <div style={{
                                            width: '1.75rem',
                                            height: '1.75rem',
                                            borderRadius: '50%',
                                            background: 'var(--cds-interactive)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            flexShrink: 0,
                                        }}>
                                            {(user?.name?.charAt(0) ?? 'G').toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                                                {user?.name ?? 'Guest'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                                                {user?.email ?? ''}
                                            </div>
                                        </div>
                                    </button>

                                    {profileOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '3rem',
                                            right: 0,
                                            minWidth: '200px',
                                            background: 'var(--cds-layer-01)',
                                            border: '1px solid var(--cds-border-subtle)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                            zIndex: 9999,
                                        }}>
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                borderBottom: '1px solid var(--cds-border-subtle)',
                                            }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                                    {user?.name ?? 'Guest'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.125rem' }}>
                                                    {user?.email ?? ''}
                                                </div>
                                            </div>
                                            <Link
                                                href={settingsHref}
                                                onClick={() => setProfileOpen(false)}
                                                style={{
                                                    display: 'block',
                                                    padding: '0.75rem 1rem',
                                                    color: 'var(--cds-text-primary)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                Settings
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </HeaderGlobalBar>
                        </Header>

                        <Suspense fallback={<div style={{ position: 'fixed', top: '3rem', left: 0, bottom: 0, width: '16rem', background: 'var(--cds-layer-01)', borderRight: '1px solid var(--cds-border-subtle)' }} />}>
                            <AppSideNav
                                isSideNavExpanded={isSideNavExpanded}
                                user={user}
                                currentUrl={currentUrl}
                            />
                        </Suspense>

                        <Content style={{ paddingTop: '3rem', marginLeft: '16rem', minHeight: '100vh', background: 'var(--cds-background)' }}>
                            {header && (
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderBottom: '1px solid var(--cds-border-subtle)',
                                    background: 'var(--cds-layer-01)',
                                }}>
                                    {header}
                                </div>
                            )}

                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                {children}
                            </div>
                        </Content>
                    </>
                )}
            />
        </>
    );
}
