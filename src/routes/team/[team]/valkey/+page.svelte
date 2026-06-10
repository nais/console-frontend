<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection, ValkeyOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import IssueSeverityTags from '$lib/domain/issues/IssueSeverityTags.svelte';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import PageModal, { pageModalClick } from '$lib/ui/PageModal.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import CreatePage from './create/+page.svelte';

	type ValkeyOrderFieldOptions = (typeof ValkeyOrderField)[keyof typeof ValkeyOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let { Valkeys, viewerIsMember } = $derived(data);

	const sortFields: { value: ValkeyOrderFieldOptions; label: string }[] = [
		{ value: ValkeyOrderField.ISSUES, label: 'Issues' },
		{ value: ValkeyOrderField.NAME, label: 'Name' },
		{ value: ValkeyOrderField.ENVIRONMENT, label: 'Environment' },
		{ value: ValkeyOrderField.STATE, label: 'State' }
	];

	const currentSortField: ValkeyOrderFieldOptions = $derived(
		(Object.values(ValkeyOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as ValkeyOrderFieldOptions | undefined) ?? ValkeyOrderField.ISSUES
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.DESC
	);

	function setSort(field: ValkeyOrderFieldOptions) {
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
</script>

<GraphErrors errors={$Valkeys.errors} />

{#if $Valkeys.data}
	<div class="layout-two-column">
		<div>
			<List title="Valkey" count={$Valkeys.data.team.valkeys.pageInfo.totalCount}>
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
				{/snippet}
				{#if $Valkeys.data.team.valkeys.nodes.length > 0}
					{#each $Valkeys.data.team.valkeys.nodes as instance (instance.id)}
						<ListItem interactive>
							<div class="name-group">
								<TooltipAlignHack
									content={{
										RUNNING: 'Instance is running',
										UNKNOWN: 'Unknown status',
										POWEROFF: 'Powered off',
										REBALANCING: 'Rebalancing',
										REBUILDING: 'Rebuilding'
									}[instance.state] ?? ''}
								>
									{#if instance.state === 'RUNNING'}
										<RunningIndicator />
									{:else if instance.state === 'REBALANCING'}
										<div class="status-indicator rebalancing">
											<CircleFillIcon />
										</div>
									{:else if instance.state === 'REBUILDING'}
										<div class="status-indicator rebuilding">
											<CircleFillIcon />
										</div>
									{:else if instance.state === 'POWEROFF'}
										<CircleFillIcon style="color: var(--ax-bg-danger-strong); font-size: 0.7rem" />
									{:else}
										<CircleFillIcon
											style="color: var(--ax-bg-info-moderate-pressed); font-size: 0.7rem"
										/>
									{/if}
								</TooltipAlignHack>
								<a
									href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
										.name}/valkey/{instance.name}"
									class="item-name">{instance.name}</a
								>
								<Tag
									size="xsmall"
									variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>
							{#if (instance.issues?.pageInfo.totalCount ?? 0) > 0}
								{@const criticalCount = countIssuesBySeverity(instance.issues?.edges, 'CRITICAL')}
								{@const warningCount = countIssuesBySeverity(instance.issues?.edges, 'WARNING')}
								{@const todoCount = countIssuesBySeverity(instance.issues?.edges, 'TODO')}

								<div class="right">
									<IssueSeverityTags
										critical={criticalCount}
										warning={warningCount}
										todo={todoCount}
									/>
								</div>
							{/if}
						</ListItem>
					{/each}
				{:else}
					<ListItem>
						<p>
							No Valkey instances found. Valkey is a key value database that is used for storing and
							querying data. It is a good choice for storing data that is not relational in nature
							and often used for caching.
							<ExternalLink href={docURL('/persistence/valkey')}
								>Learn more about Valkey and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
			</List>
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
		<div class="layout-sidebar">
			<SurfaceCard title="Filters">
				<WorkloadListFilters
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					environments={$Valkeys.data?.team.valkeys.facets?.environments ?? []}
					labels={$Valkeys.data?.team.valkeys.facets?.labels ?? []}
					{selectedEnvironments}
					{selectedLabels}
					onSort={(field) => setSort(field as ValkeyOrderFieldOptions)}
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
		</div>
	</div>

	{#if create}
		<PageModal content={create.page} header={create.header} />
	{/if}

	<style>
		.right {
			display: flex;
			gap: var(--ax-space-6);
			align-items: center;
		}

		/* Valkey state indicators */
		.status-indicator {
			width: 24px;
			font-size: 0.7rem;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.status-indicator.rebalancing {
			color: var(--ax-bg-warning-moderate-pressed);
			animation: pulse 2s ease-in-out infinite;
		}

		.status-indicator.rebuilding {
			color: var(--ax-bg-info-strong);
			animation: pulse 2s ease-in-out infinite;
		}

		@keyframes pulse {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.4;
			}
		}

		/* Mobile responsive layout */
		@media (max-width: 767px), (max-height: 500px) {
			.right {
				align-items: flex-end;
				margin-top: var(--ax-space-6);
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
{/if}
