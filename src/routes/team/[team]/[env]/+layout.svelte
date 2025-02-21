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

	const { data, children }: Props = $props();
</script>

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
