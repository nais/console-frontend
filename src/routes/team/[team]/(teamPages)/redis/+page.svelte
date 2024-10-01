<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	import { goto } from '$app/navigation';
	import { RedisInstanceOrderField } from '$houdini';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import {
		Alert,
		Button,
		HelpText,
		Link,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Redis } = data);
	$: team = $Redis.data?.team;

	$: tableSort = {
		orderBy: $Redis.variables?.orderBy?.field,
		direction: $Redis.variables?.orderBy?.direction
	};

	const changeParams = (params: Record<string, string>) => {
		const query = new URLSearchParams(get(page).url.searchParams);
		for (const [key, value] of Object.entries(params)) {
			query.set(key, value);
		}
		goto(`?${query.toString()}`);
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = RedisInstanceOrderField[key as keyof typeof RedisInstanceOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || 'NAME'
		});
	};

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
						<!--€{Math.round(team.redisInstances.cost)}-->
						TODO: not implemented in backend
					</p>
				</div>
			</div>
		</Card>
	</div>
	<Card columns={12}>
		<Table
			size="small"
			zebraStripes
			sort={{
				orderBy: tableSort.orderBy || 'NAME',
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey="NAME">Name</Th>
				<Th sortable={true} sortKey="ENVIRONMENT">Env</Th>
				<Th>Owner</Th>
			</Thead>
			<Tbody>
				{#each team.redisInstances.edges as edge}
					<Tr>
						<!-- TODO: show warning if no workload uses this instance -->
						<Td>
							<Link href="/team/{teamName}/{edge.node.environment.name}/redis/{edge.node.name}">
								{edge.node.name}
							</Link>
						</Td>
						<Td>
							{edge.node.environment.name}
						</Td>
						<Td>
							{#if edge.node.workload}
								<WorkloadLink
									workload={edge.node.workload}
									team={teamName}
									env={edge.node.environment.name}
								/>
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
			</Tbody>
		</Table>
		{#if $Redis.data?.team.redisInstances.pageInfo.hasPreviousPage || $Redis.data?.team.redisInstances.pageInfo.hasNextPage}
			<div class="pagination">
				<span>
					{#if $Redis.data.team.redisInstances.pageInfo.pageStart !== $Redis.data.team.redisInstances.pageInfo.pageEnd}
						{$Redis.data.team.redisInstances.pageInfo.pageStart} - {$Redis.data.team.redisInstances
							.pageInfo.pageEnd}
					{:else}
						{$Redis.data.team.redisInstances.pageInfo.pageStart}
					{/if}

					of {$Redis.data.team.redisInstances.pageInfo.totalCount}
				</span>

				<span style="padding-left: 1rem;">
					<Button
						size="small"
						variant="secondary"
						disabled={!$Redis.data.team.redisInstances.pageInfo.hasPreviousPage}
						on:click={async () => {
							return await Redis.loadPreviousPage();
						}}><ChevronLeftIcon /></Button
					>
					<Button
						size="small"
						variant="secondary"
						disabled={!$Redis.data.team.redisInstances.pageInfo.hasNextPage}
						on:click={async () => {
							return await Redis.loadNextPage();
						}}
					>
						<ChevronRightIcon /></Button
					>
				</span>
			</div>
		{/if}
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

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
