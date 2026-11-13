<script lang="ts">
	import { page } from '$app/state';
	import { replacer } from '#lib/replacer.js';
	import { hasReconcilerErrors } from '#lib/reconcilerStatus.js';
	import { NavTabs } from '#lib/shadcn/ui/index.js';
	import PageHeader from '#lib/ui/PageHeader.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let { AdminReconcilerStatus } = $derived(data);
	let reconcilerErrors = $derived(hasReconcilerErrors($AdminReconcilerStatus?.data));

	let currentRoute = $derived(page.route.id);
	const nav = [
		{
			tab: 'Users',
			routeId: '/admin',
			withSubRoutes: false
		},
		{
			tab: 'Teams',
			routeId: '/admin/teams',
			withSubRoutes: false
		},
		{
			tab: 'User synchronization log',
			routeId: '/admin/userSyncLog',
			withSubRoutes: false
		},
		{
			tab: 'Reconcilers',
			routeId: '/admin/reconcilers',
			withSubRoutes: false
		},
		{
			tab: 'Service accounts',
			routeId: '/admin/service_accounts',
			withSubRoutes: true
		}
	];

	const isActive = (current: string | null, routeID: string, allWithPrefix = false) => {
		if (current === routeID) {
			return true;
		}
		if (current && allWithPrefix) {
			return current.startsWith(routeID);
		}
		return false;
	};

	let activeRoute = $derived(
		nav.find(({ routeId, withSubRoutes }) => isActive(currentRoute, routeId, withSubRoutes))
			?.routeId ?? ''
	);
</script>

<div class="page">
	<PageHeader />
	<div class="tabs-container">
		<NavTabs
			items={nav.map(({ tab, routeId }) => ({
				value: routeId,
				label: tab,
				href: replacer(routeId, {}),
				error:
					routeId === '/admin/reconcilers' && reconcilerErrors
						? 'Reconcilers have errors'
						: undefined
			}))}
			activeValue={activeRoute}
			ariaLabel="Admin navigation"
		/>
	</div>
	<div class="container">
		{@render children?.()}
	</div>
</div>

<style>
	.page {
		margin-top: var(--spacing-layout);
		width: 100%;
	}

	.tabs-container {
		margin: 0 auto var(--nais-space-24);
		width: 100%;
		max-width: var(--page-max-width);
	}

	.container {
		margin: auto;
		width: 100%;
		max-width: var(--page-max-width);
	}
</style>
