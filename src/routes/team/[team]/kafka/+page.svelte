<script lang="ts">
	import { page } from '$app/state';
	import { KafkaTopicOrderField, OrderDirection } from '$houdini';
	import { docURL } from '#lib/doc.js';
	import WorkloadListFilters from '#lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import KafkaIcon from '#lib/icons/KafkaIcon.svelte';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Tag, Td, Th, Tr, type TableSortState } from '@nais/ds-svelte-community';
	import { FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	type KafkaTopicOrderFieldOptions =
		(typeof KafkaTopicOrderField)[keyof typeof KafkaTopicOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let filtersOpen = $state(false);
	let { KafkaTopics } = $derived(data);

	const currentSortField: KafkaTopicOrderFieldOptions = $derived(
		(Object.values(KafkaTopicOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as KafkaTopicOrderFieldOptions | undefined) ?? KafkaTopicOrderField.NAME
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
		const field = Object.values(KafkaTopicOrderField).find((field) => field === key);
		if (!field) throw new Error(`Unsupported Kafka sort field: ${key}`);
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
	const selectedPools: string[] = $derived(
		page.url.searchParams.get('pools')?.split(',').filter(Boolean) ?? []
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

	const poolFacets = $derived($KafkaTopics.data?.team.kafkaTopics.facets?.pools ?? []);
	const displayPoolFacets = $derived([
		...poolFacets,
		...selectedPools
			.filter((p) => !poolFacets.some((f) => f.value === p))
			.map((p) => ({ value: p, count: 0 }))
	]);

	function togglePool(pool: string) {
		const isSelected = selectedPools.includes(pool);
		const next = isSelected ? selectedPools.filter((p) => p !== pool) : [...selectedPools, pool];
		changeParams({ pools: next.join(','), after: '', before: '' }, { noScroll: true });
	}
</script>

<GraphErrors errors={$KafkaTopics.errors} />

{#if $KafkaTopics.data}
	<div class="layout-two-column">
		<div>
			<Collection
				title="Kafka"
				icon={KafkaIcon}
				headerBorder={false}
				count={$KafkaTopics.data.team.kafkaTopics.pageInfo.totalCount}
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
				{#if $KafkaTopics.data.team.kafkaTopics.pageInfo.totalCount > 0}
					<ResourceTable label="Kafka topics" sort={tableSort} onsortchange={setSort}>
						{#snippet header()}
							<Th sortable sortKey={KafkaTopicOrderField.NAME}>Name</Th>
							<Th sortable sortKey={KafkaTopicOrderField.ENVIRONMENT}>Env</Th>
						{/snippet}
						{#each $KafkaTopics.data.team.kafkaTopics.edges as { node: instance } (instance.id)}
							<Tr>
								<Td>
									<a
										class="resource-name"
										href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
											.name}/kafka/{instance.name}">{instance.name}</a
									>
								</Td>
								<Td>
									<Tag
										size="xsmall"
										variant={envTagVariant(instance.teamEnvironment.environment.name)}
										>{instance.teamEnvironment.environment.name}</Tag
									>
								</Td>
							</Tr>
						{/each}
					</ResourceTable>
				{:else}
					<p>
						No Kafka topics found. Kafka topics are categories where messages are published and
						consumed, acting as distributed logs for event streaming.
						<ExternalLink href={docURL('/persistence/kafka')}
							>Learn more about Kafka and how to get started.</ExternalLink
						>
					</p>
				{/if}
			</Collection>
			<Pagination
				page={$KafkaTopics.data.team.kafkaTopics.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams(
							{
								after: '',
								before: $KafkaTopics.data?.team.kafkaTopics.pageInfo.startCursor ?? ''
							},
							{ noScroll: true }
						),
					loadNextPage: () =>
						changeParams(
							{ before: '', after: $KafkaTopics.data?.team.kafkaTopics.pageInfo.endCursor ?? '' },
							{ noScroll: true }
						)
				}}
			/>
		</div>
		<CollapsibleSidebar bind:open={filtersOpen}>
			<SurfaceCard title="Filters">
				<WorkloadListFilters
					environments={$KafkaTopics.data?.team.kafkaTopics.facets?.environments ?? []}
					labels={$KafkaTopics.data?.team.kafkaTopics.facets?.labels ?? []}
					{selectedEnvironments}
					{selectedLabels}
					onEnvironmentsChange={handleEnvironmentsChange}
					onLabelsChange={handleLabelsChange}
				>
					{#if displayPoolFacets.length > 0}
						<details class="filter-section" open>
							<summary class="section-heading">Pools</summary>
							<div class="facet-list">
								{#each displayPoolFacets as facet (facet.value)}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={selectedPools.includes(facet.value)}
											onchange={() => togglePool(facet.value)}
										/>
										<span class="facet-label">{facet.value}</span>
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
{/if}
