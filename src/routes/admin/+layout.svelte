<script lang="ts">
	import { page } from '$app/state';
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import { replacer } from '$lib/replacer';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let currentRoute = $derived(page.route.id);
	const nav = [
		{
			tab: 'Users',
			routeId: '/admin',
			withSubRoutes: false
		},
		{
			tab: 'User sync log',
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

<svelte:head><title>Admin - Console</title></svelte:head>

<div class="page">
	<div class="header">
		<h2>Admin</h2>
	</div>
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
	.container {
		margin: auto;
		min-width: 1000px;
		max-width: 1432px;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
