<script lang="ts">
	// Import necessary modules from Svelte and other libraries
	import { graphql } from '$houdini'; // Houdini GraphQL client
	import { Button, Chips, ToggleChip } from '@nais/ds-svelte-community'; // UI components
	import { format } from 'date-fns'; // Date formatting library
	import { onDestroy } from 'svelte'; // Svelte lifecycle hook

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
				};
			};
		};
	} = $props();

	// Define a GraphQL subscription to fetch new logs
	const store = graphql(`
		subscription NewLogsSubscription($filter: WorkloadLogSubscriptionFilter!) {
			workloadLog(filter: $filter) {
				time
				message
				instance
			}
		}
	`);

	// Initialize a reactive state variable to store the logs
	let logs: { time: Date; message: string; instance: string; m?: string }[] = $state([]);
	// Initialize a reactive state variable to store the selected instances for filtering logs
	let selectedInstances: string[] = $state([]);

	let pause: boolean = $state(false);

	const MAX_LOG_LINES = 100;

	// Subscribe to the GraphQL subscription to receive new logs in real-time
	store.subscribe((result) => {
		if (!result.fetching) {
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
			// Update the logs array with the new log
			logs = [...logs, { ...result.data.workloadLog, m }];

			// Keep only the latest MAX_LOG_LINES logs
			if (logs.length > MAX_LOG_LINES) {
				logs = logs.slice(-MAX_LOG_LINES); // Discard the oldest logs
			}
		}
	});

	// Unsubscribe from the GraphQL subscription when the component is destroyed
	onDestroy(() => {
		store.unlisten();
	});

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
</script>

<div class="wrapper">
	<div class="controls">
		<Chips>
			{#each team.environment.application.instances.nodes as instance, i (instance.name)}
				{@const name = instance.name}
				<ToggleChip
					--ac-chip-toggle-bg="var(--a-{colors[i % colors.length]}-200)"
					--ac-chip-toggle-hover-bg="var(--a-{colors[i % colors.length]}-300)"
					--ac-chip-toggle-pressed-bg="var(--a-{colors[i % colors.length]}-500)"
					--ac-chip-toggle-pressed-hover-bg="var(--a-{colors[i % colors.length]}-600)"
					value={name}
					selected={selectedInstances.includes(name)}
					onclick={() => {
						// Toggle the selected instance and update the logs
						if (selectedInstances.includes(name)) {
							selectedInstances = selectedInstances.filter((i) => i !== name);
						} else {
							selectedInstances = [...selectedInstances, name];
						}

						if (pause) {
							return;
						}

						// Unsubscribe from the current subscription and subscribe to a new one with the updated filter
						store.unlisten().then(() => {
							if (selectedInstances.length !== 0) {
								store.listen({
									filter: {
										team: team.slug,
										environment: team.environment.environment.name,
										application: team.environment.application.name,
										instances: selectedInstances
									}
								});
							}
						});
					}}
				/>
			{/each}
		</Chips>
		<div class="buttons">
			<Button
				size="small"
				variant="primary"
				onclick={() => {
					if (pause) {
						pause = false;
						// Resume the subscription if it was paused
						store.listen({
							filter: {
								team: team.slug,
								environment: team.environment.environment.name,
								application: team.environment.application.name,
								instances: selectedInstances
							}
						});
					} else {
						pause = true;
						// Pause the subscription
						store.unlisten();
					}
				}}
			>
				{pause ? 'Resume' : 'Pause'}
			</Button>
			<Button
				size="small"
				variant="primary"
				onclick={() => {
					// Clear the logs and unsubscribe from the current subscription
					logs = [];
					if (pause) {
						return;
					}
					if (selectedInstances.length === 0) {
						return;
					}

					store.unlisten().then(() => {
						// Subscribe to a new one with an empty filter
						store.listen({
							filter: {
								team: team.slug,
								environment: team.environment.environment.name,
								application: team.environment.application.name,
								instances: selectedInstances
							}
						});
					});
				}}
			>
				Clear logs
			</Button>
		</div>
	</div>
	<div class="log-wrapper">
		{#each logs.toReversed() as log, i (i)}
			<div class="log-line">
				<div class="date">{format(log.time, 'yyyy-MM-dd HH:mm:ss.SSS')}</div>
				<div class="instance">
					{log.instance}
				</div>
				<div
					style:background-color="var(--a-{colors[
						team.environment.application.instances.nodes.findIndex(
							(instance) => instance.name === log.instance
						) % colors.length
					]}-200)"
					style:min-width="4px"
					style:max-width="4px"
				></div>
				<div class="level">{getLogLevel(log.message)}</div>
				<div>{log.m}</div>
			</div>
		{/each}
	</div>
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
		.buttons {
			display: flex;
			flex-direction: row;
			gap: var(--a-spacing-2);
		}
	}
	.log-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 70vh;
		/* overflow-y: auto; */
	}
	.log-line {
		display: flex;
		flex-direction: row;
		max-width: fit-content;
		font-family: monospace;
		font-size: 0.8rem;
		gap: 0.5rem;
		.date {
			text-align: right;
			white-space: nowrap;
		}
		.instance {
			text-align: center;
			white-space: nowrap;
		}
		.level {
			text-align: center;
			white-space: nowrap;
		}
	}
</style>
