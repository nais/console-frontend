<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import {
		Alert,
		HelpText,
		Link,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Redis } = data);
	$: team = $Redis.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Redis.variables));
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $Redis.errors}
	{#each distinctErrors($Redis.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{:else if team}
	<div class="summary-grid">
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total Redis cost for team for the last 30 days.</HelpText>
					</h4>
					<p class="metric">
						{#if team.redis.metrics.cost !== PendingValue}
							€{Math.round(team.redis.metrics.cost)}
						{/if}
					</p>
				</div>
			</div>
		</Card>
	</div>
	<Card columns={12}>
		<Table
			size="small"
			sort={sortState}
			zebraStripes
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
						{#each new Array(3).fill('text') as variant}
							<Td><Skeleton {variant} /></Td>
						{/each}
					</Tr>
				{:else}
					{#each team.redis.nodes as node}
						<Tr>
							<!-- TODO: show warning if no workload uses this instance -->
							<Td>
								<Link href="/team/{teamName}/{node.env.name}/redis/{node.name}">
									{node.name}
								</Link>
							</Td>
							<Td>
								{node.env.name}
							</Td>
							<Td>
								{#if node.workload}
									<WorkloadLink workload={node.workload} env={node.env.name} team={teamName} />
								{:else}
									<em title="The Redis instance is owned by the team">Team</em>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No Redis' found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.redis.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</Card>
{/if}

<style>
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}

	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 1px solid var(--bg-color);
		border-radius: 5px;
	}

	.summary {
		width: 100%;
	}
	.summary > h4 {
		display: flex;
		justify-content: space-between;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}

	.metric {
		font-size: 1.5rem;
		margin: 0;
	}

	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
</style>
