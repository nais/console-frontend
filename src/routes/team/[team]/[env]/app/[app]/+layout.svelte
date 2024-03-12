<script lang="ts">
	import { page } from '$app/stores';
	import SideMenu, { type menuGroup } from '$lib/components/SideMenu.svelte';
	import { ArrowsSquarepathIcon, BellIcon, Density3Icon, FileTextIcon, HouseIcon, LineGraphStackedIcon, PassportIcon } from '@nais/ds-svelte-community/icons';
	import type { LayoutData } from './$houdini';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
	$: instance = $page.params.instance;
	$: currentRoute = $page.route.id;

	const nav: menuGroup[] = [
		{
			items: [
				{
					name: 'Overview',
					routeId: '/team/[team]/[env]/app/[app]',
					icon: HouseIcon
				},
				{
					name: 'Status',
					routeId: '/team/[team]/[env]/app/[app]/status',
					icon: BellIcon
				},
			]
		},
		{
			items: [
				{
					name: 'Deploys',
					routeId: '/team/[team]/[env]/app/[app]/deploys',
					icon: ArrowsSquarepathIcon
				},
				{
					name: 'Cost',
					routeId: '/team/[team]/[env]/app/[app]/cost',
					icon: CostIcon
				},
				{
					name: 'Utilization',
					routeId: '/team/[team]/[env]/app/[app]/utilization',
					icon: LineGraphStackedIcon
				},
				{
					name: 'Logs',
					routeId: '/team/[team]/[env]/app/[app]/logs',
					icon: Density3Icon
				},
			]
		},
		{
			items: [
				{
					name: 'Manifest',
					routeId: '/team/[team]/[env]/app/[app]/manifest',
					icon: FileTextIcon
				}
			]
		}
	];
	export let data: LayoutData;
	$: ({ AppNotificationDot } = data);

	$: state = $AppNotificationDot?.data?.app.appState.state;
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="main">
	<SideMenu {nav} />
	<div class="container">
		<slot />
	</div>
</div>

<!-- <Tabs>
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
</Tabs> -->

<style>
	.container {
		flex-grow: 1;
	}

	.main {
		gap: 1rem;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		direction: row;
	}
	.notification {
		position: relative;
		left: -14px;
		top: 4px;
	}
</style>
