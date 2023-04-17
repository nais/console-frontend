<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from '$lib/Tabs.svelte';
	import Tab from '$lib/Tab.svelte';
	import { replacer } from '$lib/replacer';

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
	$: currentRoute = $page.route.id;

	const nav = [
		{
			tab: 'Overview',
			routeId: '/team/[team]/[env]/[app]'
		},
		{
			tab: 'API',
			routeId: '/team/[team]/[env]/[app]/api'
		},
		{
			tab: 'Ingresses',
			routeId: '/team/[team]/[env]/[app]/ingresses'
		},
		{
			tab: 'Instances',
			routeId: '/team/[team]/[env]/[app]/instances'
		},
		{
			tab: 'Logs',
			routeId: '/team/[team]/[env]/[app]/logs'
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
