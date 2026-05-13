<script lang="ts">
	import { page } from '$app/state';
	import { type ActivityLogActivityType$options } from '$houdini';
	import ActivityLogFacets from '$lib/domain/activity/ActivityLogFacets.svelte';
	import ActivityLogItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { JobActivityLog } = $derived(data);
	let activityLog = $derived($JobActivityLog.data?.team.environment.job.activityLog);
	let totalCount = $derived(activityLog?.pageInfo.totalCount ?? 0);

	let selectedActivityTypes: ActivityLogActivityType$options[] = $derived(
		(page.url.searchParams.get('activityTypes')?.split(',').filter(Boolean) ??
			[]) as ActivityLogActivityType$options[]
	);

	let selectedResourceTypes: string[] = $derived(
		page.url.searchParams.get('resourceTypes')?.split(',').filter(Boolean) ?? []
	);

	let selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	function handleActivityTypesChange(selected: ActivityLogActivityType$options[]) {
		changeParams({
			activityTypes: selected.join(','),
			after: '',
			before: ''
		});
	}

	function handleResourceTypesChange(selected: string[]) {
		changeParams({
			resourceTypes: selected.join(','),
			after: '',
			before: ''
		});
	}

	function handleEnvironmentsChange(selected: string[]) {
		changeParams({
			environments: selected.join(','),
			after: '',
			before: ''
		});
	}
</script>

<GraphErrors errors={$JobActivityLog.errors} />

<div class="wrapper">
	<div class="main-content">
		<List title="{totalCount} entr{totalCount === 1 ? 'y' : 'ies'}">
			{#each activityLog?.nodes ?? [] as item (item)}
				<ActivityLogItem {item} />
			{:else}
				<ListItem>
					<span class="empty-state">No activity log entries found</span>
				</ListItem>
			{/each}
		</List>

		{#if totalCount > 0}
			<Pagination
				page={activityLog?.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeParams({
							after: '',
							before: activityLog?.pageInfo.startCursor ?? ''
						});
					},
					loadNextPage: () => {
						changeParams({
							before: '',
							after: activityLog?.pageInfo.endCursor ?? ''
						});
					}
				}}
				fetching={$JobActivityLog.fetching}
			/>
		{/if}
	</div>

	{#if activityLog?.facets}
		<aside class="facets-sidebar">
			<ActivityLogFacets
				activityTypes={activityLog.facets.activityTypes}
				resourceTypes={activityLog.facets.resourceTypes}
				environments={activityLog.facets.environments}
				{selectedActivityTypes}
				{selectedResourceTypes}
				{selectedEnvironments}
				onActivityTypesChange={handleActivityTypesChange}
				onResourceTypesChange={handleResourceTypesChange}
				onEnvironmentsChange={handleEnvironmentsChange}
			/>
		</aside>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: var(--ax-space-24);
		align-items: start;
	}

	.main-content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		min-width: 0;
	}

	.facets-sidebar {
		position: sticky;
		top: var(--ax-space-16);
	}

	.empty-state {
		color: var(--ax-text-subtle);
	}

	@media (max-width: 960px) {
		.wrapper {
			grid-template-columns: 1fr;
		}

		.facets-sidebar {
			position: static;
			order: -1;
		}
	}
</style>
