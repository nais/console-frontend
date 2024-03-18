<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { CheckmarkIcon, XMarkIcon } from "@nais/ds-svelte-community/icons";
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ SqlInstances } = data);
	$: team = $SqlInstances.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($SqlInstances.variables));
</script>

{#if $SqlInstances.errors}
	<Alert variant="error">
		{#each $SqlInstances.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
		<Card columns={12}>
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
					<Th sortable={true} sortKey="NAME">Name</Th>
					<Th>Version</Th>
					<Th sortable={true} sortKey="ENV">Env</Th>
					<Th>Connection Name</Th>
					<Th sortable={true} sortKey="STATUS">Status</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							<Tr>
								{#each new Array(5).fill('text') as variant}
									<Td><Skeleton {variant} /></Td>
								{/each}
							</Tr>
						{:else}
							{#each team.sqlInstances.nodes as node}
								<Tr>
									<Td>
										{node.name}
									</Td>
									<Td>
										{node.type}
									</Td>
									<Td>
										{node.env.name}
									</Td>
									<Td>
										{node.connectionName}
									</Td>
									<Td>
										{#if node.isHealthy}
											<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
										{:else}
											<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem"/>
										{/if}
									</Td>
								</Tr>
							{:else}
								<Tr>
									<Td colspan={999}>No SQL instances found</Td>
								</Tr>
							{/each}
						{/if}
					{/if}
				</Tbody>
			</Table>
			<Pagination
				pageInfo={team?.sqlInstances.pageInfo}
				{limit}
				{offset}
				changePage={(e) => {
					changeParams({ page: e.toString() });
				}}
			/>
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
