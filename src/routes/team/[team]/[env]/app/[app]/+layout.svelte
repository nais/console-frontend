<script lang="ts">
	import { page } from '$app/stores';
	import SideMenu, { type menuGroup } from '$lib/components/SideMenu.svelte';
	import {
		ArrowsSquarepathIcon,
		BellIcon,
		Density3Icon,
		FileTextIcon,
		HouseIcon,
		LineGraphStackedIcon
	} from '@nais/ds-svelte-community/icons';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	$: team = $page.params.team;

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
				}
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
				}
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
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="main">
	<SideMenu {nav} />
	<div class="container">
		<slot />
	</div>
</div>

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
</style>
