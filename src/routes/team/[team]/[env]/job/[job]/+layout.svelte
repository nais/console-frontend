<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from '$lib/Tabs.svelte';
	import Tab from '$lib/Tab.svelte';
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
			tab: 'Deploys',
			routeId: '/team/[team]/[env]/job/[job]/deploys'
		},
		{
			tab: 'nais.yaml',
			routeId: '/team/[team]/[env]/job/[job]/yaml'
		}
	];
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<h3><a href="/team/{team}"> {team}</a> / {job} ({env})</h3>
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
