import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PageHeader from './PageHeader.svelte';
import { fromStore, writable } from 'svelte/store';

const { page } = vi.hoisted(() => ({
	page: {
		url: new URL('http://localhost/team/nais/applications'),
		params: {},
		data: { tenantName: 'nav' },
		route: { id: '/team/[team]/applications' }
	}
}));

vi.mock('$app/env', () => ({ browser: true, building: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: true, building: false, dev: false }));
vi.mock('$app/navigation', () => ({ afterNavigate: vi.fn() }));
vi.mock('$app/state', () => ({ page }));

const components: ReturnType<typeof PageHeader>[] = [];

beforeEach(() => {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))
	);
});

afterEach(async () => {
	for (const component of components) await unmount(component);
	components.length = 0;
	document.body.replaceChildren();
	vi.unstubAllGlobals();
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.clearAllMocks();
});

function renderHeader() {
	components.push(mount(PageHeader, { target: document.body, props: { user: undefined } }));
	flushSync();
}

function element<T extends Element>(selector: string): T {
	const match = document.querySelector<T>(selector);
	if (!match) throw new Error(`Missing ${selector}`);
	return match;
}

it.each(['/', '/team/nais/applications'])(
	'provides a skip link to one focusable main landmark on %s',
	(path) => {
		page.url = new URL(path, 'http://localhost');
		page.params = path.startsWith('/team/') ? { team: 'nais' } : {};
		renderHeader();
		const skip = element<HTMLAnchorElement>('.skip-link');
		const main = element<HTMLElement>('main');
		expect(document.querySelectorAll('main')).toHaveLength(1);
		expect(document.querySelector('a, button')).toBe(skip);
		expect(skip.textContent).toBe('Skip to content');
		expect(skip.hash).toBe(`#${main.id}`);
		expect(main.tabIndex).toBe(-1);
		expect(main.contains(document.querySelector('.sh-topnav'))).toBe(false);
		expect(main.contains(document.querySelector('.sh-sidebar'))).toBe(false);
		main.focus();
		expect(document.activeElement).toBe(main);
	}
);

it('keeps skip targets unique when more than one shell is rendered', () => {
	renderHeader();
	renderHeader();
	const targets = [...document.querySelectorAll('main')].map((main) => main.id);
	expect(new Set(targets).size).toBe(2);
	expect(
		[...document.querySelectorAll<HTMLAnchorElement>('.skip-link')].map((link) => link.hash)
	).toEqual(targets.map((target) => `#${target}`));
});

it('matches the visible search label and exposes the keyboard shortcuts separately', () => {
	renderHeader();
	const search = element<HTMLButtonElement>('.jump-to-btn');
	const label = element<HTMLElement>('.jump-to-text');
	const shortcut = element<HTMLElement>('.jump-to-control kbd');
	expect(label.textContent).toBe('Jump to');
	expect(search.getAttribute('aria-label')).toContain(label.textContent);
	expect(shortcut.getAttribute('aria-hidden')).toBe('true');
	expect(search.contains(shortcut)).toBe(false);
	expect(search.getAttribute('aria-keyshortcuts')).toBe('Control+K /');
});

it('provides user settings with a chevron instead of a separate logout control', () => {
	components.push(
		mount(PageHeader, {
			target: document.body,
			props: {
				user: { name: 'Test User', isAdmin: false }
			}
		})
	);
	flushSync();
	const settings = element<HTMLButtonElement>('button[aria-label="User settings"]');
	expect(settings.getAttribute('aria-haspopup')).toBe('menu');
	expect(document.querySelector('button[aria-label="Toggle color theme"]')).toBeNull();
	expect(settings.querySelector('.user-avatar')?.textContent).toBe('TU');
	expect(settings.querySelector('.lucide-chevron-down')).not.toBeNull();
	expect(settings.querySelector('.lucide-log-out')).toBeNull();
	expect(document.querySelector('.sh-topnav a[href="/oauth2/logout"]')).toBeNull();
});

