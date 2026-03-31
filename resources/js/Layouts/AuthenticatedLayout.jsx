import React, { Suspense, lazy, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Header,
    HeaderContainer,
    HeaderGlobalAction,
    HeaderGlobalBar,
    HeaderMenuButton,
    HeaderName,
    Content,
    OverflowMenu,
    Modal,
} from '@carbon/react';
import {
    Home,
    Help,
} from '@carbon/icons-react';
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

    const [activeFeatureModal, setActiveFeatureModal] = useState(null);

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
                                href={route('dashboard')}
                                prefix=""
                                onClick={(event) => navigateWithoutReload(event, route('dashboard'))}
                                onMouseEnter={() => prefetchPage(route('dashboard'))}
                                onFocus={() => prefetchPage(route('dashboard'))}
                            >
                                ASSET<span style={{ fontWeight: 300, color: 'var(--cds-link-primary)' }}>LINQ</span>
                            </HeaderName>

                            <HeaderGlobalBar>
                                <HeaderGlobalAction
                                    aria-label="Home"
                                    tooltipAlignment="center"
                                    onClick={() => setActiveFeatureModal('Home Hub')}
                                >
                                    <Home size={20} />
                                </HeaderGlobalAction>
                                <HeaderGlobalAction
                                    aria-label="Help"
                                    tooltipAlignment="center"
                                    onClick={() => setActiveFeatureModal('Help & Documentation')}
                                >
                                    <Help size={20} />
                                </HeaderGlobalAction>

                                {/* User menu */}
                                <OverflowMenu
                                    renderIcon={() => (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
                                            <div style={{
                                                width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                                                background: 'var(--cds-interactive)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontWeight: 700, fontSize: '0.7rem',
                                            }}>
                                                {(user?.name?.charAt(0) ?? 'G').toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-inverse)' }}>
                                                {user?.name ?? 'Guest'}
                                            </span>
                                        </div>
                                    )}
                                    menuOffset={{ top: 0, left: 0 }}
                                    flipped
                                    selectorPrimaryFocus=""
                                    iconDescription="User menu"
                                >
                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--cds-border-subtle-01)', fontSize: '0.75rem' }}>
                                        <p style={{ color: 'var(--cds-text-secondary)', margin: 0 }}>Signed in as</p>
                                        <p style={{ fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user?.email ?? ''}
                                        </p>
                                    </div>
                                    <Link prefetch={['hover', 'click']} href={route('settings.index')} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--cds-text-primary)', textDecoration: 'none' }}>
                                        Settings
                                    </Link>
                                </OverflowMenu>
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

            {/* Coming Soon Modal */}
            <Modal
                open={!!activeFeatureModal}
                modalHeading="Module Under Construction"
                primaryButtonText="Got it, thanks!"
                onRequestClose={() => setActiveFeatureModal(null)}
                onRequestSubmit={() => setActiveFeatureModal(null)}
                size="sm"
            >
                <p style={{ marginBottom: '1rem' }}>
                    The <strong>{activeFeatureModal}</strong> functionality is currently being built
                    and will be available in a future update.
                </p>
            </Modal>
        </>
    );
}
