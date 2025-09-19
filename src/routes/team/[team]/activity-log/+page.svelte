<script lang="ts">
	import {
		ActivityLogActivityType,
		type ActivityLog$input,
		type ActivityLogActivityType$options
	} from '$houdini';
	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyLong, Button, Loader, Search } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ActivityLog, teamSlug } = $derived(data);

	/* ---- filters (unchanged) ---- */
	const allActivities = Object.values(ActivityLogActivityType).map((type) => type);
	let filteredActivities = $state(allActivities);
	let searchQuery = $state('');

	let allActivitiesButtonState: boolean | 'indeterminate' = $derived(
		filteredActivities.length === allActivities.length
			? true
			: filteredActivities.length === 0
				? false
				: 'indeterminate'
	);

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
		Reconciler: [
			ActivityLogActivityType.RECONCILER_CONFIGURED,
			ActivityLogActivityType.RECONCILER_DISABLED,
			ActivityLogActivityType.RECONCILER_ENABLED
		],
		Repository: [
			ActivityLogActivityType.REPOSITORY_ADDED,
			ActivityLogActivityType.REPOSITORY_REMOVED
		],
		Secret: [
			ActivityLogActivityType.SECRET_CREATED,
			ActivityLogActivityType.SECRET_DELETED,
			ActivityLogActivityType.SECRET_VALUE_ADDED,
			ActivityLogActivityType.SECRET_VALUE_REMOVED,
			ActivityLogActivityType.SECRET_VALUE_UPDATED
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
					activityTypes:
						filteredActivities.length === allActivities.length ? [] : filteredActivities
				}
			} as ActivityLog$input
		});
		// Optional: window.scrollTo({ top: 0, behavior: 'auto' });
	}

	/* ---- bottom-only infinite scroll via window scroll ---- */
	let loadingNext = $state(false);
	const PAGE_SIZE = 20;
	const NEAR_BOTTOM_PX = 800; // eager

	async function loadMore() {
		if (loadingNext) return;
		const page = $ActivityLog.data?.team.activityLog.pageInfo;
		if (!page?.hasNextPage) return;

		loadingNext = true;
		try {
			// Infinite mode + CacheAndNetwork -> APPEND
			await ActivityLog.loadNextPage({ first: PAGE_SIZE });
		} finally {
			loadingNext = false;
		}
	}

	// rAF-throttled scroll handler
	$effect(() => {
		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				const doc = document.documentElement;
				const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - NEAR_BOTTOM_PX;
				if (nearBottom) void loadMore();
				ticking = false;
			});
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		// Check once on mount (eager in case the first page doesn't fill viewport)
		onScroll();

		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<div>
	{#if $ActivityLog.data}
		{@const ae = $ActivityLog.data.team.activityLog}
		<div class="wrapper">
			<div>
				<BodyLong spacing>
					The Activity Log provides an overview of changes made to your team and its resources
					within the Nais Console application.
				</BodyLong>

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

				{#if loadingNext}
					<div class="loader">
						<Loader size="small" title="Loading more…" />
					</div>
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
	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--ax-space-8) 0;
	}
</style>
