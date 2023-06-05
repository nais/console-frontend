<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	import Status from '../[env]/[app]/Status.svelte';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ Workloads } = data);
	$: team = $Workloads.data.team;
	$: team.apps.edges.sort((a) => {
		return a.node.instances.map((i) => i.status).every((status) => status === 'Running') ? 1 : -1;
	});
</script>

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
			{#each team.apps.edges as edge}
				<Tr>
					{#if edge.node.name === PendingValue}
						{#each new Array(4) as _}
							<Td><Loading /></Td>
						{/each}
					{:else}
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
					{/if}
				</Tr>
			{/each}
		</Tbody>
	</Table>
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
</Card>
