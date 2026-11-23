<script lang="ts">
	import TeamVulnerabilityList from '#lib/domain/vulnerability/TeamVulnerabilityList.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Heading, Loader } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilityTeams } = $derived(data);
	const teams = $derived($TenantVulnerabilityTeams.data?.teams);
</script>

<div class="wrapper">
	<GraphErrors errors={$TenantVulnerabilityTeams.errors} />
	<div>
		<Heading as="h2" spacing>Team Security Posture</Heading>
		<BodyLong>
			Teams with workloads, listed alphabetically with CVSS severity counts, known exploited
			vulnerabilities, SBOM coverage, and workload count. Teams without usable SBOMs are marked so
			missing scan data is not mistaken for no vulnerabilities. Vulnerability counts are the number
			of vulnerabilities, not the number of workloads affected.
		</BodyLong>
	</div>

	{#if $TenantVulnerabilityTeams.fetching && !$TenantVulnerabilityTeams.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if teams && teams.pageInfo.totalCount > 0}
		<TeamVulnerabilityList
			{teams}
			fetching={$TenantVulnerabilityTeams.fetching}
			loadPage={(direction) => {
				const page = teams?.pageInfo;
				return changeParams(
					{
						after: direction === 'next' ? (page?.endCursor ?? '') : '',
						before: direction === 'previous' ? (page?.startCursor ?? '') : ''
					},
					{ noScroll: true }
				);
			}}
		/>
	{:else if !$TenantVulnerabilityTeams.errors?.length}
		<BodyLong>No teams found.</BodyLong>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
