import { graphql as gql } from '../gql';

/**
 * Typed UserInfo query.
 *
 * Mirrors the previous Houdini-based query in `src/routes/userInfo.gql`.
 * Loaded once by the root `+layout.ts` and exposed to every descendant
 * route via `event.parent()`. Among other things, gates the auth flow
 * (the root layout swaps the page out for the login screen if `me` is
 * not a `User`) and powers the per-feature toggles read by routes like
 * `/team/[team]/opensearch`, `/team/[team]/valkey`, `/team/[team]/unleash`.
 *
 * NOTE: The generated helper is imported under the alias `gql` because
 * the Houdini Vite plugin rewrites any `graphql(...)` call expression in
 * the project (regardless of import source). Drop the alias once Houdini
 * is removed (Phase 4).
 */
export const UserInfoQuery = gql(/* GraphQL */ `
	query UserInfo {
		me {
			__typename
			... on User {
				id
				name
				isAdmin
			}
		}
		features {
			unleash {
				enabled
			}
			valkey {
				enabled
			}
			kafka {
				enabled
			}
			openSearch {
				enabled
			}
		}
	}
`);

/**
 * Lightweight query whose only purpose is to bump the auth cookie's
 * sliding expiration. Issued from `+layout.svelte` on a 10-minute
 * interval while the tab is open, with a `network-only` request policy
 * so it never hits the urql cache.
 */
export const RefreshCookieQuery = gql(/* GraphQL */ `
	query RefreshCookie {
		me {
			__typename
		}
	}
`);
