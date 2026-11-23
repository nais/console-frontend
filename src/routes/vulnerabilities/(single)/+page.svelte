<script lang="ts">
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import { resolve } from '$app/paths';
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
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-24);
	}
</style>
