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
	import InstanceStatus from '../../[env]/app/[app]/InstanceStatus.svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Workloads } = data);
	$: team = $Workloads.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Workloads.variables));
</script>

{#if $Workloads.errors}
	<Alert variant="error">
		{#each $Workloads.errors as error}
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
					<Th sortable={true} sortKey="STATUS" style="width: 2rem"></Th>
					<Th sortable={true} sortKey="NAME">Name</Th>
					<Th sortable={true} sortKey="ENV">Env</Th>
					<Th>Instances</Th>
					<Th sortable={true} sortKey="DEPLOYED">Deployed</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							<Tr>
								{#each new Array(team.apps.nodes.length).fill('text') as variant}
									<Td><Skeleton {variant} /></Td>
								{/each}
							</Tr>
						{:else}
							{#each team.apps.nodes as node}
								<Tr>
									<Td>
										<div class="status">
											<a
												href="/team/{teamName}/{node.env.name}/app/{node.name}/status"
												data-sveltekit-preload-data="off"
											>
												<Status size="1.5rem" state={node.appState.state} />
											</a>
										</div>
									</Td>
									<Td>
										<a href="/team/{teamName}/{node.env.name}/app/{node.name}">{node.name}</a>
									</Td>
									<Td>{node.env.name}</Td>

									<Td>
										<InstanceStatus app={node} />
									</Td>
									<Td>
										{#if node.deployInfo.timestamp}
											<Time time={node.deployInfo.timestamp} distance={true} />
										{/if}
									</Td>
								</Tr>
							{:else}
								<Tr>
									<Td colspan={999}>No apps found</Td>
								</Tr>
							{/each}
						{/if}
					{/if}
				</Tbody>
			</Table>
			<Pagination
				pageInfo={team?.apps.pageInfo}
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
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
