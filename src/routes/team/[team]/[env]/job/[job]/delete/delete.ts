import { graphql as gql } from '$lib/urql/gql';

export const DeleteJobPageQuery = gql(/* GraphQL */ `
	query DeleteJobPage($job: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			slug
			environment(name: $env) {
				job(name: $job) {
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

export const DeleteJobMutation = gql(/* GraphQL */ `
	mutation DeleteJob($team: Slug!, $env: String!, $job: String!) {
		deleteJob(input: { teamSlug: $team, environmentName: $env, name: $job }) {
			success
		}
	}
`);
