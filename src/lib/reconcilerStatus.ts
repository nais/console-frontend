import type { AdminReconcilerStatus$result, AdminReconcilerStatusStore } from '$houdini';
import { get } from 'svelte/store';

export function hasReconcilerErrors(data: AdminReconcilerStatus$result | null | undefined) {
	return data?.reconcilers.edges.some(({ node }) => node.errors.pageInfo.totalCount > 0) ?? false;
}

export async function loadRemainingReconcilerPages(
	store: Pick<AdminReconcilerStatusStore, 'subscribe' | 'loadNextPage'>,
	fetch?: typeof globalThis.fetch
) {
	while (!get(store).errors?.length && get(store).data?.reconcilers.pageInfo.hasNextPage) {
		const result = await (fetch ? store.loadNextPage({ fetch }) : store.loadNextPage());
		if (result.errors?.length) {
			throw new Error(result.errors.map(({ message }) => message).join('; '));
		}
	}
}
