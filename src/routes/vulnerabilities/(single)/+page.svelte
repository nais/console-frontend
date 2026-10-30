<script lang="ts">
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import { resolve } from '$app/paths';
	import VulnerabilityHistory from '../VulnerabilityHistory.svelte';
	import VulnerabilityLeaderBoard from '../VulnerabilityLeaderBoard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
	let exploitedWorkloadCount = $derived(
		$TenantVulnerabilites.data?.exploitedWorkloads.pageInfo.totalCount ?? 0
	);

	const knownExploitedHref = resolve('/vulnerabilities/(single)/teams');
</script>

<div class="wrapper">
	{#if $TenantVulnerabilites.data?.vulnerabilitySummary}
		<VulnerabilitySummary
			vulnerabilitySummary={$TenantVulnerabilites.data.vulnerabilitySummary}
			{knownExploitedHref}
			knownExploitedWorkloadCount={exploitedWorkloadCount}
		/>
	{/if}

	<VulnerabilityHistory />

	<VulnerabilityLeaderBoard />
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
</style>
