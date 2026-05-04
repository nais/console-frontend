<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Tab, TabList, Tabs } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let routeId = $derived(page.route.id ?? '');
	let tabs = $derived([
		{
			value: '/team/[team]/[env]/job/[job]',
			label: 'Overview',
			href: resolve('/team/[team]/[env]/job/[job]', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/vulnerabilities',
			label: 'Vulnerabilities',
			href: resolve('/team/[team]/[env]/job/[job]/vulnerabilities', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/deploys',
			label: 'Deployments',
			href: resolve('/team/[team]/[env]/job/[job]/deploys', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/cost',
			label: 'Cost',
			href: resolve('/team/[team]/[env]/job/[job]/cost', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/issues',
			label: 'Issues',
			href: resolve('/team/[team]/[env]/job/[job]/issues', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/logs',
			label: 'Logs',
			href: resolve('/team/[team]/[env]/job/[job]/logs', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/activity-log',
			label: 'Activity Log',
			href: resolve('/team/[team]/[env]/job/[job]/activity-log', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/manifest',
			label: 'Manifest',
			href: resolve('/team/[team]/[env]/job/[job]/manifest', page.params as never)
		}
	] as const);
	let visibleTabs = $derived(tabs.some((tab) => tab.value === routeId) ? tabs : []);
</script>

{#if visibleTabs.length > 0}
	<Tabs value={routeId} size="small">
		<TabList>
			{#each visibleTabs as tab (tab.value)}
				<Tab value={tab.value} as="a" href={tab.href}>{tab.label}</Tab>
			{/each}
		</TabList>

		<div class="mt-4">
			{@render children()}
		</div>
	</Tabs>
{:else}
	{@render children()}
{/if}
