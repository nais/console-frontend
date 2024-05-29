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
	import { InformationSquareFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import { resourceLink } from '$lib/utils/links';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ BigQuery } = data);
	$: team = $BigQuery.data?.team;
	$: env = $page.params.env;

	$: ({ sortState, limit, offset } = tableStateFromVariables($BigQuery.variables));
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $BigQuery.errors}
	{#each distinctErrors($BigQuery.errors) as error}
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
							<Td>
								<Skeleton {variant} />
							</Td>
						{/each}
					</Tr>
				{:else}
					{#each team.bigQuery.nodes as node}
						<Tr>
							<Td>
								<Link href={resourceLink(node.env.name, teamName, 'bigquerydataset', node.name)}
									>{node.name}</Link
								>
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
								{/if}
								{#if !node.workload?.name}
									<Tooltip content="The BigQuery  does not belong to any workload">
										<InformationSquareFillIcon
											style="color: var(--a-icon-info)"
											title="The BigQuery  does not belong to any workload"
										/>
									</Tooltip>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No BigQuery s found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.bigQuery.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</Card>
{/if}
