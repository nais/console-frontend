<script lang="ts">
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import { fragment, graphql, PendingValue } from '$houdini';
	import type { AppInstancesStatus } from '$houdini';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Loading from '$lib/Loading.svelte';
	import Nais from '$lib/icons/Nais.svelte';

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
		<Loading />
	{:else}
		{#if states.filter((s) => s === 'RUNNING').length === total && total !== 0}
			<Nais size="1.5rem" style="color: var(--a-icon-success)" />
		{:else}
			<WarningIcon size="1.5rem" style="color: var(--a-icon-warning)" />
		{/if}
		{#if total === 0}
			No instances found
		{:else}
			<!--{states.filter((s) => s === 'RUNNING').length} / {total} running-->
			Application is nais
		{/if}
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
