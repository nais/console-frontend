<script lang="ts">
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import V0sSummary from '#lib/domain/vulnerability/V0sSummary.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites, TenantV0sOverview } = $derived(data);
	let exploitedWorkloadCount = $derived(
		$TenantVulnerabilites?.data?.exploitedWorkloads.pageInfo.totalCount ?? 0
	);

	const knownExploitedHref = resolve('/vulnerabilities/(single)/teams');
</script>

<div class="wrapper">
	{#if TenantV0sOverview}
		<GraphErrors errors={$TenantV0sOverview?.errors} />
		{#if $TenantV0sOverview?.data && !$TenantV0sOverview.errors?.length}
			<V0sSummary
				summary={$TenantV0sOverview.data.vulnerabilityFindings.summary}
				{knownExploitedHref}
			/>
		{/if}
	{:else if $TenantVulnerabilites?.data?.vulnerabilitySummary}
		<VulnerabilitySummary
			vulnerabilitySummary={$TenantVulnerabilites.data.vulnerabilitySummary}
			{knownExploitedHref}
			knownExploitedWorkloadCount={exploitedWorkloadCount}
		/>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-24);
	}
</style>
