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
					id
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

	const activeTypeName = $derived(($data?.__typename as string) ?? 'Unknown');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const raw = $derived($data as Record<string, any> | null);

	const workload = $derived(
		$data?.DeprecatedRegistryIssue?.workload ??
			$data?.ExternalIngressCriticalVulnerabilityIssue?.workload ??
			$data?.FailedSynchronizationIssue?.workload ??
			$data?.InvalidSpecIssue?.workload ??
			$data?.MissingSbomIssue?.workload ??
			$data?.NoRunningInstancesIssue?.workload ??
			$data?.ApplicationRestartLoopIssue?.workload ??
			$data?.VulnerableImageIssue?.workload ??
			$data?.WorkloadProblemIssue?.workload ??
			raw?.['workload'] ??
			null
	);

	function getResourceInfo(d: IssueData): {
		name: string;
		type: 'app' | 'job' | 'database' | 'other';
		href: string | null;
	} {
		const env = d.teamEnvironment.environment.name;
		const team = d.teamEnvironment.team.slug;

		if (workload) {
			const type = workload.__typename === 'Application' ? 'app' : 'job';
			return {
				name: workload.name,
				type: type === 'app' ? 'app' : 'job',
				href: `/team/${team}/${env}/${type}/${workload.name}`
			};
		}

		const da = raw!;
		if (d.DeprecatedIngressIssue || da['application']) {
			const name = d.DeprecatedIngressIssue?.application.name ?? da['application']?.name;
			if (name) return { name, type: 'app', href: `/team/${team}/${env}/app/${name}` };
		}
		if (d.LastRunFailedIssue || da['job']) {
			const name = d.LastRunFailedIssue?.job.name ?? da['job']?.name;
			if (name) return { name, type: 'job', href: `/team/${team}/${env}/job/${name}` };
		}
		if (d.SqlInstanceStateIssue || d.SqlInstanceVersionIssue || da['sqlInstance']) {
			const name =
				(d.SqlInstanceStateIssue ?? d.SqlInstanceVersionIssue)?.sqlInstance.name ??
				da['sqlInstance']?.name;
			if (name) return { name, type: 'database', href: `/team/${team}/${env}/cloudsql/${name}` };
		}
		if (d.OpenSearchIssue || da['openSearch']) {
			const name = d.OpenSearchIssue?.openSearch.name ?? da['openSearch']?.name;
			if (name) return { name, type: 'other', href: `/team/${team}/${env}/opensearch/${name}` };
		}
		if (d.ValkeyIssue || da['valkey']) {
			const name = d.ValkeyIssue?.valkey.name ?? da['valkey']?.name;
			if (name) return { name, type: 'other', href: `/team/${team}/${env}/valkey/${name}` };
		}
		if (d.UnleashReleaseChannelIssue || da['unleash']) {
			const name = d.UnleashReleaseChannelIssue?.unleash.name ?? da['unleash']?.name;
			if (name) return { name, type: 'other', href: null };
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

	let resource = $derived(
		$data ? getResourceInfo($data) : { name: 'Unknown', type: 'other' as const, href: null }
	);
	let title = $derived(getIssueTitle(activeTypeName));
</script>

{#if $data}
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
{/if}

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
