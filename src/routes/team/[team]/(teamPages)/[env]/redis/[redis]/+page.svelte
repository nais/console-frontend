<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { RedisInstanceAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ RedisInstance } = data);

	$: tableSort = {
		orderBy: $RedisInstance.variables?.orderBy?.field,
		direction: $RedisInstance.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy =
				RedisInstanceAccessOrderField[key as keyof typeof RedisInstanceAccessOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || RedisInstanceAccessOrderField.WORKLOAD
		});
	};
</script>

{#if $RedisInstance.errors}
	<GraphErrors errors={$RedisInstance.errors} />
{/if}
{#if $RedisInstance.data}
	{@const redisInstance = $RedisInstance.data.team.environment.redisInstance}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				<Redis />
				{redisInstance.name}
			</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<p style="margin-left: 1em; margin-top: 0;">
				{#if redisInstance.workload}
					<WorkloadLink workload={redisInstance.workload} />
				{:else}
					<div class="inline">
						<i>This Redis instance does not belong to any workload</i>
					</div>
				{/if}
			</p>
			<h4 class="access">Access</h4>
			<Table
				size="small"
				zebraStripes
				sort={{
					orderBy: tableSort.orderBy || RedisInstanceAccessOrderField.WORKLOAD,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				on:sortChange={tableSortChange}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={RedisInstanceAccessOrderField.WORKLOAD}>Workload</Th>
						<Th sortable={true} sortKey={RedisInstanceAccessOrderField.ACCESS}>Access level</Th>
						<Th>Type</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each redisInstance.access.edges as edge}
						{@const access = edge.node}
						<Tr>
							<Td>
								<WorkloadLink workload={access.workload} />
							</Td>
							<Td>{access.access}</Td>

							<Td>{access.workload.__typename}</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={3}>No access</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			{#if redisInstance.access.pageInfo.hasPreviousPage || redisInstance.access.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if redisInstance.access.pageInfo.pageStart !== redisInstance.access.pageInfo.pageEnd}
							{redisInstance.access.pageInfo.pageStart} - {redisInstance.access.pageInfo.pageEnd}
						{:else}
							{redisInstance.access.pageInfo.pageStart}
						{/if}
						of {redisInstance.access.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!redisInstance.access.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await RedisInstance.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!redisInstance.access.pageInfo.hasNextPage}
							on:click={async () => {
								return await RedisInstance.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		</Card>
		<Card columns={5}>
			<h3>Status</h3>
			TODO: Sooo little status
			<!--div>
				{#if redisInstance.status.conditions.length}
					{#each redisInstance.status.conditions as cond}
						<dl class="conditions">
							<dt>Status</dt>
							<dd class="status">
								{#if cond.status === 'True'}
									{cond.type}
									<CheckmarkIcon
										style="color: var(--a-surface-success); font-size: 1.5rem"
										title={cond.type}
									/>
								{:else}
									{cond.type}
									<ExclamationmarkTriangleFillIcon
										style="color: var(--a-icon-info)"
										title={cond.type}
									/>
								{/if}
							</dd>
							<dt>Reason</dt>
							<dd>{cond.reason} (<Time time={cond.lastTransitionTime} />)</dd>
						</dl>
						<details>
							<summary>Status message</summary>
							<p style="max-width: 25em;">{cond.message}</p>
						</details>
					{/each}
				{:else}
					<p>No conditions</p>
				{/if}
			</div-->
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.heading {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	/*dl.conditions {
		display: grid;
		align-items: center;
		grid-template-columns: 20% 80%;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	div dl.conditions:not(:first-child) {
		margin-top: 3em;
	}

	dt {
		font-weight: bold;
		display: flex;
		gap: 1em;
		align-items: center;
	}*/

	h4.access {
		margin-top: 1em;
		margin-bottom: 0;
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
