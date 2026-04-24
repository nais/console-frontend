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

	type InventoryCounts = {
		applications: { total: number };
		jobs: { total: number };
		bigQueryDatasets: { total: number };
		buckets: { total: number };
		kafkaTopics: { total: number };
		openSearches: { total: number };
		postgresInstances: { total: number };
		sqlInstances: { total: number };
		valkeys: { total: number };
	};

	const inventoryItemsForTeam = (inventoryCounts: InventoryCounts) =>
		[
			{
				total: inventoryCounts.applications.total,
				label: 'applications'
			},
			{
				total: inventoryCounts.jobs.total,
				label: 'jobs'
			},
			{
				total: inventoryCounts.bigQueryDatasets.total,
				label: 'BigQuery datasets'
			},
			{
				total: inventoryCounts.buckets.total,
				label: 'buckets'
			},
			{
				total: inventoryCounts.kafkaTopics.total,
				label: 'Kafka topics'
			},
			{
				total: inventoryCounts.openSearches.total,
				label: 'OpenSearch instances'
			},
			{
				total: inventoryCounts.postgresInstances.total,
				label: 'Postgres instances'
			},
			{
				total: inventoryCounts.sqlInstances.total,
				label: 'Cloud SQL instances'
			},
			{
				total: inventoryCounts.valkeys.total,
				label: 'Valkey instances'
			}
		].flatMap((item) => (item.total > 0 ? [`${item.total} ${item.label}`] : []));
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
							{inventoryItemsForTeam(t.node.inventoryCounts).join(', ')}
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
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
		max-width: 100%;
		overflow-x: auto;
	}

	.table-container {
		max-width: 100%;
		min-width: 0;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		-webkit-overflow-scrolling: touch;
	}

	.table-container :global(table) {
		width: max-content;
		min-width: 100%;
	}

	@media (max-width: 767px) {
		.toggles {
			justify-content: flex-start;
		}
	}
</style>
