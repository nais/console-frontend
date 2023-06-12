<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	import Status from '../[env]/[app]/Status.svelte';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);
	$: team = $Workloads.data?.team;
	$: team?.apps.edges.sort((a) => {
		return a.node.instances.map((i) => i.status).every((status) => status === 'Running') ? 1 : -1;
	});
</script>

{#if $Workloads.errors}
	<Alert variant="error">
		{#each $Workloads.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<Card>
		<h4>Applications</h4>
		<Table>
			<Thead>
				<Th>Workload</Th>
				<Th>Env</Th>
				<Th>Instances</Th>
				<Th>Deployed</Th>
			</Thead>
			<Tbody>
				{#if team !== undefined}
					{#if team.id === PendingValue}
						<Tr>
							{#each team.apps.edges as _}
								<Td><Loading /></Td>
							{/each}
						</Tr>
					{:else}
						{#each team.apps.edges as edge}
							<Tr>
								<Td>
									<a href="/team/{teamName}/{edge.node.env.name}/{edge.node.name}"
										>{edge.node.name}</a
									>
								</Td>
								<Td>{edge.node.env.name}</Td>
								<Td>
									<Status app={edge.node} />
								</Td>
								<Td>
									{#if edge.node.deployInfo.timestamp}
										<Time time={edge.node.deployInfo.timestamp} distance={true} />
									{/if}
								</Td>
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
{/if}
