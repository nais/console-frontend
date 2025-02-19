<script lang="ts">
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';

	import { KafkaTopicAclOrderField } from '$houdini';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { KafkaTopic } = $derived(data);

	let tableSort = $derived({
		orderBy: $KafkaTopic.variables?.orderBy?.field,
		direction: $KafkaTopic.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = KafkaTopicAclOrderField[key as keyof typeof KafkaTopicAclOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || KafkaTopicAclOrderField.TEAM_SLUG
		});
	};
</script>

{#if $KafkaTopic.errors}
	<GraphErrors errors={$KafkaTopic.errors} />
{:else if $KafkaTopic.data}
	{@const topic = $KafkaTopic.data.team.environment.kafkaTopic}

	<div class="grid">
		<Card columns={12}>
			<h3>Topic access control list</h3>
			<Table
				size="small"
				zebraStripes
				sort={{
					orderBy: tableSort.orderBy || KafkaTopicAclOrderField.TEAM_SLUG,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				onsortchange={tableSortChange}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={KafkaTopicAclOrderField.TEAM_SLUG}>Team</Th>
						<Th sortable={true} sortKey={KafkaTopicAclOrderField.CONSUMER}>Workload</Th>
						<Th sortable={true} sortKey={KafkaTopicAclOrderField.ACCESS}>Access</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each topic.acl.nodes as a (a)}
						<Tr>
							<Td>
								{#if a.teamName === '*'}
									All teams
								{:else}
									<a href="/team/{a.teamName}">{a.teamName}</a>
								{/if}
							</Td>
							<Td>
								{#if a.workloadName === '*'}
									All workloads
								{:else if a.workload}
									<WorkloadLink workload={a.workload} />
								{:else}
									<div class="workloadNotFound">
										<ExclamationmarkTriangleFillIcon
											style="color: var(--a-icon-warning)"
											title="Workload not found"
										/>{a.workloadName}
									</div>
								{/if}
							</Td>
							<Td>{a.access}</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}><em>No ACLs found for the topic</em></Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			<Pagination
				page={topic.acl.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						KafkaTopic.loadPreviousPage();
					},
					loadNextPage: () => {
						KafkaTopic.loadNextPage();
					}
				}}
			/>
		</Card>
		{#if topic.configuration}
			<Card columns={12}>
				<h3>Topic configuration</h3>
				<dl class="status">
					{#if topic.configuration}
						{#each Object.entries(topic.configuration) as [key, value] (key)}
							<dt>{key}</dt>
							<dd>{value}</dd>
						{/each}
					{/if}
				</dl>
			</Card>
		{/if}
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	dt {
		font-weight: bold;
	}

	dl.status {
		display: grid;
		grid-template-columns: 28% 72%;
		row-gap: 0.5em;
	}

	.workloadNotFound {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
