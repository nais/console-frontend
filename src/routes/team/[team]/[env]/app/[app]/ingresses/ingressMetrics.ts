import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `IngressMetrics` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the application ingresses page
 * (`/team/[team]/[env]/app/[app]/ingresses`).
 */
export const IngressMetricsQuery = gql(/* GraphQL */ `
	query IngressMetrics($team: Slug!, $app: String!, $env: String!, $start: Time!, $end: Time!) {
		team(slug: $team) {
			environment(name: $env) {
				application(name: $app) {
					ingresses {
						url
						type
						metrics {
							rps: series(input: { end: $end, start: $start, type: REQUESTS_PER_SECOND }) {
								timestamp
								value
							}
							eps: series(input: { end: $end, start: $start, type: ERRORS_PER_SECOND }) {
								timestamp
								value
							}
						}
					}
				}
			}
		}
	}
`);
