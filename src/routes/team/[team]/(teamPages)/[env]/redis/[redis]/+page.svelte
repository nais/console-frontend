<script lang="ts">
	import { RedisInstanceAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import PersistenceIcon from '$lib/PersistenceIcon.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import {
		ArrowLeftIcon,
		ChevronLeftIcon,
		ChevronRightIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { RedisInstance } = $derived(data);

	let tableSort = $derived({
		orderBy: $RedisInstance.variables?.orderBy?.field,
		direction: $RedisInstance.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
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
	<div class="resource-header-wrapper">
		<div class="header">
			<span>
				<a href="/team/{$RedisInstance.data?.team.slug}/redis"
					><ArrowLeftIcon /> All Redis instances</a
				>
			</span>
			<div class="icon-and-name-wrapper">
				<div class="icon">
					{#if redisInstance.__typename}
						<PersistenceIcon size={'32px'} type={redisInstance.__typename} />
					{/if}
				</div>
				<div>
					<h3>{redisInstance.name}</h3>
					<span class="environment">
						{redisInstance.environment.name}
					</span>
				</div>
			</div>
		</div>
	</div>
	<div class="grid">
		<Card columns={12}>
			<h3>Redis details</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if redisInstance.workload}
					<WorkloadLink workload={redisInstance.workload} showIcon={true} />
				{:else}
					<div class="inline">
						<i>This Redis instance does not belong to any workload</i>
					</div>
				{/if}
			</div>
			<h4 class="access">Access</h4>
			<Table
				size="small"
				zebraStripes
				sort={{
					orderBy: tableSort.orderBy || RedisInstanceAccessOrderField.WORKLOAD,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				onsortchange={tableSortChange}
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
								<WorkloadLink workload={access.workload} showIcon={true} />
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
							onclick={async () => {
								return await RedisInstance.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!redisInstance.access.pageInfo.hasNextPage}
							onclick={async () => {
								return await RedisInstance.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
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

	.resource-header-wrapper {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-bottom: 1rem;
		.header {
			display: flex;
			flex-direction: column;
			align-items: left;
		}
		.icon-and-name-wrapper {
			display: flex;
			align-items: center;
			gap: 4px;

			.icon {
				display: flex;
				flex-direction: row;
			}
			h3 {
				margin: 0;
			}
			.environment {
				color: var(--a-text-subtle);
				font-size: 1rem;
			}
		}
	}

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
