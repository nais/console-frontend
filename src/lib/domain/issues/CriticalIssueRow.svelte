<script lang="ts">
	import { fragment, graphql, type CriticalIssueRow } from '$houdini';
	import { ShBadge } from '#lib/shadcn/ui/index.js';

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

	type IssueData = typeof $data;

	function getResourceInfo(d: IssueData): {
		name: string;
		type: 'app' | 'job' | 'database' | 'other';
		href: string | null;
	} {
		const env = d.teamEnvironment.environment.name;
		const team = d.teamEnvironment.team.slug;

		if ('workload' in d && d.workload) {
			const w = d.workload as { __typename: string; name: string };
			const type = w.__typename === 'Application' ? 'app' : 'job';
			return {
				name: w.name,
				type: type === 'app' ? 'app' : 'job',
				href: `/team/${team}/${env}/${type}/${w.name}`
			};
		}
		if ('application' in d && d.application) {
			const a = d.application as { name: string };
			return { name: a.name, type: 'app', href: `/team/${team}/${env}/app/${a.name}` };
		}
		if ('job' in d && d.job) {
			const j = d.job as { name: string };
			return { name: j.name, type: 'job', href: `/team/${team}/${env}/job/${j.name}` };
		}
		if ('sqlInstance' in d && d.sqlInstance) {
			const s = d.sqlInstance as { name: string };
			return { name: s.name, type: 'database', href: `/team/${team}/${env}/cloudsql/${s.name}` };
		}
		if ('openSearch' in d && d.openSearch) {
			const o = d.openSearch as { name: string };
			return { name: o.name, type: 'other', href: `/team/${team}/${env}/opensearch/${o.name}` };
		}
		if ('valkey' in d && d.valkey) {
			const v = d.valkey as { name: string };
			return { name: v.name, type: 'other', href: `/team/${team}/${env}/valkey/${v.name}` };
		}
		if ('unleash' in d && d.unleash) {
			const u = d.unleash as { name: string };
			return { name: u.name, type: 'other', href: `/team/${team}/unleash` };
		}
		return { name: 'Unknown', type: 'other', href: null };
	}

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
			SqlInstanceStateIssue: 'Database unhealthy',
			SqlInstanceVersionIssue: 'Outdated database version',
			ValkeyIssue: 'Valkey issue',
			WorkloadProblemIssue: 'Workload problem',
			UnleashReleaseChannelIssue: 'Unleash release channel'
		};
		return map[typename] ?? typename;
	}

	let resource = $derived(getResourceInfo($data));
	let title = $derived(getIssueTitle($data.__typename));
</script>

<a class="issue-row" href={resource.href}>
	<span class="issue-status-dot" aria-hidden="true"></span>
	<div class="issue-body">
		<div class="issue-title-row">
			<span class="issue-resource">{resource.name}</span>
			<ShBadge variant="secondary" mono>{$data.teamEnvironment.environment.name}</ShBadge>
			<span class="issue-title">{title}</span>
		</div>
		<p class="issue-message">{$data.message}</p>
	</div>
</a>

<style>
	.issue-row {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--border);
		background-color: var(--card);
		text-decoration: none;
		color: var(--foreground);
		transition:
			background-color 120ms ease,
			border-color 120ms ease;
	}

	.issue-row:hover {
		background-color: var(--secondary);
		border-color: var(--border-strong);
		text-decoration: none;
	}

	.issue-status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		background-color: var(--destructive);
		flex-shrink: 0;
		margin-top: 0.375rem;
	}

	.issue-body {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
		flex: 1;
	}

	.issue-title-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.issue-resource {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.issue-title {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--destructive);
		margin-left: auto;
	}

	.issue-message {
		margin: 0;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		line-height: 1.4;
	}
</style>
