import { graphql as gql } from '$lib/urql/gql';

/**
 * Page size used for both Onboarding queries. Mirrors the value previously
 * baked into the Houdini `@paginate` queries in `Onboarding.svelte`.
 */
export const ONBOARDING_PAGE_SIZE = 25;

/**
 * Search for teams by free-text query, used by the team-search field on the
 * onboarding page (shown when the signed-in user has no team memberships).
 */
export const OnboardingTeamSearchQuery = gql(/* GraphQL */ `
	query OnboardingTeamSearch(
		$query: String!
		$first: Int
		$after: Cursor
		$last: Int
		$before: Cursor
	) {
		search(
			first: $first
			after: $after
			last: $last
			before: $before
			filter: { type: TEAM, query: $query }
		) {
			edges {
				node {
					__typename
					... on Team {
						id
						slug
						purpose
					}
				}
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
				pageStart
				pageEnd
				totalCount
				startCursor
				endCursor
			}
		}
	}
`);

/**
 * Default (non-search) listing of all teams, shown on the onboarding page
 * when no search query has been entered yet.
 */
export const OnboardingTeamsQuery = gql(/* GraphQL */ `
	query OnboardingTeams($first: Int, $after: Cursor, $last: Int, $before: Cursor) {
		teams(first: $first, after: $after, last: $last, before: $before) {
			pageInfo {
				hasNextPage
				hasPreviousPage
				pageStart
				pageEnd
				totalCount
				startCursor
				endCursor
			}
			nodes {
				id
				slug
				purpose
			}
		}
	}
`);
