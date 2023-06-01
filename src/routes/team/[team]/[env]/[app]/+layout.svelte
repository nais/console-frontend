<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from '$lib/Tabs.svelte';
	import Tab from '$lib/Tab.svelte';
	import { replacer } from '$lib/replacer';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ LayoutApp } = data);

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
	$: currentRoute = $page.route.id;

	$: nav = [
		{
			tab: 'Overview',
			routeId: '/team/[team]/[env]/[app]'
		},
		{
			tab: 'Deploys',
			routeId: '/team/[team]/[env]/[app]/deploys'
		},
		{
			tab: 'nais.yaml',
			routeId: '/team/[team]/[env]/[app]/yaml'
		}
	];
</script>

<h3><a href="/team/{team}"> {team}</a> / {app} ({env})</h3>
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
