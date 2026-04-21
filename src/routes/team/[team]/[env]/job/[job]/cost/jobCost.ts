import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `JobCost` query for the job cost page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/job/[job]/cost`. The
 * `@cache(policy: NetworkOnly)` and `@loading` directives from the
 * Houdini document are dropped — they have no urql equivalent.
 */
export const JobCostQuery = gql(/* GraphQL */ `
	query JobCost($job: String!, $team: Slug!, $env: String!, $from: Date!, $to: Date!) {
		team(slug: $team) {
			environment(name: $env) {
				job(name: $job) {
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
