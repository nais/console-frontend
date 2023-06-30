<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);
	$: team = $Jobs.data?.team;
	/*$: team?.jobs.edges.sort((a) => {
		return a.node.instances.map((i) => i.status).every((status) => status === 'Running') ? 1 : -1;
	});*/
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
		<Table>
			<Thead>
				<Th>Job</Th>
				<Th>Env</Th>
				<Th>Deployed</Th>
			</Thead>
			<Tbody>
				{#if team !== undefined}
					{#if team.id === PendingValue}
						<Tr>
							{#each team.naisjobs.edges as _}
								<Td><Loading /></Td>
							{/each}
						</Tr>
					{:else}
						{#each team.naisjobs.edges as edge}
							<Tr>
								<Td>
									<a href="/team/{teamName}/{edge.node.env.name}/job/{edge.node.name}"
										>{edge.node.name}</a
									>
								</Td>
								<Td>{edge.node.env.name}</Td>
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
				/>
			{/if}
		{/if}
	</Card>
{/if}
