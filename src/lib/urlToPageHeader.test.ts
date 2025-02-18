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
					{ label: 'prod' },
					{ label: 'Buckets', href: '/team/devteam/buckets' }
				],
				heading: 'backup'
			}
		],
		[
			'http://localhost:5173/team/devteam/prod/job/dataproduct-apps-topics',
			{
				breadcrumbs: [
					{ label: 'devteam', href: '/team/devteam' },
					{ label: 'prod' },
					{ label: 'Jobs', href: '/team/devteam/jobs' }
				],
				heading: 'dataproduct-apps-topics'
			}
		],
		[
			'http://localhost:5173/team/devteam/dev/app/app-w-all-storage',
			{
				breadcrumbs: [
					{ label: 'devteam', href: '/team/devteam' },
					{ label: 'dev' },
					{ label: 'Applications', href: '/team/devteam/applications' }
				],
				heading: 'app-w-all-storage'
			}
		],
		[
			'http://localhost:5173/team/devteam/dev/job/dataproduct-apps-topics/logs',
			{
				breadcrumbs: [
					{ label: 'devteam', href: '/team/devteam' },
					{ label: 'dev' },
					{ label: 'Jobs', href: '/team/devteam/jobs' },
					{
						label: 'dataproduct-apps-topics',
						href: '/team/devteam/dev/job/dataproduct-apps-topics'
					}
				],
				heading: 'Logs'
			}
		],
		[
			'http://localhost:5173/team/devteam/dev/app/app-w-all-storage/manifest',
			{
				breadcrumbs: [
					{ label: 'devteam', href: '/team/devteam' },
					{ label: 'dev' },
					{ label: 'Applications', href: '/team/devteam/applications' },
					{ label: 'app-w-all-storage', href: '/team/devteam/dev/app/app-w-all-storage' }
				],
				heading: 'Manifest'
			}
		]
	])('%s', (url, expected) => {
		expect(urlToPageHeader(new URL(url))).toEqual(expected);
	});
});
