<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ShTabs } from '#lib/shadcn/ui/index.js';
	import type { LayoutProps } from './$types';
	import JobActions from './JobActions.svelte';

	let { data, children }: LayoutProps = $props();
	let { JobLayout, viewerIsMember } = $derived(data);
	let job = $derived($JobLayout?.data?.team?.environment?.job ?? null);

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
			value: '/team/[team]/[env]/job/[job]/network',
			label: 'Network',
			href: resolve('/team/[team]/[env]/job/[job]/network', page.params as never)
		},
		{
			value: '/team/[team]/[env]/job/[job]/deploys',
			label: 'Deployments',
			href: resolve('/team/[team]/[env]/job/[job]/deploys', page.params as never)
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
		}
	]);
	let visibleTabs = $derived(tabs.some((tab) => tab.value === routeId) ? tabs : []);
</script>

<JobActions {viewerIsMember} {job} />

{#if visibleTabs.length > 0}
	<ShTabs items={visibleTabs} activeValue={routeId} variant="line">
		{@render children()}
	</ShTabs>
{:else}
	{@render children()}
{/if}
