import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TeamRoles` query.
 *
 * Mirrors the previous Houdini-based query in `teamRoles.gql`. Loaded by
 * `+layout.ts` to gate access to the team route (404 when the team is
 * unknown to the viewer) and to expose a small set of fields that the
 * layout and a handful of descendant routes rely on (`viewerIsOwner`,
 * `viewerIsMember`, `deletionInProgress`, `lastSuccessfulSync`,
 * `externalResources.gitHubTeam`, `purpose`, members `totalCount`).
 */
export const TeamRolesQuery = gql(/* GraphQL */ `
	query TeamRoles($team: Slug!) {
		team(slug: $team) {
			members {
				pageInfo {
					totalCount
				}
			}
			viewerIsOwner
			viewerIsMember
			deletionInProgress
			lastSuccessfulSync
			externalResources {
				gitHubTeam {
					slug
				}
			}
			purpose
		}
	}
`);
