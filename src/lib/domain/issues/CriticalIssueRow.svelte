<script lang="ts">
	import { getIssueResource, type IssueDisplayData } from '$lib/domain/issues/issueResource';
	import { BodyLong, Heading, VStack } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		issue: IssueDisplayData;
		teamSlug: string;
	}

	let { issue, teamSlug }: Props = $props();

	const resource = $derived.by(() => getIssueResource(issue));
	let title = $derived(getIssueTitle(issue.__typename || 'Unknown'));
	const resourceHref = $derived.by(() => {
		const env = issue.teamEnvironment.environment.name;

		switch (resource.kind) {
			case 'app':
				return `/team/${teamSlug}/${env}/app/${resource.name}`;
			case 'job':
				return `/team/${teamSlug}/${env}/job/${resource.name}`;
			case 'database':
				return `/team/${teamSlug}/${env}/cloudsql/${resource.name}`;
			case 'opensearch':
				return `/team/${teamSlug}/${env}/opensearch/${resource.name}`;
			case 'valkey':
				return `/team/${teamSlug}/${env}/valkey/${resource.name}`;
			case 'unleash':
				return `/team/${teamSlug}/unleash`;
			default:
				return null;
		}
	});
	const heading = $derived(
		`${title} for ${resource.name} in ${issue.teamEnvironment.environment.name}`
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
</script>

{#if resourceHref}
	<a class="issue-row surface-interactive" href={resourceHref}>
		<div class="surface-icon">
			<ExclamationmarkTriangleFillIcon />
		</div>
		<VStack gap="space-1">
			<Heading size="xsmall" level="2">{heading}</Heading>
			<BodyLong size="small">{issue.message}</BodyLong>
		</VStack>
	</a>
{:else}
	<div class="issue-row surface-interactive">
		<div class="surface-icon">
			<ExclamationmarkTriangleFillIcon />
		</div>
		<VStack gap="space-1">
			<Heading size="xsmall" level="2">{heading}</Heading>
			<BodyLong size="small">{issue.message}</BodyLong>
		</VStack>
	</div>
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
