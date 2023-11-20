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
			tab: 'Manifest',
			routeId: '/team/[team]/[env]/job/[job]/yaml'
		},
		{
			tab: 'Cost',
			routeId: '/team/[team]/[env]/job/[job]/cost'
		}
	];
	export let data: LayoutData;
	$: ({ JobNotificationState } = data);

	$: state = $JobNotificationState.data?.naisjob.jobState.state;
	$: numberOfErrors = $JobNotificationState.data?.naisjob.jobState.errors.length;
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
		{#if tab !== 'Cost'}
			<Tab
				href={replacer(routeId, { team, env, job })}
				active={currentRoute == routeId}
				title={tab}
			/>
		{:else if env.indexOf('fss') === -1}
			<Tab
				href={replacer(routeId, { team, env, job })}
				active={currentRoute == routeId}
				title={tab}
			/>
		{/if}
		{#if tab === 'Status' && state !== State.NAIS}
			{#if state === State.NOTNAIS}
				<div class="notification">
					<NotificationBadge
						text={String(numberOfErrors)}
						color={'var(--a-surface-warning-moderate)'}
						size={'18px'}
					/>
				</div>
			{:else if state === State.FAILING || state !== State.UNKNOWN}
				<div class="notification">
					<NotificationBadge
						text={String(numberOfErrors)}
						color={'var(--a-icon-danger)'}
						size={'18px'}
					/>
				</div>
			{/if}
		{/if}
	{/each}
</Tabs>
<slot />

<style>
	.notification {
		position: relative;
		left: -10px;
		top: 12px;
	}
</style>
