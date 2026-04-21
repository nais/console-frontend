import { graphql as gql } from '$lib/urql/gql';

export const UpdateOpenSearchDataQuery = gql(/* GraphQL */ `
	query UpdateOpenSearchData($environment: String!, $team: Slug!, $name: String!) {
		team(slug: $team) {
			slug
			environment(name: $environment) {
				openSearch(name: $name) {
					name
					tier
					memory
					version {
						desiredMajor
					}
					storageGB
				}
			}
		}
	}
`);