it('keeps appearance settings available without user profile data', () => {
	components.push(
		mount(PageHeader, {
			target: document.body,
			props: { user: undefined }
		})
	);
	flushSync();
	const settings = element<HTMLButtonElement>('button[aria-label="User settings"]');
	expect(settings.getAttribute('aria-haspopup')).toBe('menu');
	expect(document.querySelector('a[aria-label="Log out"]')).toBeNull();
});

it('updates the Admin error indicator without hiding the link when errors clear', () => {
	const errors = writable(true);
	const status = fromStore(errors);
	components.push(
		mount(PageHeader, {
			target: document.body,
			props: {
				user: { name: 'Admin', isAdmin: true },
				get reconcilerErrors() {
					return status.current;
				}
			}
		})
	);
	flushSync();
	const admin = element<HTMLAnchorElement>('.tenant-nav a[href="/admin"]');
	expect(admin.querySelector('[aria-label="Reconcilers have errors"]')).not.toBeNull();
	flushSync(() => errors.set(false));
	expect(admin.querySelector('[aria-label="Reconcilers have errors"]')).toBeNull();
	expect(admin.textContent?.trim()).toBe('Admin');
});

type HeaderProps = ComponentProps<typeof PageHeader>;
const ownTeam = { id: 'nais', slug: 'nais', purpose: 'Platform team' };
const otherTeam = { id: 'example', slug: 'example', purpose: 'Example team' };
const searchResult = {
	teams: [otherTeam],
	hasNextPage: false,
	endCursor: null
};

function openTeamSwitcher(props: Partial<HeaderProps> = {}) {
	vi.useFakeTimers();
	page.url = new URL('http://localhost/team/nais/applications');
	page.params = { team: 'nais' };
	components.push(
		mount(PageHeader, {
			target: document.body,
			props: {
				...props,
				get teamErrors() {
					return props.teamErrors;
				},
				get user() {
					return (
						props.user ?? {
							name: 'Test User',
							isAdmin: false,
							teams: {
								nodes: [{ team: ownTeam }],
								pageInfo: { hasNextPage: false }
							}
						}
					);
				}
			}
		})
	);
	flushSync();
	element<HTMLButtonElement>('.team-switcher-trigger').click();
	flushSync();
}

function typeTeamQuery(query: string) {
	const input = element<HTMLInputElement>('.popover-search-input');
	input.value = query;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
}

async function finishTeamSearch() {
	await vi.advanceTimersByTimeAsync(251);
	flushSync();
}

it('shows own teams and removes the all-teams and new-team links', () => {
	openTeamSwitcher();
	expect(element('.popover-scope').textContent?.trim()).toBe('Your teams');
	expect(element('.popover-item').textContent).toContain('nais');
	expect(document.querySelector('.team-popover a[href="/"]')).toBeNull();
	expect(document.querySelector('.team-popover a[href="/team/create"]')).toBeNull();
});

it('filters own teams without searching all teams, including blank queries', async () => {
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	openTeamSwitcher({ searchTeams });
	for (const query of [' NAIS ', ' ', '']) {
		typeTeamQuery(query);
		await finishTeamSearch();
		expect(element('.popover-item').textContent).toContain('nais');
	}
	expect(searchTeams).not.toHaveBeenCalled();
});

it('debounces fallback search and labels results from all teams', async () => {
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	openTeamSwitcher({ searchTeams });
	typeTeamQuery('exam');
	await vi.advanceTimersByTimeAsync(100);
	typeTeamQuery(' example ');
	expect(element('.popover-scope').textContent).toContain('Searching teams');
	expect(document.querySelector('.popover-empty')).toBeNull();
	await finishTeamSearch();
	expect(searchTeams).toHaveBeenCalledExactlyOnceWith('example', undefined);
	expect(element('.popover-scope').textContent).toContain('Results from all teams');
	expect(element<HTMLAnchorElement>('.popover-item').getAttribute('href')).toBe(
		'/team/example/applications'
	);
});

it('shows an empty state only after the all-team search finishes', async () => {
	openTeamSwitcher({
		searchTeams: vi.fn().mockResolvedValue({ ...searchResult, teams: [] })
	});
	typeTeamQuery('missing');
	await finishTeamSearch();
	expect(element('.popover-empty').textContent?.trim()).toBe('No teams found');
});

