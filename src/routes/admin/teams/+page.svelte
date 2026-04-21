<script lang="ts">
	import { page } from '$app/state';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { TeamOrderField } from '$lib/urql/gql/graphql';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { changeParams } from '$lib/utils/searchparams';
	import {
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

	let field = $derived(page.url.searchParams.get('field') ?? TeamOrderField.SLUG);
	let direction = $derived(page.url.searchParams.get('direction') ?? 'ASC');

	let tableSort = $derived({
		orderBy: field,
		direction
	});

	const tableSortChange = (key: string) => {
		let newDirection: string;
		let newField: string;
		if (key === tableSort.orderBy) {
			newDirection = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			newField = tableSort.orderBy;
		} else {
			newField = TeamOrderField[key as keyof typeof TeamOrderField];
			newDirection = 'ASC';
		}

		changeParams(
			{
				direction: newDirection,
				field: newField || TeamOrderField.SLUG
			},
			{
				noScroll: true
			}
		);
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
		{#each Teams.data?.teams.edges || [] as t (t.node.slug)}
			<Tr>
				<Td><a href="/team/{t.node.slug}">{t.node.slug}</a></Td>
				<Td>
					<a href="/team/{t.node.slug}/members">{t.node.members.pageInfo.totalCount} members</a></Td
				>
				<Td>
					{[
						t.node.inventoryCounts.applications.total > 0 &&
							`${t.node.inventoryCounts.applications.total} applications`,
						t.node.inventoryCounts.jobs.total > 0 && `${t.node.inventoryCounts.jobs.total} jobs`,
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

<Pagination
	page={Teams.data?.teams.pageInfo}
	loaders={cursorPaginationLoaders(page.url, Teams.data?.teams.pageInfo)}
/>

<style>
	.toggles {
		display: flex;
		gap: var(--spacing-layout);
		flex-direction: row;
		justify-content: flex-end;
		padding-bottom: var(--spacing-layout);
	}
</style>
