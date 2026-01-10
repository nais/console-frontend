<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CveSearch from '$lib/domain/vulnerability/CveSearch.svelte';
	import VulnerabilitySummaryTenant from '$lib/domain/vulnerability/VulnerabilitySummaryTenant.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { BodyLong, Heading, Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let { TenantVulnerabilites } = $derived(data);
</script>

<GraphErrors errors={$TenantVulnerabilites.errors} />

<Heading level="1" as="h1" size="large" spacing
	>Vulnerabilities Overview for {page.data.tenantName?.toUpperCase()}</Heading
>
<BodyLong spacing>
	Overview of security vulnerabilities across all workloads in your tenant. Track CVEs, assess risk,
	and monitor remediation progress.
</BodyLong>

<div class="info">
	<div class="cve-search-section">
		<Heading level="3" as="h3" size="xsmall">Search for vulnerability</Heading>
		<BodyLong size="small">
			Find details and affected workloads for a specific vulnerability.
		</BodyLong>
		<CveSearch />
	</div>
	{#if $TenantVulnerabilites.data?.vulnerabilitySummary}
		<VulnerabilitySummaryTenant
			vulnerabilitySummary={$TenantVulnerabilites.data?.vulnerabilitySummary}
		/>
	{/if}
</div>

<Tabs value={page.route.id ?? ''} size="small">
	<TabList>
		<Tab value="/vulnerabilities/(single)" as="a" href={resolve('/vulnerabilities/(single)')}
			>Overview</Tab
		>
		<Tab
			value="/vulnerabilities/(single)/teams"
			as="a"
			href={resolve('/vulnerabilities/(single)/teams')}>Teams</Tab
		>
		<Tab
			value="/vulnerabilities/(single)/cves"
			as="a"
			href={resolve('/vulnerabilities/(single)/cves')}>CVEs</Tab
		>
	</TabList>

	<div>
		{@render children()}
	</div>
</Tabs>

<style>
	.info {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 1rem;
		align-items: start;
		margin-bottom: var(--ax-space-8);
	}

	.cve-search-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
</style>
