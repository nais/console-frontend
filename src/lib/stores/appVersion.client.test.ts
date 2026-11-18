import { get } from 'svelte/store';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const environment = vi.hoisted(() => ({ browser: true, dev: false, version: 'build-a' }));
vi.mock('$app/env', () => environment);
vi.mock('$app/paths', () => ({ base: '' }));

let appVersion: typeof import('./appVersion.js');
const fetchVersion = vi.fn<typeof fetch>();
const assign = vi.fn();

beforeEach(async () => {
	vi.resetModules();
	environment.dev = false;
	fetchVersion.mockReset();
	assign.mockReset();
	sessionStorage.clear();
	vi.stubGlobal('fetch', fetchVersion);
	vi.stubGlobal('location', { origin: 'https://console.example.com', assign });
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	appVersion = await import('./appVersion.js');
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

it('checks the tenant version rather than the pinned CDN release and detects an update', async () => {
	fetchVersion.mockResolvedValue(Response.json({ version: 'build-b' }));

	expect(await appVersion.checkForUpdate()).toBe(true);
	expect(fetchVersion).toHaveBeenCalledExactlyOnceWith('/_app/version.json', {
		cache: 'no-store'
	});
	expect(get(appVersion.appVersionUpdated)).toBe(true);
});

it('shares an in-flight check and leaves the notification hidden for the current version', async () => {
	const response = Promise.withResolvers<Response>();
	fetchVersion.mockReturnValue(response.promise);
	const first = appVersion.checkForUpdate();
	const second = appVersion.checkForUpdate();
	expect(fetchVersion).toHaveBeenCalledTimes(1);

	response.resolve(Response.json({ version: 'build-a' }));
	expect(await first).toBe(false);
	expect(await second).toBe(false);
	expect(get(appVersion.appVersionUpdated)).toBe(false);
});

it.each([
	() => Promise.resolve(new Response(null, { status: 503 })),
	() => Promise.resolve(Response.json({ version: null })),
	() => Promise.reject(new TypeError('Network unavailable'))
])('logs a failed check without reloading and allows a later retry', async (failure) => {
	fetchVersion.mockImplementationOnce(failure);
	expect(await appVersion.checkForUpdate()).toBe(false);
	expect(console.warn).toHaveBeenCalledWith(
		'Unable to check for a new Console version:',
		expect.any(Error)
	);
	expect(assign).not.toHaveBeenCalled();

	fetchVersion.mockResolvedValue(Response.json({ version: 'build-b' }));
	expect(await appVersion.checkForUpdate()).toBe(true);
});

it('reloads the intended URL only once per loaded build and tab', async () => {
	fetchVersion.mockResolvedValue(Response.json({ version: 'build-b' }));
	await appVersion.checkForUpdate();
	const target = new URL('https://console.example.com/team/nais?tab=apps#details');

	appVersion.reloadForUpdate(target);
	appVersion.reloadForUpdate(target);

	expect(assign).toHaveBeenCalledExactlyOnceWith(target.href);
});

it('does not reload without an update or navigate to another origin', async () => {
	const target = new URL('https://console.example.com/team/nais');
	appVersion.reloadForUpdate(target);
	fetchVersion.mockResolvedValue(Response.json({ version: 'build-b' }));
	await appVersion.checkForUpdate();
	appVersion.reloadForUpdate(new URL('https://other.example.com'));

	expect(assign).not.toHaveBeenCalled();
});

it('does not risk a reload loop if session storage is unavailable', async () => {
	fetchVersion.mockResolvedValue(Response.json({ version: 'build-b' }));
	await appVersion.checkForUpdate();
	vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
		throw new DOMException('Storage unavailable', 'SecurityError');
	});

	appVersion.reloadForUpdate(new URL('https://console.example.com/team/nais'));

	expect(assign).not.toHaveBeenCalled();
	expect(console.warn).toHaveBeenCalledWith(
		'Unable to reload Console after a version update:',
		expect.any(DOMException)
	);
});

it('does not perform version checks in development', async () => {
	environment.dev = true;
	expect(await appVersion.checkForUpdate()).toBe(false);
	expect(fetchVersion).not.toHaveBeenCalled();
});
