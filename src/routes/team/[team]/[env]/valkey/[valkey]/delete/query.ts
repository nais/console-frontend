import { graphql as gql } from '$lib/urql/gql';

export const DeleteValkeyDataQuery = gql(/* GraphQL */ `
	query DeleteValkeyData($environment: String!, $team: Slug!, $name: String!) {
		team(slug: $team) {
			slug
			environment(name: $environment) {
				valkey(name: $name) {
					access(first: 1) {
						pageInfo {
							totalCount
						}
					}
				}
			}
		}
	}
`);
