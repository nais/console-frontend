<script lang="ts">
	import { page } from '$app/stores';
	import LogViewer from '$lib/LogViewer.svelte';
	import { Button, Chips, Fieldset, ToggleChip } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	let running = true;
	let fetching = false;

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;

	export let data: PageData;

	$: ({ Instances, instanceNames } = data);

	function toggleInstance(i: string) {
		if (instanceNames.has(i)) {
			instanceNames.delete(i);
		} else {
			instanceNames.add(i);
		}
		instanceNames = instanceNames;
		if (!running) {
			running = true;
		}
	}

	function renderInstanceName(i: string) {
		return i.slice(app.length + 1);
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

{#if $Instances.data}
	<div class="topbar">
		<div class="instances">
			{#if $Instances.data}
				<Fieldset style="flex-grow: 1;">
					<svelte:fragment slot="legend">Instances</svelte:fragment>
					<div class="instance-button">
						<Chips>
							{#each $Instances.data.app.instances as instance}
								{@const name = instance.name}
								<ToggleChip
									value={renderInstanceName(name)}
									selected={instanceNames.has(name)}
									on:click={() => toggleInstance(name)}
								/>
							{/each}
						</Chips>

						<Button
							size="small"
							variant="primary"
							disabled={instanceNames.size === $Instances.data?.app.instances.length}
							on:click={() => {
								if (instanceNames.size === $Instances.data?.app.instances.length) {
									return;
								}
								$Instances.data?.app.instances.forEach((i) => instanceNames.add(i.name));
								instanceNames = instanceNames;
							}}
						>
							Select all
						</Button>
					</div>
				</Fieldset>
			{/if}
		</div>
		<div>
			{#if fetching}
				<Button
					on:click={() => {
						running = false;
					}}
				>
					Pause
				</Button>
			{:else}
				<Button
					on:click={() => {
						running = true;
					}}
				>
					Restart
				</Button>
			{/if}
		</div>
	</div>
	<div style="font-size: 12px; text-align:right; width: 100%">
		{#if fetching}
			Streaming logs...
		{:else}
			Streaming paused.
		{/if}
	</div>
	<div class="chips">
		Columns:
		<Chips size="small">
			{#each viewOptions as option}
				<ToggleChip
					value={option}
					selected={selectedViewOptions.has(option)}
					on:click={() => toggleSelectedViewOptions(option)}
				/>
			{/each}
		</Chips>
	</div>
	<LogViewer
		{app}
		{env}
		{team}
		{running}
		showName={selectedViewOptions.has('Name')}
		showTime={selectedViewOptions.has('Time')}
		showLevel={selectedViewOptions.has('Level')}
		instances={instanceNames}
		on:fetching={(e) => {
			fetching = e.detail;
			if (!fetching) {
				running = false;
			}
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
		gap: 1rem;
	}
	.instances {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		flex-grow: 1;
	}
	.chips {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		padding-top: 0.8rem;
	}

	.instance-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
</style>
