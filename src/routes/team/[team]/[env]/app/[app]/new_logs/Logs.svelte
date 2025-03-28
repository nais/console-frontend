<script lang="ts">
	import { graphql } from '$houdini';
	import { Chips, ToggleChip } from '@nais/ds-svelte-community';
	import { onDestroy } from 'svelte';

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

	const store = graphql(`
		subscription NewLogsSubscription($filter: WorkloadLogSubscriptionFilter!) {
			workloadLog(filter: $filter) {
				time
				message
				instance
			}
		}
	`);

	let logs: { time: Date; message: string; instance: string; m?: string }[] = $state([]);
	let selectedInstances: string[] = $state([]);

	store.subscribe((result) => {
		if (!result.fetching) {
			return;
		}
		if (result.data) {
			if (!selectedInstances.includes(result.data.workloadLog.instance)) {
				console.log('wat', result);
			}
			let m;
			try {
				m = JSON.parse(result.data.workloadLog.message).message;
			} catch (e) {
				// console.log(result.data.workloadLog.message);
			}
			logs = [...logs, { ...result.data.workloadLog, m }].sort(
				(a, b) => a.time.getTime() - b.time.getTime()
			);
		}
	});

	onDestroy(() => {
		store.unlisten();
	});

	const colors = ['blue', 'green', 'orange', 'purple', 'limegreen'];
</script>

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
				if (selectedInstances.includes(name)) {
					selectedInstances = selectedInstances.filter((i) => i !== name);
				} else {
					selectedInstances = [...selectedInstances, name];
				}

				store.unlisten().then(() => {
					logs = [];
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

{#each logs.toReversed() as log, i (i)}
	<div
		style:background-color="var(--a-{colors[
			team.environment.application.instances.nodes.findIndex(
				(instance) => instance.name === log.instance
			) % colors.length
		]}-200)"
	>
		{log.time.toLocaleTimeString()}: {log.m}
	</div>
{/each}
