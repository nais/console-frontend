<script lang="ts">
	import { KafkaTopicOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';

	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { KafkaTopics, teamSlug } = $derived(data);

	let tableSort = $derived({
		orderBy: $KafkaTopics.variables?.orderBy?.field,
		direction: $KafkaTopics.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
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
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={KafkaTopicOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={KafkaTopicOrderField.ENVIRONMENT}>Environment</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each topics.nodes as t}
					{#if t !== PendingValue}
						<Tr>
							<Td>
								<a href="/team/{teamSlug}/{t.environment.name}/kafka/{t.name}">{t.name}</a>
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
				<Pagination
					page={topics.pageInfo}
					loaders={{
						loadPreviousPage: () => KafkaTopics.loadPreviousPage(),
						loadNextPage: () => KafkaTopics.loadNextPage()
					}}
				/>
			{/if}
		{/if}
	</Card>
{/if}
