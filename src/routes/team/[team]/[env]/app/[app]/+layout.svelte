<script lang="ts">
	import { page } from '$app/stores';
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import { replacer } from '$lib/replacer';
	import type { PageData } from './$houdini';

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
		},
		{
			tab: 'Cost',
			routeId: '/team/[team]/[env]/app/[app]/cost'
		}
	];
	export let data: PageData;
	$: ({ AppNotificationState } = data);

	$: state = $AppNotificationState.data?.app.appState.state;
	$: numberOfErrors = $AppNotificationState.data?.app.appState.errors.length;
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
		{#if tab === 'Status' && state !== 'NAIS'}
			{#if state === 'NOTNAIS'}
				<div class="circle warning">{numberOfErrors}</div>
			{:else if state === 'FAILING' || state !== 'UNKNOWN'}
				<div class="circle error">{numberOfErrors}</div>
			{/if}
		{/if}
	{/each}
</Tabs>
<slot />

<style>
	.error {
		background-color: var(--a-icon-danger);
		color: var(--a-text-on-danger);
	}
	.warning {
		background-color: var(--a-surface-warning-moderate);
		color: var(--a-text-on-warning);
	}
	.circle {
		position: relative;
		left: -10px;
		top: 12px;
		border-radius: 50%;
		width: 17px;
		height: 17px;
		padding: 4px;
		text-align: center;
		font:
			8px Arial,
			sans-serif;
	}
</style>
