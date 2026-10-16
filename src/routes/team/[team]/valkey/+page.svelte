<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection, ValkeyOrderField } from '$houdini';
	import { docURL } from '#lib/doc.js';
	import IssueSeverityTags from '#lib/domain/issues/IssueSeverityTags.svelte';
	import WorkloadListFilters from '#lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import ValkeyIcon from '#lib/icons/ValkeyIcon.svelte';
	import WarningIcon from '#lib/icons/WarningIcon.svelte';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import PageModal, { pageModalClick } from '#lib/ui/PageModal.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import StatusIndicator from '#lib/ui/StatusIndicator.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '#lib/ui/TooltipAlignHack.svelte';
	import { capitalizeFirstLetter } from '#lib/utils/formatters.js';
	import { countIssuesBySeverity } from '#lib/utils/issueCounts.js';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Button, Tag, Td, Th, Tr, type TableSortState } from '@nais/ds-svelte-community';
	import { FunnelIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import CreatePage from './create/+page.svelte';

	type ValkeyOrderFieldOptions = (typeof ValkeyOrderField)[keyof typeof ValkeyOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let filtersOpen = $state(false);
	let { Valkeys, viewerIsMember } = $derived(data);

	const currentSortField: ValkeyOrderFieldOptions = $derived(
		(Object.values(ValkeyOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as ValkeyOrderFieldOptions | undefined) ?? ValkeyOrderField.ISSUES
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			OrderDirectionOptions | undefined) ?? OrderDirection.DESC
	);

	const tableSort: TableSortState = $derived({
		orderBy: currentSortField,
		direction: currentSortDirection === OrderDirection.ASC ? 'ascending' : 'descending'
	});

	function setSort(key: string) {
		const field = Object.values(ValkeyOrderField).find((field) => field === key);
		if (!field) throw new Error(`Unsupported Valkey sort field: ${key}`);
		const defaultDirection =
			field === ValkeyOrderField.NAME || field === ValkeyOrderField.ENVIRONMENT
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

	let create = $derived({
		buttonText: 'Create Valkey',
		url: `/team/${$Valkeys.data?.team.slug}/valkey/create`,
		page: CreatePage,
		header: 'Create Valkey',
		viewerIsMember: viewerIsMember
	});

	const selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);
	const selectedTiers: string[] = $derived(
		page.url.searchParams.get('tiers')?.split(',').filter(Boolean) ?? []
	);
	let selectedLabels: string[] = $derived(
		page.url.searchParams.get('labels')?.split(',').filter(Boolean) ?? []
	);

	function handleEnvironmentsChange(selected: string[]) {
		changeParams({ environments: selected.join(','), after: '', before: '' }, { noScroll: true });
	}

	function handleLabelsChange(selected: string[]) {
		changeParams({ labels: selected.join(','), after: '', before: '' }, { noScroll: true });
	}

	const tierFacets = $derived($Valkeys.data?.team.valkeys.facets?.tiers ?? []);
	const displayTierFacets = $derived([
		...tierFacets,
		...selectedTiers
			.filter((t) => !tierFacets.some((f) => f.tier === t))
			.map((t) => ({ tier: t, count: 0 }))
	]);

	function toggleTier(tier: string) {
		const isSelected = selectedTiers.includes(tier);
		const next = isSelected ? selectedTiers.filter((t) => t !== tier) : [...selectedTiers, tier];
		changeParams({ tiers: next.join(','), after: '', before: '' }, { noScroll: true });
	}

	function isManagedByConsole(instanceName: string) {
		return !instanceName.startsWith(`valkey-${page.params.team}-`);
	}
</script>

<GraphErrors errors={$Valkeys.errors} />

{#if $Valkeys.data}
	<div class="layout-two-column">
		<div>
			<Collection
				title="Valkey"
				icon={ValkeyIcon}
				headerBorder={false}
				count={$Valkeys.data.team.valkeys.pageInfo.totalCount}
			>
				{#snippet actions()}
					{#if create && create.viewerIsMember}
						<Button
							variant="secondary"
							size="small"
							as="a"
							href={create.url}
							icon={PlusIcon}
							onclick={pageModalClick}
						>
							{create.buttonText}
						</Button>
					{/if}
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
				{#if $Valkeys.data.team.valkeys.pageInfo.totalCount > 0}
					<ResourceTable label="Valkey" sort={tableSort} onsortchange={setSort}>
						{#snippet header()}
							<Th sortable sortKey={ValkeyOrderField.STATE}>Status</Th>
							<Th sortable sortKey={ValkeyOrderField.NAME}>Name</Th>
							<Th sortable sortKey={ValkeyOrderField.ENVIRONMENT}>Env</Th>
							<Th sortable sortKey={ValkeyOrderField.ISSUES}>Issues</Th>
						{/snippet}
						{#each $Valkeys.data.team.valkeys.edges as { node: instance } (instance.id)}
							<Tr>
								<Td>
									<div class="status-cell">
										<StatusIndicator
											label={{
												RUNNING: 'Instance is running',
												UNKNOWN: 'Unknown status',
												POWEROFF: 'Powered off',
												REBALANCING: 'Rebalancing',
												REBUILDING: 'Rebuilding'
											}[instance.state] ?? 'Unknown status'}
											tone={instance.state === 'RUNNING'
												? 'success'
												: instance.state === 'POWEROFF'
													? 'warning'
													: instance.state === 'REBALANCING'
														? 'warning'
														: instance.state === 'REBUILDING'
															? 'info'
															: 'neutral'}
										/>
									</div>
								</Td>
								<Td>
									<div class="resource-name-group">
										<a
											class="resource-name"
											href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
												.name}/valkey/{instance.name}">{instance.name}</a
										>
										{#if !isManagedByConsole(instance.name)}
											<TooltipAlignHack
												content="This instance will be migrated on the 9th of September."
											>
												<WarningIcon
													aria-label="This instance will be migrated on the 9th of September."
													style="color: var(--ax-text-warning); font-size: var(--ax-font-size-small)"
												/>
											</TooltipAlignHack>
										{/if}
									</div>
								</Td>
								<Td>
									<Tag
										size="xsmall"
										variant={envTagVariant(instance.teamEnvironment.environment.name)}
										>{instance.teamEnvironment.environment.name}</Tag
									>
								</Td>
								<Td>
									{#if (instance.issues?.pageInfo.totalCount ?? 0) > 0}
										{const criticalCount = $derived(
											countIssuesBySeverity(instance.issues?.edges, 'CRITICAL')
										)}
										{const warningCount = $derived(
											countIssuesBySeverity(instance.issues?.edges, 'WARNING')
										)}
										{const todoCount = $derived(
											countIssuesBySeverity(instance.issues?.edges, 'TODO')
										)}

										<IssueSeverityTags
											critical={criticalCount}
											warning={warningCount}
											todo={todoCount}
										/>
									{/if}
								</Td>
							</Tr>
						{/each}
					</ResourceTable>
				{:else}
					<p>
						No Valkey instances found. Valkey is a key value database that is used for storing and
						querying data. It is a good choice for storing data that is not relational in nature and
						often used for caching.
						<ExternalLink href={docURL('/persistence/valkey')}
							>Learn more about Valkey and how to get started.</ExternalLink
						>
					</p>
				{/if}
			</Collection>
			<Pagination
				page={$Valkeys.data.team.valkeys.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams(
							{
								after: '',
								before: $Valkeys.data?.team.valkeys.pageInfo.startCursor ?? ''
							},
							{ noScroll: true }
						),
					loadNextPage: () =>
						changeParams(
							{ before: '', after: $Valkeys.data?.team.valkeys.pageInfo.endCursor ?? '' },
							{ noScroll: true }
						)
				}}
			/>
		</div>
		<CollapsibleSidebar bind:open={filtersOpen}>
			<SurfaceCard title="Filters">
				<WorkloadListFilters
					environments={$Valkeys.data?.team.valkeys.facets?.environments ?? []}
					labels={$Valkeys.data?.team.valkeys.facets?.labels ?? []}
					{selectedEnvironments}
					{selectedLabels}
					onEnvironmentsChange={handleEnvironmentsChange}
					onLabelsChange={handleLabelsChange}
				>
					{#if displayTierFacets.length > 0}
						<details class="filter-section" open>
							<summary class="section-heading">Tier</summary>
							<div class="facet-list">
								{#each displayTierFacets as facet (facet.tier)}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={selectedTiers.includes(facet.tier)}
											onchange={() => toggleTier(facet.tier)}
										/>
										<span class="facet-label"
											>{capitalizeFirstLetter(facet.tier.split('_').join(' ').toLowerCase())}</span
										>
										<span class="facet-count">{facet.count}</span>
									</label>
								{/each}
							</div>
						</details>
					{/if}
				</WorkloadListFilters>
			</SurfaceCard>
		</CollapsibleSidebar>
	</div>

	{#if create}
		<PageModal content={create.page} header={create.header} />
	{/if}
{/if}
