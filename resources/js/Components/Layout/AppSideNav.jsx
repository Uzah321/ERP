import React, { memo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    Search,
} from '@carbon/react';
import {
    Grid,
    ShoppingCart,
    TaskTools,
    Report,
    Settings,
    Logout,
} from '@carbon/icons-react';

const prefetchPage = (href) => {
    router.prefetch(href, {}, { method: 'get' });
};

function SideNavInertiaItem({ href, children, ...props }) {
    const handleClick = (event) => {
        event.preventDefault();
        router.visit(href);
    };

    const handlePrefetch = () => {
        prefetchPage(href);
    };

    return (
        <SideNavMenuItem
            href={href}
            onClick={handleClick}
            onMouseEnter={handlePrefetch}
            onFocus={handlePrefetch}
            {...props}
        >
            {children}
        </SideNavMenuItem>
    );
}

const AppSideNav = memo(function AppSideNav({ isSideNavExpanded, user, currentUrl }) {
    const isInSection = (...prefixes) => prefixes.some((prefix) => currentUrl.includes(prefix));
    const isAdmin = user?.role === 'admin';
    const isExecutive = user?.role === 'executive';
    const canAccessProcurement = isAdmin || isExecutive;
    const roleLabel = isExecutive ? 'Executive Access' : isAdmin ? 'Admin Access' : 'User Access';

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
                <SideNavMenu
                    renderIcon={Grid}
                    title="Asset Management"
                    defaultExpanded
                    isActive={isInSection('/asset-management', '/transfers', '/allocations', '/asset-requests')}
                >
                    <SideNavInertiaItem
                        href={route('asset-management.index')}
                        isActive={currentUrl.includes('/asset-management')}
                    >
                        Asset Register
                    </SideNavInertiaItem>
                    {isAdmin && (
                        <SideNavInertiaItem
                            href={route('admin.allocations.index')}
                            isActive={currentUrl.includes('/allocations') || currentUrl.includes('/transfers')}
                        >
                            Asset Allocation
                        </SideNavInertiaItem>
                    )}
                    {isAdmin && (
                        <SideNavInertiaItem
                            href={route('asset-requests.index')}
                            isActive={currentUrl.includes('/asset-requests')}
                        >
                            Asset Requests Review
                        </SideNavInertiaItem>
                    )}
                </SideNavMenu>

                {canAccessProcurement && (
                    <SideNavMenu
                        renderIcon={ShoppingCart}
                        title="Procurement"
                        defaultExpanded={isInSection('/procurement', '/capex', '/purchase-orders', '/goods-receipts', '/invoices', '/budget')}
                        isActive={isInSection('/procurement', '/capex', '/purchase-orders', '/goods-receipts', '/invoices', '/budget')}
                    >
                        <SideNavInertiaItem
                            href={route('procurement.dashboard')}
                            isActive={currentUrl.includes('/procurement/dashboard')}
                        >
                            Procurement Hub
                        </SideNavInertiaItem>
                        <SideNavInertiaItem
                            href={route('procurement.pending')}
                            isActive={currentUrl.includes('/procurement/pending')}
                        >
                            Pending Queue
                        </SideNavInertiaItem>
                    </SideNavMenu>
                )}

                <SideNavMenu
                    renderIcon={TaskTools}
                    title="Operations"
                    defaultExpanded={isInSection('/operations/store-management', '/audit', '/maintenance', '/software', '/decommission', '/disposal')}
                    isActive={isInSection('/operations/store-management', '/audit', '/maintenance', '/software', '/decommission', '/disposal')}
                >
                    <SideNavInertiaItem
                        href={route('store-management.index')}
                        isActive={currentUrl.includes('/operations/store-management')}
                    >
                        Store Management
                    </SideNavInertiaItem>
                    <SideNavInertiaItem
                        href={route('audit.index')}
                        isActive={currentUrl.includes('/audit')}
                    >
                        Audit &amp; Inventory
                    </SideNavInertiaItem>
                    <SideNavInertiaItem
                        href={route('maintenance.index')}
                        isActive={currentUrl.includes('/maintenance')}
                    >
                        Maintenance Tracking
                    </SideNavInertiaItem>
                    {isAdmin && (
                        <SideNavInertiaItem
                            href={route('admin.software-licences.index')}
                            isActive={currentUrl.includes('/software')}
                        >
                            Software Licences
                        </SideNavInertiaItem>
                    )}
                    <SideNavInertiaItem
                        href={route('decommission.log')}
                        isActive={currentUrl.includes('/decommission')}
                    >
                        Decommission Log
                    </SideNavInertiaItem>
                    <SideNavInertiaItem
                        href={route('disposal.log')}
                        isActive={currentUrl.includes('/disposal')}
                    >
                        Disposal Certificates
                    </SideNavInertiaItem>
                </SideNavMenu>

                <SideNavMenu
                    renderIcon={Report}
                    title="Reports &amp; Analytics"
                    defaultExpanded={isInSection('/executive/dashboard', '/admin/dashboard', '/activity-log', '/department-rollup', '/reports')}
                    isActive={isInSection('/executive/dashboard', '/admin/dashboard', '/activity-log', '/department-rollup', '/reports')}
                >
                    {isExecutive && (
                        <SideNavInertiaItem
                            href={route('executive.dashboard')}
                            isActive={currentUrl.includes('/executive/dashboard')}
                        >
                            Executive Summary
                        </SideNavInertiaItem>
                    )}
                    <SideNavInertiaItem
                        href={route('activity-log.index')}
                        isActive={currentUrl.includes('/activity-log')}
                    >
                        Activity Log
                    </SideNavInertiaItem>
                    <SideNavInertiaItem
                        href={route('department.rollup')}
                        isActive={currentUrl.includes('/department-rollup')}
                    >
                        Department Rollup
                    </SideNavInertiaItem>
                    <SideNavInertiaItem
                        href={route('reports.index')}
                        isActive={currentUrl.includes('/reports')}
                    >
                        Export Reports
                    </SideNavInertiaItem>
                </SideNavMenu>

                <SideNavMenu
                    renderIcon={Settings}
                    title="Settings"
                    defaultExpanded={isInSection('/settings', '/users', '/departments', '/categories', '/locations', '/vendors', '/position-specs', '/archive', '/two-factor')}
                    isActive={isInSection('/settings', '/users', '/departments', '/categories', '/locations', '/vendors', '/position-specs', '/archive', '/two-factor')}
                >
                    <SideNavInertiaItem href={route('settings.index')} isActive={currentUrl.includes('/settings')}>Settings Hub</SideNavInertiaItem>
                </SideNavMenu>
            </SideNavItems>

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
                        {roleLabel}
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

export default AppSideNav;