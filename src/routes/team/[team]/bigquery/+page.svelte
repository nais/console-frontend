<script lang="ts">
	import { BigQueryDatasetOrderField, OrderDirection } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import PersistenceCost from '$lib/components/persistence/PersistenceCost.svelte';
	import PersistenceLink from '$lib/components/persistence/PersistenceLink.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { BigQuery } = $derived(data);

	let cost = $derived(() => {
		const costData = $BigQuery.data?.team.cost;
		const teamSlug = $BigQuery.data?.team.slug;

		if (!costData || !teamSlug) return null;

		return {
			costData,
			teamSlug,
			pageName: 'BigQuery'
		};
	});
</script>

<GraphErrors errors={$BigQuery.errors} />

{#if $BigQuery.data}
	{#if $BigQuery.data.team.bigQueryDatasets.pageInfo.totalCount}
		<div class="content-wrapper">
			<div>
				<BodyLong spacing>
					BigQuery datasets store structured data optimized for analytical workloads.
					<ExternalLink href={docURL('/persistence/bigquery')}
						>Learn more about BigQuery datasets and how to get started.</ExternalLink
					>
				</BodyLong>

				<List title="{$BigQuery.data.team.bigQueryDatasets.pageInfo.totalCount} entries">
					{#snippet menu()}
						<OrderByMenu
							orderField={BigQueryDatasetOrderField}
							defaultOrderField={BigQueryDatasetOrderField.NAME}
							defaultOrderDirection={OrderDirection.DESC}
						/>
					{/snippet}
					{#each $BigQuery.data.team.bigQueryDatasets.nodes as instance (instance.id)}
						<ListItem>
							<div>
								<PersistenceLink {instance} />
								<Tag size="small" variant={envTagVariant(instance.teamEnvironment.environment.name)}
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
			<div class="right-column">
				{#if cost()}
					{@const costData = cost()!}
					<div>
						<PersistenceCost
							pageName={costData.pageName}
							costData={costData.costData}
							teamSlug={costData.teamSlug}
							from={startOfMonth(subMonths(new Date(), 1))}
							to={endOfYesterday()}
							service="BigQuery"
						/>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="content-wrapper">
			<BodyLong>
				<strong>No BigQuery datasets found.</strong> BigQuery datasets store structured data
				optimized for analytical workloads.
				<ExternalLink href={docURL('/persistence/bigquery')}
					>Learn more about BigQuery datasets and how to get started.</ExternalLink
				>
			</BodyLong>
		</div>
	{/if}

	<style>
		.content-wrapper {
			display: grid;
			gap: var(--ax-space-24);
			grid-template-columns: 1fr 300px;
		}
		.right {
			display: flex;
			gap: var(--ax-space-6);
			align-items: center;
		}

		.right-column {
			display: grid;
			gap: var(--ax-space-24);
		}
	</style>
{/if}
