<script lang="ts">
	import TeamsGroupedByUrgency from '#lib/domain/vulnerability/prototype/TeamsGroupedByUrgency.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
</script>

<div class="wrapper">
	<GraphErrors errors={$TenantVulnerabilites.errors} />
	<div>
		<Heading as="h2" spacing>Team Security Posture</Heading>
		<BodyLong>
			A detailed breakdown of all teams with workloads, showing vulnerabilities by priority and
			severity, total risk score, SBOM coverage, and workload count. Vulnerability counts are the
			number of vulnerabilities, not the number of workloads affected. Use this overview to explore
			and compare security posture across teams.
		</BodyLong>
	</div>

	{#if $TenantVulnerabilites.fetching}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if $TenantVulnerabilites.data?.teams.edges.length}
		<TeamsGroupedByUrgency teams={$TenantVulnerabilites.data?.teams.edges ?? []} />
	{:else}
		<BodyLong>No teams found.</BodyLong>
	{/if}

	<Pagination
		page={$TenantVulnerabilites.data?.teams.pageInfo}
		fetching={$TenantVulnerabilites.fetching}
		loaders={{
			loadPreviousPage: () =>
				changeParams(
					{
						after: '',
						before: $TenantVulnerabilites.data?.teams.pageInfo.startCursor ?? ''
					},
					{ noScroll: true }
				),
			loadNextPage: () =>
				changeParams(
					{
						after: $TenantVulnerabilites.data?.teams.pageInfo.endCursor ?? '',
						before: ''
					},
					{ noScroll: true }
				)
		}}
	/>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
