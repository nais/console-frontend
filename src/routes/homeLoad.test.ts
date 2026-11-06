import {
	HomeActivityStore,
	HomeAttentionStore,
	HomeTeamSummariesStore,
	UserTeamsStore,
	load_HomeActivity,
	load_HomeAttention,
	load_HomeTeamSummaries,
	load_UserTeams,
	type UserTeams$result
} from '$houdini';
import { get, readable } from 'svelte/store';
import { vi } from 'vitest';
import { load } from './+page.js';
import { load as loadServer } from './+page.server.js';

vi.mock('$app/env', () => ({ browser: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$houdini', async (importOriginal) => ({
	...(await importOriginal<typeof import('$houdini')>()),
	load_UserTeams: vi.fn(),
	load_HomeAttention: vi.fn(),
	load_HomeActivity: vi.fn(),
	load_HomeTeamSummaries: vi.fn()
}));

function createStores(teamSlugs = ['bravo', 'charlie'], totalCount = teamSlugs.length) {
	const memberships = new UserTeamsStore();
	const data: UserTeams$result = {
		me: {
			__typename: 'User',
			teams: {
				edges: teamSlugs.map((slug) => ({
					node: { team: { id: slug, slug, purpose: '' } },
					cursor: slug
				})),
				pageInfo: {
					totalCount,
					hasNextPage: totalCount > teamSlugs.length,
					hasPreviousPage: false,
					pageStart: 1,
					pageEnd: teamSlugs.length,
					startCursor: teamSlugs[0] ?? null,
					endCursor: teamSlugs.at(-1) ?? null
				}
			}
		}
	};
	return {
		UserTeams: Object.assign(memberships, readable({ ...get(memberships), data })),
		HomeAttention: new HomeAttentionStore(),
		HomeActivity: new HomeActivityStore(),
		HomeTeamSummaries: new HomeTeamSummariesStore()
	};
}

const event = {
	url: new URL('https://console.test/'),
	data: { homeActivityFrom: new Date('2026-10-29T10:00:00Z') }
} as Parameters<typeof load>[0];
const noErrors = { teams: null, attention: null, activity: null, summaries: null };
let stores: ReturnType<typeof createStores>;

beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-11-05T10:00:00Z'));
	vi.spyOn(console, 'error').mockImplementation(() => {});
	stores = createStores(['bravo', 'charlie'], 80);
	vi.mocked(load_UserTeams).mockResolvedValue({ UserTeams: stores.UserTeams });
	vi.mocked(load_HomeAttention).mockResolvedValue({ HomeAttention: stores.HomeAttention });
	vi.mocked(load_HomeActivity).mockResolvedValue({ HomeActivity: stores.HomeActivity });
	vi.mocked(load_HomeTeamSummaries).mockResolvedValue({
		HomeTeamSummaries: stores.HomeTeamSummaries
	});
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

test('returns independent stores and scopes summaries to the loaded membership page, not its total', async () => {
	expect(await load(event)).toEqual({ ...stores, homeLoadErrors: noErrors });
	expect(load_UserTeams).toHaveBeenCalledExactlyOnceWith({ event, blocking: true });
	expect(load_HomeAttention).toHaveBeenCalledExactlyOnceWith({ event, blocking: true });
	expect(load_HomeActivity).toHaveBeenCalledExactlyOnceWith({
		event,
		blocking: true,
		variables: { from: new Date('2026-10-29T10:00:00Z') }
	});
	expect(load_HomeTeamSummaries).toHaveBeenCalledExactlyOnceWith({
		event,
		blocking: true,
		variables: { teamSlugs: ['bravo', 'charlie'] }
	});
	expect(console.error).not.toHaveBeenCalled();
});

test('gates operational queries on memberships, then loads feeds and summaries in parallel', async () => {
	const memberships = Promise.withResolvers<Awaited<ReturnType<typeof load_UserTeams>>>();
	const attention = Promise.withResolvers<Awaited<ReturnType<typeof load_HomeAttention>>>();
	const feedsStarted = Promise.withResolvers<void>();
	vi.mocked(load_UserTeams).mockReturnValueOnce(memberships.promise);
	vi.mocked(load_HomeAttention).mockImplementationOnce(() => {
		feedsStarted.resolve();
		return attention.promise;
	});

	const result = load(event);
	expect(load_UserTeams).toHaveBeenCalledOnce();
	expect(load_HomeAttention).not.toHaveBeenCalled();
	expect(load_HomeActivity).not.toHaveBeenCalled();
	expect(load_HomeTeamSummaries).not.toHaveBeenCalled();

	memberships.resolve({ UserTeams: stores.UserTeams });
	await feedsStarted.promise;
	expect(load_HomeAttention).toHaveBeenCalledOnce();
	expect(load_HomeActivity).toHaveBeenCalledOnce();
	expect(load_HomeTeamSummaries).toHaveBeenCalledOnce();
	attention.resolve({ HomeAttention: stores.HomeAttention });
	expect(await result).toEqual({ ...stores, homeLoadErrors: noErrors });
});

