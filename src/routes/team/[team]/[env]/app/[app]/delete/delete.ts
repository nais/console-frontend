import { graphql as gql } from '$lib/urql/gql';

export const DeleteAppPageQuery = gql(/* GraphQL */ `
	query DeleteAppPage($app: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			slug
			environment(name: $env) {
				application(name: $app) {
					id
					name
					deletionStartedAt
					teamEnvironment {
						environment {
							name
						}
					}
					team {
						slug
					}
					bigQueryDatasets {
						nodes {
							id
							__typename
							name
							cascadingDelete
						}
					}
					buckets {
						nodes {
							id
							__typename
							name
							cascadingDelete
						}
					}
					valkeys {
						nodes {
							id
							__typename
							name
							terminationProtection
						}
					}
					sqlInstances {
						nodes {
							id
							__typename
							name
							cascadingDelete
						}
					}
				}
			}
		}
	}
`);

export const DeleteAppMutation = gql(/* GraphQL */ `
	mutation DeleteApp($team: Slug!, $env: String!, $app: String!) {
		deleteApplication(input: { teamSlug: $team, environmentName: $env, name: $app }) {
			success
		}
	}
`);
