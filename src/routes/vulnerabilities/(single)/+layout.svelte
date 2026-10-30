<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CveSearch from '#lib/domain/vulnerability/CveSearch.svelte';
	import { ShTabs } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let { TenantVulnerabilites } = $derived(data);

	const vulnTabs = $derived([
		{
			value: '/vulnerabilities/(single)',
			label: 'Overview',
			href: resolve('/vulnerabilities/(single)')
		},
		{
			value: '/vulnerabilities/(single)/teams',
			label: 'Teams',
			href: resolve('/vulnerabilities/(single)/teams')
		},
		{
			value: '/vulnerabilities/(single)/cves',
			label: 'CVEs',
			href: resolve('/vulnerabilities/(single)/cves')
		}
	]);
</script>

<GraphErrors errors={$TenantVulnerabilites.errors} />

<div class="vuln-layout">
	<header class="vuln-header">
		<div class="vuln-header-left">
			<h1 class="vuln-title">Vulnerabilities</h1>
			<p class="vuln-subtitle">
				CVEs, known exploited vulnerabilities, and SBOM coverage across teams and workloads.
			</p>
		</div>

		<div class="cve-search-wrap">
			<CveSearch />
		</div>
	</header>

	<ShTabs items={vulnTabs} activeValue={page.route.id ?? ''} variant="line">
		{@render children()}
	</ShTabs>
</div>

<style>
	.vuln-layout {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.vuln-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.vuln-header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.vuln-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.025em;
		line-height: 1.25;
		color: var(--foreground);
	}

	.vuln-subtitle {
		margin: 0;
		font-size: 0.875rem;
		color: var(--muted-foreground);
		line-height: 1.45;
	}

	.cve-search-wrap {
		min-width: 300px;
		max-width: 380px;
		width: 100%;
	}
</style>
