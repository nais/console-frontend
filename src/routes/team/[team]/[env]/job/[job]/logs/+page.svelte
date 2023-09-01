<script lang="ts">
	import { page } from '$app/stores';
	import LogViewer from '$lib/LogViewer.svelte';
	import { Button, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
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
			$RunsWithPodNames.data?.naisjob?.runs
				.filter((run) => run.name === name)
				.map((run) => run.podNames)
				.flatMap((pod) => pod)
		);
	}
	$: setSelected(selectedRun);
</script>

<div class="topbar">
	<div class="instances">
		{#if $RunsWithPodNames.data}
			<ToggleGroup size="small" bind:value={selectedRun}>
				{#each $RunsWithPodNames.data.naisjob.runs as run}
					{@const name = run.name}
					<ToggleGroupItem value={name}>{name}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
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

<LogViewer
	{job}
	{env}
	{team}
	{running}
	instances={pods}
	on:fetching={(e) => {
		fetching = e.detail;
	}}
	on:scrolledUp={() => (running = false)}
/>

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
