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
