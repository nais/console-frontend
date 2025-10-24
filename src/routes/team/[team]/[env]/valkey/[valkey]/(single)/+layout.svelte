<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<Tabs value={page.route.id ?? ''} size="small">
	<TabList>
		<Tab
			value="/team/[team]/[env]/valkey/[valkey]/(single)"
			as="a"
			href={resolve('/team/[team]/[env]/valkey/[valkey]/(single)', page.params as never)}
			>Overview</Tab
		>
		<Tab
			value="/team/[team]/[env]/valkey/[valkey]/(single)/metrics"
			as="a"
			href={resolve('/team/[team]/[env]/valkey/[valkey]/(single)/metrics', page.params as never)}
			>Metrics</Tab
		>
	</TabList>

	<div class="mt-4">
		{@render children()}
	</div>
</Tabs>
