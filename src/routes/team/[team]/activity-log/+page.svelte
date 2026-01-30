<script lang="ts">
	import {
		ActivityLogActivityType,
		type ActivityLog$input,
		type ActivityLogActivityType$options
	} from '$houdini';
	import ActivityLogItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyLong, Button, Search } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ActivityLog, teamSlug } = $derived(data);

	const allActivities = Object.values(ActivityLogActivityType).map((type) => type);

	let filtered = $state(allActivities);

	let allActivitiesButtonState: boolean | 'indeterminate' = $derived(
		filtered.length === allActivities.length
			? true
			: filtered.length === 0
				? false
				: 'indeterminate'
	);

	let searchQuery = $state('');

	const groupedActivities: Record<string, ActivityLogActivityType$options[]> = {
		Application: [
			ActivityLogActivityType.APPLICATION_DELETED,
			ActivityLogActivityType.APPLICATION_RESTARTED,
			ActivityLogActivityType.APPLICATION_SCALED
		],
		'Cluster Audit': [ActivityLogActivityType.CLUSTER_AUDIT],
		Deployment: [ActivityLogActivityType.DEPLOYMENT],
		Job: [ActivityLogActivityType.JOB_DELETED, ActivityLogActivityType.JOB_TRIGGERED],
		OpenSearch: [
			ActivityLogActivityType.OPENSEARCH_CREATED,
			ActivityLogActivityType.OPENSEARCH_DELETED,
			ActivityLogActivityType.OPENSEARCH_UPDATED,
			ActivityLogActivityType.OPENSEARCH_MAINTENANCE_STARTED
		],
		// Reconciler: [
		// 	ActivityLogActivityType.RECONCILER_CONFIGURED,
		// 	ActivityLogActivityType.RECONCILER_DISABLED,
		// 	ActivityLogActivityType.RECONCILER_ENABLED
		// ],
		Repository: [
			ActivityLogActivityType.REPOSITORY_ADDED,
			ActivityLogActivityType.REPOSITORY_REMOVED
		],
		Secret: [
			ActivityLogActivityType.SECRET_CREATED,
			ActivityLogActivityType.SECRET_DELETED,
			ActivityLogActivityType.SECRET_VALUE_ADDED,
			ActivityLogActivityType.SECRET_VALUE_REMOVED,
			ActivityLogActivityType.SECRET_VALUE_UPDATED,
			ActivityLogActivityType.SECRET_VALUES_VIEWED
		],
		Team: [
			ActivityLogActivityType.TEAM_CONFIRM_DELETE_KEY,
			ActivityLogActivityType.TEAM_CREATED,
			ActivityLogActivityType.TEAM_CREATE_DELETE_KEY,
			ActivityLogActivityType.TEAM_DEPLOY_KEY_UPDATED,
			ActivityLogActivityType.TEAM_ENVIRONMENT_UPDATED,
			ActivityLogActivityType.TEAM_MEMBER_ADDED,
			ActivityLogActivityType.TEAM_MEMBER_REMOVED,
			ActivityLogActivityType.TEAM_MEMBER_SET_ROLE,
			ActivityLogActivityType.TEAM_UPDATED
		],
		Valkey: [
			ActivityLogActivityType.VALKEY_CREATED,
			ActivityLogActivityType.VALKEY_DELETED,
			ActivityLogActivityType.VALKEY_UPDATED,
			ActivityLogActivityType.VALKEY_MAINTENANCE_STARTED
		],
		Unleash: [
			ActivityLogActivityType.UNLEASH_INSTANCE_CREATED,
			ActivityLogActivityType.UNLEASH_INSTANCE_UPDATED
		],
		Vulnerability: [ActivityLogActivityType.VULNERABILITY_UPDATED]
	};

	function filteredGroup(types: string[]) {
		if (!searchQuery) return types;
		return types.filter((type) => type.toLowerCase().includes(searchQuery.toLowerCase()));
	}

	function filterActivities() {
		ActivityLog.fetch({
			variables: {
				team: teamSlug.valueOf(),
				first: 20,
				after: undefined,
				filter: {
					activityTypes: filtered.length === allActivities.length ? [] : filtered.toSorted()
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
									filtered = checked ? [...allActivities] : [];
									filterActivities();
								}}
							>
								All Activities
							</ActionMenuCheckboxItem>
							{#each Object.entries(groupedActivities) as [group, types] (group)}
								{#if filteredGroup(types).length}
									<div class="activity-group-label">{group}</div>
									{#each filteredGroup(types) as type (type)}
										<ActionMenuCheckboxItem
											checked={filtered.includes(type as ActivityLogActivityType$options)}
											onchange={(checked) => {
												const t = type as ActivityLogActivityType$options;
												filtered = checked ? [...filtered, t] : filtered.filter((a) => a !== t);

												filterActivities();
											}}
										>
											{capitalizeFirstLetter(type.split('_').join(' ').toLowerCase())}
										</ActionMenuCheckboxItem>
									{/each}
								{/if}
							{/each}
						</ActionMenu>
					{/snippet}
					{#each ae.nodes || [] as item (item.id)}
						<ActivityLogItem {item} />
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

	.activity-search-wrapper {
		padding: var(--ax-space-8);
	}

	.activity-group-label {
		padding: var(--ax-space-4) var(--ax-space-8);
		font-weight: 500;
		color: var(--ax-text-neutral-subtle);
		margin-top: var(--ax-space-2);
	}
</style>
