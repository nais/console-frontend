<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { replacer } from '$lib/replacer';
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import type { LayoutProps } from './$houdini';

	let { children }: LayoutProps = $props();

	let currentRoute = $derived(page.route.id);
	const nav = [
		{
			tab: 'Teams',
			routeId: '/admin/teams',
			withSubRoutes: false
		},
		{
			tab: 'Users',
			routeId: '/admin',
			withSubRoutes: false
		},
		{
			tab: 'User synchronization log',
			routeId: '/admin/userSyncLog',
			withSubRoutes: false
		},
		{
			tab: 'Reconcilers',
			routeId: '/admin/reconcilers',
			withSubRoutes: false
		}
	];

	const isActive = (current: string | null, routeID: string, allWithPrefix = false) => {
		if (current === routeID) {
			return true;
		}
		if (current && allWithPrefix) {
			return current.startsWith(routeID);
		}
		return false;
	};
</script>

<svelte:head><title>Admin - Nais Console</title></svelte:head>

<div class="page">
	<PageHeader heading="Administration" />
	<Tabs>
		{#each nav as { tab, routeId, withSubRoutes } (routeId)}
			<Tab
				href={replacer(routeId, {})}
				active={isActive(currentRoute, routeId, withSubRoutes)}
				title={tab}
			/>
		{/each}
	</Tabs>
	<div class="container">
		{@render children?.()}
	</div>
</div>

<style>
	.page {
		margin-top: var(--spacing-layout);
		width: 100%;
	}
	.container {
		margin: auto;
		min-width: 1000px;
		max-width: 1432px;
	}
</style>
