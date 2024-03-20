<script lang="ts">
	import { page } from '$app/stores';
	import type { menuGroup } from '$lib/components/SideMenu.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import {
		HouseIcon
	} from '@nais/ds-svelte-community/icons';

	$: team = $page.params.team;

	const nav: menuGroup[] = [
		{
			items: [
				{
					name: 'Overview',
					routeId: '/team/[team]/[env]/postgres/[postgres]',
					icon: HouseIcon
				},
			]
		},
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
