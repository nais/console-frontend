<script lang="ts">
	import type { menuItem } from '$lib/components/SideMenu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import {
		ArrowsSquarepathIcon,
		BellIcon,
		Density3Icon,
		FileTextIcon,
		HouseIcon,
		ImageIcon,
		TrashIcon,
		WalletIcon
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
					name: 'Image details',
					routeId: '/team/[team]/[env]/job/[job]/image',
					icon: ImageIcon
				},
				{
					name: 'Deployments',
					routeId: '/team/[team]/[env]/job/[job]/deploys',
					icon: ArrowsSquarepathIcon
				},
				{
					name: 'Cost',
					routeId: '/team/[team]/[env]/job/[job]/cost',
					icon: WalletIcon
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
