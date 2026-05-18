<script lang="ts">
	import { page } from '$app/state';
	import { type ActivityLogActivityType$options } from '$houdini';
	import ActivityLogFacets from '$lib/domain/activity/ActivityLogFacets.svelte';
	import ActivityLogItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ActivityLog } = $derived(data);

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
		changeParams(
			{
				activityTypes: selected.join(','),
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	}

	function handleResourceTypesChange(selected: string[]) {
		changeParams(
			{
				resourceTypes: selected.join(','),
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	}

	function handleEnvironmentsChange(selected: string[]) {
		changeParams(
			{
				environments: selected.join(','),
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	}
</script>

<div>
	{#if $ActivityLog.data}
		{@const ae = $ActivityLog.data.team.activityLog}
		<div class="layout-two-column">
			<div>
				<BodyLong spacing
					>The Activity Log provides an overview of changes made to your team and its resources
					within the Nais Console application.</BodyLong
				>
				<List title="Activity Log" count={ae.pageInfo.totalCount}>
					{#each ae.nodes || [] as item (item.id)}
						<ActivityLogItem {item} />
					{/each}
				</List>
				{#if ae.pageInfo.hasPreviousPage || ae.pageInfo.hasNextPage}
					<Pagination
						page={ae.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								changeParams(
									{
										after: '',
										before: ae.pageInfo.startCursor ?? ''
									},
									{ noScroll: true }
								);
							},
							loadNextPage: () => {
								changeParams(
									{
										before: '',
										after: ae.pageInfo.endCursor ?? ''
									},
									{ noScroll: true }
								);
							}
						}}
					/>
				{/if}
			</div>

			{#if ae.facets}
				<div class="layout-sidebar">
					<SurfaceCard title="Filters">
						<ListFilters>
							<ActivityLogFacets
								activityTypes={ae.facets.activityTypes}
								resourceTypes={ae.facets.resourceTypes}
								environments={ae.facets.environments}
								{selectedActivityTypes}
								{selectedResourceTypes}
								{selectedEnvironments}
								onActivityTypesChange={handleActivityTypesChange}
								onResourceTypesChange={handleResourceTypesChange}
								onEnvironmentsChange={handleEnvironmentsChange}
							/>
						</ListFilters>
					</SurfaceCard>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
</style>
