<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection, SqlInstanceOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import IssueSeverityTags from '$lib/domain/issues/IssueSeverityTags.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import CollapsibleSidebar from '$lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { changeParams } from '$lib/utils/searchparams';
	import { Loader, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon, FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	type SqlOrderFieldOptions = (typeof SqlInstanceOrderField)[keyof typeof SqlInstanceOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();

	let filtersOpen = $state(false);

	let { SqlInstances } = $derived(data);

	const sortFields: { value: SqlOrderFieldOptions; label: string }[] = [
		{ value: SqlInstanceOrderField.ISSUES, label: 'Issues' },
		{ value: SqlInstanceOrderField.NAME, label: 'Name' },
		{ value: SqlInstanceOrderField.ENVIRONMENT, label: 'Environment' },
		{ value: SqlInstanceOrderField.STATE, label: 'State' },
		{ value: SqlInstanceOrderField.COST, label: 'Cost' },
		{ value: SqlInstanceOrderField.CPU_UTILIZATION, label: 'CPU utilization' },
		{ value: SqlInstanceOrderField.MEMORY_UTILIZATION, label: 'Memory utilization' },
		{ value: SqlInstanceOrderField.DISK_UTILIZATION, label: 'Disk utilization' },
		{ value: SqlInstanceOrderField.VERSION, label: 'Version' }
	];

	const currentSortField: SqlOrderFieldOptions = $derived(
		(Object.values(SqlInstanceOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as SqlOrderFieldOptions | undefined) ?? SqlInstanceOrderField.ISSUES
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.DESC
	);

	function setSort(field: SqlOrderFieldOptions) {
		const defaultDirection =
			field === SqlInstanceOrderField.NAME ||
			field === SqlInstanceOrderField.ENVIRONMENT ||
			field === SqlInstanceOrderField.STATE ||
			field === SqlInstanceOrderField.VERSION
				? OrderDirection.ASC
				: OrderDirection.DESC;
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: defaultDirection;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}
</script>

<GraphErrors errors={$SqlInstances.errors} />

{#if $SqlInstances.fetching}
	<div class="loading" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if $SqlInstances.data}
	{@const si = $SqlInstances.data.team.sqlInstances}

	<div class="layout-two-column">
		<div>
			<List title="Cloud SQL" count={si.pageInfo.totalCount}>
				{#snippet actions()}
					<button
						type="button"
						class="sidebar-toggle"
						aria-expanded={filtersOpen}
						onclick={() => (filtersOpen = !filtersOpen)}
					>
						<FunnelIcon aria-hidden="true" style="font-size: 1rem" />
						Filters
					</button>
				{/snippet}
				{#each si.edges as { node: instance } (instance.id)}
					<ListItem interactive>
						<div class="name-group">
							<TooltipAlignHack
								content={{
									FAILED: 'FAILED',
									MAINTENANCE: 'MAINTENANCE',
									PENDING_CREATE: 'PENDING_CREATE',
									PENDING_DELETE: 'PENDING_DELETE',
									RUNNABLE: 'RUNNABLE',
									SUSPENDED: 'SUSPENDED',
									UNSPECIFIED: 'UNSPECIFIED',
									STOPPED: 'STOPPED'
								}[instance.state] ?? ''}
							>
								<CircleFillIcon
									style="color: var({{
										RUNNABLE: '--ax-bg-success-strong',
										FAILED: '--ax-bg-danger-strong',
										MAINTENANCE: '--ax-bg-warning-moderate-pressed',
										PENDING_CREATE: '--ax-bg-info-strong',
										PENDING_DELETE: '--ax-bg-info-strong',
										SUSPENDED: '--ax-bg-info-strong',
										UNSPECIFIED: '--ax-bg-info-strong',
										STOPPED: '--ax-bg-info-strong'
									}[instance.state] ?? '--ax-bg-info-strong'}); font-size: 0.7rem"
								/>
							</TooltipAlignHack>
							<a
								class="item-name"
								href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
									.name}/cloudsql/{instance.name}">{instance.name}</a
							>
							<Tag size="xsmall" variant={envTagVariant(instance.teamEnvironment.environment.name)}
								>{instance.teamEnvironment.environment.name}</Tag
							>
						</div>

						<div class="right">
							{#if instance.workload}
								<div style:display="flex" style:gap="var(--ax-space-6)">
									Owner: <WorkloadLink workload={instance.workload} hideTeam hideEnv />
								</div>
							{/if}

							<div>Version: <code>{instance.version}</code></div>
							{#if (instance.issues?.pageInfo.totalCount ?? 0) > 0}
								{@const criticalCount = countIssuesBySeverity(instance.issues?.edges, 'CRITICAL')}
								{@const warningCount = countIssuesBySeverity(instance.issues?.edges, 'WARNING')}
								{@const todoCount = countIssuesBySeverity(instance.issues?.edges, 'TODO')}

								<IssueSeverityTags
									critical={criticalCount}
									warning={warningCount}
									todo={todoCount}
								/>
							{/if}
						</div>
					</ListItem>
				{:else}
					<ListItem>
						<p>
							No Cloud SQL instances found. Cloud SQL instances provide managed relational databases
							in the cloud.
							<ExternalLink href={docURL('/persistence/cloudsql')}
								>Learn more about Cloud SQL in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/each}
			</List>

			<Pagination
				page={si.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams({ after: '', before: si.pageInfo.startCursor ?? '' }, { noScroll: true }),
					loadNextPage: () =>
						changeParams({ before: '', after: si.pageInfo.endCursor ?? '' }, { noScroll: true })
				}}
			/>
		</div>
		<CollapsibleSidebar bind:open={filtersOpen}>
			<SurfaceCard title="Filters">
				<ListFilters
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					onSort={(field) => setSort(field as SqlOrderFieldOptions)}
				/>
			</SurfaceCard>
		</CollapsibleSidebar>
	</div>
{/if}

<style>
	.right {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-6);
		align-items: flex-end;
	}

	code {
		font-size: 0.9rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
		width: 100%;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.right {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}

		.right :global(.issues-container.inline) {
			width: auto;
			justify-content: flex-end;
			gap: var(--ax-space-8);
		}
	}

	.name-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}
	.name-group :global(.aksel-tag) {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.item-name {
		color: var(--ax-text-neutral);
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 0 1 auto;
	}
	.item-name:hover {
		text-decoration: underline;
	}
</style>
