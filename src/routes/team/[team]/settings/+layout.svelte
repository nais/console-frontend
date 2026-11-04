<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { NavTabs } from '#lib/shadcn/ui/index.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const activeTab = $derived.by(() => {
		const routeId = page.route.id ?? '';
		if (routeId.startsWith('/team/[team]/settings/service_accounts')) {
			return '/team/[team]/settings/service_accounts';
		}
		return '/team/[team]/settings';
	});
	const tabs = $derived([
		{
			value: '/team/[team]/settings',
			label: 'Overview',
			href: resolve('/team/[team]/settings', page.params as never)
		},
		{
			value: '/team/[team]/settings/service_accounts',
			label: 'Service Accounts',
			href: resolve('/team/[team]/settings/service_accounts', page.params as never)
		}
	]);
</script>

<NavTabs items={tabs} value={activeTab} ariaLabel="Team settings navigation" />
<div class="tab-content">
	{@render children()}
</div>