it('ignores stale results when the query changes to an own-team match', async () => {
	let resolveSearch!: (result: typeof searchResult) => void;
	openTeamSwitcher({
		searchTeams: () =>
			new Promise((resolve) => {
				resolveSearch = resolve;
			})
	});
	typeTeamQuery('example');
	await finishTeamSearch();
	typeTeamQuery('nais');
	resolveSearch(searchResult);
	await finishTeamSearch();
	expect(element('.popover-item').textContent).toContain('nais');
	expect(element('.popover-scope').textContent?.trim()).toBe('Your teams');
});

it('cancels a scheduled search when the switcher closes and resets on reopen', async () => {
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	openTeamSwitcher({ searchTeams });
	typeTeamQuery('example');
	element<HTMLButtonElement>('.dropdown-backdrop').click();
	flushSync();
	await finishTeamSearch();
	expect(searchTeams).not.toHaveBeenCalled();
	element<HTMLButtonElement>('.team-switcher-trigger').click();
	flushSync();
	expect(element<HTMLInputElement>('.popover-search-input').value).toBe('');
	expect(element('.popover-item').textContent).toContain('nais');
});

it('paginates all-team results without replacing previous matches', async () => {
	const searchTeams = vi
		.fn()
		.mockResolvedValueOnce({ ...searchResult, hasNextPage: true, endCursor: 'next' })
		.mockResolvedValueOnce({
			teams: [{ id: 'example-2', slug: 'example-2', purpose: '' }],
			hasNextPage: false,
			endCursor: null
		});
	openTeamSwitcher({ searchTeams });
	typeTeamQuery('example');
	await finishTeamSearch();
	const more = [...document.querySelectorAll<HTMLButtonElement>('.popover-list button')].find(
		(button) => button.textContent?.includes('Load more results')
	);
	expect(more).toBeDefined();
	more!.click();
	await finishTeamSearch();
	expect(searchTeams).toHaveBeenLastCalledWith('example', 'next');
	expect(document.querySelectorAll('.popover-item')).toHaveLength(2);
});

it('retries a failed results page with the same cursor and keeps previous matches', async () => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
	const searchTeams = vi
		.fn()
		.mockResolvedValueOnce({ ...searchResult, hasNextPage: true, endCursor: 'next' })
		.mockRejectedValueOnce(new Error('Next page unavailable'))
		.mockResolvedValueOnce({
			teams: [{ id: 'example-2', slug: 'example-2', purpose: '' }],
			hasNextPage: false,
			endCursor: null
		});
	openTeamSwitcher({ searchTeams });
	typeTeamQuery('example');
	await finishTeamSearch();
	const more = [...document.querySelectorAll<HTMLButtonElement>('.popover-list button')].find(
		(button) => button.textContent?.includes('Load more results')
	);
	more!.click();
	await finishTeamSearch();
	expect(element('.graph-errors').textContent).toContain('Unable to search teams');
	expect(element('.popover-item').textContent).toContain('example');
	const retry = [...document.querySelectorAll<HTMLButtonElement>('.popover-list button')].find(
		(button) => button.textContent?.includes('Try again')
	);
	retry!.click();
	await finishTeamSearch();
	expect(searchTeams.mock.calls).toEqual([
		['example', undefined],
		['example', 'next'],
		['example', 'next']
	]);
	expect(
		[...document.querySelectorAll('.popover-team-name')].map((node) => node.textContent)
	).toEqual(['example', 'example-2']);
	expect(document.querySelector('.graph-errors')).toBeNull();
});

