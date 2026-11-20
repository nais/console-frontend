<script lang="ts">
	import { graphql, type JobRunInstanceState$options } from '$houdini';
	import { Button, ShSpinner, Tag, type TagProps } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { formatImageRef } from '#lib/utils/image.js';
	import { onMount } from 'svelte';
	import { instanceLastExit } from './instanceLastExit.js';

	let { runId, jobPath, active }: { runId: string; jobPath: string; active: boolean } = $props();

	const details = graphql(`
		query JobRunDiagnostics($id: ID!) {
			node(id: $id) {
				__typename
				... on JobRun {
					id
					instances(first: 10) @paginate(mode: Infinite) {
						edges {
							node {
								id
								name
								created
								restarts
								image {
									name
									tag
									digest
								}
								status {
									state
									message
									lastExitReason
									lastExitCode
									lastExitTimestamp
								}
							}
						}
						pageInfo {
							hasNextPage
						}
					}
				}
			}
		}
	`);

	let initialLoad = $state(true);
	let loadError = $state<string | null>(null);
	onMount(() => {
		void load(true);
		let wasActive = active;
		const interval = setInterval(() => {
			if ((active || wasActive) && !$details.fetching && !loadingMore) {
				wasActive = active;
				void load(false);
			}
		}, 10_000);
		return () => clearInterval(interval);
	});

	async function load(initial: boolean) {
		try {
			await details.fetch({
				policy: 'NetworkOnly',
				...(initial ? { variables: { id: runId } } : {})
			});
			loadError = null;
		} catch {
			loadError = 'Could not load run instances.';
		} finally {
			initialLoad = false;
		}
	}

	let loadingMore = $state(false);
	let paginationErrors = $state<{ message: string }[] | null>(null);
	async function loadMore() {
		loadingMore = true;
		paginationErrors = null;
		try {
			paginationErrors = (await details.loadNextPage()).errors;
		} catch {
			paginationErrors = [{ message: 'Could not load more run instances.' }];
		} finally {
			loadingMore = false;
		}
	}

	const run = $derived($details.data?.node);
	const instances = $derived(run?.__typename === 'JobRun' ? run.instances : undefined);
	const errors = $derived(loadError ? [{ message: loadError }] : $details.errors);
	const statuses = {
		PENDING: { label: 'Waiting for placement', variant: 'warning' },
		STARTING: { label: 'Starting', variant: 'info' },
		RUNNING: { label: 'Running', variant: 'info' },
		FAILING: { label: 'Failing', variant: 'error' },
		SUCCEEDED: { label: 'Completed successfully', variant: 'success' },
		UNKNOWN: { label: 'Unknown', variant: 'neutral' }
	} as const satisfies Record<
		JobRunInstanceState$options,
		{ label: string; variant: TagProps['variant'] }
	>;
</script>

<div class="diagnostics">
	<GraphErrors size="small" {errors} />
	{#if instances?.edges.length}
		<ul role="list" aria-label="Run instances">
			{#each instances.edges as { node: instance } (instance.id)}
				{const status = $derived(statuses[instance.status.state] ?? statuses.UNKNOWN)}
				{const exit = $derived(instanceLastExit(instance.status))}
				<li>
					<div class="instance-heading">
						<strong>{instance.name}</strong>
						<Tag size="xsmall" variant={status.variant}>{status.label}</Tag>
					</div>
					<p>{instance.status.message}</p>
					<dl>
						<div>
							<dt>Image</dt>
							<dd><code>{formatImageRef(instance.image)}</code></dd>
						</div>
						<div>
							<dt>Created</dt>
							<dd><Time time={instance.created} dateFormat="d MMM, HH:mm:ss" /></dd>
						</div>
						<div>
							<dt>Restarts</dt>
							<dd>{instance.restarts}</dd>
						</div>
						{#if exit}
							<div>
								<dt>Last exit</dt>
								<dd>
									{exit.description}
									{#if exit.timestamp}
										{#if exit.description}&middot;{/if}
										<Time time={exit.timestamp} dateFormat="d MMM, HH:mm:ss" />
									{/if}
								</dd>
							</div>
						{/if}
					</dl>
					<a
						href="{jobPath}/logs?{new URLSearchParams({ instance: instance.name })}"
						aria-label="View logs for {instance.name}"
					>
						View logs
					</a>
				</li>
			{/each}
		</ul>
		{#if instances.pageInfo.hasNextPage}
			<GraphErrors size="small" errors={paginationErrors} />
			<Button
				variant="tertiary"
				size="small"
				onclick={loadMore}
				loading={loadingMore}
				disabled={$details.fetching}
			>
				Load more instances
			</Button>
		{/if}
	{:else if (initialLoad || $details.fetching) && !errors?.length}
		<div role="status" aria-label="Loading run instances"><ShSpinner size="sm" /></div>
	{:else if !errors?.length}
		<p>{instances ? 'No instances found for this run.' : 'This run is no longer available.'}</p>
	{/if}
	<a href="{jobPath}/events">View job events</a>
</div>

<style>
	.diagnostics {
		display: grid;
		gap: var(--nais-space-8);
		justify-items: start;
	}

	ul {
		display: grid;
		gap: var(--nais-space-10);
		list-style: none;
		padding: 0;
		margin: 0;
		width: 100%;
	}

	li {
		display: grid;
		gap: var(--nais-space-4);
		min-width: 0;
		padding: var(--nais-space-10);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--nais-radius-8);
		background: var(--card);
		color: var(--foreground);
		font-size: var(--sh-font-size-sm);
		overflow-wrap: anywhere;
	}

	li a {
		justify-self: start;
	}

	.instance-heading,
	dl {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--nais-space-4) var(--nais-space-12);
	}

	p,
	dl,
	dd {
		margin: 0;
	}

	dl {
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-xs);
	}

	dt {
		font-weight: var(--sh-font-weight-semibold);
	}

	code {
		font: inherit;
		font-family: var(--sh-font-family-mono);
	}
</style>
