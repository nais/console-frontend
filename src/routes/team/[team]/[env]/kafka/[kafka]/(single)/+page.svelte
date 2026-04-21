<script lang="ts">
	import { page } from '$app/state';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { KafkaTopicAclOrderField } from '$lib/urql/gql/graphql';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { KafkaTopic } = $derived(data);

	let currentField = $derived(
		(page.url.searchParams.get('field') as KafkaTopicAclOrderField | null) ??
			KafkaTopicAclOrderField.TEAM_SLUG
	);
	let currentDirection = $derived(
		(page.url.searchParams.get('direction') as 'ASC' | 'DESC' | null) ?? 'ASC'
	);

	const tableSortChange = (key: string) => {
		let direction: 'ASC' | 'DESC';
		let field: KafkaTopicAclOrderField;
		if (key === currentField) {
			direction = currentDirection === 'ASC' ? 'DESC' : 'ASC';
			field = currentField;
		} else {
			field = KafkaTopicAclOrderField[key as keyof typeof KafkaTopicAclOrderField];
			direction = 'ASC';
		}

		changeParams(
			{
				direction,
				field
			},
			{
				noScroll: true
			}
		);
	};
</script>

<GraphErrors errors={KafkaTopic.errors} />
{#if KafkaTopic.data}
	{@const topic = KafkaTopic.data.team.environment.kafkaTopic}

	<div class="wrapper">
		<div>
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
			<div class="table">
				<Table
					size="small"
					sort={{
						orderBy: currentField,
						direction: currentDirection === 'ASC' ? 'ascending' : 'descending'
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
					loaders={cursorPaginationLoaders(page.url, topic.acl.pageInfo)}
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
