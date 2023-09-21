<script lang="ts">
	import { page } from '$app/stores';
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import { replacer } from '$lib/replacer';

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: job = $page.params.job;
	$: currentRoute = $page.route.id;

	$: nav = [
		{
			tab: 'Overview',
			routeId: '/team/[team]/[env]/job/[job]'
		},
		{
			tab: 'Status',
			routeId: '/team/[team]/[env]/job/[job]/status'
		},
		{
			tab: 'Deploys',
			routeId: '/team/[team]/[env]/job/[job]/deploys'
		},
		{
			tab: 'Logs',
			routeId: '/team/[team]/[env]/job/[job]/logs'
		},
		{
			tab: 'nais.yaml',
			routeId: '/team/[team]/[env]/job/[job]/yaml'
		}
	];
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

{#if job !== undefined}
	<h3>
		<a href="/team/{team}"> {team}</a> / {env} / <a href="/team/{team}/{env}/job/{job}">{job}</a>
	</h3>
{:else}
	<h3><a href="/team/{team}"> {team}</a> / {env}</h3>
{/if}
<Tabs>
	{#each nav as { tab, routeId }}
		<Tab
			href={replacer(routeId, { team, env, job })}
			active={currentRoute == routeId}
			title={tab}
		/>
	{/each}
</Tabs>
<slot />
