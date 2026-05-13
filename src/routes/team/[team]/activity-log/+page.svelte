<script lang="ts">
	import { page } from '$app/state';
	import { type ActivityLogActivityType$options } from '$houdini';
	import ActivityLogFacets from '$lib/domain/activity/ActivityLogFacets.svelte';
	import ActivityLogItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
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
		<div class="wrapper">
			<div class="main-content">
				<BodyLong spacing
					>The Activity Log provides an overview of changes made to your team and its resources
					within the Nais Console application.</BodyLong
				>
				<List title="{ae.pageInfo.totalCount} entries">
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
				<aside class="facets-sidebar">
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
				</aside>
			{/if}
		</div>
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
