<script lang="ts">
	import { page } from '$app/stores';
	import LogViewer from '$lib/LogViewer.svelte';
	import {
		Button,
		Chips,
		ToggleChip,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	let running = true;
	let fetching = false;

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: job = $page.params.job;

	export let data: PageData;

	$: ({ RunsWithPodNames, selected } = data);

	let pods: Set<string> = new Set([selected]);
	$: selectedRun = selected;
	function setSelected(name: string) {
		pods = new Set(
			$RunsWithPodNames.data?.team.environment.job?.runs.nodes
				.filter((run) => run.name === name)
				.map((run) => run.instances.nodes.map((instance) => instance.name))
				.flatMap((pod) => pod)
		);
		console.log(pods);
		running = true;
	}
	$: setSelected(selectedRun);

	function renderRunName(i: string) {
		if (i.startsWith(job)) {
			return i.slice(job.length + 1);
		} else {
			return i;
		}
	}

	const viewOptions = ['Time', 'Level', 'Name'];
	let selectedViewOptions = new Set(viewOptions);
	function toggleSelectedViewOptions(option: string) {
		if (selectedViewOptions.has(option)) {
			selectedViewOptions.delete(option);
		} else {
			selectedViewOptions.add(option);
		}
		selectedViewOptions = selectedViewOptions;
	}
</script>

{#if $RunsWithPodNames.data}
	{@const runs = $RunsWithPodNames.data.team.environment.job.runs.nodes}
	<div class="topbar">
		<div class="instances">
			{#if runs.length > 0}
				{#if pods.size > 0}
					<ToggleGroup size="small" bind:value={selectedRun}>
						{#each runs as run}
							{#if run.instances.nodes.length > 0}
								{@const name = run.name}
								<ToggleGroupItem value={name}>{renderRunName(name)}</ToggleGroupItem>
							{/if}
						{/each}
					</ToggleGroup>
				{/if}
			{/if}
		</div>
		<div>
			{#if fetching}
				<Button
					on:click={() => {
						running = false;
					}}>Pause</Button
				>
			{:else}
				<Button
					on:click={() => {
						running = true;
					}}>Restart</Button
				>
			{/if}
		</div>
	</div>
	{#if fetching}
		<div style="font-size: 12px; text-align:right; width: 100%">Streaming logs...</div>
	{/if}
	<Chips size="small">
		{#each viewOptions as option}
			<ToggleChip
				value={option}
				selected={selectedViewOptions.has(option)}
				on:click={() => toggleSelectedViewOptions(option)}
			/>
		{/each}
	</Chips>
	<LogViewer
		{job}
		{env}
		{team}
		{running}
		showName={selectedViewOptions.has('Name')}
		showTime={selectedViewOptions.has('Time')}
		showLevel={selectedViewOptions.has('Level')}
		instances={pods}
		on:fetching={(e) => {
			fetching = e.detail;
		}}
		on:scrolledUp={() => (running = false)}
	/>
{/if}

<style>
	.topbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	.instances {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
</style>
