/**
 * Stub for SvelteKit's `$app/forms`, which is only resolvable through the SvelteKit Vite plugin.
 * Aliased in vitest.config.js so components using `use:enhance` can be rendered in tests.
 */
export function enhance() {
	return { destroy() {} };
}

export function applyAction() {
	return Promise.resolve();
}

export function deserialize<T>(result: string): T {
	return JSON.parse(result) as T;
}
