import { graphql as gql } from '../gql';

/**
 * Server-only query that fetches the signed-in user's identity.
 *
 * Used by API endpoints (e.g. `src/routes/api/send-feedback/+server.js`)
 * to authenticate the caller and pull their email address out of the
 * Nais API. Mirrors the previous Houdini `ServerGetUserStore` that the
 * same endpoints used.
 */
export const ServerGetUserQuery = gql(/* GraphQL */ `
	query ServerGetUser {
		me {
			__typename
			... on User {
				id
				email
			}
		}
	}
`);
