import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TeamOverview` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the team overview page (`/team/[team]`):
 * firing alerts banner and the issue-summary cards (todos / warnings /
 * criticals counts).
 *
 * The previous Houdini query also selected `issues` (with
 * `IssueFragment`) and `deployments`, but neither is consumed by
 * `+page.svelte`, so they are intentionally dropped here. Reintroduce
 * them if a future change actually needs them.
 */
export const TeamOverviewQuery = gql(/* GraphQL */ `
	query TeamOverview($team: Slug!) {
		team(slug: $team) {
			firingAlerts: alerts(filter: { states: [FIRING] }) {
				pageInfo {
					totalCount
				}
				nodes {
					id
					name
					state
					teamEnvironment {
						environment {
							name
						}
					}
				}
			}

			todos: issues(filter: { severity: TODO }) {
				pageInfo {
					totalCount
				}
			}
			warnings: issues(filter: { severity: WARNING }) {
				pageInfo {
					totalCount
				}
			}
			criticals: issues(filter: { severity: CRITICAL }) {
				pageInfo {
					totalCount
				}
			}
		}
	}
`);
