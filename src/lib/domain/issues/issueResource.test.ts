import { issueResource } from './issueResource.js';

const context = {
	teamEnvironment: { environment: { name: 'dev-gcp' }, team: { slug: 'nais' } }
};

describe('issueResource', () => {
	test('uses the flat Postgres field, not the nullable Houdini type key', () => {
		const issue = {
			...context,
			PostgresIssue: null,
			postgres: { name: 'database' }
		};
		expect(issueResource(issue)).toEqual({
			name: 'database',
			href: '/team/nais/dev-gcp/postgres/database'
		});
	});

	test.each([
		[{ workload: { __typename: 'Application', name: 'app' } }, 'app', 'app/app'],
		[{ workload: { __typename: 'Job', name: 'job' } }, 'job', 'job/job'],
		[{ application: { name: 'app' } }, 'app', 'app/app'],
		[{ job: { name: 'job' } }, 'job', 'job/job'],
		[{ sqlInstance: { name: 'sql' } }, 'sql', 'cloudsql/sql'],
		[{ openSearch: { name: 'search' } }, 'search', 'opensearch/search'],
		[{ valkey: { name: 'cache' } }, 'cache', 'valkey/cache']
	])('preserves the name and link for %j', (resource, name, path) => {
		expect(issueResource({ ...context, ...resource })).toEqual({
			name,
			href: `/team/nais/dev-gcp/${path}`
		});
	});

	test('preserves the team-wide Unleash link', () => {
		expect(issueResource({ ...context, unleash: { name: 'flags' } })).toEqual({
			name: 'flags',
			href: '/team/nais/unleash'
		});
	});

	test.each([null, undefined, context])('keeps the unknown resource fallback for %j', (issue) => {
		expect(issueResource(issue)).toEqual({ name: 'Unknown', href: null });
	});

	test('does not create a broken link without an environment', () => {
		expect(
			issueResource({
				teamEnvironment: { environment: { name: '' }, team: { slug: 'nais' } },
				postgres: { name: 'database' }
			})
		).toEqual({ name: 'database', href: null });
	});
});
