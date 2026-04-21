import { graphql as gql } from '$lib/urql/gql';

/**
 * `Repositories` query for the team repositories page.
 *
 * Migrated from the previous Houdini `query.gql`. The Houdini-only
 * directives (`@cache`, `@paginate(mode: SinglePage)`, `@with(...) @mask_disable`
 * on `...SidebarActivityLogFragment`) have been dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` and the sidebar fragment is
 * spread without arguments (the urql `SidebarActivityLogFragment` has no
 * `@arguments` equivalent; the unfiltered selection is what every
 * consumer ends up rendering anyway).
 */
export const RepositoriesQuery = gql(/* GraphQL */ `
	query Repositories(
		$team: Slug!
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
		$orderBy: RepositoryOrder
		$filter: TeamRepositoryFilter
	) {
		team(slug: $team) {
			viewerIsMember
			viewerIsOwner
			repositories(
				first: $first
				last: $last
				before: $before
				after: $after
				orderBy: $orderBy
				filter: $filter
			) {
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
					name
					team {
						slug
					}
				}
			}
			...SidebarActivityLogFragment
		}
	}
`);

export const AddRepositoryMutation = gql(/* GraphQL */ `
	mutation AddRepository($repository: String!, $team: Slug!) {
		addRepositoryToTeam(input: { repositoryName: $repository, teamSlug: $team }) {
			repository {
				name
			}
		}
	}
`);

export const RemoveRepositoryMutation = gql(/* GraphQL */ `
	mutation RemoveRepository($repository: String!, $team: Slug!) {
		removeRepositoryFromTeam(input: { repositoryName: $repository, teamSlug: $team }) {
			success
		}
	}
`);
