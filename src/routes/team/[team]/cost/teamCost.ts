import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TeamCost` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the team cost overview page (`/team/[team]/cost`).
 *
 * The Houdini `@cache(policy: NetworkOnly)` and `@loading` directives are
 * dropped — cache policy is set per-call site as needed and loading state
 * is handled in the component via the absence of `data`.
 */
export const TeamCostQuery = gql(/* GraphQL */ `
	query TeamCost($team: Slug!, $from: Date!, $to: Date!) {
		team(slug: $team) {
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
`);
