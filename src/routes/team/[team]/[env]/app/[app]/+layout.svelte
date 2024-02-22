<script lang="ts">
	import { page } from '$app/stores';
	import { State } from '$houdini/graphql/enums';
	import Tab from '$lib/Tab.svelte';
	import Tabs from '$lib/Tabs.svelte';
	import NotificationBadge from '$lib/icons/NotificationBadge.svelte';
	import { replacer } from '$lib/replacer';
	import type { LayoutData } from './$houdini';

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
			routeId: '/team/[team]/[env]/app/[app]/manifest'
		},
		{
			tab: 'Cost',
			routeId: '/team/[team]/[env]/app/[app]/cost'
		},
		{
			tab: 'Utilization',
			routeId: '/team/[team]/[env]/app/[app]/utilization'
		}
	];
	export let data: LayoutData;
	$: ({ AppNotificationDot } = data);

	$: state = $AppNotificationDot?.data?.app.appState.state;
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
		{#if tab !== 'Cost'}
			<Tab
				href={replacer(routeId, { team, env, app })}
				active={currentRoute == routeId}
				title={tab}
			/>
		{:else if env.indexOf('fss') === -1}
			<Tab
				href={replacer(routeId, { team, env, app })}
				active={currentRoute == routeId}
				title={tab}
			/>
		{/if}
		{#if tab === 'Status' && state !== undefined}
			{#if state === State.NOTNAIS || state === State.FAILING}
				<div class="notification">
					<NotificationBadge color={'var(--a-border-action)'} size={'8px'} />
				</div>
			{/if}
		{/if}
	{/each}
</Tabs>
<slot />

<style>
	.notification {
		position: relative;
		left: -14px;
		top: 4px;
	}
</style>
