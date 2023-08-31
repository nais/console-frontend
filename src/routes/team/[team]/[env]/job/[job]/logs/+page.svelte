<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Chips, ToggleChip } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	let running = true;
	let fetching = false;

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: job = $page.params.job;
	$: run = $page.params.run;

	export let data: PageData;

	$: ({ RunsWithPodNames, runNames } = data);

	$: console.log(runNames);

	function toggleRuns(i: string) {
		if (runNames.has(i)) {
			runNames.delete(i);
		} else {
			runNames.add(i);
		}
		runNames = runNames;
		if (!running) {
			running = true;
		}
	}

	function renderRunName(i: string) {
		return i.slice(job.length + 1);
	}
</script>

{#if $RunsWithPodNames.data}
	<div class="topbar">
		<div class="instances">
			{#if $RunsWithPodNames.data}
				<Chips>
					{#each $RunsWithPodNames.data.naisjob.runs as run}
						{@const name = run.name}
						<ToggleChip value={name} key={name} on:click={() => toggleInstance(name)}
							>{renderRunName(name)}</ToggleChip
						>
					{/each}
				</Chips>
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
	<!--LogViewer
		{job}
		{env}
		{team}
		{running}
		instances={runNames}
		on:fetching={(e) => {
			fetching = e.detail;
		}}
		on:scrolledUp={() => (running = false)}
	/-->
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
