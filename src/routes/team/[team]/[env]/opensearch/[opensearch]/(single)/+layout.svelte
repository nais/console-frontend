<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<Tabs value={page.route.id ?? ''} size="small">
	<TabList>
		<Tab
			value="/team/[team]/[env]/opensearch/[opensearch]/(single)"
			as="a"
			href={resolve('/team/[team]/[env]/opensearch/[opensearch]/(single)', page.params as never)}
			>Overview</Tab
		>
		<Tab
			value="/team/[team]/[env]/opensearch/[opensearch]/(single)/insights"
			as="a"
			href={resolve(
				'/team/[team]/[env]/opensearch/[opensearch]/(single)/insights',
				page.params as never
			)}>Insights</Tab
		>
	</TabList>

	<div class="mt-4">
		{@render children()}
	</div>
</Tabs>
