import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PageHeader from './PageHeader.svelte';

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
