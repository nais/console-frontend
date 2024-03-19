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
	import {
		Alert,
		CopyButton,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		HelpText
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
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
					<Th sortable={true} sortKey="VERSION">Version</Th>
					<Th>App</Th>
					<Th sortable={true} sortKey="ENV">Env</Th>
					<Th>Connection Name</Th>
					<Th>
						<div class="tableHeader">
							Cost<HelpText title="Cost per SQL Instance">The cost of the SQL instance over the last 30 days</HelpText>
						</div>
					</Th>
					<Th sortable={true} sortKey="STATUS">Status</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							<Tr>
								{#each new Array(6).fill('text') as variant}
									<Td><Skeleton {variant} /></Td>
								{/each}
							</Tr>
						{:else}
							{#each team.sqlInstances.nodes as node}
								<Tr>
									<Td>
										<a href="/team/{teamName}/{node.env.name}/postgres/{node.name}">{node.name}</a>
									</Td>
									<Td>
										{node.type}
									</Td>
									<Td>
										{#if node.app?.name}
											<a href="/team/{teamName}/{node.env.name}/app/{node.app.name}"
												>{node.app.name}</a
											>
										{:else}
											No application
										{/if}
									</Td>
									<Td>
										{node.env.name}
									</Td>
									<Td style="display: flex; align-items: center;">
										{#if node.connectionName}
											{node.connectionName}
											<CopyButton variant="action" copyText={node.connectionName} />
										{/if}
									</Td>
									<Td>
										{#if node.cost >= 0}
											€{node.cost}
										{:else}
											-
										{/if}
									</Td>
									<Td>
										{#if node.isHealthy}
											<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
										{:else}
											<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
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

	.tableHeader {
		display: flex;
		gap: 0.5rem;
	}
</style>
