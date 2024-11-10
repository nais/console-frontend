<script lang="ts">
	import { page } from '$app/stores';
	import { OpenSearchOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	import { euroValueFormatter } from '$lib/utils/formatters';
	import { resourceLink } from '$lib/utils/links';
	import { changeParams } from '$lib/utils/searchparams';
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
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ OpenSearch } = data);

	$: tableSort = {
		orderBy: $OpenSearch.variables?.orderBy?.field,
		direction: $OpenSearch.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = OpenSearchOrderField[key as keyof typeof OpenSearchOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || OpenSearchOrderField.NAME
		});
	};

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $OpenSearch.errors}
	{#each distinctErrors($OpenSearch.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{/if}
{#if $OpenSearch.data}
	{@const team = $OpenSearch.data.team}
	{@const os = team.openSearchInstances}
	<div class="summary-grid">
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total OpenSearch cost for team for the last 30 days.</HelpText>
					</h4>
					<p class="metric">
						{euroValueFormatter(team.cost.daily.sum)}
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
				orderBy: tableSort.orderBy || OpenSearchOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={OpenSearchOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={OpenSearchOrderField.ENVIRONMENT}>Env</Th>
				<Th>Owner</Th>
			</Thead>
			<Tbody>
				{#each os.edges as edge}
					<Tr>
						<!-- TODO: show warning if no workload uses this instance -->
						<Td>
							<Link
								href={resourceLink(
									edge.node.environment.name,
									teamName,
									'opensearch',
									edge.node.name
								)}>{edge.node.name}</Link
							>
						</Td>
						<Td>
							{edge.node.environment.name}
						</Td>
						<Td>
							{#if edge.node.workload}
								<WorkloadLink workload={edge.node.workload} />
							{:else}
								<em title="The OpenSearch instance is owned by the team">Team</em>
							{/if}
						</Td>
					</Tr>
				{:else}
					<Tr>
						<Td colspan={999}>No OpenSearch' found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if os.pageInfo.hasPreviousPage || os.pageInfo.hasNextPage}
			<div class="pagination">
				<span>
					{#if os.pageInfo.pageStart !== os.pageInfo.pageEnd}
						{os.pageInfo.pageStart} - {os.pageInfo.pageEnd}
					{:else}
						{os.pageInfo.pageStart}
					{/if}

					of {os.pageInfo.totalCount}
				</span>

				<span style="padding-left: 1rem;">
					<Button
						size="small"
						variant="secondary"
						disabled={!os.pageInfo.hasPreviousPage}
						on:click={async () => {
							return await OpenSearch.loadPreviousPage();
						}}><ChevronLeftIcon /></Button
					>
					<Button
						size="small"
						variant="secondary"
						disabled={!os.pageInfo.hasNextPage}
						on:click={async () => {
							return await OpenSearch.loadNextPage();
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
