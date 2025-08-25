import { urlToPageHeader, urlToBreadcrumbs } from './urlToPageHeader';

describe('urlToPageHeader', () => {
	describe('basic functionality', () => {
		test.each([
			// Team-only URLs (length = 3) - should use simple heading logic
			['http://localhost:5173/team/devteam', { breadcrumbs: [], heading: 'devteam' }],
			['http://localhost:5173/team/myteam', { breadcrumbs: [], heading: 'myteam' }],
			
			// Team + resource type URLs (length = 4) - should use label lookup for heading
			[
				'http://localhost:5173/team/devteam/applications',
				{ breadcrumbs: [{ label: 'devteam', href: '/team/devteam' }], heading: 'Applications' }
			],
			[
				'http://localhost:5173/team/devteam/secrets',
				{ breadcrumbs: [{ label: 'devteam', href: '/team/devteam' }], heading: 'Secrets' }
			],

			// Full resource URLs with environment tags (length = 6) - should use simple heading logic + tag
			[
				'http://localhost:5173/team/devteam/prod/bucket/backup',
				{
					breadcrumbs: [
						{ label: 'devteam', href: '/team/devteam' },
						{ label: 'Buckets', href: '/team/devteam/buckets' }
					],
					heading: 'backup',
					tag: { label: 'prod', variant: 'info-moderate' }
				}
			],
			[
				'http://localhost:5173/team/devteam/dev/app/app-w-all-storage',
				{
					breadcrumbs: [
						{ label: 'devteam', href: '/team/devteam' },
						{ label: 'Applications', href: '/team/devteam/applications' }
					],
					heading: 'app-w-all-storage',
					tag: { label: 'dev', variant: 'neutral-filled' }
				}
			],

			// Resource detail pages (length = 7) - should use label lookup for heading + tag
			[
				'http://localhost:5173/team/devteam/dev/job/dataproduct-apps-topics/logs',
				{
					breadcrumbs: [
						{ label: 'devteam', href: '/team/devteam' },
						{ label: 'Jobs', href: '/team/devteam/jobs' },
						{
							label: 'dataproduct-apps-topics',
							href: '/team/devteam/dev/job/dataproduct-apps-topics'
						}
					],
					heading: 'Logs',
					tag: { label: 'dev', variant: 'neutral-filled' }
				}
			],
			[
				'http://localhost:5173/team/devteam/dev/app/app-w-all-storage/manifest',
				{
					breadcrumbs: [
						{ label: 'devteam', href: '/team/devteam' },
						{ label: 'Applications', href: '/team/devteam/applications' },
						{ label: 'app-w-all-storage', href: '/team/devteam/dev/app/app-w-all-storage' }
					],
					heading: 'Manifest',
					tag: { label: 'dev', variant: 'neutral-filled' }
				}
			]
		])('should handle URL pattern: %s', (url, expected) => {
			expect(urlToPageHeader(new URL(url))).toEqual(expected);
		});
	});

	describe('heading logic', () => {
		test('should use simple heading for path length 3 (team only)', () => {
			const result = urlToPageHeader(new URL('http://localhost:5173/team/myteam'));
			expect(result.heading).toBe('myteam');
		});

		test('should use simple heading for path length 6 (team/env/type/resource)', () => {
			const result = urlToPageHeader(new URL('http://localhost:5173/team/devteam/prod/app/myapp'));
			expect(result.heading).toBe('myapp');
		});

		test('should use label lookup for other path lengths', () => {
			// Length 4: team/type
			const result4 = urlToPageHeader(new URL('http://localhost:5173/team/devteam/job'));
			expect(result4.heading).toBe('Jobs');

			// Length 7: team/env/type/resource/subpage
			const result7 = urlToPageHeader(new URL('http://localhost:5173/team/devteam/dev/app/myapp/logs'));
			expect(result7.heading).toBe('Logs');
		});

		test('should handle unknown resource types gracefully', () => {
			const result = urlToPageHeader(new URL('http://localhost:5173/team/devteam/unknown-type'));
			expect(result.heading).toBe('Unknown-type');
		});
	});

	describe('tag logic', () => {
		test('should include tag for paths longer than 5 segments', () => {
			const result = urlToPageHeader(new URL('http://localhost:5173/team/devteam/prod/app/myapp'));
			expect(result.tag).toEqual({
				label: 'prod',
				variant: 'info-moderate'
			});
		});

		test('should not include tag for paths with 5 or fewer segments', () => {
			const shortPath = urlToPageHeader(new URL('http://localhost:5173/team/devteam'));
			expect(shortPath.tag).toBeUndefined();

			const mediumPath = urlToPageHeader(new URL('http://localhost:5173/team/devteam/applications'));
			expect(mediumPath.tag).toBeUndefined();
		});

		test('should handle different environment types', () => {
			const devResult = urlToPageHeader(new URL('http://localhost:5173/team/devteam/dev/app/myapp'));
			expect(devResult.tag?.variant).toBe('neutral-filled');

			const prodResult = urlToPageHeader(new URL('http://localhost:5173/team/devteam/prod/app/myapp'));
			expect(prodResult.tag?.variant).toBe('info-moderate');
		});
	});

	describe('edge cases', () => {
		test('should handle empty path segments gracefully', () => {
			const result = urlToPageHeader(new URL('http://localhost:5173/team/devteam//app/'));
			expect(result.heading).toBe('');
		});

		test('should handle minimal valid paths', () => {
			const result = urlToPageHeader(new URL('http://localhost:5173/team/'));
			expect(result.heading).toBe('');
			expect(result.breadcrumbs).toEqual([]);
		});

		test('should handle special characters in team and resource names', () => {
			const result = urlToPageHeader(new URL('http://localhost:5173/team/my-team/prod/app/my-app-v2'));
			expect(result.heading).toBe('my-app-v2');
			expect(result.breadcrumbs[0].label).toBe('my-team');
		});
	});
});

