import { AdminReconcilerStatusStore, type AdminReconcilerStatus$result } from '$houdini';
import { get, writable } from 'svelte/store';
import { vi } from 'vitest';
import { hasReconcilerErrors, loadRemainingReconcilerPages } from './reconcilerStatus.js';

vi.mock('$app/environment', () => ({ browser: false, building: false }));

function status(counts: number[], hasNextPage = false): AdminReconcilerStatus$result {
	return {
		reconcilers: {
			edges: counts.map((totalCount, index) => ({
				cursor: `${index}`,
				node: { id: `${index}`, errors: { pageInfo: { totalCount } } }
			})),
			pageInfo: {
				hasNextPage,
				hasPreviousPage: false,
				startCursor: '0',
				endCursor: `${counts.length - 1}`
			}
		}
	};
}

test.each([
	[[], false],
	[[0, 0], false],
	[[0, 65], true],
	[[1, 0], true]
])('aggregates errors across reconciler counts %j', (counts, expected) => {
	expect(hasReconcilerErrors(status(counts))).toBe(expected);
});

test('handles data not loaded yet', () => {
	expect(hasReconcilerErrors(null)).toBe(false);
	expect(hasReconcilerErrors(undefined)).toBe(false);
});

test('loads all pages and preserves an error from an earlier page', async () => {
	const store = new AdminReconcilerStatusStore();
	const state = writable({ ...get(store), data: status([65], true) });
	Object.assign(store, { subscribe: state.subscribe });
	const loadNextPage = vi.spyOn(store, 'loadNextPage').mockImplementation(async () => {
		state.update((current) => ({ ...current, data: status([65, 0]) }));
		return get(store);
	});
	const fetch = vi.fn<typeof globalThis.fetch>();

	await loadRemainingReconcilerPages(store, fetch);

	expect(loadNextPage).toHaveBeenCalledExactlyOnceWith({ fetch });
	expect(hasReconcilerErrors(get(store).data)).toBe(true);
});

test('detects an error on a later page and clears when refreshed data is healthy', async () => {
	const store = new AdminReconcilerStatusStore();
	const state = writable({ ...get(store), data: status([0], true) });
	Object.assign(store, { subscribe: state.subscribe });
	vi.spyOn(store, 'loadNextPage').mockImplementation(async () => {
		state.update((current) => ({ ...current, data: status([0, 1]) }));
		return get(store);
	});

	await loadRemainingReconcilerPages(store);
	expect(hasReconcilerErrors(get(store).data)).toBe(true);
	state.update((current) => ({ ...current, data: status([0, 0]) }));
	expect(hasReconcilerErrors(get(store).data)).toBe(false);
});

test('reports pagination errors instead of treating a partial result as healthy', async () => {
	const store = new AdminReconcilerStatusStore();
	Object.assign(store, writable({ ...get(store), data: status([0], true) }));
	vi.spyOn(store, 'loadNextPage').mockResolvedValue({
		...get(store),
		errors: [{ message: 'Status unavailable' }]
	});

	await expect(loadRemainingReconcilerPages(store)).rejects.toThrow('Status unavailable');
});
