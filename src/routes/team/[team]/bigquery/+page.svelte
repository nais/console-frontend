<script lang="ts">
	import { page } from '$app/state';
	import { BigQueryDatasetOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Tag } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	type BigQueryOrderFieldOptions =
		(typeof BigQueryDatasetOrderField)[keyof typeof BigQueryDatasetOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let { BigQuery } = $derived(data);

	const sortFields: { value: BigQueryOrderFieldOptions; label: string }[] = [
		{ value: BigQueryDatasetOrderField.NAME, label: 'Name' },
		{ value: BigQueryDatasetOrderField.ENVIRONMENT, label: 'Environment' }
	];

	const currentSortField: BigQueryOrderFieldOptions = $derived(
		(Object.values(BigQueryDatasetOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as BigQueryOrderFieldOptions | undefined) ?? BigQueryDatasetOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: BigQueryOrderFieldOptions) {
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

	function handleEnvironmentsChange(selected: string[]) {
		changeParams({ environments: selected.join(','), after: '', before: '' }, { noScroll: true });
	}
</script>

<GraphErrors errors={$BigQuery.errors} />

{#if $BigQuery.data}
	<div class="layout-two-column">
		<div>
			<List title="BigQuery" count={$BigQuery.data.team.bigQueryDatasets.pageInfo.totalCount}>
				{#if $BigQuery.data.team.bigQueryDatasets.nodes.length > 0}
					{#each $BigQuery.data.team.bigQueryDatasets.nodes as instance (instance.id)}
						<ListItem interactive>
							<div class="name-group">
								<BigQueryIcon style="font-size: 1.25rem; flex-shrink: 0" />
								<a
									href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
										.name}/bigquery/{instance.name}"
									class="item-name">{instance.name}</a
								>
								<Tag
									size="xsmall"
									variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>
							{#if instance.workload}
								<div class="right">
									Owner: <WorkloadLink workload={instance.workload} hideTeam hideEnv />
								</div>
							{/if}
						</ListItem>
					{/each}
				{:else}
					<ListItem>
						<p>
							No BigQuery datasets found. BigQuery datasets store structured data optimized for
							analytical workloads.
							<ExternalLink href={docURL('/persistence/bigquery')}
								>Learn more about BigQuery datasets and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
			</List>
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
		<div class="layout-sidebar">
			<SurfaceCard title="Filters">
				<WorkloadListFilters
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					environments={$BigQuery.data?.team.bigQueryDatasets.facets?.environments ?? []}
					{selectedEnvironments}
					onSort={(field) => setSort(field as BigQueryOrderFieldOptions)}
					onEnvironmentsChange={handleEnvironmentsChange}
				/>
			</SurfaceCard>
		</div>
	</div>

	<style>
		.right {
			display: flex;
			gap: var(--ax-space-6);
			align-items: center;
		}

		@media (max-width: 767px), (max-height: 500px) {
			.right {
				align-self: flex-end;
				justify-content: flex-end;
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
