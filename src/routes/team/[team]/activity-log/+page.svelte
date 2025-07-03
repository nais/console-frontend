<script lang="ts">
	import {
		ActivityLogActivityType,
		type ActivityLog$input,
		type ActivityLogActivityType$options
	} from '$houdini';
	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyLong, Button, Search } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

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

	let searchQuery = $state('');

	const groupedActivities: Record<string, ActivityLogActivityType$options[]> = {
		Application: [
			'APPLICATION_DELETED',
			'APPLICATION_RESTARTED',
			'APPLICATION_SCALED',
			'DEPLOYMENT'
		],
		Job: ['JOB_DELETED', 'JOB_TRIGGERED'],
		Reconciler: ['RECONCILER_CONFIGURED', 'RECONCILER_DISABLED', 'RECONCILER_ENABLED'],
		Repository: ['REPOSITORY_ADDED', 'REPOSITORY_REMOVED'],
		Secret: [
			'SECRET_CREATED',
			'SECRET_DELETED',
			'SECRET_VALUE_ADDED',
			'SECRET_VALUE_REMOVED',
			'SECRET_VALUE_UPDATED'
		],
		ServiceAccount: [
			'SERVICE_ACCOUNT_CREATED',
			'SERVICE_ACCOUNT_DELETED',
			'SERVICE_ACCOUNT_ROLE_ASSIGNED',
			'SERVICE_ACCOUNT_ROLE_REVOKED',
			'SERVICE_ACCOUNT_TOKEN_CREATED',
			'SERVICE_ACCOUNT_TOKEN_DELETED',
			'SERVICE_ACCOUNT_TOKEN_UPDATED',
			'SERVICE_ACCOUNT_UPDATED'
		],
		Team: [
			'TEAM_CONFIRM_DELETE_KEY',
			'TEAM_CREATED',
			'TEAM_CREATE_DELETE_KEY',
			'TEAM_DEPLOY_KEY_UPDATED',
			'TEAM_ENVIRONMENT_UPDATED',
			'TEAM_MEMBER_ADDED',
			'TEAM_MEMBER_REMOVED',
			'TEAM_MEMBER_SET_ROLE',
			'TEAM_UPDATED'
		],
		Unleash: ['UNLEASH_INSTANCE_CREATED', 'UNLEASH_INSTANCE_UPDATED'],
		Vulnerability: ['VULNERABILITY_UPDATED']
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
									filteredActivities = checked ? [...allActivities] : [];
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
											checked={filteredActivities.includes(type as ActivityLogActivityType$options)}
											onchange={(checked) => {
												const t = type as ActivityLogActivityType$options;
												filteredActivities = checked
													? [...filteredActivities, t]
													: filteredActivities.filter((a) => a !== t);

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
