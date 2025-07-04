<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';

	import { KafkaTopicAclOrderField } from '$houdini';
	import Pagination from '$lib/Pagination.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
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

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || KafkaTopicAclOrderField.TEAM_SLUG
			},
			{
				noScroll: true
			}
		);
	};
</script>

<GraphErrors errors={$KafkaTopic.errors} />
{#if $KafkaTopic.data}
	{@const topic = $KafkaTopic.data.team.environment.kafkaTopic}

	<div class="wrapper">
		<div>
			{#if topic.configuration}
				<Heading level="2" spacing>Topic Configuration</Heading>

				<dl class="status">
					{#if topic.configuration}
						{#each Object.entries(topic.configuration) as [key, value] (key)}
							<dt>{key}</dt>
							<dd>{value}</dd>
						{/each}
					{/if}
				</dl>
			{/if}
			<Heading level="2" spacing>Topic Access Control List</Heading>
			<div class="table">
				<Table
					size="small"
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
										<IconLabel label={a.workloadName} description={a.teamName}>
											{#snippet icon()}
												<TooltipAlignHack content="Invalid workload reference">
													<WarningIcon />
												</TooltipAlignHack>
											{/snippet}
										</IconLabel>
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
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.table {
		padding-bottom: var(--spacing-layout);
	}
	dl {
		display: grid;
		grid-template-columns: 35% 65%;
	}

	dt {
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	dd {
		margin-inline-start: 0;
	}
</style>
