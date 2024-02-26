<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
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
			tab: 'Overview',
			routeId: '/team/[team]/(teamTabs)',
			withSubRoutes: false
		},
		{
			tab: 'Apps',
			routeId: '/team/[team]/(teamTabs)/applications',
			withSubRoutes: true
		},
		{
			tab: 'Jobs',
			routeId: '/team/[team]/(teamTabs)/jobs',
			withSubRoutes: true
		},
		{
			tab: 'Members',
			routeId: '/team/[team]/(teamTabs)/members',
			withSubRoutes: true
		},
		{
			tab: 'Deploys',
			routeId: '/team/[team]/(teamTabs)/deploy',
			withSubRoutes: true
		},
		{
			tab: 'Cost',
			routeId: '/team/[team]/(teamTabs)/cost',
			withSubRoutes: true
		},
		{
			tab: 'Utilization',
			routeId: '/team/[team]/(teamTabs)/utilization',
			withSubRoutes: true
		},
		{
			tab: 'Vulnerabilities',
			routeId: '/team/[team]/(teamTabs)/vulnerabilities',
			withSubRoutes: true
		},
		{
			tab: 'Repositories',
			routeId: '/team/[team]/(teamTabs)/repositories',
			withSubRoutes: true
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

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="header">
	<h2>{team}</h2>
</div>
<Tabs>
	{#each nav as { tab, routeId, withSubRoutes }}
		<Tab
			href={replacer(routeId, { team })}
			active={isActive(currentRoute, routeId, withSubRoutes)}
			title={tab}
		/>
	{/each}
	{#if $TeamRoles.data}
		{#if $TeamRoles.data.team !== PendingValue && ($TeamRoles.data.team.viewerIsMember || $TeamRoles.data.team.viewerIsOwner)}
			<Tab
				href={replacer('/team/[team]/(teamTabs)/secrets', { team })}
				active={isActive(currentRoute, '/team/[team]/(teamTabs)/secrets', true)}
				title="Secrets"
			/>
			<Tab
				href={replacer('/team/[team]/(teamTabs)/settings', { team })}
				active={isActive(currentRoute, '/team/[team]/(teamTabs)/settings', true)}
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
