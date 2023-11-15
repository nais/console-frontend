<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Status from '$lib/Status.svelte';
	import Time from '$lib/Time.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import InstanceStatus from '../[env]/app/[app]/InstanceStatus.svelte';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);
	$: team = $Workloads.data?.team;
</script>

{#if $Workloads.errors}
	<Alert variant="error">
		{#each $Workloads.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
		<Card columns={3}>
			<Cost app="" env="" team={teamName} cpuUtilization={-1} memoryUtilization={-1} />
		</Card>
		<Card columns={12}>
			<Table size="small">
				<Thead>
					<Th style="width: 2rem"></Th>
					<Th>Name</Th>
					<Th>Env</Th>
					<Th>Instances</Th>
					<Th>Deployed</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							<Tr>
								{#each new Array(team.apps.edges.length).fill('medium') as size}
									<Td><Loading {size} /></Td>
								{/each}
							</Tr>
						{:else}
							{#each team.apps.edges as edge}
								<Tr>
									<Td>
										<div class="status">
											<a
												href="/team/{teamName}/{edge.node.env.name}/app/{edge.node.name}/status"
												data-sveltekit-preload-data="off"
											>
												<Status size="1.5rem" state={edge.node.appState.state} />
											</a>
										</div>
									</Td>
									<Td>
										<a href="/team/{teamName}/{edge.node.env.name}/app/{edge.node.name}"
											>{edge.node.name}</a
										>
									</Td>
									<Td>{edge.node.env.name}</Td>

									<Td>
										<InstanceStatus app={edge.node} />
									</Td>
									<Td>
										{#if edge.node.deployInfo.timestamp}
											<Time time={edge.node.deployInfo.timestamp} distance={true} />
										{/if}
									</Td>
								</Tr>
							{:else}
								<Tr>
									<Td colspan={4}>No apps found</Td>
								</Tr>
							{/each}
						{/if}
					{/if}
				</Tbody>
			</Table>
			{#if team !== undefined}
				{#if team.id !== PendingValue}
					<Pagination
						totalCount={team.apps.totalCount}
						pageInfo={team.apps.pageInfo}
						on:nextPage={() => {
							if (!$Workloads.pageInfo.hasNextPage) return;
							Workloads.loadNextPage();
						}}
						on:previousPage={() => {
							if (!$Workloads.pageInfo.hasPreviousPage) return;
							Workloads.loadPreviousPage();
						}}
					/>
				{/if}
			{/if}
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
