import { graphql as gql } from '$lib/urql/gql';

export const KafkaTopicQuery = gql(/* GraphQL */ `
	query KafkaTopic(
		$team: Slug!
		$name: String!
		$environment: String!
		$orderBy: KafkaTopicAclOrder
		$first: Int
		$after: Cursor
		$last: Int
		$before: Cursor
	) {
		team(slug: $team) {
			slug
			environment(name: $environment) {
				kafkaTopic(name: $name) {
					id
					__typename
					name
					teamEnvironment {
						environment {
							name
						}
					}
					configuration {
						cleanupPolicy
						maxMessageBytes
						minimumInSyncReplicas
						partitions
						retentionBytes
						retentionHours
						segmentHours
					}
					acl(first: $first, after: $after, last: $last, before: $before, orderBy: $orderBy) {
						pageInfo {
							hasNextPage
							hasPreviousPage
							totalCount
							pageStart
							pageEnd
							startCursor
							endCursor
						}
						nodes {
							access
							workloadName
							teamName
							workload {
								id
								teamEnvironment {
									environment {
										name
									}
								}
								name
								__typename
								team {
									slug
								}
							}
						}
					}
				}
			}
		}
	}
`);
