import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { themeSwitch } from './theme.svelte.js';

vi.mock('$app/env', () => ({ browser: true }));

beforeEach(() => {
	themeSwitch.theme = 'light';
});

afterEach(() => {
	vi.unstubAllGlobals();
});

it('previews and persists the selected theme', async () => {
	const response = Promise.withResolvers<Response>();
	const fetch = vi.fn<typeof globalThis.fetch>(() => response.promise);
	vi.stubGlobal('fetch', fetch);
	const saved = themeSwitch.setTheme('dark');
	expect(themeSwitch.theme).toBe('dark');
	expect(fetch).toHaveBeenCalledWith('/api/theme', {
		method: 'POST',
		body: expect.any(FormData)
	});
	const request = new Request('http://localhost/api/theme', fetch.mock.calls[0][1]);
	expect((await request.formData()).get('theme')).toBe('dark');
	response.resolve(new Response('Theme set'));
	await saved;
	expect(themeSwitch.theme).toBe('dark');
});

it.each(['network', 'server'])('rolls back and reports a %s failure', async (failure) => {
	const error = new Error('Offline');
	vi.stubGlobal(
		'fetch',
		failure === 'network'
			? vi.fn().mockRejectedValue(error)
			: vi.fn().mockResolvedValue(new Response('Failed', { status: 500 }))
	);
	await expect(themeSwitch.setTheme('dark')).rejects.toThrow(
		failure === 'network' ? 'Offline' : 'Saving color theme failed (500)'
	);
	expect(themeSwitch.theme).toBe('light');
});