it('checks remaining own-team pages before falling back to all teams', async () => {
	const userStore = writable({
		name: 'Test User',
		isAdmin: false,
		teams: {
			nodes: [{ team: ownTeam }],
			pageInfo: { hasNextPage: true }
		}
	});
	const user = fromStore(userStore);
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	const loadMoreTeams = vi.fn(async () => {
		userStore.update((value) => ({
			...value,
			teams: {
				nodes: [...value.teams.nodes, { team: otherTeam }],
				pageInfo: { hasNextPage: false }
			}
		}));
	});
	openTeamSwitcher({
		get user() {
			return user.current;
		},
		loadMoreTeams,
		searchTeams
	});
	typeTeamQuery('example');
	await finishTeamSearch();
	expect(loadMoreTeams).toHaveBeenCalledOnce();
	expect(searchTeams).not.toHaveBeenCalled();
	expect(element('.popover-item').textContent).toContain('example');
	expect(element('.popover-scope').textContent?.trim()).toBe('Your teams');
});

it.each([true, false])(
	'checks all 75 memberships before deciding whether to search all teams (own match: %s)',
	async (ownMatch) => {
		function membershipPage(start: number) {
			return Array.from({ length: 25 }, (_, index) => {
				const number = start + index + 1;
				return {
					team: {
						id: `own-team-${number}`,
						slug: ownMatch && number === 75 ? 'example' : `own-team-${number}`,
						purpose: ''
					}
				};
			});
		}
		const userStore = writable({
			name: 'Test User',
			isAdmin: false,
			teams: { nodes: membershipPage(0), pageInfo: { hasNextPage: true } }
		});
		const user = fromStore(userStore);
		const searchTeams = vi.fn().mockResolvedValue(searchResult);
		const loadMoreTeams = vi.fn(async () => {
			userStore.update((value) => ({
				...value,
				teams: {
					nodes: [...value.teams.nodes, ...membershipPage(value.teams.nodes.length)],
					pageInfo: { hasNextPage: value.teams.nodes.length + 25 < 75 }
				}
			}));
		});
		openTeamSwitcher({
			get user() {
				return user.current;
			},
			loadMoreTeams,
			searchTeams
		});
		typeTeamQuery('example');
		await vi.advanceTimersByTimeAsync(1000);
		flushSync();
		expect(loadMoreTeams).toHaveBeenCalledTimes(2);
		if (ownMatch) expect(searchTeams).not.toHaveBeenCalled();
		else expect(searchTeams).toHaveBeenCalledExactlyOnceWith('example', undefined);
		expect(element('.popover-item').textContent).toContain('example');
		typeTeamQuery('');
		expect(document.querySelectorAll('.popover-item')).toHaveLength(75);
		expect(element('.popover-item').textContent).toContain('own-team-1');
	}
);

it('searches all teams after exhausting own-team pages without a match', async () => {
	const userStore = writable({
		name: 'Test User',
		isAdmin: false,
		teams: {
			nodes: [{ team: ownTeam }],
			pageInfo: { hasNextPage: true }
		}
	});
	const user = fromStore(userStore);
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	const loadMoreTeams = vi.fn(async () => {
		userStore.update((value) => ({
			...value,
			teams: {
				nodes: [...value.teams.nodes, { team: { ...ownTeam, id: 'nais-2', slug: 'nais-2' } }],
				pageInfo: { hasNextPage: false }
			}
		}));
	});
	openTeamSwitcher({
		get user() {
			return user.current;
		},
		loadMoreTeams,
		searchTeams
	});
	typeTeamQuery('example');
	await finishTeamSearch();
	expect(loadMoreTeams).toHaveBeenCalledOnce();
	expect(searchTeams).toHaveBeenCalledExactlyOnceWith('example', undefined);
	expect(element('.popover-scope').textContent).toContain('Results from all teams');
});

it('does not report zero own-team matches if loading memberships fails', async () => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	openTeamSwitcher({
		user: {
			name: 'Test User',
			isAdmin: false,
			teams: {
				nodes: [{ team: ownTeam }],
				pageInfo: { hasNextPage: true }
			}
		},
		loadMoreTeams: vi.fn().mockRejectedValue(new Error('Memberships unavailable')),
		searchTeams
	});
	typeTeamQuery('example');
	await finishTeamSearch();
	expect(searchTeams).not.toHaveBeenCalled();
	expect(element('.graph-errors').textContent).toContain('Unable to search teams');
	expect(document.querySelector('.popover-empty')).toBeNull();
});

