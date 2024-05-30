<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ KafkaTopics } = data);
	$: team = $KafkaTopics.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($KafkaTopics.variables));
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $KafkaTopics.errors}
	{#each distinctErrors($KafkaTopics.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{:else if team}
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
				<Th sortable={true} sortKey="ENV">Env</Th>
				<Th>Owner</Th>
			</Thead>
			<Tbody>
				{#if team.id === PendingValue}
					<Tr>
						{#each new Array(4).fill('text') as variant}
							<Td><Skeleton {variant} /></Td>
						{/each}
					</Tr>
				{:else}
					{#each team.kafkaTopics.nodes as node}
						<Tr>
							<Td>
								<a href="/team/{teamName}/{node.env.name}/kafka/{node.name}">{node.name}</a>
							</Td>
							<Td>
								{node.env.name}
							</Td>
							<Td>
								{#if node.workload}
									<WorkloadLink workload={node.workload} env={node.env.name} team={teamName} />
								{:else}
									<em>No owner</em>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No Kafka topics found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.kafkaTopics.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</Card>
{/if}
