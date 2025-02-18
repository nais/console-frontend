<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import LogViewer from '$lib/LogViewer.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import {
		Button,
		Chips,
		ToggleChip,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageData } from './$houdini';

	let running = $state(true);
	let fetching = $state(false);

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { RunsWithPodNames, selected, teamSlug } = $derived(data);

	let result = $derived($RunsWithPodNames.data);

	// svelte-ignore state_referenced_locally
	let pods: Set<string> = $state(new Set([selected]));
	let selectedRun: string = $state('');
	function setSelected(name: string) {
		pods = new Set(
			$RunsWithPodNames.data?.team.environment.job?.runs.nodes
				.filter((run) => run.name === name)
				.map((run) => run.instances.nodes.map((instance) => instance.name))
				.flatMap((pod) => pod)
		);
		running = true;
	}

	$effect(() => {
		if (selectedRun == '') {
			selectedRun = selected;
			setSelected(selected);
		}
	});

	function renderRunName(i: string) {
		if ($RunsWithPodNames.data?.team.environment.job.name) {
			if (i.startsWith($RunsWithPodNames.data?.team.environment.job.name ?? '')) {
				return i.slice($RunsWithPodNames.data?.team.environment.job.name.length + 1);
			}
		}
		return i;
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

<PageHeader {...urlToPageHeader(page.url)} />
{#if result}
	{@const runs = result.team.environment.job.runs.nodes}
	<div class="topbar">
		<div class="instances">
			{#if runs.length > 0}
				<ToggleGroup size="small" bind:value={selectedRun} onchange={setSelected}>
					{#each runs as run (run.id)}
						{#if run.instances.nodes.length > 0}
							{@const name = run.name}
							<ToggleGroupItem value={name}>{renderRunName(name)}</ToggleGroupItem>
						{/if}
					{/each}
				</ToggleGroup>
			{/if}
		</div>
		<div>
			{#if fetching}
				<Button
					onclick={() => {
						running = false;
					}}>Pause</Button
				>
			{:else}
				<Button
					onclick={() => {
						running = true;
					}}>Restart</Button
				>
			{/if}
		</div>
	</div>
	{#if fetching}
		<div style:font-size="12px" style:text-align="right" style:width="100%">Streaming logs...</div>
	{/if}
	<Chips size="small">
		{#each viewOptions as option (option)}
			<ToggleChip
				value={option}
				selected={selectedViewOptions.has(option)}
				onclick={() => toggleSelectedViewOptions(option)}
			/>
		{/each}
	</Chips>
	<LogViewer
		job={result.team.environment.job.name}
		env={result.team.environment.name}
		team={teamSlug}
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