it('handles pagination-result errors even when the parent store does not publish them', async () => {
	const log = vi.spyOn(console, 'error').mockImplementation(() => {});
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	openTeamSwitcher({
		user: {
			name: 'Test User',
			isAdmin: false,
			teams: {
				nodes: [{ team: ownTeam }],
				pageInfo: { hasNextPage: true }
			}
		},
		loadMoreTeams: vi.fn().mockResolvedValue({ errors: [{ message: 'Memberships unavailable' }] }),
		searchTeams
	});
	typeTeamQuery('example');
	await finishTeamSearch();
	expect(log).toHaveBeenCalledWith('Unable to search teams:', new Error('Memberships unavailable'));
	expect(document.body.textContent).toContain('Try again');
	expect(searchTeams).not.toHaveBeenCalled();
});

it('retries resolved membership errors and resumes the all-team search after recovery', async () => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
	const userStore = writable({
		name: 'Test User',
		isAdmin: false,
		teams: {
			nodes: [{ team: ownTeam }],
			pageInfo: { hasNextPage: true }
		}
	});
	const errors = writable<{ message: string }[] | null>(null);
	const user = fromStore(userStore);
	const teamErrors = fromStore(errors);
	const searchTeams = vi.fn().mockResolvedValue(searchResult);
	const loadMoreTeams = vi
		.fn()
		.mockImplementationOnce(async () => {
			errors.set([{ message: 'Memberships unavailable' }]);
		})
		.mockImplementationOnce(async () => {
			errors.set(null);
			userStore.update((value) => ({
				...value,
				teams: {
					nodes: [...value.teams.nodes, { team: { ...ownTeam, id: 'nais-2', slug: 'nais-2' } }],
					pageInfo: { hasNextPage: false }
				}
			}));
		});
	openTeamSwitcher({
		get user() {
			return user.current;
		},
		get teamErrors() {
			return teamErrors.current;
		},
		loadMoreTeams,
		searchTeams
	});
	typeTeamQuery('example');
	await finishTeamSearch();
	expect(searchTeams).not.toHaveBeenCalled();
	expect(document.body.textContent).toContain('Unable to search teams');
	const retry = [...document.querySelectorAll<HTMLButtonElement>('.popover-list button')].find(
		(button) => button.textContent?.includes('Try again')
	);
	expect(retry).toBeDefined();
	retry!.click();
	await finishTeamSearch();
	expect(loadMoreTeams).toHaveBeenCalledTimes(2);
	expect(searchTeams).toHaveBeenCalledExactlyOnceWith('example', undefined);
	expect(element('.popover-item').textContent).toContain('example');
	expect(document.querySelector('.graph-errors')).toBeNull();
});

it('clearing a query prevents in-flight fallback results from replacing own teams', async () => {
	const pending = Promise.withResolvers<typeof searchResult>();
	openTeamSwitcher({ searchTeams: () => pending.promise });
	typeTeamQuery('example');
	await finishTeamSearch();
	typeTeamQuery('');
	pending.resolve(searchResult);
	await finishTeamSearch();
	expect(element('.popover-item').textContent).toContain('nais');
	expect(element('.popover-scope').textContent?.trim()).toBe('Your teams');
});

it('shows search failures explicitly and allows retrying', async () => {
	const log = vi.spyOn(console, 'error').mockImplementation(() => {});
	const searchTeams = vi
		.fn()
		.mockRejectedValueOnce(new Error('Network failed'))
		.mockResolvedValueOnce(searchResult);
	openTeamSwitcher({ searchTeams });
	typeTeamQuery('example');
	await finishTeamSearch();
	expect(element('.graph-errors').textContent).toContain('Unable to search teams');
	expect(document.querySelector('.popover-empty')).toBeNull();
	const retry = [...document.querySelectorAll<HTMLButtonElement>('.popover-list button')].find(
		(button) => button.textContent?.includes('Try again')
	);
	retry!.click();
	await finishTeamSearch();
	expect(log).toHaveBeenCalledOnce();
	expect(searchTeams).toHaveBeenCalledTimes(2);
	expect(element('.popover-item').textContent).toContain('example');
});
