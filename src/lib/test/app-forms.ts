/**
 * Stub for SvelteKit's `$app/forms`, which is only resolvable through the SvelteKit Vite plugin.
 * Aliased in vitest.config.js so components using `use:enhance` can be rendered in tests.
 *
 * Only the exports the app actually imports are stubbed; add the others if a component starts
 * using them.
 */
export function enhance() {
	return { destroy() {} };
}
