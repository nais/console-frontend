import { graphql as gql } from '$lib/urql/gql';

/**
 * Query loaded by the Valkey create page (`+page.ts`). Returns the
 * team's environments so the form can offer a dropdown of valid
 * `environmentName` values when creating a new instance. Only
 * environments with a `gcpProjectID` are shown in the UI.
 */
export const CreateValkeyEnvironmentsQuery = gql(/* GraphQL */ `
	query CreateValkeyEnvironments($slug: Slug!) {
		team(slug: $slug) {
			environments {
				gcpProjectID
				environment {
					name
				}
			}
		}
	}
`);
