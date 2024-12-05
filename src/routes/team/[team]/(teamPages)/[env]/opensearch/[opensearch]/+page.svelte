<script lang="ts">
	import { OpenSearchAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import Opensearch from '$lib/icons/Opensearch.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ OpenSearchInstance } = data);

	$: tableSort = {
		orderBy: $OpenSearchInstance.variables?.orderBy?.field,
		direction: $OpenSearchInstance.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy =
				OpenSearchAccessOrderField[key as keyof typeof OpenSearchAccessOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || OpenSearchAccessOrderField.WORKLOAD
		});
	};
</script>

{#if $OpenSearchInstance.errors}
	<GraphErrors errors={$OpenSearchInstance.errors} />
{:else if $OpenSearchInstance.data}
	{@const os = $OpenSearchInstance.data.team.environment.openSearchInstance}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				<Opensearch />
				{os.name}
			</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if os.workload}
					<WorkloadLink workload={os.workload} />
				{:else}
					<div class="inline">
						<i>This OpenSearch instance does not belong to any workload</i>
					</div>
				{/if}
			</div>
			<h4 class="access">Access</h4>
			{#if os.access.edges.length > 0}
				<Table
					size="small"
					zebraStripes
					sort={{
						orderBy: tableSort.orderBy || OpenSearchAccessOrderField.WORKLOAD,
						direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
					}}
					on:sortChange={tableSortChange}
				>
					<Thead>
						<Tr>
							<Th sortable={true} sortKey={OpenSearchAccessOrderField.WORKLOAD}>Workload</Th>
							<Th sortable={true} sortKey={OpenSearchAccessOrderField.ACCESS}>Access level</Th>
							<Th>Type</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each os.access.edges as edge}
							{@const access = edge.node}
							<Tr>
								<Td>
									<WorkloadLink workload={access.workload} />
								</Td>
								<Td><code>{access.access}</code></Td>
								<Td>{access.workload.__typename}</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
				{#if os.access.pageInfo.hasPreviousPage || os.access.pageInfo.hasNextPage}
					<div class="pagination">
						<span>
							{#if os.access.pageInfo.pageStart !== os.access.pageInfo.pageEnd}
								{os.access.pageInfo.pageStart} - {os.access.pageInfo.pageEnd}
							{:else}
								{os.access.pageInfo.pageStart}
							{/if}
							of {os.access.pageInfo.totalCount}
						</span>

						<span style="padding-left: 1rem;">
							<Button
								size="small"
								variant="secondary"
								disabled={!os.access.pageInfo.hasPreviousPage}
								on:click={async () => {
									return await OpenSearchInstance.loadPreviousPage();
								}}><ChevronLeftIcon /></Button
							>
							<Button
								size="small"
								variant="secondary"
								disabled={!os.access.pageInfo.hasNextPage}
								on:click={async () => {
									return await OpenSearchInstance.loadNextPage();
								}}
							>
								<ChevronRightIcon /></Button
							>
						</span>
					</div>
				{/if}
			{:else}
				<p>No workloads with configured access</p>
			{/if}
		</Card>
		<Card columns={5}>
			<h3>Status</h3>
			<!--div>
				{#if os.status.conditions.length}
					{#each os.status.conditions as cond}
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
	code {
		font-size: 0.8em;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
