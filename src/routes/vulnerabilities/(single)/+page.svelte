<script lang="ts">
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import { resolve } from '$app/paths';
	import { Heading } from '@nais/ds-svelte-community';
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
	<Heading as="h1" size="large">Vulnerabilities</Heading>

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
