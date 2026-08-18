<script lang="ts">
	import { page } from '$app/state';
	import { type ActivityLogActivityType$options } from '$houdini';
	import ActivityLogFacets from '$lib/domain/activity/ActivityLogFacets.svelte';
	import ActivityLogItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ApplicationActivityLog } = $derived(data);
	let activityLog = $derived(
		$ApplicationActivityLog.data?.team.environment.application.activityLog
	);
	let totalCount = $derived(activityLog?.pageInfo.totalCount ?? 0);

	let selectedActivityTypes: ActivityLogActivityType$options[] = $derived(
		(page.url.searchParams.get('activityTypes')?.split(',').filter(Boolean) ??
			[]) as ActivityLogActivityType$options[]
	);

	function handleActivityTypesChange(selected: ActivityLogActivityType$options[]) {
		changeParams({
			activityTypes: selected.join(','),
			after: '',
			before: ''
		});
	}
</script>

<GraphErrors errors={$ApplicationActivityLog.errors} />

{#if activityLog}
	<div class="layout-two-column">
		<div>
			<List title="Activity log" count={totalCount}>
				{#each activityLog.edges ?? [] as { node: item } (item)}
					<ActivityLogItem {item} />
				{:else}
					<ListItem>
						<span class="empty-state">No activity log entries found</span>
					</ListItem>
				{/each}
			</List>

			{#if totalCount > 0}
				<Pagination
					page={activityLog.pageInfo}
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
					fetching={$ApplicationActivityLog.fetching}
				/>
			{/if}
		</div>

		{#if activityLog.facets}
			<div class="layout-sidebar">
				<SurfaceCard title="Filters">
					<ListFilters>
						<ActivityLogFacets
							activityTypes={activityLog.facets.activityTypes}
							{selectedActivityTypes}
							onActivityTypesChange={handleActivityTypesChange}
						/>
					</ListFilters>
				</SurfaceCard>
			</div>
		{/if}
	</div>
{/if}

<style>
	.empty-state {
		color: var(--ax-text-neutral-subtle);
	}
</style>
