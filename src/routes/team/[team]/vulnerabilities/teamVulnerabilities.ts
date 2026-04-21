import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TeamVulnerabilities` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the team vulnerabilities overview page
 * (`/team/[team]/vulnerabilities`).
 *
 * The Houdini `@cache(policy: CacheAndNetwork)` directive is dropped —
 * cache policy is set per-call site as needed.
 */
export const TeamVulnerabilitiesQuery = gql(/* GraphQL */ `
	query TeamVulnerabilities($team: Slug!) {
		team(slug: $team) {
			environments {
				id
				environment {
					name
				}
			}
			workloads {
				pageInfo {
					totalCount
				}
			}

			vulnerabilitySummary {
				sbomCount
				coverage
				critical
				riskScore
				riskScoreTrend
				lastUpdated
			}
		}
	}
`);
