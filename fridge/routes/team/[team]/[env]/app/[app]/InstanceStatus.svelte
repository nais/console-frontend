<script lang="ts">
	import type { AppInstancesStatus } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';

	export let app: AppInstancesStatus;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstancesStatus on App {
				instances @loading {
					state @loading
					message @loading
				}
			}
		`)
	);

	$: states = $data.instances.map((i) => i.state);
	$: total = states.length;
</script>

<div>
	{#if states.includes(PendingValue)}
		<Skeleton variant="rectangle" />
	{:else if total === 0}
		No instances found
	{:else}
		{states.filter((s) => s === 'RUNNING').length} / {total} running
	{/if}
</div>

<style>
	div {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 0.5rem;
	}
</style>
