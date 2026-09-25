<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PrototypeSwitcher from '$lib/domain/vulnerability/prototype/PrototypeSwitcher.svelte';
	import VulnerabilitySummaryVariantC from '$lib/domain/vulnerability/prototype/VulnerabilitySummaryVariantC.svelte';
	import VulnerabilitySummaryMetrics from '$lib/domain/vulnerability/VulnerabilitySummaryMetrics.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import VulnerabilityHistory from '../VulnerabilityHistory.svelte';
	import VulnerabilityLeaderBoard from '../VulnerabilityLeaderBoard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
	let exploitedWorkloadCount = $derived(
		$TenantVulnerabilites.data?.exploitedWorkloads.pageInfo.totalCount ?? 0
	);

	const variants = ['A', 'C'] as const;
	let variant = $derived(
		(variants as readonly string[]).includes(page.url.searchParams.get('variant') ?? '')
			? (page.url.searchParams.get('variant') as (typeof variants)[number])
			: 'A'
	);
	const knownExploitedHref = resolve('/vulnerabilities/(single)/teams');
</script>

<div class="wrapper">
	<Heading as="h1" size="large">Vulnerabilities</Heading>

	{#if $TenantVulnerabilites.data?.vulnerabilitySummary}
		{#if variant === 'C'}
			<VulnerabilitySummaryVariantC
				vulnerabilitySummary={$TenantVulnerabilites.data.vulnerabilitySummary}
				{knownExploitedHref}
				knownExploitedWorkloadCount={exploitedWorkloadCount}
			/>
		{:else}
			<VulnerabilitySummaryMetrics
				vulnerabilitySummary={$TenantVulnerabilites.data.vulnerabilitySummary}
				{knownExploitedHref}
				knownExploitedWorkloadCount={exploitedWorkloadCount}
			/>
		{/if}
	{/if}

	<VulnerabilityHistory />

	<VulnerabilityLeaderBoard />
</div>

{#if import.meta.env.DEV}
	<PrototypeSwitcher {variants} current={variant} />
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}

	@media (max-width: 767px) {
		.wrapper {
			gap: var(--ax-space-16);
			margin-top: var(--ax-space-16);
		}
	}
</style>
