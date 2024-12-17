<script lang="ts">
	import SideMenu, { type menuItem } from '$lib/components/SideMenu.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import {
		ArrowsSquarepathIcon,
		BellIcon,
		Density3Icon,
		FileTextIcon,
		HouseIcon,
		ImageIcon,
		LineGraphStackedIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { teamSlug } = $derived(data);

	type menuGroup = {
		items: (menuItem & { memberOnly?: boolean })[];
	};

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
					name: 'Image details',
					routeId: '/team/[team]/[env]/app/[app]/image',
					icon: ImageIcon
				},
				{
					name: 'Deployments',
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
		},
		{
			items: [
				{
					name: 'Delete',
					routeId: '/team/[team]/[env]/app/[app]/delete',
					icon: TrashIcon,
					memberOnly: true
				}
			]
		}
	];

	function memberOnly(nav: menuGroup[], data: LayoutData) {
		return nav
			.map((group) => {
				return {
					items: group.items.filter((item) => {
						return !item.memberOnly || data.viewerIsOwner || data.viewerIsMember;
					})
				};
			})
			.filter((group) => group.items.length > 0);
	}
</script>

<svelte:head><title>{teamSlug} - Console</title></svelte:head>

<div class="main">
	<SideMenu nav={memberOnly(nav, data)} />
	<div class="container">
		{@render children?.()}
	</div>
</div>

<style>
	.container {
		flex-grow: 1;
	}

	.main {
		gap: 1rem;
		display: grid;
		grid-template-columns: 200px 1fr;
	}
</style>
