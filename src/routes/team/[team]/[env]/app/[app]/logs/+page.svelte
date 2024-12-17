<script lang="ts">
	import { page } from '$app/state';
	import LogViewer from '$lib/LogViewer.svelte';
	import { Button, Chips, Fieldset, ToggleChip } from '@nais/ds-svelte-community';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageData } from './$houdini';

	let running = $state(true);
	let fetching = $state(false);

	let team = $derived(page.params.team);
	let env = $derived(page.params.env);
	let app = $derived(page.params.app);

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let Instances = $derived(data.Instances);
	let instanceNames: Set<string> = data.instanceNames;

	function toggleInstance(i: string) {
		if (instanceNames.has(i)) {
			instanceNames.delete(i);
		} else {
			instanceNames.add(i);
		}
		if (!running) {
			running = true;
		}
	}

	function renderInstanceName(i: string) {
		return i.slice(app.length + 1);
	}

	const viewOptions = ['Time', 'Level', 'Name'];
	let selectedViewOptions = new SvelteSet(viewOptions);
	function toggleSelectedViewOptions(option: string) {
		if (selectedViewOptions.has(option)) {
			selectedViewOptions.delete(option);
		} else {
			selectedViewOptions.add(option);
		}
	}
</script>

{#if $Instances.data}
	{@const instances = $Instances.data.team.environment.application.instances.nodes}
	<div class="topbar">
		<div class="instances">
			{#if $Instances.data}
				<Fieldset style="flex-grow: 1;">
					{#snippet legend()}
						Instances
					{/snippet}
					<div class="instance-button">
						<Chips>
							{#each instances as instance}
								{@const name = instance.name}
								<ToggleChip
									value={renderInstanceName(name)}
									selected={instanceNames.has(name)}
									onclick={() => toggleInstance(name)}
								/>
							{/each}
						</Chips>

						<Button
							size="small"
							variant="primary"
							disabled={instanceNames.size === instances.length}
							onclick={() => {
								if (instanceNames.size === instances.length) {
									return;
								}
								instances.forEach((i) => instanceNames.add(i.name));
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
					onclick={() => {
						running = false;
					}}
				>
					Pause
				</Button>
			{:else}
				<Button
					onclick={() => {
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
					onclick={() => toggleSelectedViewOptions(option)}
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
