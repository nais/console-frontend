<script lang="ts">
	import TenantKnownExploitedWorkloads from '$lib/domain/vulnerability/TenantKnownExploitedWorkloads.svelte';
	import VulnerabilitySummaryMetrics from '$lib/domain/vulnerability/VulnerabilitySummaryMetrics.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import VulnerabilityHistory from '../VulnerabilityHistory.svelte';
	import VulnerabilityLeaderBoard from '../VulnerabilityLeaderBoard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
</script>

<div class="wrapper">
	<Heading as="h1" size="large">Vulnerabilities</Heading>

	{#if $TenantVulnerabilites.data?.vulnerabilitySummary}
		<VulnerabilitySummaryMetrics
			vulnerabilitySummary={$TenantVulnerabilites.data?.vulnerabilitySummary}
			knownExploitedHref="#known-exploited-list"
		/>
	{/if}

	<div id="known-exploited-list">
		<TenantKnownExploitedWorkloads />
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

	/* Mobile responsive styles */
	@media (max-width: 767px) {
		.wrapper {
			gap: var(--ax-space-16);
			margin-top: var(--ax-space-16);
		}
	}
</style>
