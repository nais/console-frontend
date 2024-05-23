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
		Link,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Buckets } = data);
	$: team = $Buckets.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Buckets.variables));
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $Buckets.errors}
	{#each distinctErrors($Buckets.errors) as error}
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
					{#each team.buckets.nodes as node}
						<Tr>
							<Td>
								<Link href="/team/{teamName}/{node.env.name}/bucket/{node.name}">{node.name}</Link>
							</Td>
							<Td>
								{node.env.name}
							</Td>
							<Td>
								{#if node.workload}
									<a
										href="/team/{teamName}/{node.env.name}/{node.workload?.type === 'App'
											? 'app'
											: 'job'}/{node.workload.name}">{node.workload.name}</a
									>
								{:else}
									<div class="inline">
										<i>No owner</i>
										<ExclamationmarkTriangleFillIcon
											style="color: var(--a-icon-warning)"
											title="The bucket does not belong to any workload"
										/> 
									</div>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No buckets found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.buckets.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</Card>
{/if}

<style>
	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
