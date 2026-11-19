import { AppDeploymentStore } from '$houdini';
import { render } from 'svelte/server';
import { vi } from 'vitest';
import WorkloadDeploy from './WorkloadDeploy.svelte';

vi.mock('$app/env', () => ({ browser: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$houdini', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$houdini')>();
	return { ...actual, graphql: () => new actual.WorkloadDeployStore() };
});

test.each([false, true])(
	'SSR preserves modern metadata through the Houdini fragment (%s)',
	async (disabled) => {
		const store = new AppDeploymentStore();
		const result = await store.fetch({
			variables: { team: 'team', env: 'dev', app: 'app', legacyDeployDisabled: disabled },
			fetch: async () =>
				Response.json({
					data: {
						team: {
							__typename: 'Team',
							id: 'team',
							environment: {
								__typename: 'TeamEnvironment',
								id: 'env',
								application: {
									__typename: 'Application',
									id: 'app',
									...(!disabled
										? { deployments: { __typename: 'DeploymentConnection', nodes: [] } }
										: {}),
									activityLog: {
										__typename: 'ActivityLogEntryConnection',
										nodes: [
											{
												__typename: 'ApplicationUpdatedActivityLogEntry',
												id: 'activity',
												createdAt: '2026-11-19T12:00:00Z',
												actor: 'modern-deployer',
												gitHubActorClaims: {
													__typename: 'GitHubActorClaims',
													actor: 'modern-deployer',
													repository: 'nais/current',
													runID: '42'
												}
											}
										]
									}
								}
							}
						}
					}
				})
		});
		expect(result.data).toMatchObject({
			team: { environment: { application: { __typename: 'Application' } } }
		});
		const workload = result.data?.team.environment?.application;
		if (!workload) throw new Error('Expected workload data');
		const { body } = await render(WorkloadDeploy, {
			props: { workload, legacyDeployDisabled: disabled }
		});
		expect(body).toContain('modern-deployer');
		expect(body).toContain('nais/current');
	}
);
