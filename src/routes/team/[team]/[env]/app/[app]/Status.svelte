<script lang="ts">
	import { PendingValue, State, fragment, graphql, type AppState } from '$houdini';
	import ErrorTypeToMessage from '$lib/ErrorTypeToMessage.svelte';
	import Loading from '$lib/Loading.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

	export let app: AppState;
	$: data = fragment(
		app,
		graphql(`
			fragment AppState on App {
				appState @loading {
					state @loading
					errors @loading
				}
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
	{#if $data.appState.state === PendingValue}
		<Loading />
	{:else if $data.appState.state}
		<div class="icon">
			{#if $data.appState.state === State.NAIS}
				<Nais size="2rem" style="color: var(--a-icon-success)" />
			{:else if $data.appState.state === State.FAILING}
				<WarningIcon size="2rem" style="color: var(--a-icon-danger)" />
			{:else if $data.appState.state === State.NOTNAIS}
				<Nais size="2rem" style="color: var(--a-icon-warning)" />
			{:else if $data.appState.state === State.UNKNOWN}
				<UnknownIcon size="2rem" style="color: var(--a-icon-warning)" />
			{/if}
		</div>
		{#if $data.appState.errors}
			{#each $data.appState.errors as error}
				<ErrorTypeToMessage {error} />
			{/each}
		{/if}
		<!--{#if $data.instances}
			{#each $data.instances as instance}
				{instance.message}
			{/each}
		{/if}-->
	{/if}
</div>

<style>
	div {
		display: flex;
		flex-direction: row;
	}
	.icon {
		padding: 0rem 1rem 0rem 0rem;
	}
</style>
