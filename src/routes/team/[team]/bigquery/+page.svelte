<script lang="ts">
	import { BigQueryDatasetOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import PersistenceLink from '$lib/domain/persistence/PersistenceLink.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Tag } from '@nais/ds-svelte-community';
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
	<div class="content-wrapper">
		<div>
			<List title="BigQuery" count={$BigQuery.data.team.bigQueryDatasets.pageInfo.totalCount}>
				{#snippet menu()}
					<OrderByMenu
						orderField={BigQueryDatasetOrderField}
						defaultOrderField={BigQueryDatasetOrderField.NAME}
						defaultOrderDirection={OrderDirection.DESC}
					/>
				{/snippet}
				{#if $BigQuery.data.team.bigQueryDatasets.nodes.length > 0}
					{#each $BigQuery.data.team.bigQueryDatasets.nodes as instance (instance.id)}
						<ListItem interactive>
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

		/* Mobile responsive layout */
		@media (max-width: 767px), (max-height: 500px) {
			.content-wrapper {
				grid-template-columns: 1fr;
			}

			.right {
				align-self: flex-end;
				justify-content: flex-end;
				margin-top: var(--ax-space-6);
			}
		}
	</style>
{/if}
