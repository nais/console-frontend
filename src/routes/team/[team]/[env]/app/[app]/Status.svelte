<script lang="ts">
	import { fragment, graphql, PendingValue, type AppStatus } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Loading from '$lib/Loading.svelte';

	export let app: AppStatus;
	$: data = fragment(
		app,
		graphql(`
			fragment AppStatus on App {
				state @loading
				messages @loading
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
	{#if $data.state == PendingValue}
		<Loading />
	{:else if $data.state === 'NAIS'}
		<div class="icon">
			<Nais size="2rem" style="color: var(--a-icon-success)" />
		</div>
		<div class="message">
			All nais
			{#if $data.messages && $data.messages.length > 0}
				{#each $data.messages as message}
					{message}.<br />
				{/each}
			{/if}
		</div>
	{:else if $data.state === 'FAILING'}
		<div class="icon">
			<WarningIcon size="2rem" style="color: var(--a-icon-danger)" />
		</div>
		<div class="message">
			{#if $data.messages && $data.messages.length > 0}
				{#each $data.messages as message}
					{message}.<br />
				{/each}
			{/if}
		</div>
	{:else if $data.state === 'NOTNAIS'}
		<div class="icon">
			<Nais size="2rem" style="color: var(--a-icon-warning)" />
		</div>
		<div class="message">
			{#if $data.messages && $data.messages.length > 0}
				{#each $data.messages as message}
					{message}.<br />
				{/each}
			{/if}
		</div>
	{:else if $data.state === 'UNKNOWN'}
		<div class="icon">
			<UnknownIcon size="2rem" style="color: var(--a-icon-warning)" />
		</div>
		<div class="message">
			{#if $data.messages && $data.messages.length > 0}
				{#each $data.messages as message}
					{message}.<br />
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	div {
		display: flex;
		flex-direction: row;
	}
	.message {
		display: flex;
		flex-direction: column;
	}
	.icon {
		padding: 0rem 1rem 0rem 0rem;
	}
</style>
