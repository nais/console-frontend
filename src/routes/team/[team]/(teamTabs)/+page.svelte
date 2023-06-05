<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	import Status from '../[env]/[app]/Status.svelte';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);
	$: $Workloads.data?.team.apps.edges.sort((a) => {
		return a.node.instances.every((instance) => instance.status === 'Running') ? 1 : -1;
	});
</script>

<Card>
	<h4>Applications</h4>
	{#if $Workloads.data}
		<Table>
			<Thead>
				<Th>Workload</Th>
				<Th>Env</Th>
				<Th>Instances</Th>
				<Th>Deployed</Th>
			</Thead>
			<Tbody>
				{#each $Workloads.data.team.apps.edges as edge}
					<Tr>
						<Td>
							<a href="/team/{teamName}/{edge.node.env.name}/{edge.node.name}">{edge.node.name}</a>
						</Td>
						<Td>{edge.node.env.name}</Td>
						<Td>
							<Status app={edge.node} />
						</Td>
						<Td>
							{#if edge.node.deployed}
								<Time time={edge.node.deployed} distance={true} />
							{/if}
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={$Workloads.data.team.apps.pageInfo}
			totalCount={$Workloads.data.team.apps.totalCount}
			on:nextPage={() => {
				if (!$Workloads.pageInfo.hasNextPage) return;
				Workloads.loadNextPage();
			}}
			on:previousPage={() => {
				if (!$Workloads.pageInfo.hasPreviousPage) return;
				Workloads.loadPreviousPage();
			}}
		/>
	{:else}
		<p>loading...</p>
	{/if}
</Card>
