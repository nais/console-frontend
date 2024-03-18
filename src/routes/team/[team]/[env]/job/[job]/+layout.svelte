<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, type TeamRoles$result } from '$houdini';
	import type { menuGroup, menuItem } from '$lib/components/SideMenu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import {
		ArrowsSquarepathIcon,
		BellIcon,
		Density3Icon,
		FileTextIcon,
		HouseIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { LayoutData } from './$houdini';

	$: team = $page.params.team;

	export let data: LayoutData;
	$: ({ TeamRoles } = data);

	type menuGroup = {
		items: (menuItem & { memberOnly?: boolean })[];
	};

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
		},
		{
			items: [
				{
					name: 'Delete',
					routeId: '/team/[team]/[env]/job/[job]/delete',
					icon: TrashIcon,
					memberOnly: true
				}
			]
		}
	];
	function memberOnly(nav: menuGroup[], data: TeamRoles$result | null) {
		return nav
			.map((group) => {
				return {
					items: group.items.filter((item) => {
						return (
							!item.memberOnly ||
							(data?.team !== PendingValue &&
								(data?.team.viewerIsOwner || data?.team.viewerIsMember))
						);
					})
				};
			})
			.filter((group) => group.items.length > 0);
	}
</script>

<svelte:head><title>{team} - Console</title></svelte:head>

<div class="main">
	<SideMenu nav={memberOnly(nav, $TeamRoles.data)} />
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
