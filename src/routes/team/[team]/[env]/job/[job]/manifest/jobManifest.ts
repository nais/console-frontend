import { graphql as gql } from '$lib/urql/gql';

/**
 * Query for the job manifest page. Spreads the `ManifestFragment` from
 * `$lib/domain/resources/manifest` so the `Manifest.svelte` component
 * can render the YAML manifest content.
 */
export const JobManifestQuery = gql(/* GraphQL */ `
	query JobManifest($job: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			environment(name: $env) {
				workload(name: $job) {
					...ManifestFragment
				}
			}
		}
	}
`);
