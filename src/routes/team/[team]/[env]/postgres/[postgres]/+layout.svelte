<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let routeId = $derived(page.route.id ?? '');
	let tabs = $derived([
		{
			value: '/team/[team]/[env]/postgres/[postgres]',
			label: 'Overview',
			href: resolve('/team/[team]/[env]/postgres/[postgres]', page.params as never)
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/branches',
			label: 'Branches',
			href: resolve('/team/[team]/[env]/postgres/[postgres]/branches', page.params as never)
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/insights',
			label: 'Insights',
			href: resolve('/team/[team]/[env]/postgres/[postgres]/insights', page.params as never)
		}
	]);
	let visibleTabs = $derived(tabs.some((tab) => tab.value === routeId) ? tabs : []);
</script>

{#if visibleTabs.length > 0}
	<Tabs value={routeId} size="small">
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
