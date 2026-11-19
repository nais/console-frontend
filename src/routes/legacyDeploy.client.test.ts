import { AppDeploymentStore, JobDeploymentStore, TeamSettingsStore } from '$houdini';
import { readFileSync } from 'node:fs';
import { buildSchema, graphql, GraphQLSchema } from 'graphql';
import { onTestFinished, vi } from 'vitest';

vi.mock('$app/env', () => ({ browser: true, dev: false }));
vi.mock('$app/environment', () => ({ browser: true, building: false }));

const apiSchema = buildSchema(readFileSync('schema.graphql', 'utf8'), {
	assumeValid: true
});
const schema = new GraphQLSchema({
	...apiSchema.toConfig(),
	directives: apiSchema
		.getDirectives()
		.filter((directive) => !['defer', 'stream'].includes(directive.name))
});

test.each(['app', 'job'] as const)(
	'never resolves legacy %s history when disabled, including after an enabled fetch',
	async (kind) => {
		const deployments = vi.fn(() => ({ nodes: [] }));
		const activityLog = vi.fn(() => ({
			nodes: [
				{
					__typename:
						kind === 'app' ? 'ApplicationUpdatedActivityLogEntry' : 'JobUpdatedActivityLogEntry',
					id: `modern-${kind}`,
					actor: 'modern-deployer',
					createdAt: '2026-11-19T12:00:00Z',
					gitHubActorClaims: null
				}
			]
		}));
		const workload = {
			__typename: kind === 'app' ? 'Application' : 'Job',
			id: `legacy-flag-${kind}`,
			activityLog,
			deployments
		};
		const network = vi.fn<typeof fetch>(async (_input, init) => {
			const { query, variables } = JSON.parse(String(init?.body));
			const result = await graphql({
				schema,
				source: query,
				variableValues: variables,
				rootValue: {
					team: () => ({
						id: `legacy-team-${kind}`,
						environment: () => ({
							id: `legacy-env-${kind}`,
							application: () => workload,
							job: () => workload
						})
					})
				}
			});
			expect(result.errors).toBeUndefined();
			return Response.json(result);
		});
		const store = kind === 'app' ? new AppDeploymentStore() : new JobDeploymentStore();
		onTestFinished(store.subscribe(() => {}));
		for (const disabled of [false, true]) {
			const request = {
				fetch: network,
				policy: 'NetworkOnly' as const,
				variables: {
					team: 'team',
					env: 'dev',
					app: 'app',
					job: 'job',
					legacyDeployDisabled: disabled
				}
			};
			const result = await (store instanceof AppDeploymentStore
				? store.fetch(request)
				: store.fetch(request));
			expect(result.errors).toBeNull();
		}
		const poll = { fetch: network, policy: 'NetworkOnly' as const };
		const refreshed = await (store instanceof AppDeploymentStore
			? store.fetch(poll)
			: store.fetch(poll));
		expect(refreshed.errors).toBeNull();
		expect(deployments).toHaveBeenCalledTimes(1);
		expect(activityLog).toHaveBeenCalledTimes(3);
	}
);

test.each([
	[false, true, true],
	[false, false, false],
	[true, true, false],
	[true, false, false]
])(
	'deploy key resolution respects flag %s and membership %s',
	async (disabled, member, expected) => {
		const deploymentKey = vi.fn(() => ({
			id: 'legacy-test-key',
			created: '2026-11-19T12:00:00Z',
			expires: '2026-11-20T12:00:00Z',
			key: 'test-deploy-key'
		}));
		const store = new TeamSettingsStore();
		onTestFinished(store.subscribe(() => {}));
		const result = await store.fetch({
			policy: 'NetworkOnly',
			variables: {
				team: 'team',
				viewerIsMember: member,
				legacyDeployDisabled: disabled
			},
			fetch: async (_input, init) => {
				const { query, variables } = JSON.parse(String(init?.body));
				const response = await graphql({
					schema,
					source: query,
					variableValues: variables,
					rootValue: {
						team: () => ({
							id: 'legacy-key-team',
							slug: 'team',
							purpose: '',
							slackChannel: '',
							environments: [],
							externalResources: {},
							deploymentKey
						})
					}
				});
				expect(response.errors).toBeUndefined();
				return Response.json(response);
			}
		});
		expect(result.errors).toBeNull();
		expect(deploymentKey).toHaveBeenCalledTimes(expected ? 1 : 0);
		if (expected) {
			expect(result.data?.team.deploymentKey?.key).toBe('test-deploy-key');
		} else {
			expect(result.data?.team.deploymentKey).toBeUndefined();
		}
	}
);