describe('urlToBreadcrumbs', () => {
	describe('breadcrumb generation', () => {
		test.each([
			// No breadcrumbs for short paths
			['http://localhost:5173/team/devteam', []],
			['http://localhost:5173/team/', []],
			
			// Single breadcrumb for team + type
			[
				'http://localhost:5173/team/devteam/applications',
				[{ label: 'devteam', href: '/team/devteam' }]
			],
			
			// Two breadcrumbs for full resource path
			[
				'http://localhost:5173/team/devteam/prod/app/myapp',
				[
					{ label: 'devteam', href: '/team/devteam' },
					{ label: 'Applications', href: '/team/devteam/applications' }
				]
			],
			
			// Three breadcrumbs for resource detail pages
			[
				'http://localhost:5173/team/devteam/dev/bucket/backup/logs',
				[
					{ label: 'devteam', href: '/team/devteam' },
					{ label: 'Buckets', href: '/team/devteam/buckets' },
					{ label: 'backup', href: '/team/devteam/dev/bucket/backup' }
				]
			]
		])('should generate correct breadcrumbs for %s', (url, expected) => {
			expect(urlToBreadcrumbs(new URL(url))).toEqual(expected);
		});

		test('should handle special confirm_delete case', () => {
			const result = urlToBreadcrumbs(new URL('http://localhost:5173/team/devteam/settings/confirm_delete'));
			expect(result).toEqual([{ label: 'devteam', href: '/team/devteam' }]);
		});
	});
});

// Example usage for documentation and demonstration purposes
describe('usage examples', () => {
	test('example: team overview page', () => {
		const url = new URL('http://localhost:5173/team/my-awesome-team');
		const result = urlToPageHeader(url);
		
		// Should show team name as heading with no breadcrumbs or tags
		expect(result).toEqual({
			breadcrumbs: [],
			heading: 'my-awesome-team',
			// no tag property for team-only URLs
		});
	});

	test('example: resource type listing page', () => {
		const url = new URL('http://localhost:5173/team/backend-team/applications');
		const result = urlToPageHeader(url);
		
		// Should show resource type as heading with team breadcrumb
		expect(result).toEqual({
			breadcrumbs: [{ label: 'backend-team', href: '/team/backend-team' }],
			heading: 'Applications'
			// no tag property for type listing URLs
		});
	});

	test('example: specific resource in environment', () => {
		const url = new URL('http://localhost:5173/team/data-team/prod/postgres/user-database');
		const result = urlToPageHeader(url);
		
		// Should show resource name as heading with team/type breadcrumbs and environment tag
		expect(result).toEqual({
			breadcrumbs: [
				{ label: 'data-team', href: '/team/data-team' },
				{ label: 'Postgres Instances', href: '/team/data-team/postgres' }
			],
			heading: 'user-database',
			tag: { label: 'prod', variant: 'info-moderate' }
		});
	});

	test('example: resource detail page', () => {
		const url = new URL('http://localhost:5173/team/frontend-team/dev/app/dashboard-ui/manifest');
		const result = urlToPageHeader(url);
		
		// Should show detail page name as heading with full breadcrumb trail and environment tag
		expect(result).toEqual({
			breadcrumbs: [
				{ label: 'frontend-team', href: '/team/frontend-team' },
				{ label: 'Applications', href: '/team/frontend-team/applications' },
				{ label: 'dashboard-ui', href: '/team/frontend-team/dev/app/dashboard-ui' }
			],
			heading: 'Manifest',
			tag: { label: 'dev', variant: 'neutral-filled' }
		});
	});
});
