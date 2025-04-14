<script lang="ts">
	import { page } from '$app/state';

	// Import necessary modules from Svelte and other libraries
	import { graphql } from '$houdini';
	// Houdini GraphQL client
	import { BodyShort, Button, Chips, ToggleChip } from '@nais/ds-svelte-community';
	// UI components
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	// Date formatting library
	import { onDestroy, onMount } from 'svelte'; // Svelte lifecycle hook
	import { SvelteSet } from 'svelte/reactivity';

	// Define the props for the component, including team information
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

	// Define a GraphQL subscription to fetch new logs
	const newstore = () => {
		const store = graphql(`
			subscription NewLogsSubscription($filter: WorkloadLogSubscriptionFilter!) {
				workloadLog(filter: $filter) {
					time
					message
					instance
				}
			}
		`);
		// Subscribe to the GraphQL subscription to receive new logs in real-time
		store.subscribe((result) => {
			if (!result.fetching) {
				return;
			}

			if (!result.partial) {
				return;
			}

			if (result.data) {
				if (!selectedInstances.includes(result.data.workloadLog.instance)) {
					console.log('Log received but not for selected instances:', result.data.workloadLog);
				}
				let m;
				// Attempt to parse the log message as JSON, if it fails, use the original message
				try {
					m = JSON.parse(result.data.workloadLog.message).message;
				} catch (e) {
					console.log('Error parsing JSON message: ', e);
					m = result.data.workloadLog.message;
				}

				if (m === undefined) {
					m = result.data.workloadLog.message;
				}

				// Update the logs array with the new log
				logs = [...logs, { ...result.data.workloadLog, m }];

				// Keep only the latest MAX_LOG_LINES logs
				if (logs.length > MAX_LOG_LINES) {
					logs = logs.slice(-MAX_LOG_LINES); // Discard the oldest logs
				}
			}
		});
		return store;
	};

	let store = newstore();

	function start() {
		if (selectedInstances.length === 0) {
			return;
		}
		logs = [];
		isPaused = false;
		isStarted = true;

		store = newstore();
		store.listen({
			filter: {
				team: team.slug,
				environment: team.environment.environment.name,
				application: team.environment.application.name,
				instances: selectedInstances
			}
		});
	}

	// Initialize a reactive state variable to store the logs
	let logs: { time: Date; message: string; instance: string; m?: string }[] = $state([]);
	// Initialize a reactive state variable to store the selected instances for filtering logs
	let selectedInstances: string[] = $state([]);

	let isStarted: boolean = $state(false);
	let isPaused: boolean = $state(true);

	const MAX_LOG_LINES = 200;

	onMount(() => {
		let instance = page.url.searchParams.get('instance');

		if (instance) {
			// If an instance is provided in the URL, set it as the selected instance
			selectedInstances = [instance];
			start();
		} else {
			// Otherwise, select all instances by default
			selectedInstances = team.environment.application.instances.nodes.map((node) => node.name);
		}
	});

	// Unsubscribe from the GraphQL subscription when the component is destroyed
	onDestroy(() => {
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

	// Define an array of colors to use for different instances
	const colors = ['blue', 'green', 'orange', 'purple', 'limegreen'];

	// Function to extract the log level from the message
	function getLogLevel(message: string) {
		const logLevel = message.match(/"level":"(\w+)"/);
		if (logLevel) {
			return logLevel[1].toUpperCase();
		}
		return 'INFO';
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
				{#each team.environment.application.instances.nodes as instance, i (instance.name)}
					{@const name = instance.name}
					<ToggleChip
						--ac-chip-toggle-bg="var(--a-{colors[i % colors.length]}-200)"
						--ac-chip-toggle-hover-bg="var(--a-{colors[i % colors.length]}-300)"
						--ac-chip-toggle-pressed-bg="var(--a-{colors[i % colors.length]}-500)"
						--ac-chip-toggle-pressed-hover-bg="var(--a-{colors[i % colors.length]}-600)"
						value={renderInstanceName(name)}
						selected={selectedInstances.includes(name)}
						onclick={() => {
							// Toggle the selected instance and update the logs
							if (selectedInstances.includes(name)) {
								selectedInstances = selectedInstances.filter((i) => i !== name);
							} else {
								selectedInstances = [...selectedInstances, name];
							}

							if (selectedInstances.length === 0) {
								// If no instances are selected, unsubscribe from the current subscription
								store.unlisten();
								isPaused = true;
							}

							if (isPaused) {
								return;
							}

							// Unsubscribe from the current subscription and subscribe to a new one with the updated filter
							store.unlisten().then(start);
						}}
					/>
				{/each}
			</div>
		</Chips>
		<div>
			<div class="buttons">
				{#if isStarted}
					<Button
						size="small"
						variant="primary"
						disabled={selectedInstances.length === 0}
						onclick={() => {
							if (isPaused) {
								start();
							} else {
								isPaused = true;
								// Pause the subscription
								store.unlisten();
							}
						}}
					>
						{isPaused ? 'Restart' : 'Stop'}
					</Button>
					<Button
						size="small"
						variant="primary"
						onclick={() => {
							logs = [];
						}}
					>
						Clear logs
					</Button>
				{:else}
					<Button
						size="small"
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
			<div style="padding-top: var(--a-spacing-2);">
				{#each team.environment.application.logDestinations as logDestination (logDestination.id)}
					{#if logDestination.__typename === 'LogDestinationLoki'}
						<a href={logDestination.grafanaURL} target="_blank" rel="noopener noreferrer">
							View logs in Grafana <ExternalLinkIcon />
						</a>
					{/if}
				{/each}
			</div>
		</div>
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
	{:else}
		<div>
			<Chips size="small">
				{#each viewOptions as option (option)}
					<ToggleChip
						value={option}
						selected={selectedViewOptions.has(option)}
						onclick={() => toggleSelectedViewOptions(option)}
					/>
				{/each}
			</Chips>
		</div>
		<div class="log-wrapper">
			{#each logs.toReversed() as log, i (i)}
				<div class="log-line">
					{#if selectedViewOptions.has('Time')}
						<div class="date">{format(log.time, 'yyyy-MM-dd HH:mm:ss.SSS')}</div>
					{/if}
					{#if selectedViewOptions.has('Instance')}
						<div class="instance">
							{renderInstanceName(log.instance)}
						</div>
					{/if}
					<div
						class="instance-color"
						style:background-color="var(--a-{colors[
							team.environment.application.instances.nodes.findIndex(
								(instance) => instance.name === log.instance
							) % colors.length
						]}-500)"
					></div>
					{#if selectedViewOptions.has('Level')}
						<div class="level">{getLogLevel(log.message)}</div>
					{/if}

					<div class="message" style:max-width={messageWidth}>
						{log.m}
					</div>
				</div>
			{:else}
				<BodyShort>Waiting for logs...</BodyShort>
			{/each}
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
		gap: var(--a-spacing-8);
		width: 100%;
		.buttons {
			display: flex;
			flex-direction: row;
			gap: var(--a-spacing-2);
		}
	}
	.chips {
		display: grid;
		grid-template-columns: repeat(auto-fill, 28ch);
		grid-auto-rows: min-content;

		gap: var(--a-spacing-2);
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
</style>
