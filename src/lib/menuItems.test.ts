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
					postgresCount: 1
				})
			).toEqual([
				[{ label: 'Team Overview', href: '/team/devteam', active: true }],
				[
					{ label: 'Applications', href: '/team/devteam/applications' },
					{ label: 'Jobs', href: '/team/devteam/jobs' }
				],
				[
					{ label: 'Secrets', href: '/team/devteam/secrets' },
					{ label: 'Configs', href: '/team/devteam/configs' },
					{ label: 'Cloud SQL', href: '/team/devteam/cloudsql' },
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
					member: false,
					postgresCount: 0
				})
					.flatMap((g) => g)
					.find((i) => i.label === 'Secrets')?.active
			).toBe(true);
		});

		test('cloud sql active for sub-pages', () => {
			expect(
				menuItems({
					path: '/team/nais/prod-gcp/cloudsql/gemini',
					member: false,
					postgresCount: 0
				})
					.flatMap((g) => g)
					.find((i) => i.label === 'Cloud SQL')?.active
			).toBe(true);
		});

		test('postgres active on team page', () => {
			expect(
				menuItems({
					path: '/team/nais/postgres',
					member: true,
					postgresCount: 1
				})
					.flatMap((group) => group)
					.find((item) => item.label === 'Postgres')?.active
			).toBe(true);
		});

		test.each([
			{ member: false, postgresCount: 1 },
			{ member: true, postgresCount: 0 },
			{ member: false, postgresCount: 0 }
		])('hides Postgres for $member member with $postgresCount resources', (visibility) => {
			expect(
				menuItems({
					path: '/team/nais',
					...visibility
				})
					.flatMap((group) => group)
					.find((item) => item.label === 'Postgres')
			).toBeUndefined();
		});

		test('valkey active for sub-pages with feature toogling', () => {
			expect(
				menuItems({
					path: '/team/nais/prod-gcp/valkey/gemini',
					member: true,
					postgresCount: 1,
					features
				})
					.flatMap((g) => g)
					.find((i) => i.label === 'Valkey')?.active
			).toBe(true);
		});

		test('no features', () => {
			expect(
				menuItems({
					path: '/team/devteam/jobs',
					member: false,
					postgresCount: 0
				})
					.flatMap((g) => g)
					.find((i) => ['Valkey', 'OpenSearch', 'Kafka Topics', 'Unleash'].includes(i.label))
			).toBeUndefined();
		});

		test('show settings when admin', () => {
			expect(
				menuItems({
					path: '/team/nais',
					member: true,
					postgresCount: 1,
					features
				})
					.flatMap((g) => g)
					.find((i) => ['Settings'].includes(i.label))
			).toBeDefined();
		});
	});

	describe('workload detail routes', () => {
		test('app detail routes keep applications active in the team menu', () => {
			expect(
				menuItems({
					path: '/team/devteam/dev/app/app-w-all-storage/utilization',
					member: false,
					postgresCount: 0
				})
					.flatMap((group) => group)
					.find((item) => item.label === 'Applications')
			).toEqual({ label: 'Applications', href: '/team/devteam/applications', active: true });
		});

		test('job detail routes keep jobs active in the team menu', () => {
			expect(
				menuItems({
					path: '/team/devteam/dev/job/dataproduct-apps-topics/vulnerabilities',
					member: false,
					postgresCount: 0
				})
					.flatMap((group) => group)
					.find((item) => item.label === 'Jobs')
			).toEqual({ label: 'Jobs', href: '/team/devteam/jobs', active: true });
		});

		test('auxiliary workload routes do not add detail menu entries', () => {
			expect(
				menuItems({
					path: '/team/devteam/dev/job/dataproduct-apps-topics/delete',
					member: false,
					postgresCount: 0
				})
					.flatMap((group) => group)
					.find((item) => item.label === 'Delete')
			).toBeUndefined();
		});
	});
});
