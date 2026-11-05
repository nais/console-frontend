import { render } from 'svelte/server';
import { get, readable, type Readable } from 'svelte/store';
import { vi } from 'vitest';
import {
	HomeActivityStore,
	HomeAttentionStore,
	HomeTeamSummariesStore,
	UserInfoStore,
	UserTeamsStore
} from '$houdini';
import type { PageProps } from './$types';
import { favorites } from '#lib/stores/favorites.svelte.js';
import HomePage from './+page.svelte';

vi.mock('$app/env', () => ({ browser: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('./Onboarding.svelte', async () => ({
	default: (await import('#lib/shadcn/ui/Heading.svelte')).default
}));
vi.mock('#lib/ui/PageModal.svelte', async () => ({
	default: (await import('#lib/shadcn/ui/Heading.svelte')).default,
	pageModalClick: vi.fn()
}));
vi.mock('./team/create/+page.svelte', async () => ({
	default: (await import('#lib/shadcn/ui/Heading.svelte')).default
}));

beforeEach(() => favorites.setFavorites([]));
afterEach(() => favorites.setFavorites([]));

type StoreState<S> = S extends Readable<infer State> ? State : never;

function mockStore<S extends Readable<object>>(store: S, overrides: Partial<StoreState<S>>): S {
	return Object.assign(store, readable({ ...get(store), ...overrides }));
}

interface HomePageOptions {
	totalTeams?: number;
	attentionError?: boolean;
	activityError?: boolean;
	summaryError?: boolean;
	teamsError?: boolean;
	criticalCount?: number;
	withActivity?: boolean;
	activityCount?: number;
	singleCounts?: boolean;
	attentionLoadError?: boolean;
}

function pageData({
	totalTeams = 1,
	attentionError = false,
	activityError = false,
	summaryError = false,
	teamsError = false,
	criticalCount = 0,
	withActivity = false,
	activityCount = withActivity ? 1 : 0,
	singleCounts = false,
	attentionLoadError = false
}: HomePageOptions = {}): PageProps['data'] {
	return {
		tenantName: 'test',
		isAdmin: false,
		githubOrganization: 'test',
		theme: 'light',
		userAgent: '',
		meta: {},
		UserInfo: new UserInfoStore(),
		UserTeams: mockStore(new UserTeamsStore(), {
			data: teamsError
				? null
				: {
						me: {
							__typename: 'User',
							teams: {
								edges: totalTeams
									? [
											{
												node: { team: { id: 'team', slug: 'my-team', purpose: 'My work' } },
												cursor: 'cursor'
											}
										]
									: [],
								pageInfo: {
									totalCount: totalTeams,
									hasNextPage: totalTeams > 25,
									hasPreviousPage: false,
									pageStart: 1,
									pageEnd: 1,
									startCursor: null,
									endCursor: null
								}
							}
						}
					},
			errors: teamsError ? [{ message: 'Membership unavailable' }] : null,
			fetching: false
		}),
		HomeAttention: attentionLoadError
			? null
			: mockStore(new HomeAttentionStore(), {
					data: attentionError
						? null
						: {
								issues: {
									nodes: Array.from({ length: Math.min(criticalCount, 5) }, (_, index) => ({
										__typename: 'NoRunningInstancesIssue' as const,
										id: `issue-${index}`,
										message: 'Application is not running',
										teamEnvironment: {
											team: { slug: 'my-team' },
											environment: { name: 'prod-gcp' }
										},
										workload: { __typename: 'Application' as const, name: `application-${index}` }
									})),
									pageInfo: { totalCount: criticalCount, hasNextPage: criticalCount > 5 }
								}
							},
					errors: attentionError ? [{ message: 'Issue data unavailable' }] : null,
					fetching: false
				}),
		HomeActivity: mockStore(new HomeActivityStore(), {
			data: activityError
				? null
				: {
						activityLog: {
							nodes: Array.from({ length: activityCount }, (_, index) => ({
								__typename: 'DeploymentActivityLogEntry' as const,
								id: index === 0 ? 'deployment' : `deployment-${index}`,
								message: 'Application deployed',
								createdAt: new Date('2026-11-05T08:00:00Z'),
								actor: 'test-operator',
								environmentName: 'prod-gcp',
								resourceName: 'application',
								resourceType: 'APP' as const,
								teamSlug: 'my-team'
							}))
						}
					},
			errors: activityError ? [{ message: 'Activity unavailable' }] : null,
			fetching: false
		}),
		HomeTeamSummaries: mockStore(new HomeTeamSummariesStore(), {
			data: summaryError
				? null
				: {
						teams: {
							nodes: [
								{
									id: 'team',
									slug: 'my-team',
									inventoryCounts: {
										applications: { total: singleCounts ? 1 : 3 },
										jobs: { total: singleCounts ? 1 : 2 }
									},
									criticalIssues: { pageInfo: { totalCount: 0 } },
									issues: { pageInfo: { totalCount: singleCounts ? 1 : 4 } }
								}
							]
						}
					},
			errors: summaryError ? [{ message: 'Inventory unavailable' }] : null,
			fetching: false
		}),
		homeLoadErrors: {
			teams: null,
			attention: attentionLoadError
				? 'Unable to load attention items. Try refreshing the page.'
				: null,
			activity: null,
			summaries: null
		}
	};
}

function normalizeHtml(html: string) {
	let previous: string;
	do {
		previous = html;
		html = html.replace(/<!--[\s\S]*?-->/g, '');
	} while (html !== previous);
	return html.replace(/\s+/g, ' ');
}

async function body(options: Parameters<typeof pageData>[0] = {}) {
	const html = (
		await render(HomePage, { props: { data: pageData(options), params: {}, form: null } })
	).body;
	return normalizeHtml(html);
}

test.each([
	['<p>before<!-- comment -->after</p>', '<p>beforeafter</p>'],
	['<p>before<!-<!-- inner -->-outer-->after</p>', '<p>beforeafter</p>']
])('normalizes rendered HTML comments in %s', (html, expected) => {
	expect(normalizeHtml(html)).toBe(expected);
});

test('prioritizes teams and pins over activity while keeping zero-state information quiet', async () => {
	const html = await body();
	expect(html.indexOf('href="/team/my-team"')).toBeLessThan(html.indexOf('Recent activity'));
	expect(html.indexOf('Pinned Favorites</h2>')).toBeLessThan(html.indexOf('Recent activity'));
	expect(html).not.toContain('Needs attention');
	expect(html).toContain('No critical issues across your teams.');
	expect(html).toContain('No changes across your teams in the last 7 days.');
	expect(html).toContain('3 apps');
	expect(html).toContain('2 jobs');
	expect(html).toContain('4 issues');
	expect(html).toContain('href="/team/my-team/vulnerabilities"');
	expect(html).toContain('Pinned Favorites');
	expect(html).not.toContain('Pinned resources');
	expect(html).not.toContain('empty-star');
	expect(html).not.toContain('aria-label="Overview sections"');
	expect(html).not.toContain('Last 7 days');
});

test('makes the team heading, description and arrow one large link with separate quick links', async () => {
	const html = await body();
	const mainLink = html.match(
		/<a href="\/team\/my-team" class="team-card-main[^"]*">([\s\S]*?)<\/a>/
	)?.[1];
	expect(mainLink).toBeDefined();
	expect(mainLink).toContain('<h3');
	expect(mainLink).toContain('my-team');
	expect(mainLink).toContain('My work');
	expect(mainLink).toContain('team-go-icon');
	expect(mainLink).not.toContain('<a ');
	for (const resource of ['applications', 'jobs', 'issues', 'vulnerabilities']) {
		expect(mainLink).not.toContain(`/team/my-team/${resource}`);
		expect(html).toContain(`href="/team/my-team/${resource}"`);
	}
	expect(html).toMatch(/<\/a>\s*<div class="team-links[^"]*">/);
});

test.each([false, true])(
	'links to the tenant activity log scoped to viewer memberships, including when activity is unavailable (%s)',
	async (activityError) => {
		const html = await body({ activityError });
		expect(html).toContain('href="/activity-log?myTeams=true"');
		expect(html).toContain('View activity log');
	}
);

test.each(['attentionError', 'activityError', 'summaryError'] as const)(
	'preserves independent sections when %s is unavailable',
	async (error) => {
		const html = await body({ [error]: true });
		expect(html).toContain('href="/team/my-team"');
		expect(html).toContain('Pinned Favorites');
		if (error === 'attentionError') {
			expect(html).not.toContain('No critical issues');
			expect(html).toContain('No changes across your teams');
		} else if (error === 'activityError') {
			expect(html).not.toContain('No changes across your teams');
			expect(html).toContain('No critical issues');
		} else {
			expect(html).toContain('Apps: unavailable');
			expect(html).toContain('Issues: unavailable');
			expect(html).not.toContain('0 apps');
		}
	}
);

test('does not interpret unavailable memberships as no memberships', async () => {
	const html = await body({ teamsError: true });
	expect(html).toContain('Membership unavailable');
	expect(html).toContain('Your overview');
	expect(html).toContain('Pinned Favorites');
});

test('keeps pins but uses onboarding instead of empty operational panels for no memberships', async () => {
	const html = await body({ totalTeams: 0 });
	expect(html).not.toContain('Needs attention');
	expect(html).not.toContain('Recent activity');
	expect(html).toContain('Pinned Favorites');
});

test.each([1, 2, 3])('omits team search for %s memberships', async (totalTeams) => {
	const html = await body({ totalTeams });
	expect(html).not.toContain('aria-label="Filter teams on this page"');
	expect(html).toContain('href="/team/my-team"');
});

test.each([4, 25, 80])('keeps team search for %s memberships', async (totalTeams) => {
	const html = await body({ totalTeams });
	expect(html).toContain('aria-label="Filter teams on this page"');
});

test('uses backend membership totals and labels the page-local filter for many teams', async () => {
	const html = await body({ totalTeams: 80 });
	expect(html).toContain('80');
	expect(html).toContain('The filter searches this page');
	expect(html).toContain('aria-label="Next page"');
});

test('shows actionable critical resources with full context and an honest bounded count', async () => {
	const html = await body({ criticalCount: 9 });
	expect(html.indexOf('Needs attention')).toBeLessThan(html.indexOf('href="/team/my-team"'));
	expect(html).toContain('Showing 5 of 9 critical issues');
	expect(html).toContain('href="/team/my-team/prod-gcp/app/application-0"');
	expect(html).toContain('Application is not running');
	expect(html).toContain('prod-gcp');
	expect(html).toContain('application-4');
	expect(html).not.toContain('application-5');
	expect(html).not.toContain('No critical issues');
});

test('renders deployments in the contextual activity feed with navigation to the log entry', async () => {
	const html = await body({ withActivity: true });
	expect(html).toContain('Application deployed');
	expect(html).toContain('test-operator');
	expect(html).toContain('my-team');
	expect(html).toContain('prod-gcp');
	expect(html).toContain(
		'href="/team/my-team/activity-log?id=deployment&amp;resourceTypes=APP&amp;environments=prod-gcp"'
	);
	expect(html).not.toContain('No changes across your teams');
});

test('distinguishes a transport failure from no attention items', async () => {
	const html = await body({ attentionLoadError: true });
	expect(html).toContain('Unable to load attention items');
	expect(html).not.toContain('No critical issues');
	expect(html).toContain('href="/team/my-team"');
	expect(html).toContain('Pinned Favorites');
});

test('uses singular workload and issue labels for one item', async () => {
	const html = await body({ singleCounts: true });
	expect(html).toContain('1 app');
	expect(html).toContain('1 job');
	expect(html).toContain('1 issue');
	expect(html).not.toContain('1 apps');
	expect(html).not.toContain('1 jobs');
	expect(html).not.toContain('1 issues');
});

test('shows all eight loaded activity entries without an expansion control', async () => {
	const html = await body({ activityCount: 8 });
	expect(html).toMatch(/<section[^>]*aria-labelledby="[^"]+-activity"[^>]*>/);
	expect(html.match(/class="list-item(?:\s[^"]*)?"/g)).toHaveLength(8);
	expect(html).toContain('id=deployment-7');
	expect(html).not.toContain('more changes');
	expect(html).not.toContain('Show less activity');
});

test('shows all available activity when fewer than eight entries exist', async () => {
	const html = await body({ activityCount: 3 });
	expect(html.match(/class="list-item(?:\s[^"]*)?"/g)).toHaveLength(3);
	expect(html).not.toContain('more changes');
});

test('does not render an attention panel or alert for a genuine zero count', async () => {
	const html = await body();
	expect(html).toContain('No critical issues across your teams.');
	expect(html).not.toContain('attention-section');
	expect(html).not.toContain('role="alert"');
	expect(html).not.toContain('variant-success');
	expect(html).not.toContain('0 critical');
});

test.each([false, true])(
	'keeps pins above the secondary activity section whether populated or empty (%s)',
	async (pinned) => {
		if (pinned) favorites.setFavorites(['/team/my-team']);
		const html = await body();
		const pins = html.indexOf('Pinned Favorites</h2>');
		const teams = html.indexOf('Your teams</h2>');
		const activity = html.indexOf('Recent activity');
		expect(pins).toBeGreaterThan(0);
		expect(teams).toBeGreaterThan(0);
		expect(pins).toBeLessThan(activity);
		expect(teams).toBeLessThan(activity);
		if (pinned) {
			expect(html).not.toContain('No pinned favorites yet');
			expect(pins).toBeLessThan(html.indexOf('class="favorites-card'));
		} else {
			expect(html).not.toContain('class="favorites-card');
			expect(html).toContain('No pinned favorites yet');
			expect(html).toContain(
				'Click the star icon in any page header to pin workloads, databases, or teams here.'
			);
		}
	}
);
