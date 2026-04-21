import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Members` query for the team members list page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the team members list page
 * (`/team/[team]/members`).
 *
 * The `@paginate(mode: SinglePage)` directive from the Houdini document
 * is dropped — pagination is URL-driven via `cursorPaginationLoaders`
 * (see `$lib/urql/pagination`). The `@with(...) @mask_disable` modifiers
 * on the `SidebarActivityLogFragment` spread translate to passing
 * `$filter` straight through to the fragment's `activityLog` arguments;
 * the urql client preset doesn't mask fragments by default at the type
 * level the same way Houdini does, so the consumer reads the data
 * directly off `team.activityLog`.
 */
export const MembersQuery = gql(/* GraphQL */ `
	query Members(
		$team: Slug!
		$after: Cursor
		$before: Cursor
		$first: Int
		$last: Int
		$orderBy: TeamMemberOrder!
		$filter: ActivityLogFilter
	) {
		team(slug: $team) {
			slug
			members(after: $after, before: $before, first: $first, last: $last, orderBy: $orderBy) {
				pageInfo {
					totalCount
					hasNextPage
					hasPreviousPage
					pageStart
					pageEnd
					startCursor
					endCursor
				}
				edges {
					node {
						user {
							id
							email
							name
						}
						role
					}
				}
			}
			...SidebarActivityLogFragment
		}
	}
`);

/**
 * `DeleteTeamMember` mutation, invoked from the members list when an
 * owner removes a user from the team. Returns the team slug so urql's
 * graphcache can re-fetch the affected `members` connection.
 */
export const DeleteTeamMemberMutation = gql(/* GraphQL */ `
	mutation DeleteTeamMember($input: RemoveTeamMemberInput!) {
		removeTeamMember(input: $input) {
			team {
				slug
			}
		}
	}
`);

/**
 * Query used by the `AddMember` modal: lists candidate users (the full
 * user directory) and the team's current members so the UI can offer
 * only emails that aren't already on the team.
 */
export const AddMemberQuery = gql(/* GraphQL */ `
	query AddMemberQuery($team: Slug!) {
		users(first: 10000) {
			nodes {
				id
				email
			}
		}
		team(slug: $team) {
			members {
				nodes {
					user {
						email
					}
				}
			}
		}
	}
`);

/**
 * Mutation invoked from the `AddMember` modal to add a user to the team.
 */
export const AddTeamMemberMutation = gql(/* GraphQL */ `
	mutation AddTeamMember($input: AddTeamMemberInput!) {
		addTeamMember(input: $input) {
			member {
				team {
					members {
						nodes {
							user {
								email
							}
						}
					}
				}
				user {
					id
				}
			}
		}
	}
`);

/**
 * Query used by the `EditMember` modal: fetches a single team member's
 * current role and basic user info.
 */
export const TeamMemberQuery = gql(/* GraphQL */ `
	query TeamMember($team: Slug!, $email: String!) {
		team(slug: $team) {
			member(email: $email) {
				role
				user {
					id
					name
				}
			}
		}
	}
`);

/**
 * Mutation invoked from the `EditMember` modal to change a member's role.
 */
export const UpdateMemberRoleMutation = gql(/* GraphQL */ `
	mutation UpdateMemberRole($input: SetTeamMemberRoleInput!) {
		setTeamMemberRole(input: $input) {
			member {
				role
			}
		}
	}
`);
