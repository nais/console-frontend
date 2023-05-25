<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from '$lib/Tabs.svelte';
	import Tab from '$lib/Tab.svelte';
	import { replacer } from '$lib/replacer';

	$: team = $page.params.team;
	$: currentRoute = $page.route.id;
	const nav = [
		{
			tab: 'Workloads',
			routeId: '/team/[team]/(teamTabs)'
		},
		{
			tab: 'Members',
			routeId: '/team/[team]/(teamTabs)/members'
		},
		{
			tab: 'Deploy',
			routeId: '/team/[team]/(teamTabs)/deploy'
		},
		{
			tab: 'Settings',
			routeId: '/team/[team]/(teamTabs)/settings'
		}
	];
</script>

<div class="header">
	<h3>{team}</h3>
</div>
<Tabs>
	{#each nav as { tab, routeId }}
		<Tab href={replacer(routeId, { team })} active={currentRoute == routeId} title={tab} />
	{/each}
</Tabs>
<div class="container">
	<slot />
</div>

<style>
	.container {
		margin: auto;
		min-width: 1000px;
		max-width: 1432px;
		padding: 1rem;
	}
	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
