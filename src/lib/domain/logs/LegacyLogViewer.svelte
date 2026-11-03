<script lang="ts">
	import { docURL } from '#lib/doc.js';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import {
		createBufferedLogAppender,
		filterLogsByLevel,
		getLogInstanceColor,
		getLogLevel,
		parseLogMessage,
		type LogLine
	} from '#lib/utils/logViewer.js';
	import { graphql } from '$houdini';
	import {
		Alert,
		BodyShort,
		Button,
		Chips,
		ToggleChip,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { onMount, untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let {
		team,
		environment,
		workload,
		instances,
		initialInstances = instances,
		tracesURL
	}: {
		team: string;
		environment: string;
		workload: string;
		instances: string[];
		initialInstances?: string[];
		tracesURL?: string;
	} = $props();

	const maxLogLines = 200;
	const logLevels = new SvelteSet<string>();
	const selectedLogLevels = new SvelteSet<string>();
	const viewOptions = ['Time', 'Level', 'Instance'];
	const selectedViewOptions = new SvelteSet(viewOptions);
	let selectedInstances = $state.raw(untrack(() => [...initialInstances]));
	let logs: LogLine[] = $state.raw([]);
	let paused = $state(false);
	let error = $state('');
	let logOrder = $state('newest');
	let transitionId = 0;
	let destroyed = false;
	const filteredLogs = $derived(filterLogsByLevel(logs, selectedLogLevels).slice(-maxLogLines));
	const displayedLogs = $derived(logOrder === 'newest' ? filteredLogs.toReversed() : filteredLogs);
	const logAppender = createBufferedLogAppender({
		maxEntries: maxLogLines,
		maxPendingEntries: 5000,
		flushIntervalMs: 100,
		getLogs: () => logs,
		getSelectedLevels: () => selectedLogLevels,
		setLogs: (nextLogs) => (logs = nextLogs)
	});

	function createSubscription() {
		const store = graphql(`
			subscription LegacyWorkloadLogs($filter: WorkloadLogSubscriptionFilter!) {
				workloadLog(filter: $filter) {
					time
					message
					instance
				}
			}
		`);
		const unsubscribe = store.subscribe((result) => {
			if (paused || destroyed || !result.fetching || !result.partial) return;
			if (result.errors?.length) {
				error = 'Unable to stream logs. Resume to try again.';
				pause();
				return;
			}
			const log = result.data?.workloadLog;
			if (!log) return;
			if (log.instance === 'api' && parseLogMessage(log.message) === 'Subscription closed.') {
				pause();
				return;
			}
			const level = getLogLevel(log.message);
			if (!logLevels.has(level)) {
				logLevels.add(level);
				selectedLogLevels.add(level);
			}
			logAppender.enqueue(log);
		});
		return { store, unsubscribe };
	}

	let subscription: ReturnType<typeof createSubscription> | undefined;

	async function start() {
		const transition = ++transitionId;
		subscription?.unsubscribe();
		await subscription?.store.unlisten();
		if (destroyed || transition !== transitionId || paused) return;
		if (selectedInstances.length === 0) {
			logAppender.flush();
			paused = true;
			return;
		}
		logAppender.clear();
		logs = [];
		error = '';
		subscription = createSubscription();
		try {
			await subscription.store.listen({
				filter: { team, environment, application: workload, instances: selectedInstances }
			});
		} catch {
			if (destroyed || transition !== transitionId) return;
			error = 'Unable to stream logs. Resume to try again.';
			paused = true;
		}
	}

	function pause() {
		paused = true;
		++transitionId;
		void subscription?.store.unlisten();
		logAppender.flush();
	}

	function toggleInstance(instance: string) {
		selectedInstances = selectedInstances.includes(instance)
			? selectedInstances.filter((name) => name !== instance)
			: [...selectedInstances, instance];
		paused = false;
		void start();
	}

	function toggle(options: SvelteSet<string>, option: string) {
		if (options.has(option)) options.delete(option);
		else options.add(option);
	}

	function instanceName(instance: string) {
		return instance.startsWith(`${workload}-`) ? instance.slice(workload.length + 1) : instance;
	}

	onMount(() => {
		void start();
		return () => {
			destroyed = true;
			++transitionId;
			subscription?.unsubscribe();
			logAppender.clear();
			void subscription?.store.unlisten();
		};
	});
</script>

<div class="legacy-logs">
	<Alert variant="warning">
		We have a new logs explorer powered by Loki. This workload is using the old log viewer.
		Configure Loki as a log destination to use the new explorer.
		<ExternalLink href={docURL('/observability/logging/how-to/loki/')}>
			Learn how to send logs to Loki
		</ExternalLink>
	</Alert>

	<div class="controls">
		<Chips aria-label="Instances">
			{#each instances as instance (instance)}
				<ToggleChip
					data-color={getLogInstanceColor(instance, instances)}
					value={instanceName(instance)}
					selected={selectedInstances.includes(instance)}
					onclick={() => toggleInstance(instance)}
				/>
			{/each}
		</Chips>
		<div class="buttons">
			<Button
				size="small"
				disabled={selectedInstances.length === 0}
				onclick={() => {
					if (paused) {
						paused = false;
						void start();
					} else pause();
				}}
			>
				{paused ? 'Resume' : 'Pause'}
			</Button>
			<Button
				size="small"
				variant="secondary"
				onclick={() => {
					logAppender.clear();
					logs = [];
				}}
			>
				Clear logs
			</Button>
			{#if tracesURL}
				<ExternalLink href={tracesURL}>View traces in APM</ExternalLink>
			{/if}
		</div>
	</div>

	<div class="controls">
		<Chips size="small" aria-label="Log display">
			{#each viewOptions as option (option)}
				<ToggleChip
					value={option}
					selected={selectedViewOptions.has(option)}
					onclick={() => toggle(selectedViewOptions, option)}
				/>
			{/each}
			{#each logLevels as level (level)}
				<ToggleChip
					value={level}
					selected={selectedLogLevels.has(level)}
					onclick={() => toggle(selectedLogLevels, level)}
				/>
			{/each}
		</Chips>
		<ToggleGroup label="Log order" size="small" bind:value={logOrder}>
			<ToggleGroupItem value="newest">Newest first</ToggleGroupItem>
			<ToggleGroupItem value="oldest">Oldest first</ToggleGroupItem>
		</ToggleGroup>
	</div>

	{#if error}
		<Alert variant="error">{error}</Alert>
	{/if}
	{#if selectedInstances.length === 0}
		<BodyShort>No instances selected. Please select at least one instance to view logs.</BodyShort>
	{:else if paused && logs.length === 0}
		<BodyShort>Logs are paused.</BodyShort>
	{:else if logs.length === 0}
		<BodyShort>Waiting for logs.</BodyShort>
	{/if}

	{#if logs.length > 0}
		<div class="log-lines">
			{#if displayedLogs.length === 0}
				<BodyShort size="small">No logs match the selected levels.</BodyShort>
			{:else}
				{#each displayedLogs as log (log.id)}
					<div class="log-line">
						{#if selectedViewOptions.has('Time')}
							<time datetime={log.time.toISOString()}>{log.timestamp}</time>
						{/if}
						{#if selectedViewOptions.has('Instance')}
							<span data-color={getLogInstanceColor(log.instance, instances)} class="instance">
								{instanceName(log.instance)}
							</span>
						{/if}
						{#if selectedViewOptions.has('Level')}
							<span>{log.level}</span>
						{/if}
						<span class="message">{log.parsedMessage}</span>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.legacy-logs {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.controls,
	.buttons {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}

	.controls {
		justify-content: space-between;
	}

	.log-lines {
		overflow: auto;
	}

	.log-line {
		display: flex;
		align-items: baseline;
		gap: var(--ax-space-8);
		padding-block: var(--ax-space-4);
		font-family: monospace;
		font-size: var(--ax-font-size-small);
	}

	time,
	.instance {
		white-space: nowrap;
	}

	.instance {
		color: var(--ax-text-decoration);
	}

	.message {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		min-width: 0;
	}
</style>
