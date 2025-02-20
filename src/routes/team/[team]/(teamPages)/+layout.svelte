<script lang="ts">
	import { page } from '$app/state';
	import Menu from '$lib/components/Menu.svelte';
	import PageHeader from '$lib/components/UrlBasedPageHeader.svelte';
	import { menuItems } from '$lib/menuItems';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$houdini';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();

	let { InventoryCounts, UserInfo, teamSlug } = $derived(data);
</script>

<svelte:head><title>{teamSlug} - Console</title></svelte:head>

<div class="main">
	<Menu
		items={menuItems({
			path: page.url.pathname,
			member: data.viewerIsMember,
			inventory:
				typeof $InventoryCounts.data?.team.inventoryCounts.applications.total === 'number'
					? ($InventoryCounts.data.team.inventoryCounts as never)
					: undefined,
			features: UserInfo.data?.features
		})}
	/>
	<div class="container">
		<PageHeader />
		<div>{@render children?.()}</div>
	</div>
</div>

<style>
	.container {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-12);
	}

	.main {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: var(--a-spacing-12);
	}
</style>
