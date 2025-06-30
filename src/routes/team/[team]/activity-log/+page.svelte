<script lang="ts">
	import { ActivityLogActivityType, type ActivityLog$input } from '$houdini';
	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { ActivityLog, teamSlug } = $derived(data);

	const allActivities = Object.values(ActivityLogActivityType).map((type) => type);

	let filteredActivities = $state(allActivities);

	let allActivitiesButtonState: boolean | 'indeterminate' = $derived(
		filteredActivities.length === allActivities.length
			? true
			: filteredActivities.length === 0
				? false
				: 'indeterminate'
	);

	function filterActivities() {
		ActivityLog.fetch({
			variables: {
				team: teamSlug.valueOf(),
				first: 20,
				after: undefined,
				filter: {
					activityTypes:
						filteredActivities.length === allActivities.length ? [] : filteredActivities
				}
			} as ActivityLog$input
		});
	}
</script>

<div>
	{#if $ActivityLog.data}
		{@const ae = $ActivityLog.data.team.activityLog}
		<div class="wrapper">
			<div>
				<BodyLong spacing
					>The Activity Log provides an overview of changes made to your team and its resources
					within the Nais Console application.</BodyLong
				>
				<List title="{ae.pageInfo.totalCount} entries">
					{#snippet menu()}
						<ActionMenu>
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
							<ActionMenuCheckboxItem
								checked={allActivitiesButtonState}
								onchange={(checked) => {
									filteredActivities = checked ? [...allActivities] : [];
									filterActivities();
								}}
							>
								All Activities
							</ActionMenuCheckboxItem>
							{#each Object.values(ActivityLogActivityType) as type (type)}
								<ActionMenuCheckboxItem
									checked={filteredActivities.includes(type)}
									onchange={(checked) => {
										filteredActivities = checked
											? [...filteredActivities, type]
											: filteredActivities.filter((a) => a !== type);
										filterActivities();
									}}
								>
									{capitalizeFirstLetter(type.split('_').join(' ').toLowerCase())}
								</ActionMenuCheckboxItem>
							{/each}
						</ActionMenu>
					{/snippet}
					{#each ae.nodes || [] as item (item.id)}
						<ListItem>
							<ActivityLogItem {item} />
						</ListItem>
					{/each}
				</List>
				{#if $ActivityLog.data.team.activityLog.pageInfo.hasPreviousPage || $ActivityLog.data.team.activityLog.pageInfo.hasNextPage}
					<Pagination
						page={ae.pageInfo}
						loaders={{
							loadNextPage: () => {
								ActivityLog.loadNextPage({ first: 20 });
							},
							loadPreviousPage: () => {
								ActivityLog.loadPreviousPage({
									last: 20
								});
							}
						}}
					/>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
