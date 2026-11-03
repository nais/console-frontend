<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { NavTabs } from '#lib/shadcn/ui/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
	const tabs = $derived([
		{
			value: '/team/[team]/[env]/opensearch/[opensearch]/(single)',
			label: 'Overview',
			href: resolve('/team/[team]/[env]/opensearch/[opensearch]/(single)', page.params as never)
		},
		{
			value: '/team/[team]/[env]/opensearch/[opensearch]/(single)/insights',
			label: 'Insights',
			href: resolve(
				'/team/[team]/[env]/opensearch/[opensearch]/(single)/insights',
				page.params as never
			)
		}
	]);
</script>

<NavTabs items={tabs} value={page.route.id ?? ''} ariaLabel="OpenSearch navigation" />
<div class="tab-content">
	{@render children()}
</div>
