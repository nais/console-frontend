<script lang="ts">
	import { page } from '$app/state';

	import { graphql } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { BodyShort, Button, Chips, ToggleChip } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
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
		store.subscribe((result) => {
			if (!result.fetching) {
				return;
			}

			if (!result.partial) {
				return;
			}

			if (result.data) {
				if (!selectedInstances.includes(result.data.workloadLog.instance)) {
					console.debug('Log received but not for selected instances:', result.data.workloadLog);
				}
				let m: string | undefined;
				try {
					m = JSON.parse(result.data.workloadLog.message).message;
				} catch (e) {
					console.debug('Error parsing JSON message: ', e);
					m = result.data.workloadLog.message;
				}

				if (m === undefined) {
					m = result.data.workloadLog.message;
				}

				if (m === 'Subscription closed.' && result.data.workloadLog.instance === 'api') {
					console.debug('Subscription closed');
					isPaused = true;
					store.unlisten();
					isStarted = false;
					return;
				}

				let level: string = getLogLevel(result.data.workloadLog.message);

				if (!logLevels.has(level)) {
					logLevels.add(level);
					selectedLogLevels.add(level);
				}

				if (!selectedLogLevels.has(level)) {
					return;
				}

				logs = [...logs, { ...result.data.workloadLog, m }];

				logs = logs
					.sort((a, b) => {
						return new Date(a.time).getTime() - new Date(b.time).getTime();
					})
					.slice(-MAX_LOG_LINES);
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

	let logs: { time: Date; message: string; instance: string; m?: string }[] = $state([]);
	let selectedInstances: string[] = $state([]);

	let isStarted: boolean = $state(false);
	let isPaused: boolean = $state(true);

	const MAX_LOG_LINES = 200;

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

	const colors = ['blue', 'green', 'orange', 'purple', 'limegreen'];

	function getLogLevel(message: string): string {
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
						--ax-bg-accent-moderate="var(--{colors[i % colors.length]}-200)"
						--ax-bg-accent-moderate-hover="var(--{colors[i % colors.length]}-300)"
						--ax-bg-accent-strong-pressed="var(--{colors[i % colors.length]}-500)"
						--ax-bg-accent-strong-hover="var(--{colors[i % colors.length]}-600)"
						value={renderInstanceName(name)}
						selected={selectedInstances.includes(name)}
						onclick={() => {
							if (selectedInstances.includes(name)) {
								selectedInstances = selectedInstances.filter((i) => i !== name);
							} else {
								selectedInstances = [...selectedInstances, name];
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
						<ExternalLink href={logDestination.grafanaURL}>
							View logs in Grafana <ExternalLinkIcon />
						</ExternalLink>
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
							style:background-color="var(--{colors[
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
