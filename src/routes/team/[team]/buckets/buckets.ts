import { graphql as gql } from '$lib/urql/gql';

export const BucketsQuery = gql(/* GraphQL */ `
	query Buckets(
		$team: Slug!
		$orderBy: BucketOrder
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
		$from: Date!
		$to: Date!
	) {
		team(slug: $team) {
			slug
			cost {
				daily(from: $from, to: $to, filter: { services: ["Cloud Storage"] }) {
					series {
						services {
							service
						}
						date
						sum
					}
				}
			}

			buckets(first: $first, last: $last, orderBy: $orderBy, before: $before, after: $after) {
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
					workload {
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
					}
				}
			}

			externalResources {
				cdn {
					bucket
				}
			}
		}
	}
`);
