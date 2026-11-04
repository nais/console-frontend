import { flushSync, mount, tick, unmount, type ComponentProps } from 'svelte';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { UnleashStore, UnleashReleaseChannelsStore } from '$houdini';
import UnleashPage from './+page.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({
	page: {
		params: { team: 'example' },
		data: { tenantName: 'example' }
	}
}));
vi.mock('$houdini', () => ({
	UnleashStore: class {
		subscribe = queryState.subscribe;
		fetch = vi.fn(async () => {});
	},
	UnleashReleaseChannelsStore: class {
		subscribe = writable({
			data: { unleashReleaseChannels: [] },
			errors: null
		}).subscribe;
	},
	graphql: () => ({
		subscribe: writable({ data: null, errors: null }).subscribe,
		mutate: vi.fn(async () => ({ errors: null }))
	})
}));

function instance(ready: boolean) {
	return {
		name: 'example',
		version: '7.6.5',
		releaseChannelName: 'unleash-v7',
		releaseChannel: null,
		allowedTeams: { edges: [{ node: { slug: 'example' } }] },
		webIngress: 'unleash.example.com',
		apiIngress: 'unleash-api.example.com',
		ready,
		metrics: {
			apiTokens: 0,
			cpuUtilization: 0,
			cpuRequests: 1,
			memoryUtilization: 0,
			memoryRequests: 1,
			toggles: 0
		}
	};
}

let component: ReturnType<typeof UnleashPage> | undefined;
let queryState = writable({
	data: { team: { unleash: null as ReturnType<typeof instance> | null } },
	errors: null,
	fetching: false
});

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
});

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
	vi.useRealTimers();
});

async function renderPage(ready: boolean | null) {
	const state = writable({
		data: { team: { unleash: ready === null ? null : instance(ready) } },
		errors: null,
		fetching: false
	});
	queryState = state;
	const query = new UnleashStore();
	const fetch = vi.mocked(query.fetch);
	component = mount(UnleashPage, {
		target: document.body,
		props: {
			params: { team: 'example' },
			data: {
				Unleash: query,
				UnleashReleaseChannels: new UnleashReleaseChannelsStore(),
				teamSlug: 'example',
				viewerIsMember: true
			}
		} as ComponentProps<typeof UnleashPage>
	});
	flushSync();
	await tick();
	return { state, fetch };
}

test('describes an existing not-ready instance without claiming it is being created', async () => {
	const { state, fetch } = await renderPage(false);
	expect(document.body.textContent).toContain('The Unleash instance is not ready.');
	expect(document.body.textContent).not.toContain('instance is being created');
	expect(document.querySelector('[aria-label="Unleash is not ready"]')).not.toBeNull();
	await vi.advanceTimersByTimeAsync(3000);
	expect(fetch).toHaveBeenCalledExactlyOnceWith({ policy: 'NetworkOnly' });

	state.update((value) => ({
		...value,
		data: { team: { unleash: instance(true) } }
	}));
	flushSync();
	await tick();
	expect(document.body.textContent).not.toContain('The Unleash instance is not ready.');
	await vi.advanceTimersByTimeAsync(6000);
	expect(fetch).toHaveBeenCalledTimes(1);
});

test('starts refreshing when a previously ready instance becomes not ready', async () => {
	const { state, fetch } = await renderPage(true);
	await vi.advanceTimersByTimeAsync(3000);
	expect(fetch).not.toHaveBeenCalled();

	state.update((value) => ({
		...value,
		data: { team: { unleash: instance(false) } }
	}));
	flushSync();
	await vi.advanceTimersByTimeAsync(3000);
	expect(fetch).toHaveBeenCalledTimes(1);

	state.update((value) => ({ ...value, fetching: true }));
	flushSync();
	await vi.advanceTimersByTimeAsync(3000);
	expect(fetch).toHaveBeenCalledTimes(1);

	await unmount(component!);
	component = undefined;
	await vi.advanceTimersByTimeAsync(6000);
	expect(fetch).toHaveBeenCalledTimes(1);
});

test('does not poll when no Unleash instance exists', async () => {
	const { fetch } = await renderPage(null);
	expect(document.body.textContent).toContain('Enable Unleash');
	await vi.advanceTimersByTimeAsync(6000);
	expect(fetch).not.toHaveBeenCalled();
});
