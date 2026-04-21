import { graphql as gql } from '$lib/urql/gql';

export const UpdateValkeyDataQuery = gql(/* GraphQL */ `
	query UpdateValkeyData($environment: String!, $team: Slug!, $name: String!) {
		team(slug: $team) {
			slug
			environment(name: $environment) {
				valkey(name: $name) {
					name
					tier
					memory
					maxMemoryPolicy
					notifyKeyspaceEvents
					databases
				}
			}
		}
	}
`);
