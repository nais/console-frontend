import { graphql as gql } from '$lib/urql/gql';

/**
 * `Alerts` query for the team alerts list page. Migrated from the
 * previous Houdini-based document in `query.gql`. The
 * `@cache(policy: NetworkOnly)` and `@paginate(mode: SinglePage)`
 * directives are dropped — pagination is URL-driven via
 * `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const AlertsQuery = gql(/* GraphQL */ `
	query Alerts(
		$team: Slug!
		$filter: TeamAlertsFilter
		$orderBy: AlertOrder
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			slug
			alerts(
				first: $first
				last: $last
				filter: $filter
				orderBy: $orderBy
				before: $before
				after: $after
			) {
				pageInfo {
					startCursor
					endCursor
					hasNextPage
					hasPreviousPage
					pageStart
					pageEnd
					totalCount
				}
				nodes {
					id
					name
					state
					query
					duration
					__typename
					... on PrometheusAlert {
						alarms {
							action
							consequence
							since
							summary
							state
							value
						}
						ruleGroup
					}
					team {
						slug
					}
					teamEnvironment {
						environment {
							name
						}
					}
				}
			}
			environments {
				id
				environment {
					name
				}
			}
		}
	}
`);

/**
 * `AlertsMetadata` query — fetches the team's environments and the
 * total number of alerts (used for the empty-state heuristic and the
 * environment-filter dropdown).
 */
export const AlertsMetadataQuery = gql(/* GraphQL */ `
	query AlertsMetadata($team: Slug!) {
		team(slug: $team) {
			environments {
				id
				environment {
					name
				}
			}
			totalAlerts: alerts {
				pageInfo {
					totalCount
				}
			}
		}
	}
`);
