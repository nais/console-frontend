import { urlToPageHeader } from './urlToPageHeader';

describe('urlToBreadcrumbs', () => {
	test.each([
		['http://localhost:5173/team/devteam', { breadcrumbs: [], heading: 'devteam' }],
		[
			'http://localhost:5173/team/devteam/applications',
			{ breadcrumbs: [{ label: 'devteam', href: '/team/devteam' }], heading: 'Applications' }
		],

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
			'http://localhost:5173/team/devteam/prod/job/dataproduct-apps-topics',
			{
				breadcrumbs: [
					{ label: 'devteam', href: '/team/devteam' },
					{ label: 'Jobs', href: '/team/devteam/jobs' }
				],
				heading: 'dataproduct-apps-topics',
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
	])('%s', (url, expected) => {
		expect(urlToPageHeader(new URL(url))).toEqual(expected);
	});
});
