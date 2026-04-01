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
    Enterprise,
    Logout,
} from '@carbon/icons-react';
import { safeRoute } from '@/utils/ziggy';

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
    const isPrivileged = isAdmin || isExecutive;
    const canAccessProcurement = isAdmin || isExecutive;
    const roleLabel = isExecutive ? 'Executive Access' : isAdmin ? 'Admin Access' : 'User Access';
    const assetManagementHref = safeRoute('asset-management.index');
    const adminAllocationsHref = safeRoute('admin.allocations.index');
    const assetRequestsHref = safeRoute('asset-requests.index');
    const procurementDashboardHref = safeRoute('procurement.dashboard');
    const procurementPendingHref = safeRoute('procurement.pending');
    const storeManagementHref = safeRoute('store-management.index');
    const auditHref = safeRoute('audit.index');
    const maintenanceHref = safeRoute('maintenance.index');
    const softwareLicencesHref = safeRoute('admin.software-licences.index');
    const decommissionHref = safeRoute('decommission.log');
    const disposalHref = safeRoute('disposal.log');
    const executiveDashboardHref = safeRoute('executive.dashboard');
    const activityLogHref = safeRoute('activity-log.index');
    const departmentRollupHref = safeRoute('department.rollup');
    const reportsHref = safeRoute('reports.index');
    const settingsHref = safeRoute('settings.index');
    const categoriesHref = safeRoute('admin.categories.index');
    const departmentsHref = safeRoute('admin.departments.index');
    const logoutHref = safeRoute('logout');

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
                    isActive={isInSection('/asset-management', '/transfers', '/allocations', '/asset-requests', '/audit', '/categories')}
                >
                    {assetManagementHref && (
                    <SideNavInertiaItem
                        href={assetManagementHref}
                        isActive={currentUrl.includes('/asset-management')}
                    >
                        Asset Register
                    </SideNavInertiaItem>
                    )}
                    {isPrivileged && adminAllocationsHref && (
                        <SideNavInertiaItem
                            href={adminAllocationsHref}
                            isActive={currentUrl.includes('/allocations') || currentUrl.includes('/transfers')}
                        >
                            Asset Allocation
                        </SideNavInertiaItem>
                    )}
                    {isPrivileged && assetRequestsHref && (
                        <SideNavInertiaItem
                            href={assetRequestsHref}
                            isActive={currentUrl.includes('/asset-requests')}
                        >
                            Asset Requests Review
                        </SideNavInertiaItem>
                    )}
                    {auditHref && (
                    <SideNavInertiaItem
                        href={auditHref}
                        isActive={currentUrl.includes('/audit')}
                    >
                        Asset Verification
                    </SideNavInertiaItem>
                    )}
                    {categoriesHref && (
                    <SideNavInertiaItem 
                        href={categoriesHref} 
                        isActive={currentUrl.includes('/categories')}
                    >
                        Asset Categories
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
                        {procurementDashboardHref && (
                        <SideNavInertiaItem
                            href={procurementDashboardHref}
                            isActive={currentUrl.includes('/procurement/dashboard')}
                        >
                            Procurement Hub
                        </SideNavInertiaItem>
                        )}
                        {procurementPendingHref && (
                        <SideNavInertiaItem
                            href={procurementPendingHref}
                            isActive={currentUrl.includes('/procurement/pending')}
                        >
                            Pending Queue
                        </SideNavInertiaItem>
                        )}
                    </SideNavMenu>
                )}

                <SideNavMenu
                    renderIcon={TaskTools}
                    title="Operations"
                    defaultExpanded={isInSection('/operations/store-management', '/maintenance')}
                    isActive={isInSection('/operations/store-management', '/maintenance')}
                >
                    {storeManagementHref && (
                    <SideNavInertiaItem
                        href={storeManagementHref}
                        isActive={currentUrl.includes('/operations/store-management')}
                    >
                        Store Management
                    </SideNavInertiaItem>
                    )}
                    {maintenanceHref && (
                    <SideNavInertiaItem
                        href={maintenanceHref}
                        isActive={currentUrl.includes('/maintenance')}
                    >
                        Maintenance Tracking
                    </SideNavInertiaItem>
                    )}
                </SideNavMenu>

                <SideNavMenu
                    renderIcon={Enterprise}
                    title="Head Office"
                    defaultExpanded={isInSection('/admin/departments', '/software', '/decommission', '/disposal')}
                    isActive={isInSection('/admin/departments', '/software', '/decommission', '/disposal')}
                >
                    {departmentsHref && <SideNavInertiaItem href={departmentsHref} isActive={currentUrl.includes('/admin/departments')}>Departments</SideNavInertiaItem>}
                    {isPrivileged && softwareLicencesHref && (
                        <SideNavInertiaItem
                            href={softwareLicencesHref}
                            isActive={currentUrl.includes('/software')}
                        >
                            Software Licences
                        </SideNavInertiaItem>
                    )}
                    {decommissionHref && (
                    <SideNavInertiaItem
                        href={decommissionHref}
                        isActive={currentUrl.includes('/decommission')}
                    >
                        Decommission Log
                    </SideNavInertiaItem>
                    )}
                    {disposalHref && (
                    <SideNavInertiaItem
                        href={disposalHref}
                        isActive={currentUrl.includes('/disposal')}
                    >
                        Disposal Records
                    </SideNavInertiaItem>
                    )}
                </SideNavMenu>

                <SideNavMenu
                    renderIcon={Report}
                    title="Reports &amp; Analytics"
                    defaultExpanded={isInSection('/executive/dashboard', '/admin/dashboard', '/activity-log', '/department-rollup', '/reports')}
                    isActive={isInSection('/executive/dashboard', '/admin/dashboard', '/activity-log', '/department-rollup', '/reports')}
                >
                    {isExecutive && executiveDashboardHref && (
                        <SideNavInertiaItem
                            href={executiveDashboardHref}
                            isActive={currentUrl.includes('/executive/dashboard')}
                        >
                            Executive Summary
                        </SideNavInertiaItem>
                    )}
                    {activityLogHref && (
                    <SideNavInertiaItem
                        href={activityLogHref}
                        isActive={currentUrl.includes('/activity-log')}
                    >
                        Activity Log
                    </SideNavInertiaItem>
                    )}
                    {departmentRollupHref && (
                    <SideNavInertiaItem
                        href={departmentRollupHref}
                        isActive={currentUrl.includes('/department-rollup')}
                    >
                        Department Rollup
                    </SideNavInertiaItem>
                    )}
                    {reportsHref && (
                    <SideNavInertiaItem
                        href={reportsHref}
                        isActive={currentUrl.includes('/reports')}
                    >
                        Analytics &amp; Reports
                    </SideNavInertiaItem>
                    )}
                </SideNavMenu>

                <SideNavMenu
                    renderIcon={Settings}
                    title="Settings"
                    defaultExpanded={isInSection('/settings', '/users', '/locations', '/vendors', '/position-specs', '/archive', '/two-factor')}
                    isActive={isInSection('/settings', '/users', '/locations', '/vendors', '/position-specs', '/archive', '/two-factor')}
                >
                    {settingsHref && <SideNavInertiaItem href={settingsHref} isActive={currentUrl.includes('/settings')}>Settings Hub</SideNavInertiaItem>}
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
                    href={logoutHref ?? '#'}
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
