<script lang="ts">
	import { fragment, graphql, type CriticalIssueRow } from '$houdini';
	import { BodyLong, Heading, VStack } from '@nais/ds-svelte-community';
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
	<div class="issue-icon">
		<ExclamationmarkTriangleFillIcon />
	</div>
	<VStack gap="space-1">
		<Heading size="xsmall" level="2">
			{title} for {resource.name} in {$data.teamEnvironment.environment.name}
		</Heading>
		<BodyLong size="small">
			{$data.message}
		</BodyLong>
	</VStack>
</a>

<style>
	.issue-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-12);
		border-radius: var(--ax-radius-8);
		background: color-mix(in srgb, var(--ax-bg-default) 82%, transparent);
		box-shadow: 0 0 0 1px var(--ax-border-neutral-subtleA);
		transition:
			background-color 120ms ease,
			box-shadow 120ms ease,
			transform 120ms ease;
		text-decoration: none;
		color: inherit;
	}

	.issue-row:hover {
		background: color-mix(in srgb, var(--surface-icon-color) 8%, var(--ax-bg-default));
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--surface-icon-color) 24%, transparent),
			0 8px 12px -10px var(--surface-shadow-color);
		transform: translateY(-1px);
	}

	.issue-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		border-radius: var(--ax-radius-8);
		font-size: 1.1rem;
		color: var(--ax-text-danger);
		background: color-mix(in srgb, var(--ax-text-danger) 10%, transparent);
	}
</style>
