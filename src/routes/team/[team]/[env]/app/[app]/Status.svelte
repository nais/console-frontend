<script lang="ts">
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import { fragment, graphql, PendingValue } from '$houdini';
	import type { AppInstancesStatus } from '$houdini';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Loading from '$lib/Loading.svelte';

	export let app: AppInstancesStatus;
	$: data = fragment(
		app,
		graphql(`
			fragment AppInstancesStatus on App {
				instances @loading {
					status @loading
				}
			}
		`)
	);

	$: statuses = $data.instances.map((i) => i.status);
	$: total = statuses.length;
</script>

<div>
	{#if statuses.includes(PendingValue)}
		<Loading />
	{:else}
		{#if statuses.filter((s) => s === 'Running').length === total && total !== 0}
			<SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
		{:else}
			<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
		{/if}
		{#if total === 0}
			No instances found
		{:else}
			{statuses.filter((s) => s === 'Running').length} / {total} running
		{/if}
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
