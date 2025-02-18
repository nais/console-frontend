import { urlToBreadcrumbs } from './urlToBreadcrumbs';

describe('urlToBreadcrumbs', () => {
	test.each([
		['http://localhost:5173/team/devteam', []],
		[
			'http://localhost:5173/team/devteam/applications',
			[{ label: 'devteam', href: '/team/devteam' }]
		],

		[
			'http://localhost:5173/team/devteam/prod/bucket/backup',
			[
				{ label: 'devteam', href: '/team/devteam' },
				{ label: 'prod' },
				{ label: 'Buckets', href: '/team/devteam/buckets' }
			]
		],
		[
			'http://localhost:5173/team/devteam/prod/job/dataproduct-apps-topics',
			[
				{ label: 'devteam', href: '/team/devteam' },
				{ label: 'prod' },
				{ label: 'Jobs', href: '/team/devteam/jobs' }
			]
		],
		[
			'http://localhost:5173/team/devteam/dev/app/app-w-all-storage',
			[
				{ label: 'devteam', href: '/team/devteam' },
				{ label: 'dev' },
				{ label: 'Applications', href: '/team/devteam/applications' }
			]
		],
		[
			'http://localhost:5173/team/devteam/dev/job/dataproduct-apps-topics/logs',
			[
				{ label: 'devteam', href: '/team/devteam' },
				{ label: 'dev' },
				{ label: 'Jobs', href: '/team/devteam/jobs' },
				{ label: 'dataproduct-apps-topics', href: '/team/devteam/dev/job/dataproduct-apps-topics' }
			]
		],
		[
			'http://localhost:5173/team/devteam/dev/app/app-w-all-storage/manifest',
			[
				{ label: 'devteam', href: '/team/devteam' },
				{ label: 'dev' },
				{ label: 'Applications', href: '/team/devteam/applications' },
				{ label: 'app-w-all-storage', href: '/team/devteam/dev/app/app-w-all-storage' }
			]
		]
	])('%s', (url, expected) => {
		expect(urlToBreadcrumbs(new URL(url))).toEqual(expected);
	});
});
