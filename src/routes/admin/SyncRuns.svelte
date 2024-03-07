<script lang="ts">
	import { graphql, UserSyncRunStatus } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Accordion, AccordionItem, Loader } from '@nais/ds-svelte-community';
	import { format } from 'date-fns/format';
	import { formatDistance } from 'date-fns/formatDistance';
	import { enGB } from 'date-fns/locale/en-GB';

	const runs = graphql(`
		query UserSyncRuns @load {
			userSync {
				startedAt
				finishedAt
				status
				error
				auditLogs(limit: 15) {
					nodes {
						actor
						action
						message
						createdAt
					}
				}
			}
		}
	`);
</script>

<div class="wrapper">
	{#if $runs.fetching}
		<p><Loader size="xlarge" /></p>
	{:else}
		{#if $runs.errors}
			<GraphErrors errors={$runs.errors} />
		{/if}

		{#each $runs.data?.userSync || [] as us}
			<div
				class="run"
				class:ok={us.status == UserSyncRunStatus.SUCCESS}
				class:pending={us.status == UserSyncRunStatus.IN_PROGRESS}
				class:error={us.status == UserSyncRunStatus.FAILURE}
			>
				Started <Time time={us.startedAt} distance={true} />.
				{#if us.finishedAt}
					{#if us.status == UserSyncRunStatus.FAILURE}
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
							{#each us.auditLogs.nodes as log}
								<p>{log.actor} - {log.message} - {log.createdAt}</p>
							{/each}
						</AccordionItem>
					</Accordion>
				{/if}
			</div>
		{/each}
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

	.run.pending {
		border-color: var(--a-surface-neutral);
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
