<script lang="ts">
	import VulnerabilitySummaryTenant from '$lib/domain/vulnerability/VulnerabilitySummaryTenant.svelte';
	import VulnerabilityHistory from '../VulnerabilityHistory.svelte';
	import VulnerabilityLeaderBoard from '../VulnerabilityLeaderBoard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
</script>

<div class="wrapper">
	<div class="header">
		{#if $TenantVulnerabilites.data?.vulnerabilitySummary}
			<VulnerabilitySummaryTenant
				vulnerabilitySummary={$TenantVulnerabilites.data?.vulnerabilitySummary}
			/>
		{/if}
	</div>

	<VulnerabilityHistory />

	<VulnerabilityLeaderBoard />
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
