<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CveSearch from '$lib/domain/vulnerability/CveSearch.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { BodyLong, Heading, Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let { TenantVulnerabilites } = $derived(data);
</script>

<GraphErrors errors={$TenantVulnerabilites.errors} />
<Heading as="h1" size="large">Security & Vulnerabilities</Heading>
<div class="cve-search-section">
	<Heading as="h2" size="xsmall">Search for vulnerability</Heading>
	<BodyLong size="small">
		Find details and affected workloads for a specific vulnerability.
	</BodyLong>
	<CveSearch />
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
	.cve-search-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		margin-bottom: var(--spacing-layout);
	}
</style>
