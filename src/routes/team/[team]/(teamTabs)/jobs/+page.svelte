<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Status from '$lib/Status.svelte';
	import Time from '$lib/Time.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);
	$: team = $Jobs.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Jobs.variables));
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
				const ss = sortTable(key, sortState);
				changeParams({ col: ss.orderBy, dir: tableGraphDirection[ss.direction] });
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

		<Pagination
			pageInfo={team?.naisjobs.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
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
