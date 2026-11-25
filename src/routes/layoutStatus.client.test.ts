import { AdminReconcilerStatusStore, UserInfoStore } from '$houdini';
import { afterNavigate } from '$app/navigation';
import { appVersionUpdated, checkForUpdate, reloadForUpdate } from '#lib/stores/appVersion.js';
import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { fromStore, get, readable, writable } from 'svelte/store';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { LayoutProps } from './$types';
import Layout from './+layout.svelte';

const { pageState } = vi.hoisted(() => ({
	pageState: {
		data: { meta: {} },
		status: 200,
		url: new URL('https://console.example.com/team/nais')
	}
}));

vi.mock('$app/env', () => ({ browser: true, dev: false }));
vi.mock('$app/environment', () => ({ browser: true, building: false }));
vi.mock('$app/navigation', () => ({
	afterNavigate: vi.fn(),
	beforeNavigate: vi.fn()
}));
vi.mock('$app/state', () => ({
	page: pageState,
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
vi.mock('#lib/stores/appVersion.js', async () => {
	const { writable } = await import('svelte/store');
	return {
		appVersionUpdated: writable(false),
		checkForUpdate: vi.fn().mockResolvedValue(false),
		reloadForUpdate: vi.fn()
	};
});
vi.mock('./PageHeader.svelte', async () => ({
	default: (await import('#lib/shadcn/ui/Page.svelte')).default
}));
vi.mock('./Naisdevice.svelte', async () => ({
	default: (await import('@nais/ui')).Heading,
	isNaisdevice: () => false
}));

const initialError = 'Unable to load reconciler status. Try refreshing the page.';
let component: ReturnType<typeof Layout> | undefined;

beforeEach(() => {
	vi.useFakeTimers();
	appVersionUpdated.set(false);
	pageState.status = 200;
	vi.mocked(checkForUpdate).mockReset().mockResolvedValue(false);
	vi.mocked(reloadForUpdate).mockClear();
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
		legacyDeployDisabled: false,
		v0sVulnerabilities: false,
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

it('shows the update notification when the tenant has a different version', () => {
	renderLayout(data(new AdminReconcilerStatusStore()));
	expect(document.body.textContent).not.toContain('New version available');

	flushSync(() => appVersionUpdated.set(true));

	expect(document.body.textContent).toContain('New version available');
});

it.each([200, 500])(
	'only reloads a failed navigation when a different tenant version is detected (status %i)',
	async (status) => {
		renderLayout(data(new AdminReconcilerStatusStore()));
		pageState.status = status;
		vi.mocked(checkForUpdate).mockResolvedValue(true);
		const callback = vi.mocked(afterNavigate).mock.calls.at(-1)?.[0];
		if (!callback) throw new Error('Layout did not register afterNavigate');

		callback({
			type: 'enter',
			from: null,
			to: { params: {}, route: { id: null }, url: pageState.url, scroll: { x: 0, y: 0 } },
			willUnload: false,
			complete: Promise.resolve()
		});
		await Promise.resolve();

		if (status >= 400) {
			expect(reloadForUpdate).toHaveBeenCalledExactlyOnceWith(pageState.url);
		} else {
			expect(reloadForUpdate).not.toHaveBeenCalled();
		}
	}
);

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
