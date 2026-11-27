import { vi } from 'vitest';
import type { LoadEvent } from '@sveltejs/kit';
import { load as teamDeployments } from './deploy/+page';
import { load as appDeployments } from './[env]/app/[app]/deploys/+page';
import { load as jobDeployments } from './[env]/job/[job]/deploys/+page';
import { load as settings } from './settings/+page';
import { load as app } from './[env]/app/[app]/+page';
import { load as job } from './[env]/job/[job]/+page';
import { load as team } from './+page';

const queries = vi.hoisted(() => ({
	load_Deployments: vi.fn().mockResolvedValue({}),
	load_AppDeploys: vi.fn().mockResolvedValue({}),
	load_JobDeploys: vi.fn().mockResolvedValue({}),
	load_TeamSettings: vi.fn().mockResolvedValue({}),
	load_App: vi.fn().mockResolvedValue({}),
	load_AppDeployment: vi.fn().mockResolvedValue({}),
	load_AppInstanceGroups: vi.fn().mockResolvedValue({}),
	load_AppWorkloadEvents: vi.fn().mockResolvedValue({}),
	load_Job: vi.fn().mockResolvedValue({}),
	load_JobDeployment: vi.fn().mockResolvedValue({}),
	load_JobRunsList: vi.fn().mockResolvedValue({}),
	load_JobWorkloadEvents: vi.fn().mockResolvedValue({}),
	load_TeamOverview: vi.fn().mockResolvedValue({}),
	load_TeamHealth: vi.fn().mockResolvedValue({}),
	load_TeamSummaryCost: vi.fn().mockResolvedValue({})
}));

vi.mock('$houdini', () => queries);
vi.mock('$app/paths', () => ({
	resolve: (route: string, params: Record<string, string>) =>
		route.replace(/\[(\w+)\]/g, (_, key) => params[key])
}));
vi.mock('#lib/utils/pageMeta.js', () => ({
	addPageMeta: vi.fn().mockResolvedValue({})
}));

beforeEach(() => vi.clearAllMocks());

const params = { team: 'example-team', env: 'dev', app: 'example-app', job: 'example-job' };
type HistoryEvent = Parameters<typeof teamDeployments>[0] &
	Parameters<typeof appDeployments>[0] &
	Parameters<typeof jobDeployments>[0];

function event(
	legacyDeployDisabled: boolean,
	viewerIsMember = true
): Pick<LoadEvent, 'params' | 'url' | 'parent'> {
	return {
		params,
		url: new URL('http://localhost/?after=cursor'),
		parent: async () => ({ legacyDeployDisabled, viewerIsMember })
	};
}

test.each([
	[teamDeployments, '/team/example-team', queries.load_Deployments],
	[appDeployments, '/team/example-team/dev/app/example-app', queries.load_AppDeploys],
	[jobDeployments, '/team/example-team/dev/job/example-job', queries.load_JobDeploys]
] as const)('redirects disabled history before querying (%s)', async (load, location, query) => {
	await expect(load(event(true) as HistoryEvent)).rejects.toMatchObject({
		status: 307,
		location
	});
	expect(query).not.toHaveBeenCalled();
});

test.each([
	[teamDeployments, queries.load_Deployments],
	[appDeployments, queries.load_AppDeploys],
	[jobDeployments, queries.load_JobDeploys]
] as const)('keeps enabled history and pagination (%s)', async (load, query) => {
	await load(event(false) as HistoryEvent);
	expect(query).toHaveBeenCalledWith(
		expect.objectContaining({
			variables: expect.objectContaining({ after: 'cursor', first: 25 })
		})
	);
});

test.each([false, true])('passes the flag through every overview query (%s)', async (disabled) => {
	const input = event(disabled);
	await app(input as Parameters<typeof app>[0]);
	await job(input as Parameters<typeof job>[0]);
	await team(input as Parameters<typeof team>[0]);
	for (const query of [
		queries.load_App,
		queries.load_AppDeployment,
		queries.load_Job,
		queries.load_JobDeployment,
		queries.load_TeamOverview
	]) {
		expect(query).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({ legacyDeployDisabled: disabled })
			})
		);
	}
});

test.each([
	[false, false],
	[false, true],
	[true, false],
	[true, true]
])('passes flag %s and membership %s to settings', async (disabled, member) => {
	await settings(event(disabled, member) as Parameters<typeof settings>[0]);
	expect(queries.load_TeamSettings).toHaveBeenCalledWith(
		expect.objectContaining({
			variables: {
				team: params.team,
				legacyDeployDisabled: disabled,
				viewerIsMember: member
			}
		})
	);
});
