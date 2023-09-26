<script lang="ts">
	import { page } from '$app/stores';
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import { replacer } from '$lib/replacer';

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
	$: instance = $page.params.instance;
	$: currentRoute = $page.route.id;

	$: nav = [
		{
			tab: 'Overview',
			routeId: '/team/[team]/[env]/app/[app]'
		},
		{
			tab: 'Status',
			routeId: '/team/[team]/[env]/app/[app]/status'
		},
		{
			tab: 'Logs',
			routeId: '/team/[team]/[env]/app/[app]/logs'
		},
		{
			tab: 'Deploys',
			routeId: '/team/[team]/[env]/app/[app]/deploys'
		},
		{
			tab: 'Manifest',
			routeId: '/team/[team]/[env]/app/[app]/yaml'
		}
	];
</script>

<svelte:head><title>{team} - Console</title></svelte:head>
{#if instance !== undefined}
	<h3>
		<a href="/team/{team}"> {team}</a> / {env} / <a href="/team/{team}/{env}/app/{app}">{app}</a> / {instance}
	</h3>
{:else if app !== undefined}
	<h3>
		<a href="/team/{team}"> {team}</a> / {env} / <a href="/team/{team}/{env}/app/{app}">{app}</a>
	</h3>
{:else}
	<h3><a href="/team/{team}"> {team}</a> / {env}</h3>
{/if}
<Tabs>
	{#each nav as { tab, routeId }}
		<Tab
			href={replacer(routeId, { team, env, app })}
			active={currentRoute == routeId}
			title={tab}
		/>
	{/each}
</Tabs>
<slot />
