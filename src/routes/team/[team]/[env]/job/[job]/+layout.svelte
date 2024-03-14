<script lang="ts">
	import { page } from '$app/stores';
	import type { menuGroup } from '$lib/components/SideMenu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import {
		ArrowsSquarepathIcon,
		BellIcon,
		Density3Icon,
		FileTextIcon,
		HouseIcon
	} from '@nais/ds-svelte-community/icons';

	$: team = $page.params.team;

	const nav: menuGroup[] = [
		{
			items: [
				{
					name: 'Overview',
					routeId: '/team/[team]/[env]/job/[job]',
					icon: HouseIcon
				},
				{
					name: 'Status',
					routeId: '/team/[team]/[env]/job/[job]/status',
					icon: BellIcon
				}
			]
		},
		{
			items: [
				{
					name: 'Deploys',
					routeId: '/team/[team]/[env]/job/[job]/deploys',
					icon: ArrowsSquarepathIcon
				},
				{
					name: 'Cost',
					routeId: '/team/[team]/[env]/job/[job]/cost',
					icon: CostIcon
				},
				{
					name: 'Logs',
					routeId: '/team/[team]/[env]/job/[job]/logs',
					icon: Density3Icon
				}
			]
		},
		{
			items: [
				{
					name: 'Manifest',
					routeId: '/team/[team]/[env]/job/[job]/manifest',
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
