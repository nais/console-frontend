import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Job` query for the job detail page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/job/[job]`.
 *
 * Houdini directives (`@cache`) are dropped — they have no urql
 * equivalent.
 */
export const JobQuery = gql(/* GraphQL */ `
	query Job($job: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			environment(name: $env) {
				job(name: $job) {
					__typename
					id
					name
					deletionStartedAt
					team {
						slug
					}
					image {
						hasSBOM
						vulnerabilitySummary {
							critical
							high
							medium
							low
							unassigned
							riskScore
							lastUpdated
						}
					}
					issues {
						edges {
							node {
								id
								...IssueFragment
							}
						}
					}
					schedule {
						expression
						timeZone
					}
					teamEnvironment {
						environment {
							name
						}
					}
					deployments(first: 1) {
						nodes {
							triggerUrl
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
						}
					}

					...SidebarActivityLogFragment
					...JobRunsFragment
					...PersistenceFragment
					...WorkloadDeployFragment
					...NetworkPolicyFragment
					...ManifestFragment
				}
			}
		}
	}
`);

/**
 * `TriggerJob` mutation, invoked when a team member triggers a new
 * run of the job from the runs panel (or the trigger run modal).
 */
export const TriggerJobMutation = gql(/* GraphQL */ `
	mutation TriggerJob(
		$teamSlug: Slug!
		$environment: String!
		$jobName: String!
		$runName: String!
	) {
		triggerJob(
			input: {
				environmentName: $environment
				teamSlug: $teamSlug
				runName: $runName
				name: $jobName
			}
		) {
			jobRun {
				id
				name
			}
		}
	}
`);

/**
 * `DeleteJobRun` mutation, invoked when a team member deletes a run
 * from the runs panel.
 */
export const DeleteJobRunMutation = gql(/* GraphQL */ `
	mutation DeleteJobRun($teamSlug: Slug!, $environment: String!, $runName: String!) {
		deleteJobRun(input: { teamSlug: $teamSlug, environmentName: $environment, runName: $runName }) {
			success
		}
	}
`);
