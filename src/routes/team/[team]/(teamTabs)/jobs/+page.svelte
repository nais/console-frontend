<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Status from '$lib/Status.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Jobs } = data);
	$: team = $Jobs.data?.team;
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
		<Table size="small">
			<Thead>
				<Th style="width: 2rem;"></Th>
				<Th>Name</Th>
				<Th>Env</Th>
				<Th>Deployed</Th>
			</Thead>
			<Tbody>
				{#if team !== undefined}
					{#if team.id === PendingValue}
						<Tr>
							{#each new Array(team.naisjobs.edges.length).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						</Tr>
					{:else}
						{#each team.naisjobs.edges as edge}
							<Tr>
								<Td>
									<div class="status">
										<a
											href="/team/{teamName}/{edge.node.env.name}/job/{edge.node.name}/status"
											data-sveltekit-preload-data="off"
										>
											<Status size="1.5rem" state={edge.node.jobState.state} />
										</a>
									</div>
								</Td>
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

<style>
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
</style>
