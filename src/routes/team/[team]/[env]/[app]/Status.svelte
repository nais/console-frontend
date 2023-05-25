<script lang="ts">
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import { fragment, graphql } from '$houdini';
	import type { AppInstancesStatus } from '$houdini';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

	export let app: AppInstancesStatus;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstancesStatus on App {
				instances {
					status
				}
			}
		`)
	);

	$: instances = $data.instances;
	$: running = instances.filter((instance) => instance.status === 'Running').length;
	$: total = instances.length;
</script>

<div>
	{#if instances}
		{#if running === total}
			<SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
		{:else}
			<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
		{/if}
		{running} / {total} running
	{:else}
		<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
		0 / 0 running
	{/if}
</div>

<style>
	div {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 1rem;
	}
</style>