test('reuses the server cutoff when hydration runs later', async () => {
	const data = loadServer();
	expect(data.homeActivityFrom).toEqual(new Date('2026-10-29T10:00:00Z'));
	await load({ ...event, data });

	vi.advanceTimersByTime(1500);
	await load({ ...event, data: structuredClone(data) });

	expect(load_HomeActivity).toHaveBeenCalledTimes(2);
	for (const [params] of vi.mocked(load_HomeActivity).mock.calls) {
		expect(params.variables).toEqual({ from: data.homeActivityFrom });
	}
});

test.each([
	{ loader: load_UserTeams, store: 'UserTeams', key: 'teams', section: 'your teams' },
	{
		loader: load_HomeAttention,
		store: 'HomeAttention',
		key: 'attention',
		section: 'attention items'
	},
	{
		loader: load_HomeActivity,
		store: 'HomeActivity',
		key: 'activity',
		section: 'recent activity'
	},
	{
		loader: load_HomeTeamSummaries,
		store: 'HomeTeamSummaries',
		key: 'summaries',
		section: 'team summaries'
	}
])('isolates and reports a rejected $store load', async ({ loader, store, key, section }) => {
	const error = new Error('Connection failed');
	vi.mocked(loader).mockRejectedValueOnce(error);

	expect(await load(event)).toEqual({
		...stores,
		HomeTeamSummaries: key === 'teams' ? null : stores.HomeTeamSummaries,
		[store]: null,
		homeLoadErrors: {
			...noErrors,
			[key]: `Unable to load ${section}. Try refreshing the page.`
		}
	});
	expect(console.error).toHaveBeenCalledExactlyOnceWith(`Unable to load home ${section}:`, error);
	if (key === 'teams') {
		expect(load_HomeTeamSummaries).not.toHaveBeenCalled();
		expect(load_HomeAttention).toHaveBeenCalledOnce();
		expect(load_HomeActivity).toHaveBeenCalledOnce();
	} else {
		expect(load_HomeTeamSummaries).toHaveBeenCalledExactlyOnceWith({
			event,
			blocking: true,
			variables: { teamSlugs: ['bravo', 'charlie'] }
		});
	}
});

test('skips unused feeds and summaries when the user has no memberships', async () => {
	const { UserTeams } = createStores([]);
	vi.mocked(load_UserTeams).mockResolvedValueOnce({ UserTeams });

	expect(await load(event)).toEqual({
		UserTeams,
		HomeAttention: null,
		HomeActivity: null,
		HomeTeamSummaries: null,
		homeLoadErrors: noErrors
	});
	expect(load_HomeAttention).not.toHaveBeenCalled();
	expect(load_HomeActivity).not.toHaveBeenCalled();
	expect(load_HomeTeamSummaries).not.toHaveBeenCalled();
	expect(console.error).not.toHaveBeenCalled();
});

test('does not interpret an errored zero membership response as confirmed onboarding', async () => {
	const { UserTeams } = createStores([]);
	Object.assign(
		UserTeams,
		readable({ ...get(UserTeams), errors: [{ message: 'Memberships unavailable' }] })
	);
	vi.mocked(load_UserTeams).mockResolvedValueOnce({ UserTeams });

	expect(await load(event)).toEqual({
		...stores,
		UserTeams,
		HomeTeamSummaries: null,
		homeLoadErrors: noErrors
	});
	expect(load_HomeAttention).toHaveBeenCalledOnce();
	expect(load_HomeActivity).toHaveBeenCalledOnce();
	expect(load_HomeTeamSummaries).not.toHaveBeenCalled();
});

test('keeps feeds but skips summaries for an empty page with a nonzero membership total', async () => {
	const { UserTeams } = createStores([], 80);
	vi.mocked(load_UserTeams).mockResolvedValueOnce({ UserTeams });

	expect(await load(event)).toEqual({
		...stores,
		UserTeams,
		HomeTeamSummaries: null,
		homeLoadErrors: noErrors
	});
	expect(load_HomeAttention).toHaveBeenCalledOnce();
	expect(load_HomeActivity).toHaveBeenCalledOnce();
	expect(load_HomeTeamSummaries).not.toHaveBeenCalled();
});
