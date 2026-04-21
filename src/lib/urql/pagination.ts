/**
 * URL-driven cursor pagination helpers for urql.
 *
 * Houdini exposes a stateful `paginated` store that knows how to advance
 * itself. We don't want that abstraction with urql: keeping pagination in
 * the URL means pages remain shareable and the back button works. These
 * helpers make converting a `@paginate` query into urql roughly five
 * lines: read pagination off the URL in the `load`, pass it as variables,
 * and hand `Pagination.svelte` the loaders produced from `pageInfo`.
 */

import { goto } from '$app/navigation';

/**
 * Variables understood by GraphQL `Connection`-style fields. Exactly one
 * of (`first`, `after`) or (`last`, `before`) is populated at a time,
 * matching the Relay cursor-pagination spec.
 */
export interface CursorPaginationVariables {
	first?: number;
	after?: string;
	last?: number;
	before?: string;
}

/**
 * Subset of `pageInfo` that {@link cursorPaginationLoaders} reads from.
 * Matches what `Pagination.svelte` already consumes, so any
 * `pageInfo { ... }` selection that includes `start/endCursor` works.
 */
export interface CursorPageInfo {
	readonly startCursor?: string | null;
	readonly endCursor?: string | null;
}

/**
 * Read cursor-pagination variables from the current URL.
 *
 * Recognized search params:
 *   - `?after=<cursor>` → forward page ({ first: pageSize, after })
 *   - `?before=<cursor>` → backward page ({ last: pageSize, before })
 *   - neither           → first page ({ first: pageSize })
 *
 * `before` takes precedence over `after` if both are present (the user
 * just clicked the "previous" button).
 */
export function readCursorPagination(url: URL, pageSize: number): CursorPaginationVariables {
	const after = url.searchParams.get('after');
	const before = url.searchParams.get('before');

	if (before) {
		return { last: pageSize, before };
	}
	if (after) {
		return { first: pageSize, after };
	}
	return { first: pageSize };
}

/**
 * Replace the `?after` / `?before` params on the current URL and navigate
 * to it. We `goto` instead of mutating `window.location` so SvelteKit
 * re-runs the affected `load` functions and `Pagination.svelte` ends up
 * disabled briefly while the next page loads.
 */
function navigateToCursor(currentUrl: URL, params: { after?: string; before?: string }): void {
	const url = new URL(currentUrl);
	url.searchParams.delete('after');
	url.searchParams.delete('before');
	if (params.after) url.searchParams.set('after', params.after);
	if (params.before) url.searchParams.set('before', params.before);
	goto(url, { keepFocus: true, noScroll: true });
}

/**
 * Build the `loaders` object that `Pagination.svelte` expects from a
 * `pageInfo` selection.
 *
 * Usage:
 *
 * ```svelte
 * <Pagination
 *   page={data.Thing.data?.things.pageInfo}
 *   loaders={cursorPaginationLoaders(page.url, data.Thing.data?.things.pageInfo)}
 * />
 * ```
 *
 * If `pageInfo` is undefined (e.g. the query is still loading or errored),
 * the loaders are no-ops, which is safe because `Pagination.svelte`
 * disables its buttons in that case.
 */
export function cursorPaginationLoaders(
	currentUrl: URL,
	pageInfo: CursorPageInfo | null | undefined
): { loadNextPage: () => void; loadPreviousPage: () => void } {
	return {
		loadNextPage: () => {
			if (pageInfo?.endCursor) {
				navigateToCursor(currentUrl, { after: pageInfo.endCursor });
			}
		},
		loadPreviousPage: () => {
			if (pageInfo?.startCursor) {
				navigateToCursor(currentUrl, { before: pageInfo.startCursor });
			}
		}
	};
}
