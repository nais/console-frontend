import { AdminReconcilerStatusStore, UserInfoStore } from '$houdini';
import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { fromStore, get, readable, writable } from 'svelte/store';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { LayoutProps } from './$types';
import Layout from './+layout.svelte';

vi.mock('$app/env', () => ({ browser: true, dev: false }));
vi.mock('$app/environment', () => ({ browser: true, building: false }));
vi.mock('$app/navigation', () => ({
	afterNavigate: vi.fn(),
	beforeNavigate: vi.fn()
}));
vi.mock('$app/state', () => ({
	page: { data: { meta: {} } },
	navigating: { to: null },
	updated: { current: false }
}));
vi.mock('$houdini', () => ({
	AdminReconcilerStatusStore: class {
		subscribe = readable({ data: null, errors: null }).subscribe;
		fetch = vi.fn();
		loadNextPage = vi.fn();
	},
	UserInfoStore: class {
		subscribe = readable({ data: null, errors: null }).subscribe;
	},
	graphql: () => ({ fetch: vi.fn() })
}));
vi.mock('#lib/authentication.js', () => ({
	isAuthenticated: readable(true),
	isUnauthenticated: () => false
}));
vi.mock('#lib/stores/theme.svelte.js', () => ({ themeSwitch: { theme: 'light' } }));
vi.mock('./PageHeader.svelte', async () => ({
	default: (await import('#lib/shadcn/ui/Page.svelte')).default
}));
vi.mock('./Naisdevice.svelte', async () => ({
	default: (await import('#lib/shadcn/ui/Heading.svelte')).default,
	isNaisdevice: () => false
}));

const initialError = 'Unable to load reconciler status. Try refreshing the page.';
let component: ReturnType<typeof Layout> | undefined;

beforeEach(() => {
	vi.useFakeTimers();
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

function data(
	store: AdminReconcilerStatusStore,
	reconcilerStatusError: string | null = null
): LayoutProps['data'] {
	const userInfo = new UserInfoStore();
	return {
		UserInfo: Object.assign(
			userInfo,
			readable({
				...get(userInfo),
				data: { me: { __typename: 'User', isAdmin: true } }
			})
		),
		AdminReconcilerStatus: store,
		reconcilerStatusError,
		isAdmin: true,
		tenantName: 'test',
		githubOrganization: 'test',
		theme: 'light',
		userAgent: '',
		meta: {}
	};
}

function renderLayout(initialData: LayoutProps['data']) {
	const current = writable(initialData);
	const state = fromStore(current);
	component = mount(Layout, {
		target: document.body,
		props: {
			get data() {
				return state.current;
			},
			params: {},
			children: createRawSnippet(() => ({ render: () => '<div>Page content</div>' }))
		}
	});
	flushSync();
	return current;
}

it('retries the administrator fallback store and clears the initial load error after recovery', async () => {
	const store = new AdminReconcilerStatusStore();
	const fetch = vi.spyOn(store, 'fetch').mockResolvedValue(get(store));
	renderLayout(data(store, initialError));
	expect(document.body.textContent).toContain(initialError);

	await vi.advanceTimersByTimeAsync(30_000);
	flushSync();

	expect(fetch).toHaveBeenCalledExactlyOnceWith({ policy: 'NetworkOnly' });
	expect(document.body.textContent).not.toContain(initialError);
});

it('does not let a successful poll hide a later load failure using the same store', async () => {
	const store = new AdminReconcilerStatusStore();
	vi.spyOn(store, 'fetch').mockResolvedValue(get(store));
	const current = renderLayout(data(store));
	await vi.advanceTimersByTimeAsync(30_000);
	flushSync(() => current.set(data(store, initialError)));

	expect(document.body.textContent).toContain(initialError);
	await vi.advanceTimersByTimeAsync(30_000);
	flushSync();
	expect(document.body.textContent).not.toContain(initialError);
});

it('reports a current poll failure and clears it after recovery', async () => {
	const store = new AdminReconcilerStatusStore();
	const error = new Error('Status unavailable');
	vi.spyOn(store, 'fetch').mockRejectedValueOnce(error).mockResolvedValue(get(store));
	renderLayout(data(store));

	await vi.advanceTimersByTimeAsync(30_000);
	flushSync();

	expect(document.body.textContent).toContain(
		'Unable to refresh reconciler status. Try refreshing the page.'
	);
	expect(console.error).toHaveBeenCalledWith('Unable to refresh reconciler status:', error);

	await vi.advanceTimersByTimeAsync(30_000);
	flushSync();

	expect(document.body.textContent).not.toContain('Unable to refresh reconciler status');
});

it('ignores a successful in-flight poll after the load result changes', async () => {
	const store = new AdminReconcilerStatusStore();
	const poll = Promise.withResolvers<Awaited<ReturnType<typeof store.fetch>>>();
	vi.spyOn(store, 'fetch').mockReturnValue(poll.promise);
	const current = renderLayout(data(store));
	await vi.advanceTimersByTimeAsync(30_000);
	flushSync(() => current.set(data(store, initialError)));

	poll.resolve(get(store));
	await vi.advanceTimersByTimeAsync(0);
	flushSync();

	expect(document.body.textContent).toContain(initialError);
});

it('ignores an in-flight failure from a previous load and cleans up polling on unmount', async () => {
	const store = new AdminReconcilerStatusStore();
	const poll = Promise.withResolvers<Awaited<ReturnType<typeof store.fetch>>>();
	const fetch = vi.spyOn(store, 'fetch').mockReturnValue(poll.promise);
	const current = renderLayout(data(store));
	await vi.advanceTimersByTimeAsync(30_000);
	flushSync(() => current.set(data(new AdminReconcilerStatusStore())));

	poll.reject(new Error('Old poll failed'));
	await vi.advanceTimersByTimeAsync(0);
	flushSync();

	expect(document.body.textContent).not.toContain('Unable to refresh reconciler status');
	if (component) await unmount(component);
	component = undefined;
	await vi.advanceTimersByTimeAsync(30_000);
	expect(fetch).toHaveBeenCalledTimes(1);
	expect(vi.getTimerCount()).toBe(0);
});
