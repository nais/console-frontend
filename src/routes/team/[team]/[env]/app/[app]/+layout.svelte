<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let routeId = $derived(page.route.id ?? '');
	let tabs = $derived([
		{
			value: '/team/[team]/[env]/app/[app]',
			label: 'Overview',
			href: resolve('/team/[team]/[env]/app/[app]', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/instancegroup/[instancegroup]',
			label: 'Instance Groups',
			href: resolve('/team/[team]/[env]/app/[app]/instancegroup', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/vulnerabilities',
			label: 'Vulnerabilities',
			href: resolve('/team/[team]/[env]/app/[app]/vulnerabilities', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/deploys',
			label: 'Deployments',
			href: resolve('/team/[team]/[env]/app/[app]/deploys', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/issues',
			label: 'Issues',
			href: resolve('/team/[team]/[env]/app/[app]/issues', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/utilization',
			label: 'Utilization',
			href: resolve('/team/[team]/[env]/app/[app]/utilization', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/network',
			label: 'Network',
			href: resolve('/team/[team]/[env]/app/[app]/network', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/logs',
			label: 'Logs',
			href: resolve('/team/[team]/[env]/app/[app]/logs', page.params as never)
		},
		{
			value: '/team/[team]/[env]/app/[app]/activity-log',
			label: 'Activity Log',
			href: resolve('/team/[team]/[env]/app/[app]/activity-log', page.params as never)
		}
	] as const);
	let activeTab = $derived(
		routeId?.startsWith('/team/[team]/[env]/app/[app]/instancegroup')
			? '/team/[team]/[env]/app/[app]/instancegroup/[instancegroup]'
			: routeId
	);
	let visibleTabs = $derived(tabs.some((tab) => tab.value === activeTab) ? tabs : []);
</script>

{#if visibleTabs.length > 0}
	<Tabs value={activeTab} size="small">
		<TabList>
			{#each visibleTabs as tab (tab.value)}
				<Tab value={tab.value} as="a" href={tab.href}>{tab.label}</Tab>
			{/each}
		</TabList>

		<div class="tab-content">
			{@render children()}
		</div>
	</Tabs>
{:else}
	{@render children()}
{/if}
