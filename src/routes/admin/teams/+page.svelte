<script lang="ts">
	import { TeamOrderField } from '$houdini';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Heading,
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

	let { Teams, tenantName, filter } = $derived(data);

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

<Heading level="2" size="large" spacing>Teams in {tenantName}</Heading>

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
							t.node.inventoryCounts.jobs.total > 0 && `${t.node.inventoryCounts.jobs.total} jobs`,
							t.node.inventoryCounts.bigQueryDatasets.total > 0 &&
								`${t.node.inventoryCounts.bigQueryDatasets.total} BigQuery datasets`,
							t.node.inventoryCounts.buckets.total > 0 &&
								`${t.node.inventoryCounts.buckets.total} buckets`,
							t.node.inventoryCounts.kafkaTopics.total > 0 &&
								`${t.node.inventoryCounts.kafkaTopics.total} Kafka topics`,
							t.node.inventoryCounts.openSearches.total > 0 &&
								`${t.node.inventoryCounts.openSearches.total} OpenSearch instances`,
							t.node.inventoryCounts.sqlInstances.total > 0 &&
								`${t.node.inventoryCounts.sqlInstances.total} SQL instances`,
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
</style>
