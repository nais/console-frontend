import { graphql as gql } from '$lib/urql/gql';

/**
 * Query for the application manifest page. Spreads the
 * `ManifestFragment` from `$lib/domain/resources/manifest` so the
 * `Manifest.svelte` component can render the YAML manifest content.
 */
export const AppManifestQuery = gql(/* GraphQL */ `
	query AppManifest($app: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			environment(name: $env) {
				workload(name: $app) {
					...ManifestFragment
				}
			}
		}
	}
`);
