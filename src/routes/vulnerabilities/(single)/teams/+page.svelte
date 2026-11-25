<script lang="ts">
	import TeamVulnerabilityList from '#lib/domain/vulnerability/TeamVulnerabilityList.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Heading, Loader } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const store = $derived(data.TenantV0sTeams ?? data.TenantVulnerabilityTeams);
	const teams = $derived($store?.data?.teams);
</script>

<div class="wrapper">
	<GraphErrors errors={$store?.errors} />
	<div>
		<Heading as="h2" spacing>Team Security Posture</Heading>
		{#if data.TenantV0sTeams}
			<BodyLong
				>Teams with workloads, listed alphabetically with scan coverage, known exploited
				vulnerabilities and unique vulnerabilities by severity. Missing scan data is not counted as
				zero vulnerabilities.</BodyLong
			>
		{:else}
			<BodyLong>
				Teams with workloads, listed alphabetically with CVSS severity counts, known exploited
				vulnerabilities, SBOM coverage, and workload count. Teams without usable SBOMs are marked so
				missing scan data is not mistaken for no vulnerabilities. Vulnerability counts are the
				number of vulnerabilities, not the number of workloads affected.
			</BodyLong>
		{/if}
	</div>

	{#if $store?.fetching && !$store.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if teams && !$store?.errors?.length && teams.pageInfo.totalCount > 0}
		<TeamVulnerabilityList
			{teams}
			fetching={$store?.fetching}
			v0s={!!data.TenantV0sTeams}
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
	{:else if !$store?.errors?.length}
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
