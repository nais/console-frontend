<script lang="ts">
	import { page } from '$app/state';
	import { KafkaTopicOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import CollapsibleSidebar from '$lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Tag } from '@nais/ds-svelte-community';
	import { FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	type KafkaTopicOrderFieldOptions =
		(typeof KafkaTopicOrderField)[keyof typeof KafkaTopicOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let filtersOpen = $state(false);
	let { KafkaTopics } = $derived(data);

	const sortFields: { value: KafkaTopicOrderFieldOptions; label: string }[] = [
		{ value: KafkaTopicOrderField.NAME, label: 'Name' },
		{ value: KafkaTopicOrderField.ENVIRONMENT, label: 'Environment' }
	];

	const currentSortField: KafkaTopicOrderFieldOptions = $derived(
		(Object.values(KafkaTopicOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as KafkaTopicOrderFieldOptions | undefined) ?? KafkaTopicOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: KafkaTopicOrderFieldOptions) {
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
			<List title="Kafka" count={$KafkaTopics.data.team.kafkaTopics.pageInfo.totalCount}>
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
				{#each $KafkaTopics.data.team.kafkaTopics.edges as { node: instance } (instance.id)}
					<ListItem
						interactive
						href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
							.name}/kafka/{instance.name}"
					>
						<div class="name-group">
							<KafkaIcon style="font-size: 1.25rem; flex-shrink: 0" />
							<span class="item-name">{instance.name}</span>
							<Tag size="xsmall" variant={envTagVariant(instance.teamEnvironment.environment.name)}
								>{instance.teamEnvironment.environment.name}</Tag
							>
						</div>
					</ListItem>
				{:else}
					<ListItem>
						<p>
							No Kafka topics found. Kafka topics are categories where messages are published and
							consumed, acting as distributed logs for event streaming.
							<ExternalLink href={docURL('/persistence/kafka')}
								>Learn more about Kafka and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/each}
			</List>
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
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					environments={$KafkaTopics.data?.team.kafkaTopics.facets?.environments ?? []}
					labels={$KafkaTopics.data?.team.kafkaTopics.facets?.labels ?? []}
					{selectedEnvironments}
					{selectedLabels}
					onSort={(field) => setSort(field as KafkaTopicOrderFieldOptions)}
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

	<style>
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
