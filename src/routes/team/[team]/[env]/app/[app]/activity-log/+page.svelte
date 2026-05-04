<script lang="ts">
	import { page } from '$app/state';
	import type { ActivityLogActivityType$options } from '$houdini';
	import {
		activityTypeLabel,
		allWorkloadActivityTypes,
		groupedWorkloadActivities
	} from '$lib/domain/activity/workload/activityTypeFilter';
	import ActivityLogItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { Button, Search } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ApplicationActivityLog } = $derived(data);
	let activityLog = $derived(
		$ApplicationActivityLog.data?.team.environment.application.activityLog
	);
	let totalCount = $derived(activityLog?.pageInfo.totalCount ?? 0);

	const groupedActivities = groupedWorkloadActivities('app');
	const allActivities = allWorkloadActivityTypes('app');
	let filtered = $state<ActivityLogActivityType$options[]>([...allActivities]);
	let searchQuery = $state('');

	let allActivitiesButtonState: boolean | 'indeterminate' = $derived(
		filtered.length === allActivities.length
			? true
			: filtered.length === 0
				? false
				: 'indeterminate'
	);

	function filteredGroup(types: ActivityLogActivityType$options[]) {
		if (!searchQuery) return types;
		return types.filter((type) => type.toLowerCase().includes(searchQuery.toLowerCase()));
	}

	function filterActivities(nextFiltered: ActivityLogActivityType$options[]) {
		filtered = nextFiltered;
		ApplicationActivityLog.fetch({
			variables: {
				team: page.params.team!,
				env: page.params.env!,
				app: page.params.app!,
				first: 20,
				after: undefined,
				before: undefined,
				filter: {
					activityTypes: nextFiltered.length === allActivities.length ? [] : nextFiltered.toSorted()
				}
			}
		});
	}
</script>

<GraphErrors errors={$ApplicationActivityLog.errors} />

<List title="{totalCount} entr{totalCount === 1 ? 'y' : 'ies'}">
	{#snippet menu()}
		<ActionMenu align="end">
			{#snippet trigger(props)}
				<Button
					variant="tertiary-neutral"
					size="small"
					iconPosition="right"
					{...props}
					icon={ChevronDownIcon}
				>
					<span style="font-weight: normal">Filter</span>
				</Button>
			{/snippet}
			<div class="activity-search-wrapper">
				<Search
					class="activity-filter-search"
					placeholder="Search activity type…"
					label="Search activity type"
					size="small"
					bind:value={searchQuery}
				/>
			</div>
			<ActionMenuCheckboxItem
				checked={allActivitiesButtonState}
				onchange={(checked) => {
					filterActivities(checked ? [...allActivities] : []);
				}}
			>
				<span class="activity-filter-option-label">All Activities</span>
			</ActionMenuCheckboxItem>
			{#each Object.entries(groupedActivities) as [group, types] (group)}
				{#if filteredGroup(types).length}
					<div class="activity-group-label">{group}</div>
					{#each filteredGroup(types) as type (type)}
						<ActionMenuCheckboxItem
							checked={filtered.includes(type)}
							onchange={(checked) => {
								filterActivities(
									checked ? [...filtered, type] : filtered.filter((activity) => activity !== type)
								);
							}}
						>
							<span class="activity-filter-option-label">{activityTypeLabel(type)}</span>
						</ActionMenuCheckboxItem>
					{/each}
				{/if}
			{/each}
		</ActionMenu>
	{/snippet}
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
			loadPreviousPage: () =>
				ApplicationActivityLog.loadPreviousPage({
					last: 20
				}),
			loadNextPage: () =>
				ApplicationActivityLog.loadNextPage({
					first: 20
				})
		}}
		fetching={$ApplicationActivityLog.fetching}
	/>
{/if}

<style>
	.activity-search-wrapper {
		padding: var(--ax-space-8);
	}

	.activity-group-label {
		padding: var(--ax-space-4) var(--ax-space-8);
		font-weight: 500;
		color: var(--ax-text-neutral-subtle);
		margin-top: var(--ax-space-2);
	}

	.activity-filter-option-label {
		display: block;
		width: 100%;
		flex: 1 1 auto;
		min-width: 0;
		text-align: left;
	}

	.empty-state {
		color: var(--ax-text-subtle);
	}
</style>
