<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ KafkaTopic } = data);
	$: topic = $KafkaTopic.data?.team.kafkaTopic;
</script>

{#if $KafkaTopic.errors}
	{#each $KafkaTopic.errors as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else}
	<Card columns={12}>
		<h3>Topic ACLs</h3>
		<Table size="small">
			<Thead>
				<Th>Team</Th>
				<Th>Consumer</Th>
				<Th>Access</Th>
			</Thead>
			<Tbody>
				{#if topic}
					{#each topic.acl as ac}
						<Tr>
							{#if ac.access === PendingValue}
								<Td><Skeleton variant="text" /></Td>
								<Td><Skeleton variant="text" /></Td>
								<Td><Skeleton variant="text" /></Td>
							{:else}
								<Td>
									<a href="/team/{ac.team}">{ac.team}</a>
								</Td>
								<Td>
									<a href="/team/{ac.team}/{String(topic.env.name)}/app/{ac.application}"
										>{ac.application}</a
									>
								</Td>
								<Td>{ac.access}</Td>
							{/if}
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No Kafka topics found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
	</Card>
{/if}
