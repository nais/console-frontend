import { createUrqlClient } from '$lib/urql/client';
import { USER_TEAMS_PAGE_SIZE, UserTeamsQuery } from '$lib/urql/queries/userTeams';

/**
 * Read pagination cursors from the current URL.
 *
 * We drive pagination through query string parameters so that pages remain
 * shareable and `Pagination.svelte` can keep working without a stateful
 * paginated store like the one Houdini provided.
 */
function readPagination(url: URL): {
	first?: number;
	after?: string;
	last?: number;
	before?: string;
} {
	const after = url.searchParams.get('after');
	const before = url.searchParams.get('before');

	if (before) {
		return { last: USER_TEAMS_PAGE_SIZE, before };
	}
	return { first: USER_TEAMS_PAGE_SIZE, after: after ?? undefined };
}

export async function load(event) {
	const { fetch, url } = event;

	const { client, ssr } = createUrqlClient({ fetch });

	const variables = readPagination(url);

	const result = await client.query(UserTeamsQuery, variables).toPromise();

	return {
		// Forward the SSR cache so the client can hydrate without re-fetching.
		urqlState: ssr.extractData(),
		UserTeams: {
			data: result.data ?? null,
			error: result.error ?? null,
			variables
		}
	};
}
