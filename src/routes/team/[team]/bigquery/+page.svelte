<script lang="ts">
	import { page } from '$app/state';
	import { BigQueryDatasetOrderField, OrderDirection } from '$houdini';
	import { docURL } from '#lib/doc.js';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import WorkloadListFilters from '#lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import BigQueryIcon from '#lib/icons/BigQueryIcon.svelte';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Tag, Td, Th, Tr, type TableSortState } from '#lib/shadcn/ui/index.js';
	import { FunnelIcon } from '#lib/icons/index.js';
	import type { PageProps } from './$types';

	type BigQueryOrderFieldOptions =
		(typeof BigQueryDatasetOrderField)[keyof typeof BigQueryDatasetOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let filtersOpen = $state(false);
	let { BigQuery } = $derived(data);

	const currentSortField: BigQueryOrderFieldOptions = $derived(
		(Object.values(BigQueryDatasetOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as BigQueryOrderFieldOptions | undefined) ?? BigQueryDatasetOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			OrderDirectionOptions | undefined) ?? OrderDirection.ASC
	);

	const tableSort: TableSortState = $derived({
		orderBy: currentSortField,
		direction: currentSortDirection === OrderDirection.ASC ? 'ascending' : 'descending'
	});

	function setSort(key: string) {
		const field = Object.values(BigQueryDatasetOrderField).find((field) => field === key);
		if (!field) throw new Error(`Unsupported BigQuery sort field: ${key}`);
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.ASC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}

	const selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
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
</script>

<GraphErrors errors={$BigQuery.errors} />

{#if $BigQuery.data}
	<div class="layout-two-column">
		<div>
			<Collection
				title="BigQuery"
				icon={BigQueryIcon}
				headerBorder={false}
				count={$BigQuery.data.team.bigQueryDatasets.pageInfo.totalCount}
			>
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
				{#if $BigQuery.data.team.bigQueryDatasets.pageInfo.totalCount > 0}
					<ResourceTable label="BigQuery" sort={tableSort} onsortchange={setSort}>
						{#snippet header()}
							<Th sortable sortKey={BigQueryDatasetOrderField.NAME}>Name</Th>
							<Th sortable sortKey={BigQueryDatasetOrderField.ENVIRONMENT}>Env</Th>
							<Th>Owner</Th>
						{/snippet}
						{#each $BigQuery.data.team.bigQueryDatasets.edges as { node: instance } (instance.id)}
							<Tr>
								<Td>
									<a
										class="resource-name"
										href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
											.name}/bigquery/{instance.name}">{instance.name}</a
									>
								</Td>
								<Td
									><Tag
										size="xsmall"
										variant={envTagVariant(instance.teamEnvironment.environment.name)}
										>{instance.teamEnvironment.environment.name}</Tag
									>
								</Td>
								<Td>
									{#if instance.workload}
										<WorkloadLink workload={instance.workload} hideTeam hideEnv />
									{/if}
								</Td>
							</Tr>
						{/each}
					</ResourceTable>
				{:else}
					<p>
						No BigQuery datasets found. BigQuery datasets store structured data optimized for
						analytical workloads.
						<ExternalLink href={docURL('/persistence/bigquery')}
							>Learn more about BigQuery datasets and how to get started.</ExternalLink
						>
					</p>
				{/if}
			</Collection>
			<Pagination
				page={$BigQuery.data.team.bigQueryDatasets.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams(
							{
								after: '',
								before: $BigQuery.data?.team.bigQueryDatasets.pageInfo.startCursor ?? ''
							},
							{ noScroll: true }
						),
					loadNextPage: () =>
						changeParams(
							{
								before: '',
								after: $BigQuery.data?.team.bigQueryDatasets.pageInfo.endCursor ?? ''
							},
							{ noScroll: true }
						)
				}}
			/>
		</div>
		<CollapsibleSidebar bind:open={filtersOpen}>
			<SurfaceCard title="Filters">
				<WorkloadListFilters
					environments={$BigQuery.data?.team.bigQueryDatasets.facets?.environments ?? []}
					labels={$BigQuery.data?.team.bigQueryDatasets.facets?.labels ?? []}
					{selectedEnvironments}
					{selectedLabels}
					onEnvironmentsChange={handleEnvironmentsChange}
					onLabelsChange={handleLabelsChange}
				/>
			</SurfaceCard>
		</CollapsibleSidebar>
	</div>
{/if}
