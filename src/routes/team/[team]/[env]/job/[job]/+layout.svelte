<script lang="ts">
	import { page } from '$app/state';
	import Menu from '$lib/components/Menu.svelte';
	import PageHeader from '$lib/components/UrlBasedPageHeader.svelte';
	import { menuItems } from '$lib/menuItems';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { teamSlug } = $derived(data);
</script>

<svelte:head><title>{teamSlug} - Console</title></svelte:head>

<div class="main">
	<Menu
		items={menuItems({
			path: page.url.pathname,
			member: data.viewerIsMember
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
		gap: 1rem;
		display: grid;
		grid-template-columns: 200px 1fr;
	}
</style>
