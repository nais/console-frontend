<script lang="ts">
	import VulnerabilitySummaryTenant from '$lib/domain/vulnerability/VulnerabilitySummaryTenant.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
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
		<SurfaceCard title="Summary" level="h2" bordered>
			<VulnerabilitySummaryTenant
				vulnerabilitySummary={$TenantVulnerabilites.data?.vulnerabilitySummary}
			/>
		</SurfaceCard>
	{/if}

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
