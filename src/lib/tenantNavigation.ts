export interface TenantNavigationItem {
	href: string;
	label: string;
	active: boolean;
	error?: string;
}

const links = [
	{ href: '/vulnerabilities', label: 'Vulnerabilities' },
	{ href: '/cost', label: 'Cost' },
	{ href: '/utilization', label: 'Utilization' },
	{ href: '/activity-log', label: 'Activity Log' }
];

export function tenantNavigation(
	pathname: string,
	isAdmin = false,
	reconcilerErrors = false
): TenantNavigationItem[] {
	return [
		...links,
		...(isAdmin
			? [
					{
						href: '/admin',
						label: 'Admin',
						...(reconcilerErrors ? { error: 'Reconcilers have errors' } : {})
					}
				]
			: [])
	].map((item) => ({
		...item,
		active: pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
	}));
}
