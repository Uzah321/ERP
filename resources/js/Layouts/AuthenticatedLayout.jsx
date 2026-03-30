import React, { useState, memo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Header,
    HeaderContainer,
    HeaderGlobalAction,
    HeaderGlobalBar,
    HeaderMenuButton,
    HeaderName,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    Content,
    OverflowMenu,
    OverflowMenuItem,
    Search,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from '@carbon/react';
import {
    Grid,
    ArrowsHorizontal,
    Document,
    Finance,
    ShoppingCart,
    Package,
    Receipt,
    ChartBar,
    TaskTools,
    Application,
    TrashCan,
    Recycle,
    Dashboard,
    Time,
    Building,
    Report,
    Settings,
    UserMultiple,
    Location,
    Category,
    Enterprise,
    Security,
    Archive,
    Catalog,
    Home,
    Help,
    UserAvatarFilled,
    Logout,
} from '@carbon/icons-react';

// Memoized sidebar nav — only re-renders when user role or current URL changes
const AppSideNav = memo(function AppSideNav({ isSideNavExpanded, user, currentUrl }) {
    const isInSection = (...prefixes) => prefixes.some(p => currentUrl.includes(p));

    return (
        <SideNav
            aria-label="Side navigation"
            expanded={isSideNavExpanded}
            isPersistent
        >
            <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
                <Search
                    size="sm"
                    placeholder="Search..."
                    labelText="Search navigation"
                    closeButtonLabelText="Clear search"
                />
            </div>

            <SideNavItems>

                {/* MAIN */}
                <SideNavMenu
                    renderIcon={Grid}
                    title="Main"
                    defaultExpanded
                    isActive={isInSection('/dashboard', '/transfers', '/allocations', '/asset-requests')}
                >
                    <SideNavMenuItem
                        href={route('dashboard')}
                        isActive={currentUrl.includes('/dashboard')}
                    >
                        Asset Register
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('transfers.index')}
                        isActive={currentUrl.includes('/transfers')}
                    >
                        Asset Transfers
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('admin.allocations.index')}
                        isActive={currentUrl.includes('/allocations')}
                    >
                        Asset Allocations
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('asset-requests.index')}
                        isActive={currentUrl.includes('/asset-requests')}
                    >
                        Asset Requests
                    </SideNavMenuItem>
                </SideNavMenu>

                {/* PROCUREMENT (admin only) */}
                {user?.role === 'admin' && (
                    <SideNavMenu
                        renderIcon={ShoppingCart}
                        title="Procurement"
                        defaultExpanded={isInSection('/capex', '/purchase-orders', '/goods-receipts', '/invoices', '/budget')}
                        isActive={isInSection('/capex', '/purchase-orders', '/goods-receipts', '/invoices', '/budget')}
                    >
                        <SideNavMenuItem
                            href={route('admin.capex.index')}
                            isActive={currentUrl.includes('/capex')}
                        >
                            CAPEX Forms
                        </SideNavMenuItem>
                        <SideNavMenuItem
                            href={route('purchase-orders.index')}
                            isActive={currentUrl.includes('/purchase-orders')}
                        >
                            Purchase Orders
                        </SideNavMenuItem>
                        <SideNavMenuItem
                            href={route('goods-receipts.index')}
                            isActive={currentUrl.includes('/goods-receipts')}
                        >
                            Goods Receipts
                        </SideNavMenuItem>
                        <SideNavMenuItem
                            href={route('invoices.index')}
                            isActive={currentUrl.includes('/invoices')}
                        >
                            Invoices &amp; Payments
                        </SideNavMenuItem>
                        <SideNavMenuItem
                            href={route('admin.budget-tracking')}
                            isActive={currentUrl.includes('/budget')}
                        >
                            Budget vs. Actual
                        </SideNavMenuItem>
                    </SideNavMenu>
                )}

                {/* OPERATIONS */}
                <SideNavMenu
                    renderIcon={TaskTools}
                    title="Operations"
                    defaultExpanded={isInSection('/audit', '/maintenance', '/software', '/decommission', '/disposal')}
                    isActive={isInSection('/audit', '/maintenance', '/software', '/decommission', '/disposal')}
                >
                    <SideNavMenuItem
                        href={route('audit.index')}
                        isActive={currentUrl.includes('/audit')}
                    >
                        Audit &amp; Inventory
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('maintenance.index')}
                        isActive={currentUrl.includes('/maintenance')}
                    >
                        Maintenance Tracking
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('admin.software-licences.index')}
                        isActive={currentUrl.includes('/software')}
                    >
                        Software Licences
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('decommission.log')}
                        isActive={currentUrl.includes('/decommission')}
                    >
                        Decommission Log
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('disposal.log')}
                        isActive={currentUrl.includes('/disposal')}
                    >
                        Disposal Certificates
                    </SideNavMenuItem>
                </SideNavMenu>

                {/* REPORTS */}
                <SideNavMenu
                    renderIcon={Report}
                    title="Reports &amp; Analytics"
                    defaultExpanded={isInSection('/admin/dashboard', '/activity-log', '/department-rollup', '/reports')}
                    isActive={isInSection('/admin/dashboard', '/activity-log', '/department-rollup', '/reports')}
                >
                    {user?.role === 'admin'
                        ? (
                            <SideNavMenuItem
                                href={route('admin.dashboard')}
                                isActive={currentUrl.includes('/admin/dashboard')}
                            >
                                Executive Summary
                            </SideNavMenuItem>
                        ) : (
                            <SideNavMenuItem isActive={false} aria-disabled="true" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                Executive Summary
                            </SideNavMenuItem>
                        )
                    }
                    <SideNavMenuItem
                        href={route('activity-log.index')}
                        isActive={currentUrl.includes('/activity-log')}
                    >
                        Activity Log
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('department.rollup')}
                        isActive={currentUrl.includes('/department-rollup')}
                    >
                        Department Rollup
                    </SideNavMenuItem>
                    <SideNavMenuItem
                        href={route('reports.index')}
                        isActive={currentUrl.includes('/reports')}
                    >
                        Export Reports
                    </SideNavMenuItem>
                </SideNavMenu>

                {/* SETTINGS */}
                <SideNavMenu
                    renderIcon={Settings}
                    title="Settings"
                    defaultExpanded={isInSection('/users', '/departments', '/categories', '/locations', '/vendors', '/position-specs', '/archive', '/two-factor')}
                    isActive={isInSection('/users', '/departments', '/categories', '/locations', '/vendors', '/position-specs', '/archive', '/two-factor')}
                >
                    {user?.role === 'admin' && (
                        <>
                            <SideNavMenuItem href={route('admin.users.index')} isActive={currentUrl.includes('/users')}>User Management</SideNavMenuItem>
                            <SideNavMenuItem href={route('admin.departments.index')} isActive={currentUrl.includes('/departments')}>Departments</SideNavMenuItem>
                            <SideNavMenuItem href={route('admin.categories.index')} isActive={currentUrl.includes('/categories')}>Categories</SideNavMenuItem>
                            <SideNavMenuItem href={route('admin.locations.index')} isActive={currentUrl.includes('/locations')}>Locations</SideNavMenuItem>
                            <SideNavMenuItem href={route('admin.vendors.index')} isActive={currentUrl.includes('/vendors')}>Vendors</SideNavMenuItem>
                            <SideNavMenuItem href={route('admin.position-specs.index')} isActive={currentUrl.includes('/position-specs')}>Position Specifications</SideNavMenuItem>
                            <SideNavMenuItem href={route('archive.utilities')} isActive={currentUrl.includes('/archive')}>Archive Utilities</SideNavMenuItem>
                        </>
                    )}
                    <SideNavMenuItem href={route('two-factor.setup')} isActive={currentUrl.includes('/two-factor')}>Two-Factor Auth</SideNavMenuItem>
                </SideNavMenu>

            </SideNavItems>

            {/* Pinned user card */}
            <div style={{
                borderTop: '1px solid var(--cds-border-subtle)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
            }}>
                <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    background: 'var(--cds-interactive)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                }}>
                    {(user?.name?.charAt(0) ?? 'G').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name ?? 'Guest'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', margin: 0, textTransform: 'capitalize' }}>
                        {user?.role ?? '—'}
                    </p>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    title="Log out"
                    style={{ padding: '0.25rem', color: 'var(--cds-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                    <Logout size={16} />
                </Link>
            </div>
        </SideNav>
    );
});

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
                            <HeaderName href={route('dashboard')} prefix="">
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
                                    <Link href={route('profile.edit')} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--cds-text-primary)', textDecoration: 'none' }}>
                                        Profile
                                    </Link>
                                </OverflowMenu>
                            </HeaderGlobalBar>
                        </Header>

                        <AppSideNav
                            isSideNavExpanded={isSideNavExpanded}
                            user={user}
                            currentUrl={currentUrl}
                        />

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
