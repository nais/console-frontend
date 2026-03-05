<script lang="ts">
	import { page } from '$app/state';
	import { graphql, JobRunState, type JobRunState$options } from '$houdini';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import {
		createBufferedLogAppender,
		getLogLevel,
		parseLogMessage,
		type LogLine
	} from '$lib/utils/logViewer';
	import { BodyShort, Button, Chips, ToggleChip } from '@nais/ds-svelte-community';
	import { onDestroy, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	const {
		team
	}: {
		team: {
			slug: string;
			environment: {
				environment: {
					name: string;
				};
				job: {
					name: string;
					runs: {
						nodes: {
							id: string;
							name: string;
							status: {
								state: JobRunState$options;
							};
							instances: {
								nodes: {
									id: string;
									name: string;
								}[];
							};
						}[];
					};
					logDestinations: ({
						id: string;
						__typename: string | null;
					} & (
						| {
								grafanaURL: string;
								__typename: 'LogDestinationLoki';
						  }
						| {
								__typename: "non-exhaustive; don't match this";
						  }
					))[];
				};
			};
		};
	} = $props();

	const MAX_LOG_LINES = 200;
	const MAX_PENDING_LOG_LINES = 5000;
	const FLUSH_INTERVAL_MS = 100;

	let logs: LogLine[] = $state([]);
	let logAppender = createBufferedLogAppender({
		maxEntries: MAX_LOG_LINES,
		maxPendingEntries: MAX_PENDING_LOG_LINES,
		flushIntervalMs: FLUSH_INTERVAL_MS,
		getLogs: () => logs,
		setLogs: (nextLogs) => {
			logs = nextLogs;
		}
	});

	const newstore = () => {
		const store = graphql(`
			subscription NewLogsSubscription2($filter: WorkloadLogSubscriptionFilter!) {
				workloadLog(filter: $filter) {
					time
					message
					instance
				}
			}
		`);
		store.subscribe((result) => {
			if (!result.fetching) {
				return;
			}

			if (!result.partial) {
				return;
			}

			if (result.data) {
				const workloadLog = result.data.workloadLog;
				const m = parseLogMessage(workloadLog.message);

				if (m === 'Subscription closed.' && workloadLog.instance === 'api') {
					console.debug('Subscription closed');
					isPaused = true;
					logAppender.clear();
					store.unlisten();
					isStarted = false;
					return;
				}

				const level = getLogLevel(workloadLog.message);

				if (!logLevels.has(level)) {
					logLevels.add(level);
					selectedLogLevels.add(level);
				}

				if (!selectedLogLevels.has(level)) {
					return;
				}

				logAppender.enqueue(workloadLog);
			}
		});
		return store;
	};

	let store = newstore();

	function start() {
		if (selectedInstances.length === 0) {
			return;
		}
		logAppender.clear();
		logs = [];
		isPaused = false;
		isStarted = true;

		store = newstore();
		store.listen({
			filter: {
				team: team.slug,
				environment: team.environment.environment.name,
				application: team.environment.job.name,
				instances: selectedInstances
			}
		});
	}

	let displayedLogs = $derived(logs.toReversed());
	let selectedInstances: string[] = $state([]);

	let isStarted: boolean = $state(false);
	let isPaused: boolean = $state(true);

	onMount(() => {
		let instance = page.url.searchParams.get('instance');

		if (instance) {
			team.environment.job.runs.nodes.forEach((run) => {
				run.instances.nodes.forEach((node) => {
					if (node.name.startsWith(instance)) {
						selectedInstances = [node.name];
					}
				});
			});
			start();
		} else if (
			team.environment.job.runs.nodes.filter((run) => run.status.state === JobRunState.RUNNING)
				.length > 0
		) {
			selectedInstances = team.environment.job.runs.nodes
				.filter((run) => run.status.state === JobRunState.RUNNING)
				.map((run) => run.instances.nodes.map((node) => node.name))
				.flat();
			start();
		} else {
			selectedInstances = team.environment.job.runs.nodes
				.map((run) => run.instances.nodes.map((node) => node.name))
				.flat();
		}
	});

	onDestroy(() => {
		logAppender.clear();
		store.unlisten();
	});

	const viewOptions = ['Time', 'Level', 'Instance'];
	let selectedViewOptions = new SvelteSet(viewOptions);
	function toggleSelectedViewOptions(option: string) {
		if (selectedViewOptions.has(option)) {
			selectedViewOptions.delete(option);
		} else {
			selectedViewOptions.add(option);
		}
	}

	let logLevels = new SvelteSet<string>();
	let selectedLogLevels = new SvelteSet<string>();

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

	type ColorRole = (typeof colorRoles)[number];
	const colorSpreadStep = 7;
	let instanceColorByName = $derived.by(() => {
		const byName: Record<string, ColorRole> = {};
		let runOffset = 0;

		for (const run of team.environment.job.runs.nodes) {
			for (let instanceIndex = 0; instanceIndex < run.instances.nodes.length; instanceIndex++) {
				const instance = run.instances.nodes[instanceIndex];
				if (byName[instance.name] === undefined) {
					byName[instance.name] = colorForPosition(runOffset + instanceIndex);
				}
			}
			runOffset += run.instances.nodes.length;
		}

		return byName;
	});

	function colorForPosition(position: number): ColorRole {
		const normalized = ((position % colorRoles.length) + colorRoles.length) % colorRoles.length;
		return colorRoles[(normalized * colorSpreadStep) % colorRoles.length];
	}

	function colorForInstance(instanceName: string): ColorRole {
		return instanceColorByName[instanceName] ?? colorForPosition(0);
	}

	function renderInstanceName(i: string) {
		return i.slice(team.environment.job.name.length + 1);
	}

	let messageWidth = $derived.by(() => {
		let width = 95;
		if (!selectedViewOptions.has('Time')) {
			width += 25;
		}
		if (!selectedViewOptions.has('Instance')) {
			width += 15;
		}
		if (!selectedViewOptions.has('Level')) {
			width += 7;
		}
		return width + 'ch';
	});
</script>

<div class="wrapper">
	<div class="controls">
		<Chips style="flex-grow: 1">
			<div class="chips">
				{#each team.environment.job.runs.nodes as run (run.id)}
					{#each run.instances.nodes as instance (instance.id)}
						{@const color = colorForInstance(instance.name)}
						<ToggleChip
							data-color={color}
							value={renderInstanceName(instance.name)}
							selected={selectedInstances.includes(instance.name)}
							onclick={() => {
								if (selectedInstances.includes(instance.name)) {
									selectedInstances = selectedInstances.filter((i) => i !== instance.name);
								} else {
									selectedInstances = [...selectedInstances, instance.name];
								}
								if (selectedInstances.length === 0) {
									store.unlisten();
									isPaused = true;
								}
								if (isPaused) {
									return;
								}
								store.unlisten().then(start);
							}}
						/>
					{/each}
				{/each}
			</div>
		</Chips>
		<div>
			<div class="buttons">
				{#if isStarted}
					<Button
						size="medium"
						variant="primary"
						disabled={selectedInstances.length === 0}
						onclick={() => {
							if (isPaused) {
								start();
							} else {
								isPaused = true;
								store.unlisten();
							}
						}}
					>
						{isPaused ? 'Restart' : 'Stop'}
					</Button>
					<Button
						size="medium"
						variant="primary"
						onclick={() => {
							logAppender.clear();
							logs = [];
						}}
					>
						Clear logs
					</Button>
				{:else}
					<Button
						size="medium"
						variant="primary"
						onclick={() => {
							isStarted = true;
							start();
						}}
					>
						Start
					</Button>
				{/if}
			</div>
			<div style="padding-top: var(--ax-space-8);">
				{#each team.environment.job.logDestinations as logDestination (logDestination.id)}
					{#if logDestination.__typename === 'LogDestinationLoki'}
						<ExternalLink href={logDestination.grafanaURL}>View logs in Grafana</ExternalLink>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<div>
		<Chips size="small">
			{#each viewOptions as option (option)}
				<ToggleChip
					value={option}
					selected={selectedViewOptions.has(option)}
					onclick={() => toggleSelectedViewOptions(option)}
				/>
			{/each}
			{#if logLevels.size > 0}
				<div class="divider"></div>
			{/if}
			{#each logLevels as level (level)}
				<ToggleChip
					value={level}
					selected={selectedLogLevels.has(level)}
					onclick={() => {
						if (selectedLogLevels.has(level)) {
							selectedLogLevels.delete(level);
						} else {
							selectedLogLevels.add(level);
						}
						store.unlisten().then(start);
					}}
				/>
			{/each}
		</Chips>
	</div>

	{#if isPaused && logs.length === 0}
		{#if team.environment.job.runs.nodes.filter((run) => run.instances.nodes.length > 0).length === 0}
			<div class="paused">
				<p>No run instances.</p>
			</div>
		{:else if selectedInstances.length === 0}
			<div class="paused">
				<p>No run instances selected. Please select at least one instance to view logs.</p>
			</div>
		{:else}
			<div class="paused">
				<p>Logs are paused. Click "Start/Restart" to resume.</p>
			</div>
		{/if}
	{/if}

	{#if logs.length > 0}
		<div class="log-wrapper">
			{#if logs.length === 0}
				<BodyShort size="small">Waiting for logs...</BodyShort>
			{:else}
				{#each displayedLogs as log (log.id)}
					{@const color = colorForInstance(log.instance)}
					<div class="log-line">
						{#if selectedViewOptions.has('Time')}
							<div class="date">{log.timestamp}</div>
						{/if}
						{#if selectedViewOptions.has('Instance')}
							<div class="instance">
								{renderInstanceName(log.instance)}
							</div>
						{/if}
						<div
							class="instance-color"
							data-color={color}
							style:background-color="var(--ax-bg-strong-pressed)"
						></div>
						{#if selectedViewOptions.has('Level')}
							<div class="level">{log.level}</div>
						{/if}

						<div class="message" style:max-width={messageWidth}>
							{log.parsedMessage}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.controls {
		display: flex;
		flex-direction: row;
		gap: var(--ax-space-32);
		width: 100%;
		.buttons {
			display: flex;
			flex-direction: row;
			gap: var(--ax-space-8);
		}
	}
	.chips {
		display: grid;
		grid-template-columns: repeat(auto-fill, 28ch);
		grid-auto-rows: min-content;

		gap: var(--ax-space-8);
		flex-grow: 1;
	}
	.log-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 70vh;
		overflow-y: auto;
	}
	.log-line {
		display: flex;
		flex-direction: row;
		max-width: fit-content;
		font-family: monospace;
		font-size: 0.8rem;
		gap: 0.5rem;
		margin-right: 2rem;
		.date {
			text-align: right;
			white-space: nowrap;
		}
		.instance-color {
			min-width: 4px;
			max-width: 4px;
			border-radius: 0.25rem;
		}
		.instance {
			text-align: center;
			white-space: nowrap;
		}
		.level {
			min-width: 6ch;
		}
		.message {
			white-space: normal;
			overflow-wrap: break-word;
			word-wrap: break-word;
		}
	}
	.divider {
		background-color: var(--a-blue-200);
		min-width: 4px;
		max-width: 4px;
		border-radius: 0.25rem;
	}
</style>
