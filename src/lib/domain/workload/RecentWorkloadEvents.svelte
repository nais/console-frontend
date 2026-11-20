<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ComponentProps } from 'svelte';
	import { ChevronRightIcon } from '#lib/icons/index.js';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import WorkloadEventTimeline from './WorkloadEventTimeline.svelte';

	let {
		viewAllRoute,
		...timeline
	}: Omit<ComponentProps<typeof WorkloadEventTimeline>, 'compact'> & {
		viewAllRoute: '/team/[team]/[env]/app/[app]/events' | '/team/[team]/[env]/job/[job]/events';
	} = $props();
</script>

<SurfaceCard title="Recent events">
	{#snippet headerAside()}
		<a
			class="view-all"
			href={resolve(viewAllRoute, page.params as never)}
			aria-label="View all workload events"
		>
			View all <ChevronRightIcon size="1em" aria-hidden="true" />
		</a>
	{/snippet}

	<SectionBoundary message="Workload events failed to render.">
		<WorkloadEventTimeline {...timeline} compact />
	</SectionBoundary>
</SurfaceCard>

<style>
	.view-all {
		display: inline-flex;
		align-items: center;
		gap: var(--nais-space-2);
		font-size: var(--sh-font-size-xs);
		font-weight: var(--sh-font-weight-medium);
		color: var(--muted-foreground);
		text-decoration: none;
	}

	.view-all:is(:hover, :focus-visible) {
		color: var(--foreground);
		text-decoration: underline;
	}
</style>
