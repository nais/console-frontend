import { pathToFavoriteLabel, urlToPageHeader } from './urlToPageHeader';

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
		],
		[
			'http://localhost:5173/team/teampam/prod-gcp/valkey/valkey-teampam-stillingsok/insights',
			{
				breadcrumbs: [
					{ label: 'teampam', href: '/team/teampam' },
					{ label: 'Valkey Instances', href: '/team/teampam/valkey' },
					{
						label: 'valkey-teampam-stillingsok',
						href: '/team/teampam/prod-gcp/valkey/valkey-teampam-stillingsok'
					}
				],
				heading: 'Insights for valkey-teampam-stillingsok',
				tag: { label: 'prod-gcp', variant: 'info-moderate' }
			}
		],
		[
			'http://localhost:5173/team/myteam/dev/opensearch/search-instance/insights',
			{
				breadcrumbs: [
					{ label: 'myteam', href: '/team/myteam' },
					{ label: 'OpenSearch Instances', href: '/team/myteam/opensearch' },
					{ label: 'search-instance', href: '/team/myteam/dev/opensearch/search-instance' }
				],
				heading: 'Insights for search-instance',
				tag: { label: 'dev', variant: 'neutral-filled' }
			}
		],
		[
			'http://localhost:5173/team/myteam/dev/kafka/my-topic/insights',
			{
				breadcrumbs: [
					{ label: 'myteam', href: '/team/myteam' },
					{ label: 'Kafka Topics', href: '/team/myteam/kafka' },
					{ label: 'my-topic', href: '/team/myteam/dev/kafka/my-topic' }
				],
				heading: 'Insights for my-topic',
				tag: { label: 'dev', variant: 'neutral-filled' }
			}
		]
	])('%s', (url, expected) => {
		expect(urlToPageHeader(new URL(url))).toEqual(expected);
	});
});

describe('pathToFavoriteLabel', () => {
	test.each([
		['/team/devteam', 'devteam'],
		['/team/devteam/applications', 'devteam · Applications'],
		['/team/devteam/prod/app/myapp', 'devteam · prod · Applications · myapp'],
		[
			'/team/teampam/prod-gcp/valkey/valkey-teampam-stillingsok/insights',
			'teampam · prod-gcp · Valkey Instances · valkey-teampam-stillingsok · Insights'
		],
		[
			'/team/myteam/dev/opensearch/search-instance/insights',
			'myteam · dev · OpenSearch Instances · search-instance · Insights'
		],
		[
			'/team/myteam/dev/kafka/my-topic/insights',
			'myteam · dev · Kafka Topics · my-topic · Insights'
		]
	])('%s should return "%s"', (path, expected) => {
		expect(pathToFavoriteLabel(path)).toEqual(expected);
	});
});
