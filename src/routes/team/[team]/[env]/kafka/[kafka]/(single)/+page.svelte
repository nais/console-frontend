<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';

	import { KafkaTopicAclOrderField } from '$houdini';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
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
		<div class="content">
			{#if topic.configuration}
				<Heading as="h2" spacing>Topic Configuration</Heading>

				<dl class="status">
					{#if topic.configuration}
						{#each Object.entries(topic.configuration) as [key, value] (key)}
							<dt>{key}</dt>
							<dd>{value}</dd>
						{/each}
					{/if}
				</dl>
			{/if}
			<Heading as="h2" spacing>Topic Access Control List</Heading>
			<div class="table-container">
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
							<Th class="team-column" sortable={true} sortKey={KafkaTopicAclOrderField.TEAM_SLUG}
								>Team</Th
							>
							<Th class="workload-column" sortable={true} sortKey={KafkaTopicAclOrderField.CONSUMER}
								>Workload</Th
							>
							<Th class="access-column" sortable={true} sortKey={KafkaTopicAclOrderField.ACCESS}
								>Access</Th
							>
						</Tr>
					</Thead>
					<Tbody>
						{#each topic.acl.nodes as a (a)}
							<Tr>
								<Td class="team-cell">
									{#if a.teamName === '*'}
										All teams
									{:else}
										<a href="/team/{a.teamName}">{a.teamName}</a>
									{/if}
								</Td>
								<Td class="workload-cell">
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
								<Td class="access-cell">{a.access}</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={999}><em>No ACLs found for the topic</em></Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</div>
			<div class="table-pagination">
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
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: var(--spacing-layout);
		align-items: start;
		min-width: 0;
	}

	.content {
		min-width: 0;
	}

	.table-container {
		max-width: 100%;
		min-width: 0;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		-webkit-overflow-scrolling: touch;
		padding-bottom: var(--ax-space-4);
	}

	.table-container :global(table) {
		width: 100%;
	}

	.table-container :global(th),
	.table-container :global(td) {
		vertical-align: top;
	}

	.table-container :global(.team-column),
	.table-container :global(.team-cell),
	.table-container :global(.access-column),
	.table-container :global(.access-cell) {
		white-space: nowrap;
	}

	.table-container :global(.workload-cell) {
		min-width: 0;
	}

	.table-container :global(.workload-cell .icon-label) {
		align-items: flex-start;
		min-width: 0;
	}

	.table-container :global(.workload-cell .icon-label--small) {
		gap: var(--ax-space-2);
	}

	.table-container :global(.workload-cell .content) {
		min-width: 0;
	}

	.table-container :global(.workload-cell a) {
		overflow-wrap: anywhere;
	}

	.table-container :global(.workload-cell .desc) {
		flex-wrap: wrap;
	}

	.table-pagination {
		margin-top: var(--ax-space-4);
	}

	dl {
		display: grid;
		grid-template-columns: 35% minmax(0, 1fr);
		gap: var(--ax-space-4) var(--ax-space-8);
		min-width: 0;
	}

	dt {
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	dd {
		margin-inline-start: 0;
		min-width: 0;
	}

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
		}

		.table-container :global(table) {
			width: max-content;
			min-width: 100%;
		}

		.table-container :global(th:not(.workload-column)),
		.table-container :global(td:not(.workload-cell)) {
			white-space: nowrap;
		}

		dl {
			grid-template-columns: 1fr;
		}

		dd {
			margin-bottom: var(--ax-space-4);
		}

		dd:last-child {
			margin-bottom: 0;
		}
	}
</style>
