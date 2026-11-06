<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { NavTabs } from '#lib/shadcn/ui/index.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const tabs = $derived([
		{
			value: '/team/[team]/[env]/kafka/[kafka]/(single)',
			label: 'Overview',
			href: resolve('/team/[team]/[env]/kafka/[kafka]/(single)', page.params as never)
		},
		{
			value: '/team/[team]/[env]/kafka/[kafka]/(single)/insights',
			label: 'Insights',
			href: resolve('/team/[team]/[env]/kafka/[kafka]/(single)/insights', page.params as never)
		}
	]);
</script>

<NavTabs items={tabs} value={page.route.id ?? ''} ariaLabel="Kafka navigation" />
<div class="tab-content">
	{@render children()}
</div>
