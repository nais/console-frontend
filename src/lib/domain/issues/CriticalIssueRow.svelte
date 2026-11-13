<script lang="ts">
	import { fragment, graphql, type CriticalIssueRow } from '$houdini';
	import { BodyLong, Heading } from '#lib/shadcn/ui/index.js';
	import { ExclamationmarkTriangleFillIcon } from '#lib/icons/index.js';
	import { issueResource } from './issueResource.js';

	interface Props {
		issue: CriticalIssueRow;
	}

	let { issue }: Props = $props();

	let data = $derived(
		fragment(
			issue,
			graphql(`
				fragment CriticalIssueRow on Issue {
					__typename
					teamEnvironment {
						environment {
							name
						}
						team {
							slug
						}
					}
					message
					severity
					... on DeprecatedIngressIssue {
						application {
							name
						}
						ingresses
					}
					... on DeprecatedRegistryIssue {
						workload {
							__typename
							name
							image {
								name
							}
						}
					}
					... on ExternalIngressUrgentVulnerabilityIssue {
						priorityUrgent
						ingresses
						workload {
							__typename
							... on Application {
								__typename
								name
							}
							... on Job {
								__typename
								name
							}
						}
					}
					... on LastRunFailedIssue {
						job {
							name
						}
					}
					... on FailedSynchronizationIssue {
						workload {
							__typename
							name
						}
					}
					... on InvalidSpecIssue {
						workload {
							__typename
							name
						}
					}
					... on MissingSbomIssue {
						workload {
							__typename
							name
						}
					}
					... on NoRunningInstancesIssue {
						workload {
							__typename
							name
						}
					}
					... on ApplicationRestartLoopIssue {
						workload {
							__typename
							name
						}
					}
					... on OpenSearchIssue {
						event
						openSearch {
							name
						}
					}
					... on PostgresIssue {
						__typename
						severity
						message
						teamEnvironment {
							environment {
								name
							}
							team {
								slug
							}
						}
						postgres {
							name
						}
					}
					... on SqlInstanceStateIssue {
						sqlInstance {
							name
						}
						state
					}
					... on SqlInstanceVersionIssue {
						sqlInstance {
							name
						}
					}
					... on ValkeyIssue {
						valkey {
							name
						}
					}
					... on VulnerableImageIssue {
						workload {
							__typename
							name
						}
					}
					... on WorkloadProblemIssue {
						workload {
							__typename
							name
						}
					}
					... on UnleashReleaseChannelIssue {
						unleash {
							name
						}
					}
				}
			`)
		)
	);

	function getIssueTitle(typename: string): string {
		const map: Record<string, string> = {
			NoRunningInstancesIssue: 'No running instances',
			ApplicationRestartLoopIssue: 'Restart loop detected',
			FailedSynchronizationIssue: 'Sync failed',
			InvalidSpecIssue: 'Invalid specification',
			LastRunFailedIssue: 'Last run failed',
			DeprecatedIngressIssue: 'Deprecated ingress',
			DeprecatedRegistryIssue: 'Deprecated registry',
			ExternalIngressUrgentVulnerabilityIssue: 'Known exploited vulnerability on external ingress',
			MissingSbomIssue: 'Missing SBOM',
			VulnerableImageIssue: 'Vulnerable image',
			OpenSearchIssue: 'OpenSearch issue',
			PostgresIssue: 'Postgres failure',
			SqlInstanceStateIssue: 'Database unhealthy',
			SqlInstanceVersionIssue: 'Outdated database version',
			ValkeyIssue: 'Valkey issue',
			WorkloadProblemIssue: 'Workload problem',
			UnleashReleaseChannelIssue: 'Unleash release channel'
		};
		return map[typename] ?? typename;
	}

	let resource = $derived(issueResource($data));
	let title = $derived(getIssueTitle($data.__typename));
</script>

<a class="issue-row surface-interactive" href={resource.href}>
	<div class="surface-icon">
		<ExclamationmarkTriangleFillIcon />
	</div>
	<div class="issue-content">
		<Heading size="xsmall" level="2">
			{title} for {resource.name} in {$data.teamEnvironment.environment.name}
		</Heading>
		<BodyLong size="small">
			{$data.message}
		</BodyLong>
	</div>
</a>

<style>
	.issue-content {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-1);
	}

	.issue-row {
		--surface-accent-color: var(--destructive);
		--surface-icon-size: var(--nais-space-32);
		--surface-icon-glyph-size: var(--sh-font-size-lg);
		--surface-icon-background: color-mix(in srgb, var(--destructive) 10%, transparent);
		--surface-icon-shadow: none;
		display: flex;
		align-items: center;
		gap: var(--nais-space-12);
		padding: var(--nais-space-12);
	}
</style>
