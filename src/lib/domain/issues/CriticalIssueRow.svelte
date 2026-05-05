<script lang="ts">
	import { fragment, graphql, type CriticalIssueRow } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import { Tag } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		issue: CriticalIssueRow;
	}

	let { issue }: Props = $props();

	let data = $derived(
		fragment(
			issue,
			graphql(`
				fragment CriticalIssueRow on Issue {
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
					... on ExternalIngressCriticalVulnerabilityIssue {
						cvssScore
						ingresses
						workload {
							__typename
							name
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
			ExternalIngressCriticalVulnerabilityIssue: 'Critical CVE on external ingress',
			MissingSbomIssue: 'Missing SBOM',
			VulnerableImageIssue: 'Vulnerable image',
			OpenSearchIssue: 'OpenSearch issue',
			SqlInstanceStateIssue: 'Database unhealthy',
			SqlInstanceVersionIssue: 'Outdated database version',
			ValkeyIssue: 'Valkey issue'
		};
		return map[typename] ?? typename;
	}

	let resource = $derived(getResourceInfo($data));
	let title = $derived(getIssueTitle($data.__typename));
</script>

<a class="issue-row" href={resource.href}>
	<div class="issue-severity-icon">
		<ExclamationmarkTriangleFillIcon />
	</div>
	<div class="issue-body">
		<span class="issue-title">{title}</span>
		<div class="issue-resource">
			<span class="issue-resource-name">{resource.name}</span>
			<Tag size="xsmall" variant={envTagVariant($data.teamEnvironment.environment.name)}>
				{$data.teamEnvironment.environment.name}
			</Tag>
		</div>
		<span class="issue-message">{$data.message}</span>
	</div>
</a>

<style>
	.issue-row {
		display: flex;
		align-items: flex-start;
		gap: var(--ax-space-8);
		padding: var(--ax-space-12);
		border-radius: var(--ax-radius-8);
		background: linear-gradient(to right, var(--ax-bg-danger-soft), var(--ax-bg-default));
		border: 1px solid var(--ax-border-neutral-subtleA);
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
		text-decoration: none;
		color: inherit;
	}

	.issue-row:hover {
		box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
	}

	.issue-severity-icon {
		color: var(--ax-text-danger);
		display: flex;
		flex-shrink: 0;
		padding-top: 2px;
	}

	.issue-body {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
		min-width: 0;
		flex: 1;
	}

	.issue-title {
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral);
	}

	.issue-resource {
		display: flex;
		align-items: center;
		gap: var(--ax-space-6);
		flex-wrap: wrap;
	}

	.issue-resource-name {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		font-family: monospace;
	}

	.issue-message {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		overflow-wrap: anywhere;
	}
</style>
