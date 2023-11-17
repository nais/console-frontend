<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import { replacer } from '$lib/replacer';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ TeamRoles } = data);

	$: team = $page.params.team;
	$: currentRoute = $page.route.id;
	const nav = [
		{
			tab: 'Apps',
			routeId: '/team/[team]/(teamTabs)'
		},
		{
			tab: 'Jobs',
			routeId: '/team/[team]/(teamTabs)/jobs'
		},
		{
			tab: 'Members',
			routeId: '/team/[team]/(teamTabs)/members'
		},
		{
			tab: 'Deploys',
			routeId: '/team/[team]/(teamTabs)/deploy'
		},
		{
			tab: 'Cost',
			routeId: '/team/[team]/(teamTabs)/cost'
		},
		{
			tab: 'Resources',
			routeId: '/team/[team]/(teamTabs)/resources'
		},
        {
            tab: 'Vulnerabilities',
            routeId: '/team/[team]/(teamTabs)/vulnerabilities'
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
	{#if $TeamRoles.data}
		{#if $TeamRoles.data.team === PendingValue}
			<Loading />
		{:else if $TeamRoles.data.team.viewerIsMember || $TeamRoles.data.team.viewerIsAdmin}
			<Tab
				href={replacer('/team/[team]/(teamTabs)/settings', { team })}
				active={currentRoute == '/team/[team]/(teamTabs)/settings'}
				title="Settings"
			/>
		{/if}
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
