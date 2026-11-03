<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import HeaderActions from '#lib/ui/HeaderActions.svelte';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem,
		Button,
		NavTabs
	} from '#lib/shadcn/ui/index.js';
	import { MenuElipsisVerticalIcon, PencilWritingIcon, TrashIcon } from '#lib/icons/index.js';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let routeId = $derived(page.route.id ?? '');
	let metricsSearch = $derived.by(() => {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.delete('database');
		if (routeId.endsWith('/insights') || routeId.endsWith('/queries')) {
			params.set('interval', page.data.interval);
		}
		const search = params.toString();
		return search ? `?${search}` : '';
	});
	let tabs = $derived([
		{
			value: '/team/[team]/[env]/postgres/[postgres]/(single)',
			label: 'Overview',
			href: resolve('/team/[team]/[env]/postgres/[postgres]/(single)', page.params as never)
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/(single)/branches',
			label: 'Branches',
			href: resolve(
				'/team/[team]/[env]/postgres/[postgres]/(single)/branches',
				page.params as never
			)
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/(single)/insights',
			label: 'Insights',
			href: `${resolve(
				'/team/[team]/[env]/postgres/[postgres]/(single)/insights',
				page.params as never
			)}${metricsSearch}`
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/(single)/queries',
			label: 'Queries',
			href: `${resolve('/team/[team]/[env]/postgres/[postgres]/(single)/queries', page.params as never)}${metricsSearch}`
		},
		{
			value: '/team/[team]/[env]/postgres/[postgres]/(single)/logs',
			label: 'Logs',
			href: resolve('/team/[team]/[env]/postgres/[postgres]/(single)/logs', page.params as never)
		}
	]);
</script>

{#if data.viewerIsMember || data.isAdmin}
	<HeaderActions>
		<ActionMenu>
			{#snippet trigger(props)}
				<Button
					variant="secondary"
					size="small"
					icon={MenuElipsisVerticalIcon}
					iconPosition="right"
					{...props}
				>
					Actions
				</Button>
			{/snippet}
			<ActionMenuItem
				icon={PencilWritingIcon}
				href={resolve('/team/[team]/[env]/postgres/[postgres]/edit', page.params as never)}
			>
				Edit
			</ActionMenuItem>
			<ActionMenuDivider />
			<ActionMenuItem
				icon={TrashIcon}
				variant="danger"
				href={resolve('/team/[team]/[env]/postgres/[postgres]/delete', page.params as never)}
			>
				Delete
			</ActionMenuItem>
		</ActionMenu>
	</HeaderActions>
{/if}

<NavTabs items={tabs} value={routeId} ariaLabel="Postgres navigation" />
<div class="tab-content">
	{@render children()}
</div>
