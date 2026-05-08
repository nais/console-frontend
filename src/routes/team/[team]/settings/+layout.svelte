<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const activeTab = $derived.by(() => {
		const routeId = page.route.id ?? '';
		if (routeId.startsWith('/team/[team]/settings/service_accounts')) {
			return '/team/[team]/settings/service_accounts';
		}
		return '/team/[team]/settings';
	});
</script>

<Tabs value={activeTab} size="small">
	<TabList>
		<Tab
			value="/team/[team]/settings"
			as="a"
			href={resolve('/team/[team]/settings', page.params as never)}
		>
			Overview
		</Tab>
		<Tab
			value="/team/[team]/settings/service_accounts"
			as="a"
			href={resolve('/team/[team]/settings/service_accounts', page.params as never)}
		>
			Service Accounts
		</Tab>
	</TabList>

	<div class="mt-4">
		{@render children()}
	</div>
</Tabs>
