import { describe, expect, it } from 'vitest';
import { tenantNavigation } from './tenantNavigation.js';

describe('tenantNavigation', () => {
	it('attaches reconciler errors only to the administrator link', () => {
		expect(tenantNavigation('/', true, true).filter((item) => item.error)).toEqual([
			{ href: '/admin', label: 'Admin', active: false, error: 'Reconcilers have errors' }
		]);
		expect(tenantNavigation('/', false, true).some((item) => item.error)).toBe(false);
		expect(tenantNavigation('/', true, false).some((item) => item.error)).toBe(false);
	});

	it('includes all tenant destinations and only shows Admin to administrators', () => {
		expect(tenantNavigation('/').map(({ href }) => href)).toEqual([
			'/vulnerabilities',
			'/cost',
			'/utilization',
			'/activity-log'
		]);
		expect(tenantNavigation('/admin', true).at(-1)).toEqual({
			href: '/admin',
			label: 'Admin',
			active: true
		});
		expect(tenantNavigation('/admin').some(({ href }) => href === '/admin')).toBe(false);
	});

	it.each([
		['/vulnerabilities', '/vulnerabilities'],
		['/vulnerabilities/CVE-2026-1234', '/vulnerabilities'],
		['/cost/teams', '/cost'],
		['/utilization', '/utilization'],
		['/activity-log', '/activity-log'],
		['/admin/reconcilers', '/admin']
	])('marks only the matching destination active for %s', (pathname, href) => {
		expect(
			tenantNavigation(pathname, true)
				.filter((item) => item.active)
				.map((item) => item.href)
		).toEqual([href]);
	});

	it.each(['/team/nais', '/team/nais/vulnerabilities', '/costume', '/administer'])(
		'does not activate tenant navigation for %s',
		(pathname) => {
			expect(tenantNavigation(pathname, true).some((item) => item.active)).toBe(false);
		}
	);
});
