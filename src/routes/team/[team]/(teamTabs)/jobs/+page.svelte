<script lang="ts">
	import { page } from '$app/stores';
	import { OrderByField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Status from '$lib/Status.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import { sortTable } from '../../../../../helpers';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);
	$: team = $Jobs.data?.team;

	let sortState: TableSortState = {
		orderBy: 'STATUS',
		direction: 'ascending'
	};

	const refetch = (key: string) => {
		const field = Object.values(OrderByField).find((value) => value === key);
		Jobs.fetch({
			variables: {
				team: teamName,
				orderBy: {
					field: field !== undefined ? field : 'STATUS',
					direction: sortState.direction === 'descending' ? 'DESC' : 'ASC'
				}
			}
		});
	};
</script>

{#if $Jobs.errors}
	<Alert variant="error">
		{#each $Jobs.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<Card>
		<h3>Naisjobs</h3>
		<Table
			size="small"
			sort={sortState}
			on:sortChange={(e) => {
				const { key } = e.detail;
				sortState = sortTable(key, sortState, refetch);
			}}
		>
			<Thead>
				<Th style="width: 2rem;" sortable={true} sortKey="STATUS"></Th>
				<Th sortable={true} sortKey="NAME">Name</Th>
				<Th sortable={true} sortKey="ENV">Env</Th>
				<Th sortable={true} sortKey="DEPLOYED">Deployed</Th>
			</Thead>
			<Tbody>
				{#if team !== undefined}
					{#if team.id === PendingValue}
						<Tr>
							{#each new Array(team.naisjobs.nodes.length).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						</Tr>
					{:else}
						{#each team.naisjobs.nodes as node}
							<Tr>
								<Td>
									<div class="status">
										<a
											href="/team/{teamName}/{node.env.name}/job/{node.name}/status"
											data-sveltekit-preload-data="off"
										>
											<Status size="1.5rem" state={node.jobState.state} />
										</a>
									</div>
								</Td>
								<Td>
									<a href="/team/{teamName}/{node.env.name}/job/{node.name}">{node.name}</a>
								</Td>
								<Td>{node.env.name}</Td>
								<Td>
									{#if node.deployInfo.timestamp}
										<Time time={node.deployInfo.timestamp} distance={true} />
									{/if}
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={4}>No jobs found</Td>
							</Tr>
						{/each}
					{/if}
				{/if}
			</Tbody>
		</Table>
		{#if team !== undefined}
			{#if team.id !== PendingValue}
				<!-- <Pagination
					totalCount={team.naisjobs.totalCount}
					pageInfo={team.naisjobs.pageInfo}
					on:nextPage={() => {
						if (!$Jobs.pageInfo.hasNextPage) return;
						Jobs.loadNextPage();
					}}
					on:previousPage={() => {
						if (!$Jobs.pageInfo.hasPreviousPage) return;
						Jobs.loadPreviousPage();
					}}
				/> -->
			{/if}
		{/if}
	</Card>
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
</style>
