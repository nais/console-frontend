import { graphql as gql } from '$lib/urql/gql';

export const PostgresInstancesQuery = gql(/* GraphQL */ `
	query PostgresInstances(
		$team: Slug!
		$orderBy: PostgresInstanceOrder
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			slug
			inventoryCounts {
				sqlInstances {
					total
				}
			}

			postgresInstances(
				first: $first
				last: $last
				orderBy: $orderBy
				before: $before
				after: $after
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
					__typename
					name
					teamEnvironment {
						environment {
							name
						}
					}
					team {
						slug
					}
					majorVersion
					state
				}
			}
		}
	}
`);
