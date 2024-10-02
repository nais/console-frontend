<script lang="ts">
	import { page } from '$app/stores';
	import { KafkaTopicOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';

	import { goto } from '$app/navigation';
	import { Alert, Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ KafkaTopics } = data);

	$: tableSort = {
		orderBy: $KafkaTopics.variables?.orderBy?.field,
		direction: $KafkaTopics.variables?.orderBy?.direction
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
			tableSort.orderBy = KafkaTopicOrderField[key as keyof typeof KafkaTopicOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || 'NAME'
		});
	};

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $KafkaTopics.errors}
	{#each distinctErrors($KafkaTopics.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{/if}
{#if $KafkaTopics.data}
	{@const topics = $KafkaTopics.data.team.kafkaTopics}
	<Card columns={12}>
		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || 'NAME',
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={KafkaTopicOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={KafkaTopicOrderField.ENVIRONMENT}>Env</Th>
			</Thead>
			<Tbody>
				{#each topics.edges as edge}
					<Tr>
						<Td>
							<a href="/team/{teamName}/{edge.node.environment.name}/kafka/{edge.node.name}"
								>{edge.node.name}</a
							>
						</Td>
						<Td>
							{edge.node.environment.name}
						</Td>
					</Tr>
				{:else}
					<Tr>
						<Td colspan={999}>No Kafka topics found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
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
	</Card>
{/if}

<style>
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
