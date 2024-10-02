<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { KafkaTopicAclOrderField } from '$houdini';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		ExclamationmarkTriangleFillIcon
	} from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ KafkaTopic } = data);

	$: tableSort = {
		orderBy: $KafkaTopic.variables?.orderBy?.field,
		direction: $KafkaTopic.variables?.orderBy?.direction
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
			tableSort.orderBy = KafkaTopicAclOrderField[key as keyof typeof KafkaTopicAclOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || 'TEAM_SLUG'
		});
	};
</script>

{#if $KafkaTopic.errors}
	<GraphErrors errors={$KafkaTopic.errors} />
{:else if $KafkaTopic.data}
	{@const topic = $KafkaTopic.data.team.environment.kafkaTopic}
	<div class="grid">
		<Card columns={6}>
			<h3 class="heading">
				<Kafka />
				{topic.name}
			</h3>

			<h3>Topic ACLs</h3>
			<Table
				size="small"
				zebraStripes
				sort={{
					orderBy: tableSort.orderBy || 'TEAM_SLUG',
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				on:sortChange={tableSortChange}
			>
				<Thead>
					<Th sortable={true} sortKey={KafkaTopicAclOrderField.TEAM_SLUG}>Team</Th>
					<Th sortable={true} sortKey={KafkaTopicAclOrderField.CONSUMER}>Consumer</Th>
					<Th sortable={true} sortKey={KafkaTopicAclOrderField.ACCESS}>Access</Th>
				</Thead>
				<Tbody>
					{#each topic.acl.edges as edge}
						<Tr>
							<Td>
								{#if edge.node.teamName === '*'}
									All teams
								{:else}
									<a href="/team/{edge.node.teamName}">{edge.node.teamName}</a>
								{/if}
							</Td>
							<Td>
								{#if edge.node.workloadName === '*'}
									All workloads
								{:else if edge.node.workload}
									<WorkloadLink
										workload={edge.node.workload}
										team={edge.node.teamName}
										env={edge.node.workload.environment.name}
									/>
								{:else}
									<div class="workloadNotFound">
										<ExclamationmarkTriangleFillIcon
											style="color: var(--a-icon-warning)"
											title="Workload not found"
										/>{edge.node.workloadName}
									</div>
								{/if}
							</Td>
							<Td>{edge.node.access}</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}><em>No ACLs found for the topic</em></Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			{#if topic.acl.pageInfo.hasPreviousPage || topic.acl.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if topic.acl.pageInfo.pageStart !== topic.acl.pageInfo.pageEnd}
							{topic.acl.pageInfo.pageStart} - {topic.acl.pageInfo.pageEnd}
						{:else}
							{topic.acl.pageInfo.pageStart}
						{/if}
						of {topic.acl.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!topic.acl.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await KafkaTopic.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!topic.acl.pageInfo.hasNextPage}
							on:click={async () => {
								return await KafkaTopic.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		</Card>
		<Card rows={2} columns={6}>
			<h3>Status</h3>
			<p>TODO</p>
			<!--dl class="status">
				<dt>Fully qualified name</dt>
				<dd><code>{s.fullyQualifiedName}</code></dd>
				<dt>Synchronization state</dt>
				<dd>
					{#if s.synchronizationState === State.NAIS}
						<Nais style="color: var(--a-icon-success)" />
					{:else if s.synchronizationState === State.NOTNAIS}
						<ExclamationmarkTriangleFillIcon
							style="color: var(--a-icon-warning)"
							title="Not NAIS!"
						/>
					{:else}
						Unknown
					{/if}
				</dd>
				<dt>Synchronization time</dt>
				<dd><Time time={s.synchronizationTime} /></dd>
				<dt>Credentials expiry time</dt>
				<dd>TODO<Time time={s.credentialsExpiryTime} /></dd>
				<dt>Latest Aiven sync failure</dt>
				<dd><Time time={s.latestAivenSyncFailure} /></dd>
			</dl-->

			<!--details>
				<summary>Status message</summary>
				<p style="max-width: 25em;">
					{s.message}
				</p>
			</details-->

			<h3>Errors</h3>
			<!--ul>
				{#each s.errors as err}
					<li>{err}</li>
				{/each}
			</ul-->
			<p>TODO</p>
		</Card>
		<Card columns={6}>
			<h3>Topic configuration</h3>
			<dl class="status">
				{#if topic.configuration}
					{#each Object.entries(topic.configuration) as [key, value]}
						<dt>{key}</dt>
						<dd>{value}</dd>
					{/each}
				{/if}
			</dl>
		</Card>
	</div>
{/if}

<style>
	.heading {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

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

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
