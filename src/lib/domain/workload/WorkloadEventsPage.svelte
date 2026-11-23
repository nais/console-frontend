<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Heading, ShBadge } from '#lib/shadcn/ui/index.js';
	import Collection from '#lib/ui/Collection.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import WorkloadEventTimeline from './WorkloadEventTimeline.svelte';

	let {
		events,
		fetching,
		failed,
		job = false
	}: Omit<ComponentProps<typeof WorkloadEventTimeline>, 'compact'> & {
		job?: boolean;
	} = $props();
	const headingId = $props.id();
	const page = $derived(events?.pageInfo);
</script>

<section aria-labelledby={headingId}>
	<header>
		<div class="title-row">
			<Heading as="h2" id={headingId}>Recent events</Heading>
			{#if page && !failed}
				<ShBadge size="sm">
					{page.totalCount}
					{page.totalCount === 1 ? 'event' : 'events'}
				</ShBadge>
			{/if}
		</div>
		<p class="description">
			Platform events from the last 30 days, newest first.
			{#if job}Includes all runs of this job.{/if}
		</p>
	</header>

	<Collection headerless>
		<WorkloadEventTimeline {events} {fetching} {failed} />
		{#if page && (fetching || page.hasNextPage || page.hasPreviousPage)}
			<footer>
				<Pagination
					{page}
					{fetching}
					loaders={{
						loadPreviousPage: () => changeParams({ after: '', before: page.startCursor ?? '' }),
						loadNextPage: () => changeParams({ before: '', after: page.endCursor ?? '' })
					}}
				/>
			</footer>
		{/if}
	</Collection>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-16);
	}

	.title-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--nais-space-4) var(--nais-space-10);
	}

	.description {
		margin: var(--nais-space-4) 0 0;
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-sm);
	}

	footer {
		border-block-start: var(--sh-border-width) solid var(--border);
	}
</style>
