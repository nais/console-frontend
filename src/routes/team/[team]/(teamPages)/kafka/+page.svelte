<script lang="ts">
	import { page } from '$app/stores';
	import { KafkaTopicOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';

	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ KafkaTopics } = data);

	$: tableSort = {
		orderBy: $KafkaTopics.variables?.orderBy?.field,
		direction: $KafkaTopics.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = KafkaTopicOrderField[key as keyof typeof KafkaTopicOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || KafkaTopicOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$KafkaTopics.errors} />

{#if $KafkaTopics.data}
	{@const topics = $KafkaTopics.data.team.kafkaTopics}
	<Card columns={12}>
		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || KafkaTopicOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={KafkaTopicOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={KafkaTopicOrderField.ENVIRONMENT}>Environment</Th>
			</Thead>
			<Tbody>
				{#each topics.nodes as t}
					{#if t !== PendingValue}
						<Tr>
							<Td>
								<a href="/team/{teamName}/{t.environment.name}/kafka/{t.name}">{t.name}</a>
							</Td>
							<Td>
								{t.environment.name}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
						</Tr>
					{/if}
				{:else}
					<Tr>
						<Td colspan={999}>No Kafka topics found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if topics.pageInfo !== PendingValue}
			{#if topics.pageInfo.hasPreviousPage || topics.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if topics.pageInfo.pageStart !== topics.pageInfo.pageEnd}
							{topics.pageInfo.pageStart} - {topics.pageInfo.pageEnd}
						{:else}
							{topics.pageInfo.pageStart}
						{/if}

						of {topics.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!topics.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await KafkaTopics.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!topics.pageInfo.hasNextPage}
							on:click={async () => {
								return await KafkaTopics.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		{/if}
	</Card>
{/if}

<style>
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
