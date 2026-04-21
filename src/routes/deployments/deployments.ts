import { graphql as gql } from '$lib/urql/gql';

export const TenantDeploymentsQuery = gql(/* GraphQL */ `
	query TenantDeployments(
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
		$filter: DeploymentFilter
	) {
		deployments(first: $first, last: $last, before: $before, after: $after, filter: $filter) {
			pageInfo {
				hasNextPage
				endCursor
				hasPreviousPage
				pageEnd
				pageStart
				startCursor
				totalCount
			}
			nodes {
				id
				statuses {
					nodes {
						state
						message
						createdAt
					}
				}
				resources {
					nodes {
						id
						kind
						name
					}
				}
				environmentName
				createdAt
				teamSlug
				repository
				commitSha
				deployerUsername
				triggerUrl
			}
		}
	}
`);

export const DeploymentsMetadataQuery = gql(/* GraphQL */ `
	query DeploymentsMetadata {
		environments {
			nodes {
				id
				name
			}
		}
	}
`);
