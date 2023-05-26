<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from '$lib/Tabs.svelte';
	import Tab from '$lib/Tab.svelte';
	import { replacer } from '$lib/replacer';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ UserMemberships, UserInfo } = data);

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
		}
	];
	$: email = $UserInfo.data?.user.email;
	$: console.log(email);
	/*$: email = $UserMemberships.data?.user.email;
	$: memberOfTeam = $UserMemberships.data?.team.members.edges.some(
		(edge) => edge.node.email === email
	);*/
</script>

<div class="header">
	<h3>{team}</h3>
</div>
<Tabs>
	{#each nav as { tab, routeId }}
		<Tab href={replacer(routeId, { team })} active={currentRoute == routeId} title={tab} />
	{/each}
	{#if memberOfTeam}
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
		padding: 1rem;
	}
	.header {
		display: flex;
		justify-content: space-between;
	}
</style>
