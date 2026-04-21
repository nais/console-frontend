import { graphql as gql } from '$lib/urql/gql';

export const DeleteOpenSearchDataQuery = gql(/* GraphQL */ `
	query DeleteOpenSearchData($environment: String!, $team: Slug!, $name: String!) {
		team(slug: $team) {
			slug
			environment(name: $environment) {
				openSearch(name: $name) {
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
