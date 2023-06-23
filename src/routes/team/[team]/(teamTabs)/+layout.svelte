<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from '$lib/Tabs.svelte';
	import Tab from '$lib/Tab.svelte';
	import { replacer } from '$lib/replacer';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ TeamRoles } = data);

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
			tab: 'Deploys',
			routeId: '/team/[team]/(teamTabs)/deploy'
		}
	];
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="header">
	<h2>{team}</h2>
</div>
<Tabs>
	{#each nav as { tab, routeId }}
		<Tab href={replacer(routeId, { team })} active={currentRoute == routeId} title={tab} />
	{/each}
	{#if $TeamRoles.data?.team.viewerIsMember || $TeamRoles.data?.team.viewerIsAdmin}
		<Tab
			href={replacer('/team/[team]/(teamTabs)/settings', { team })}
			active={currentRoute == '/team/[team]/(teamTabs)/settings'}
			title="Settings"
		/>
	{/if}
</Tabs>
<div class="container">
	<slot />
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
