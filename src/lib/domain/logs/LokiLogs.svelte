<script lang="ts">
	import {
		createBufferedLogAppender,
		getLogLevel,
		parseLogMessage,
		type LogLine
	} from '#lib/utils/logViewer.js';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import { buildLokiLogQuery } from '#lib/utils/lokiLogQuery.js';
	import { graphql } from '$houdini';
	import {
		Alert,
		BodyShort,
		Button,
		Chips,
		TextField,
		ToggleChip,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { SortDownIcon, SortUpIcon } from '@nais/ds-svelte-community/icons';
	import { onDestroy, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	type Props = {
		team: string;
		environment: string;
		workload: string;
		container: string;
		instances: string[];
		initialInstances: string[];
		podNamePrefix?: string;
		startOnMount: boolean;
		hasLoki: boolean;
		grafanaURL?: string;
		tracesURL?: string;
	};

	let {
		team,
		environment,
		workload,
		container,
		instances,
		initialInstances,
		podNamePrefix,
		startOnMount,
		hasLoki,
		grafanaURL,
		tracesURL
	}: Props = $props();

	const MAX_LOG_LINES = 200;
	const MAX_PENDING_LOG_LINES = 5000;
	const FLUSH_INTERVAL_MS = 100;
	const viewOptions = ['Time', 'Level', 'Instance'];
	const commonLogLevels = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
	const colorRoles = [
		'accent',
		'success',
		'warning',
		'danger',
		'brand-magenta',
		'meta-purple',
		'meta-lime',
		'brand-beige',
		'info',
		'brand-blue'
	] as const;
	const logLevels = new SvelteSet<string>();
	const selectedLogLevels = new SvelteSet<string>();

	function toDateTimeLocal(date: Date): string {
		const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
		return localDate.toISOString().slice(0, 16);
	}

	let logs: LogLine[] = $state.raw([]);
	let selectedInstances: string[] = $state.raw([]);
	let isStarted = $state(false);
	let isPaused = $state(true);
	let subscriptionError = $state('');
	let fromDateTime = $state(toDateTimeLocal(new Date(Date.now() - 60 * 60 * 1000)));
	let searchText = $state('');
	let levelFilterActive = $state(false);
	let logOrder = $state<'newest' | 'oldest'>('newest');
	let selectedViewOptions = new SvelteSet(viewOptions);
	let displayedLogs = $derived(logOrder === 'newest' ? logs.toReversed() : logs);
	let availableLogLevels = $derived([...new Set([...commonLogLevels, ...logLevels])]);
	let messageWidth = $derived.by(() => {
		let width = 95;
		if (!selectedViewOptions.has('Time')) width += 25;
		if (!selectedViewOptions.has('Instance')) width += 15;
		if (!selectedViewOptions.has('Level')) width += 7;
		return `${width}ch`;
	});
	let canStart = $derived(podNamePrefix !== undefined || selectedInstances.length > 0);

	let logAppender = createBufferedLogAppender({
		maxEntries: MAX_LOG_LINES,
		maxPendingEntries: MAX_PENDING_LOG_LINES,
		flushIntervalMs: FLUSH_INTERVAL_MS,
		getLogs: () => logs,
		setLogs: (nextLogs) => {
			logs = nextLogs;
		}
	});

	function getLabel(labels: { key: string; value: string }[], key: string): string | undefined {
		return labels.find((label) => label.key === key)?.value;
	}

	function colorForInstance(instance: string) {
		const position = Math.max(instances.indexOf(instance), 0);
		return colorRoles[(position * 7) % colorRoles.length];
	}

	let transitionId = 0;
	let activeStreamId = 0;
	let destroyed = false;
	let subscriptionTransition = Promise.resolve();

	function createStore(streamId: number) {
		const store = graphql(`
			subscription LokiLogs($filter: LogSubscriptionFilter!) {
				log(filter: $filter) {
					time
					message
					labels {
						key
						value
					}
				}
			}
		`);

		store.subscribe((result) => {
			if (destroyed || streamId !== activeStreamId) {
				return;
			}

			if (result.errors?.length) {
				subscriptionError = result.errors.map((error) => error.message).join(', ');
				isPaused = true;
				logAppender.flush();
				isStarted = false;
				scheduleTransition(false);
				return;
			}

			if (!result.fetching || !result.partial || !result.data) {
				return;
			}

			const lokiLog = result.data.log;
			const instance = getLabel(lokiLog.labels, 'k8s_pod_name') ?? 'unknown';
			const level = getLogLevel(lokiLog.message);

			if (lokiLog.message.startsWith('error streaming log lines:')) {
				subscriptionError = parseLogMessage(lokiLog.message);
				logAppender.enqueue({
					time: lokiLog.time,
					message: lokiLog.message,
					instance
				});
				isPaused = true;
				logAppender.flush();
				isStarted = false;
				scheduleTransition(false);
				return;
			}

			if (!logLevels.has(level)) {
				logLevels.add(level);
				if (!levelFilterActive) {
					selectedLogLevels.add(level);
				}
			}

			if (levelFilterActive && !selectedLogLevels.has(level)) {
				return;
			}

			logAppender.enqueue({
				time: lokiLog.time,
				message: lokiLog.message,
				instance
			});
		});

		return store;
	}

	let store = createStore(activeStreamId);

	function start() {
		scheduleTransition(true);
	}

	function scheduleTransition(shouldStart: boolean) {
		const currentTransitionId = ++transitionId;
		activeStreamId += 1;
		isPaused = true;

		subscriptionTransition = subscriptionTransition
			.then(async () => {
				await store.unlisten();
				if (destroyed || currentTransitionId !== transitionId || !shouldStart || !hasLoki) {
					return;
				}
				if (!canStart) {
					return;
				}

				const startTime = new Date(fromDateTime);
				if (Number.isNaN(startTime.getTime()) || startTime.getTime() > Date.now()) {
					subscriptionError = 'Enter a valid start time in the past.';
					return;
				}
				if (levelFilterActive && selectedLogLevels.size === 0) {
					logAppender.clear();
					logs = [];
					isStarted = true;
					return;
				}

				logAppender.clear();
				logs = [];
				subscriptionError = '';
				isStarted = true;
				isPaused = false;
				store = createStore(activeStreamId);
				await store.listen({
					filter: {
						environmentName: environment,
						query: buildLokiLogQuery({
							team,
							workload,
							container,
							instances: selectedInstances,
							podNamePrefix,
							search: searchText,
							logLevels: levelFilterActive ? [...selectedLogLevels] : undefined
						}),
						initialBatch: {
							start: startTime,
							limit: 150
						}
					}
				});
			})
			.catch((error: unknown) => {
				if (destroyed || currentTransitionId !== transitionId) {
					return;
				}
				subscriptionError =
					error instanceof Error ? error.message : 'Unable to update the log subscription.';
				isPaused = true;
				isStarted = false;
			});
	}

	function setInstances(nextInstances: string[]) {
		selectedInstances = nextInstances;
		if (!canStart) {
			isPaused = true;
			scheduleTransition(false);
		}
		if (!isPaused) {
			start();
		}
	}

	function displayInstance(instance: string): string {
		const prefix = podNamePrefix ?? `${workload}-`;
		return instance.startsWith(prefix) ? instance.slice(prefix.length) : instance;
	}

	function toggleLogLevel(level: string) {
		if (!levelFilterActive) {
			selectedLogLevels.clear();
		}
		levelFilterActive = true;
		if (selectedLogLevels.has(level)) {
			selectedLogLevels.delete(level);
		} else {
			selectedLogLevels.add(level);
		}
		if (isStarted) start();
	}

	function selectAllLogLevels() {
		levelFilterActive = false;
		selectedLogLevels.clear();
		if (isStarted) start();
	}

	onMount(() => {
		selectedInstances = initialInstances;
		if (startOnMount && hasLoki) start();
	});

	onDestroy(() => {
		destroyed = true;
		transitionId += 1;
		activeStreamId += 1;
		logAppender.clear();
		subscriptionTransition = subscriptionTransition
			.then(async () => {
				await store.unlisten();
			})
			.catch((error: unknown) => {
				console.error('Failed to clean up the Loki log subscription.', error);
			});
	});
</script>

{#if !hasLoki}
	<Alert variant="info">This workload has no Loki log destination.</Alert>
{:else}
	<div class="wrapper">
		{#if subscriptionError}
			<Alert variant="error">{subscriptionError}</Alert>
		{/if}

		<div class="controls">
			<div class="query-controls">
				<div class="from-control">
					<TextField size="small" type="datetime-local" label="From" bind:value={fromDateTime} />
					<div class="history-description">
						<BodyShort size="small" textColor="subtle">
							History starts at this time, then streams live.
						</BodyShort>
					</div>
				</div>
				<div class="search-control">
					<TextField
						size="small"
						type="search"
						label="Search"
						bind:value={searchText}
						maxlength={256}
					/>
				</div>
				<div class="apply-filters">
					<Button size="small" variant="primary" onclick={start}>Apply filters</Button>
				</div>
			</div>
			{#if instances.length > 0}
				<Chips style="flex-grow: 1">
					<div class="chips">
						{#each instances as instance (instance)}
							<ToggleChip
								data-color={colorForInstance(instance)}
								value={displayInstance(instance)}
								selected={selectedInstances.includes(instance)}
								onclick={() =>
									setInstances(
										selectedInstances.includes(instance)
											? selectedInstances.filter((selected) => selected !== instance)
											: [...selectedInstances, instance]
									)}
							/>
						{/each}
					</div>
				</Chips>
			{/if}
			<div>
				<div class="buttons">
					{#if isStarted}
						<Button
							size="small"
							variant="primary"
							disabled={!canStart}
							onclick={() => {
								if (isPaused) start();
								else {
									isPaused = true;
									scheduleTransition(false);
								}
							}}>{isPaused ? 'Restart' : 'Stop'}</Button
						>
						<Button
							size="small"
							variant="primary"
							onclick={() => {
								logAppender.clear();
								logs = [];
							}}>Clear logs</Button
						>
					{:else}
						<Button size="small" variant="primary" onclick={start}>Start</Button>
					{/if}
				</div>
				<div class="links">
					{#if grafanaURL}
						<ExternalLink href={grafanaURL}>View logs in Grafana</ExternalLink>
					{/if}
					{#if tracesURL}
						<ExternalLink href={tracesURL}>View traces in APM</ExternalLink>
					{/if}
				</div>
			</div>
		</div>

		<div class="display-controls">
			<Chips size="small">
				{#each viewOptions as option (option)}
					<ToggleChip
						value={option}
						selected={selectedViewOptions.has(option)}
						onclick={() => {
							if (selectedViewOptions.has(option)) selectedViewOptions.delete(option);
							else selectedViewOptions.add(option);
						}}
					/>
				{/each}
			</Chips>
			<ToggleGroup label="Log order" size="small" bind:value={logOrder}>
				<ToggleGroupItem value="newest"
					><SortDownIcon aria-hidden="true" /> Newest first</ToggleGroupItem
				>
				<ToggleGroupItem value="oldest"
					><SortUpIcon aria-hidden="true" /> Oldest first</ToggleGroupItem
				>
			</ToggleGroup>
		</div>
		<div class="level-controls" role="group" aria-label="Filter logs by level">
			<span>Log level</span>
			<Chips size="small">
				<ToggleChip value="All" selected={!levelFilterActive} onclick={selectAllLogLevels} />
				{#each availableLogLevels as level (level)}
					<ToggleChip
						value={level}
						selected={!levelFilterActive || selectedLogLevels.has(level)}
						onclick={() => toggleLogLevel(level)}
					/>
				{/each}
			</Chips>
		</div>

		{#if isPaused && logs.length === 0}
			<div class="paused">
				<p>
					{!canStart
						? 'No instances selected. Please select at least one instance to view logs.'
						: 'Logs are paused. Click "Start/Restart" to resume.'}
				</p>
			</div>
		{/if}

		{#if logs.length > 0}
			<div class="log-wrapper">
				{#each displayedLogs as log (log.id)}
					<div class="log-line">
						{#if selectedViewOptions.has('Time')}<div class="date">{log.timestamp}</div>{/if}
						{#if selectedViewOptions.has('Instance')}
							<div class="instance">{displayInstance(log.instance)}</div>
						{/if}
						<div
							class="instance-color"
							data-color={colorForInstance(log.instance)}
							style:background-color="var(--ax-bg-strong-pressed)"
						></div>
						{#if selectedViewOptions.has('Level')}<div class="level">{log.level}</div>{/if}
						<div class="message" style:max-width={messageWidth}>{log.parsedMessage}</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.controls,
	.buttons,
	.display-controls,
	.links {
		display: flex;
		gap: var(--ax-space-8);
	}
	.controls {
		flex-direction: column;
		gap: var(--ax-space-32);
		width: 100%;
	}
	.query-controls {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--ax-space-8);
	}
	.from-control {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		max-width: 32ch;
	}
	.history-description {
		width: max-content;
		max-width: 48ch;
	}
	.search-control {
		max-width: 48ch;
	}
	.apply-filters {
		justify-self: start;
	}
	.controls > div:last-child {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
	.buttons,
	.links {
		flex-wrap: wrap;
	}
	.chips {
		display: grid;
		grid-template-columns: repeat(auto-fill, 28ch);
		grid-auto-rows: min-content;
		gap: var(--ax-space-8);
		flex-grow: 1;
	}
	.display-controls {
		align-items: end;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.level-controls {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}
	.log-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		max-height: 70vh;
		overflow-y: auto;
	}
	.log-line {
		display: flex;
		gap: var(--ax-space-8);
		max-width: fit-content;
		font-family: monospace;
		font-size: var(--ax-font-size-small);
	}
	.date,
	.instance {
		white-space: nowrap;
	}
	.date {
		text-align: right;
	}
	.instance-color {
		min-width: var(--ax-space-1);
		max-width: var(--ax-space-1);
		border-radius: var(--ax-radius-4);
	}
	.paused {
		text-align: center;
	}
</style>
