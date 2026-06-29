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
					... on WorkloadProblemIssue {
						workload {
							__typename
							name
						}
						problemType
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
			return { name: u.name, type: 'other', href: `/team/${team}/${env}/unleash/${u.name}` };
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
			ValkeyIssue: 'Valkey issue',
			WorkloadProblemIssue: 'Workload problem',
			UnleashReleaseChannelIssue: 'Unleash release channel'
		};
		return map[typename] ?? typename;
	}

	let resource = $derived(getResourceInfo($data));
	let title = $derived(getIssueTitle($data.__typename));
</script>

<a class="issue-row surface-interactive" href={resource.href}>
	<div class="surface-icon">
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
		--surface-accent-color: var(--ax-text-danger);
		--surface-icon-size: 2rem;
		--surface-icon-glyph-size: 1.1rem;
		--surface-icon-background: color-mix(in srgb, var(--ax-text-danger) 10%, transparent);
		--surface-icon-shadow: none;
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-12);
	}
</style>
