import { menuItems } from './menuItems';

const features = {
	valkey: { enabled: true },
	openSearch: { enabled: true },
	kafka: { enabled: true },
	unleash: { enabled: true }
};

describe('menuItems', () => {
	describe('team menu', () => {
		test('full', () => {
			expect(
				menuItems({
					path: '/team/devteam',
					features,
					member: true,
					isAdmin: false
				})
			).toEqual([
				[{ label: 'Team Overview', href: '/team/devteam', active: true }],
				[
					{ label: 'Applications', href: '/team/devteam/applications' },
					{ label: 'Jobs', href: '/team/devteam/jobs' }
				],
				[
					{ label: 'Secrets', href: '/team/devteam/secrets' },
					{ label: 'Postgres', href: '/team/devteam/postgres' },
					{ label: 'Buckets', href: '/team/devteam/buckets' },
					{ label: 'Valkey', href: '/team/devteam/valkey' },
					{ label: 'OpenSearch', href: '/team/devteam/opensearch' },
					{ label: 'Kafka Topics', href: '/team/devteam/kafka' },
					{ label: 'BigQuery', href: '/team/devteam/bigquery' },
					{ label: 'Unleash', href: '/team/devteam/unleash' }
				],
				[
					{ label: 'Alerts', href: '/team/devteam/alerts' },
					{ label: 'Issues', href: '/team/devteam/issues' },
					{ label: 'Deployments', href: '/team/devteam/deploy' },
					{ label: 'Cost', href: '/team/devteam/cost' },
					{ label: 'Utilization', href: '/team/devteam/utilization' },
					{ label: 'Vulnerabilities', href: '/team/devteam/vulnerabilities' }
				],
				[
					{ label: 'Members', href: '/team/devteam/members' },
					{ label: 'Repositories', href: '/team/devteam/repositories' },
					{ label: 'Settings', href: '/team/devteam/settings' },
					{ label: 'Activity Log', href: '/team/devteam/activity-log' }
				]
			]);
		});

		test('secrets active for sub-pages', () => {
			expect(
				menuItems({
					path: '/team/nais/prod-gcp/secret/github-backup-config',
					member: true,
					isAdmin: false
				})
					.flatMap((g) => g)
					.find((i) => i.label === 'Secrets')?.active
			).toBe(true);
		});

		test('postgres active for sub-pages', () => {
			expect(
				menuItems({
					path: '/team/nais/prod-gcp/postgres/gemini',
					member: true,
					isAdmin: false
				})
					.flatMap((g) => g)
					.find((i) => i.label === 'Postgres')?.active
			).toBe(true);
		});

		test('valkey active for sub-pages with feature toogling', () => {
			expect(
				menuItems({
					path: '/team/nais/prod-gcp/valkey/gemini',
					features,
					member: true,
					isAdmin: false
				})
					.flatMap((g) => g)
					.find((i) => i.label === 'Valkey')?.active
			).toBe(true);
		});

		test('no features', () => {
			expect(
				menuItems({
					path: '/team/devteam/jobs',
					member: true,
					isAdmin: false
				})
					.flatMap((g) => g)
					.find((i) => ['Valkey', 'OpenSearch', 'Kafka Topics', 'Unleash'].includes(i.label))
			).toBeUndefined();
		});

		test('when not member', () => {
			expect(
				menuItems({
					path: '/team/tbd/jobs',
					features,
					member: false,
					isAdmin: false
				})
					.flatMap((g) => g)
					.find((i) => ['Secrets', 'Settings'].includes(i.label))
			).toBeUndefined();
		});

		test('inventory', () => {
			const res = menuItems({
				path: '/team/tbd/jobs',
				features,
				member: true,
				isAdmin: false,
				inventory: {
					applications: { total: 42 },
					jobs: { total: 1 },
					sqlInstances: { total: 7 },
					buckets: { total: 1337 },
					valkeys: { total: 11 },
					openSearches: { total: 17 },
					kafkaTopics: { total: 23 },
					bigQueryDatasets: { total: 49 }
				}
			});

			expect(
				res
					.flatMap((g) => g)
					.filter((i) => i.count)
					.map((i) => ({ label: i.label, count: i.count }))
			).toEqual([
				{ label: 'Applications', count: 42 },
				{ label: 'Jobs', count: 1 },
				{ label: 'Postgres', count: 7 },
				{ label: 'Buckets', count: 1337 },
				{ label: 'Valkey', count: 11 },
				{ label: 'OpenSearch', count: 17 },
				{ label: 'Kafka Topics', count: 23 },
				{ label: 'BigQuery', count: 49 }
			]);
		});
		test('show settings when admin', () => {
			expect(
				menuItems({
					path: '/team/nais',
					features,
					member: false,
					isAdmin: true
				})
					.flatMap((g) => g)
					.find((i) => ['Settings'].includes(i.label))
			).toBeDefined();
		});
	});

	describe('workload menu', () => {
		test('full', () => {
			expect(
				menuItems({
					path: '/team/devteam/dev/app/app-w-all-storage/utilization',
					member: true,
					isAdmin: false
				})
			).toEqual([
				[{ label: 'App Overview', href: '/team/devteam/dev/app/app-w-all-storage' }],
				[
					{
						label: 'Vulnerabilities',
						href: '/team/devteam/dev/app/app-w-all-storage/vulnerabilities'
					},
					{
						label: 'Deployments',
						href: '/team/devteam/dev/app/app-w-all-storage/deploys'
					},
					{ label: 'Cost', href: '/team/devteam/dev/app/app-w-all-storage/cost' },
					{ label: 'Issues', href: '/team/devteam/dev/app/app-w-all-storage/issues' },
					{
						label: 'Utilization',
						href: '/team/devteam/dev/app/app-w-all-storage/utilization',
						active: true
					},
					{
						href: '/team/devteam/dev/app/app-w-all-storage/ingresses',
						label: 'Ingresses'
					},
					{ label: 'Logs', href: '/team/devteam/dev/app/app-w-all-storage/logs' }
				],
				[
					{
						label: 'Manifest',
						href: '/team/devteam/dev/app/app-w-all-storage/manifest'
					}
				],
				[{ label: 'Delete', href: '/team/devteam/dev/app/app-w-all-storage/delete' }]
			]);
		});

		test('when not member', () => {
			expect(
				menuItems({
					path: '/team/devteam/dev/job/dataproduct-apps-topics/vulnerabilities',
					member: false,
					isAdmin: false
				})
					.flatMap((g) => g)
					.find((i) => ['Delete'].includes(i.label))
			).toBeUndefined();
		});
	});
});
