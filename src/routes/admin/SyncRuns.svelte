<script lang="ts">
	import { graphql, UsersyncRunStatus } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Accordion, AccordionItem, Loader, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { format } from 'date-fns/format';
	import { formatDistance } from 'date-fns/formatDistance';
	import { enGB } from 'date-fns/locale/en-GB';

	const runs = graphql(`
		query UsersyncRuns @load {
			usersyncRuns(limit: 5) {
				pageInfo {
					totalCount
				}
				nodes {
					startedAt
					finishedAt
					status
					error
					auditLogs(limit: 100) {
						pageInfo {
							totalCount
						}
						nodes {
							actor
							action
							message
							createdAt
						}
					}
				}
			}
		}
	`);
</script>

<div class="wrapper">
	{#if $runs.fetching}
		<p><Loader size="xlarge" /></p>
	{:else if $runs.errors}
		<GraphErrors errors={$runs.errors} />
	{:else if $runs.data?.usersyncRuns?.nodes && $runs.data.usersyncRuns.nodes.length > 0}
		<p>
			Showing {$runs.data.usersyncRuns.nodes.length} of {$runs.data.usersyncRuns.pageInfo
				.totalCount} entries.
		</p>
		{#each $runs.data.usersyncRuns.nodes || [] as us}
			<div
				class="run"
				class:ok={us.status == UsersyncRunStatus.SUCCESS}
				class:error={us.status == UsersyncRunStatus.FAILURE}
			>
				Started <Time time={us.startedAt} distance={true} />.
				{#if us.finishedAt}
					{#if us.status == UsersyncRunStatus.FAILURE}
						Failed after
					{:else}
						Finished after
					{/if}
					<time
						datetime={us.finishedAt.toTimeString()}
						title={format(us.finishedAt, 'dd. MMMM yyyy HH:mm:ss', { locale: enGB })}
					>
						{formatDistance(us.startedAt, us.finishedAt, { includeSeconds: true })}.
					</time>
				{/if}
				{#if us.error}
					<pre>{us.error}</pre>
				{/if}
				{#if us.auditLogs.nodes.length > 0}
					<Accordion>
						<AccordionItem>
							<svelte:fragment slot="heading">
								<h2>View logs</h2>
							</svelte:fragment>
							{#if us.auditLogs.pageInfo.totalCount > us.auditLogs.nodes.length}
								<p>
									Showing {us.auditLogs.nodes.length} of {us.auditLogs.pageInfo.totalCount} entries.
								</p>
							{/if}
							<Table zebraStripes>
								<Thead>
									<Tr>
										<Th>Time</Th>
										<Th>Action</Th>
										<Th>Message</Th>
									</Tr>
								</Thead>
								<Tbody>
									{#each us.auditLogs.nodes as log}
										<Tr>
											<Td>
												<Time time={log.createdAt} distance={true} />
											</Td>
											<Td>{log.action}</Td>
											<Td>{log.message}</Td>
										</Tr>
									{/each}
								</Tbody>
							</Table>
						</AccordionItem>
					</Accordion>
				{/if}
			</div>
		{/each}
	{:else}
		<p>No entries.</p>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
	}

	.run {
		margin-bottom: 1rem;
		border: 1px solid #d6d8db;
		border-left: 0.7rem solid #d6d8db;
		padding: 0.5rem;
	}

	.run.ok {
		border-color: var(--a-surface-success);
	}

	.run.error {
		border-color: var(--a-surface-danger);
	}

	pre {
		font-size: 0.8rem;
	}

	.run :global(time) {
		border-bottom: 1px dotted var(--a-border-default);
	}
</style>
