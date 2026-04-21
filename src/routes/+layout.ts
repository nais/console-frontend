import { runQuery } from '$lib/urql/load';
import { UserInfoQuery } from '$lib/urql/queries/userInfo';

/**
 * Root universal load.
 *
 * Loads the `UserInfo` query through urql (see `runQuery`) and exposes
 * it under the `UserInfo` key so descendant routes can pull it off
 * `event.parent()`. Also forwards the `urqlState` from
 * `+layout.server.ts` so the browser-side `+layout.svelte` can hydrate
 * its urql client without re-fetching anything.
 *
 * The `UserInfo` query is allowed to fail with `Unauthorized` without
 * flipping the `isAuthenticated` store — the root layout reads the
 * errors directly and renders the login screen when appropriate. (This
 * mirrors the previous Houdini setup, where `handleMissingLogin` was
 * configured to ignore the `UserInfo` operation.)
 */
export async function load(event) {
	const UserInfo = await runQuery(event, UserInfoQuery, {}, { ignoreAuthErrors: true });

	return {
		// Ensure `meta` is always present so `+layout.svelte` can read
		// `page.data.meta.breadcrumbs` etc. without guarding for undefined.
		meta: {},
		...event.data,
		UserInfo
	};
}
