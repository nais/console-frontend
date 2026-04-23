<script lang="ts">
	import { TeamOrderField } from '$houdini';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { Teams, filter } = $derived(data);

	let tableSort = $derived({
		orderBy: $Teams.variables?.orderBy?.field,
		direction: $Teams.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = TeamOrderField[key as keyof typeof TeamOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || TeamOrderField.SLUG
			},
			{
				noScroll: true
			}
		);
	};

	let after: string = $derived($Teams.variables?.after ?? '');
	let before: string = $derived($Teams.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};

	let workloadsToggle = $derived(filter || 'all');
</script>

<div class="toggles">
	<ToggleGroup
		size="small"
		label="Show Teams"
		value={workloadsToggle}
		onchange={(val) => changeParams({ filter: val, before: '', after: '' })}
	>
		<ToggleGroupItem value="ALL">All</ToggleGroupItem>
		<ToggleGroupItem value="WITHOUT_WORKLOADS">Without Workloads</ToggleGroupItem>
		<ToggleGroupItem value="WITH_WORKLOADS">With Workloads</ToggleGroupItem>
	</ToggleGroup>
</div>

{#if !$Teams.fetching}
	<!-- Desktop Table View -->
	<div class="table-container">
		<Table
			size="small"
			zebraStripes
			sort={{
				orderBy: tableSort.orderBy || TeamOrderField.SLUG,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={TeamOrderField.SLUG} style="width: 32ch;">Team</Th>
					<Th style="width: 16ch;">Members</Th>
					<Th>Inventory</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each $Teams.data?.teams.edges || [] as t (t.node.slug)}
					<Tr>
						<Td><a href="/team/{t.node.slug}">{t.node.slug}</a></Td>
						<Td>
							<a href="/team/{t.node.slug}/members">{t.node.members.pageInfo.totalCount} members</a
							></Td
						>
						<Td>
							{[
								t.node.inventoryCounts.applications.total > 0 &&
									`${t.node.inventoryCounts.applications.total} applications`,
								t.node.inventoryCounts.jobs.total > 0 &&
									`${t.node.inventoryCounts.jobs.total} jobs`,
								t.node.inventoryCounts.bigQueryDatasets.total > 0 &&
									`${t.node.inventoryCounts.bigQueryDatasets.total} BigQuery datasets`,
								t.node.inventoryCounts.buckets.total > 0 &&
									`${t.node.inventoryCounts.buckets.total} buckets`,
								t.node.inventoryCounts.kafkaTopics.total > 0 &&
									`${t.node.inventoryCounts.kafkaTopics.total} Kafka topics`,
								t.node.inventoryCounts.openSearches.total > 0 &&
									`${t.node.inventoryCounts.openSearches.total} OpenSearch instances`,
								t.node.inventoryCounts.postgresInstances.total > 0 &&
									`${t.node.inventoryCounts.postgresInstances.total} Postgres instances`,
								t.node.inventoryCounts.sqlInstances.total > 0 &&
									`${t.node.inventoryCounts.sqlInstances.total} Cloud SQL instances`,
								t.node.inventoryCounts.valkeys.total > 0 &&
									`${t.node.inventoryCounts.valkeys.total} Valkey instances`
							]
								.filter(Boolean)
								.join(', ')}
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</div>

	<!-- Mobile Card View -->
	<div class="card-container">
		{#each $Teams.data?.teams.edges || [] as t (t.node.slug)}
			<div class="team-card">
				<div class="card-header">
					<a href="/team/{t.node.slug}" class="team-name">{t.node.slug}</a>
				</div>
				<div class="card-content">
					<div class="card-row">
						<span class="card-label">Members</span>
						<a href="/team/{t.node.slug}/members" class="card-value">
							{t.node.members.pageInfo.totalCount}
						</a>
					</div>
					<div class="card-row">
						<span class="card-label">Inventory</span>
						<span class="card-value inventory-list">
							{#each [t.node.inventoryCounts.applications.total > 0 && `${t.node.inventoryCounts.applications.total} app${t.node.inventoryCounts.applications.total !== 1 ? 's' : ''}`, t.node.inventoryCounts.jobs.total > 0 && `${t.node.inventoryCounts.jobs.total} job${t.node.inventoryCounts.jobs.total !== 1 ? 's' : ''}`, t.node.inventoryCounts.bigQueryDatasets.total > 0 && `${t.node.inventoryCounts.bigQueryDatasets.total} BigQuery`, t.node.inventoryCounts.buckets.total > 0 && `${t.node.inventoryCounts.buckets.total} bucket${t.node.inventoryCounts.buckets.total !== 1 ? 's' : ''}`, t.node.inventoryCounts.kafkaTopics.total > 0 && `${t.node.inventoryCounts.kafkaTopics.total} Kafka`, t.node.inventoryCounts.openSearches.total > 0 && `${t.node.inventoryCounts.openSearches.total} OpenSearch`, t.node.inventoryCounts.postgresInstances.total > 0 && `${t.node.inventoryCounts.postgresInstances.total} Postgres`, t.node.inventoryCounts.sqlInstances.total > 0 && `${t.node.inventoryCounts.sqlInstances.total} SQL`, t.node.inventoryCounts.valkeys.total > 0 && `${t.node.inventoryCounts.valkeys.total} Valkey`].filter(Boolean) as item, index (index)}
								<div class="inventory-item">{item}</div>
							{/each}
						</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
		<Loader size="3xlarge" />
	</div>
{/if}

<Pagination
	page={$Teams.data?.teams.pageInfo}
	loaders={{
		loadPreviousPage: () => {
			changeQuery({
				after: '',
				before: $Teams.data?.teams.pageInfo.startCursor ?? ''
			});
		},
		loadNextPage: () => {
			changeQuery({
				before: '',
				after: $Teams.data?.teams.pageInfo.endCursor ?? ''
			});
		}
	}}
/>

<style>
	.toggles {
		display: flex;
		gap: var(--spacing-layout);
		flex-direction: row;
		justify-content: flex-end;
		padding-bottom: var(--spacing-layout);
	}

	/* Desktop table view */
	.table-container {
		display: block;
	}

	/* Mobile card view */
	.card-container {
		display: none;
		gap: 1rem;
		flex-direction: column;
	}

	.team-card {
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: 8px;
		padding: 1rem;
		background: var(--ax-bg-raised);
	}

	.card-header {
		margin-bottom: 0.75rem;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		padding-bottom: 0.75rem;
	}

	.team-name {
		font-weight: 600;
		color: var(--ax-text-accent);
		text-decoration: none;
	}

	.team-name:hover {
		text-decoration: underline;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.card-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		font-size: 0.9rem;
	}

	.card-label {
		font-weight: 500;
		color: var(--ax-text-subtle);
		flex-shrink: 0;
		min-width: 80px;
	}

	.card-value {
		color: var(--ax-text-neutral);
		text-align: right;
		flex: 1;
	}

	:global(.card-value a) {
		color: var(--ax-text-accent);
		text-decoration: none;
	}

	:global(.card-value a:hover) {
		text-decoration: underline;
	}

	.inventory-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: flex-end;
	}

	.inventory-item {
		font-size: 0.85rem;
		color: var(--ax-text-subtle);
	}

	/* Mobile breakpoint: show cards, hide table */
	@media (max-width: 767px) {
		.table-container {
			display: none;
		}

		.card-container {
			display: flex;
		}
	}
</style>
