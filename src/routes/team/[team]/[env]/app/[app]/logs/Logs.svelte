<script lang="ts">
	import { page } from '$app/state';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { getContextClient } from '$lib/urql/context';
	import {
		createBufferedLogAppender,
		getLogLevel,
		parseLogMessage,
		type LogLine
	} from '$lib/utils/logViewer';
	import { BodyShort, Button, Chips, ToggleChip } from '@nais/ds-svelte-community';
	import { onDestroy, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { AppLogsSubscription } from './appLogs';

	const {
		team
	}: {
		team: {
			slug: string;
			environment: {
				environment: {
					name: string;
				};
				application: {
					name: string;
					instances: {
						nodes: {
							name: string;
						}[];
					};
					logDestinations: (
						| { __typename: 'LogDestinationLoki'; id: string; grafanaURL: string }
						| { __typename: 'LogDestinationGeneric'; id: string }
						| { __typename: 'LogDestinationSecureLogs'; id: string }
					)[];
				};
			};
		};
	} = $props();

	const MAX_LOG_LINES = 200;
	const MAX_PENDING_LOG_LINES = 5000;
	const FLUSH_INTERVAL_MS = 100;

	const client = getContextClient();

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

	let activeSub: { unsubscribe: () => void } | undefined;

	function stopSubscription() {
		if (activeSub) {
			activeSub.unsubscribe();
			activeSub = undefined;
		}
	}

	function start() {
		if (selectedInstances.length === 0) {
			return;
		}
		stopSubscription();
		logAppender.clear();
		logs = [];
		isPaused = false;
		isStarted = true;

		activeSub = client
			.subscription(AppLogsSubscription, {
				filter: {
					team: team.slug,
					environment: team.environment.environment.name,
					application: team.environment.application.name,
					instances: selectedInstances
				}
			})
			.subscribe((result) => {
				if (result.error) {
					console.error('subscription error', result.error);
					return;
				}
				if (!result.data) {
					return;
				}

				const workloadLog = result.data.workloadLog;
				const parsedMessage = parseLogMessage(workloadLog.message);

				if (parsedMessage === 'Subscription closed.' && workloadLog.instance === 'api') {
					console.debug('Subscription closed');
					isPaused = true;
					logAppender.flush();
					stopSubscription();
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
			});
	}

	let displayedLogs = $derived(logs.toReversed());
	let selectedInstances: string[] = $state([]);

	let isStarted: boolean = $state(false);
	let isPaused: boolean = $state(true);

	onMount(() => {
		let instance = page.url.searchParams.get('instance');

		if (instance) {
			selectedInstances = [instance];
			start();
		} else {
			selectedInstances = team.environment.application.instances.nodes.map((node) => node.name);
		}
	});

	onDestroy(() => {
		logAppender.clear();
		stopSubscription();
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
	let instanceIndexByName = $derived.by(() => {
		const byName: Record<string, number> = {};
		team.environment.application.instances.nodes.forEach((instance, index) => {
			byName[instance.name] = index;
		});
		return byName;
	});

	function colorForPosition(position: number): ColorRole {
		const normalized = ((position % colorRoles.length) + colorRoles.length) % colorRoles.length;
		return colorRoles[(normalized * colorSpreadStep) % colorRoles.length];
	}

	function colorForInstance(instanceName: string): ColorRole {
		const index = instanceIndexByName[instanceName] ?? 0;
		return colorForPosition(index >= 0 ? index : 0);
	}

	function renderInstanceName(i: string) {
		return i.slice(team.environment.application.name.length + 1);
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
				{#each team.environment.application.instances.nodes as instance (instance.name)}
					{@const name = instance.name}
					{@const color = colorForInstance(name)}
					<ToggleChip
						data-color={color}
						value={renderInstanceName(name)}
						selected={selectedInstances.includes(name)}
						onclick={() => {
							if (selectedInstances.includes(name)) {
								selectedInstances = selectedInstances.filter((i) => i !== name);
							} else {
								selectedInstances = [...selectedInstances, name];
							}

							if (selectedInstances.length === 0) {
								stopSubscription();
								isPaused = true;
							}

							if (isPaused) {
								return;
							}
							stopSubscription();
							start();
						}}
					/>
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
								stopSubscription();
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
				{#each team.environment.application.logDestinations as logDestination (logDestination.id)}
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
						stopSubscription();
						start();
					}}
				/>
			{/each}
		</Chips>
	</div>

	{#if isPaused && logs.length === 0}
		{#if selectedInstances.length === 0}
			<div class="paused">
				<p>No instances selected. Please select at least one instance to view logs.</p>
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
