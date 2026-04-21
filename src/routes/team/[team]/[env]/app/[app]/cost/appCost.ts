import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `AppCost` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the application cost page
 * (`/team/[team]/[env]/app/[app]/cost`).
 *
 * The Houdini `@cache(policy: NetworkOnly)` and `@loading` directives are
 * dropped — cache policy is set per-call site as needed and loading state
 * is handled in the component via the absence of `data`.
 */
export const AppCostQuery = gql(/* GraphQL */ `
	query AppCost($app: String!, $team: Slug!, $env: String!, $from: Date!, $to: Date!) {
		team(slug: $team) {
			environment(name: $env) {
				environment {
					name
				}
				application(name: $app) {
					cost {
						daily(from: $from, to: $to) {
							series {
								date
								services {
									cost
									service
								}
								sum
							}
						}
					}
				}
			}
		}
	}
`);
