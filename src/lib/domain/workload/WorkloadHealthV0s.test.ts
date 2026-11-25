import { buildSchema, graphql } from 'graphql';
import { readFileSync } from 'node:fs';
import { load as loadApp } from '../../../routes/team/[team]/[env]/app/[app]/+page';
import { load as loadJob } from '../../../routes/team/[team]/[env]/job/[job]/+page';

vi.mock('$houdini', () => ({
	load_App: vi.fn(),
	load_AppDeployment: vi.fn(),
	load_AppInstanceGroups: vi.fn(),
	load_AppWorkloadEvents: vi.fn(),
	load_Job: vi.fn(),
	load_JobDeployment: vi.fn(),
	load_JobRunsList: vi.fn(),
	load_JobWorkloadEvents: vi.fn(),
	load_AppHealthV0s: ({ variables }: { variables: Record<string, string> }) =>
		runHealthQuery('AppHealthV0s', variables),
	load_JobHealthV0s: ({ variables }: { variables: Record<string, string> }) =>
		runHealthQuery('JobHealthV0s', variables)
}));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn() }));

const schema = buildSchema(`
	scalar Slug
	type Query { team(slug: Slug!): Team! }
	type Team { environment(name: String!): TeamEnvironment! }
	type TeamEnvironment {
		application(name: String!): Application!
		job(name: String!): Job!
		workload(name: String!): Workload!
	}
	interface Workload { vulnerabilityOverview: Overview! }
	type Application implements Workload { vulnerabilityOverview: Overview! }
	type Job implements Workload { vulnerabilityOverview: Overview! }
	type Overview { knownExploitedVulnerabilityCount: Int!, coverage: Coverage! }
	type Coverage { status: String!, error: String }
`);
const app = {
	vulnerabilityOverview: { knownExploitedVulnerabilityCount: 3, coverage: { status: 'SCANNED' } }
};
const job = {
	vulnerabilityOverview: { knownExploitedVulnerabilityCount: 0, coverage: { status: 'PENDING' } }
};

async function runHealthQuery(
	name: 'AppHealthV0s' | 'JobHealthV0s',
	variables: Record<string, string>
) {
	const result = await graphql({
		schema,
		source: readFileSync(new URL(`./${name}.gql`, import.meta.url), 'utf8'),
		variableValues: variables,
		rootValue: {
			team: {
				environment: {
					application: ({ name }: { name: string }) => (name === 'worker' ? app : null),
					job: ({ name }: { name: string }) => (name === 'worker' ? job : null),
					workload: () => ({ ...app, __typename: 'Application' })
				}
			}
		}
	});
	expect(result.errors).toBeUndefined();
	return { [name]: result.data };
}

test('app and job with the same name load their own vulnerability health', async () => {
	type AppEvent = Parameters<typeof loadApp>[0];
	type JobEvent = Parameters<typeof loadJob>[0];
	const url = new URL('https://console.example.com');
	const parent = { v0sVulnerabilities: true, legacyDeployDisabled: false };
	const params = { team: 'example', env: 'dev' };
	const [appPage, jobPage] = await Promise.all([
		loadApp({
			url,
			params: { ...params, app: 'worker' },
			parent: async () => parent as Awaited<ReturnType<AppEvent['parent']>>
		} as AppEvent),
		loadJob({
			url,
			params: { ...params, job: 'worker' },
			parent: async () => parent as Awaited<ReturnType<JobEvent['parent']>>
		} as JobEvent)
	]);
	const overview = (workload: typeof app) => ({
		team: { environment: { workload } }
	});
	expect(appPage.AppHealthV0s).toMatchObject(overview(app));
	expect(jobPage.JobHealthV0s).toMatchObject(overview(job));
});
