<script lang="ts">
	import { PendingValue, State } from '$houdini';
	import ErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ AppStatusDetailed } = data);
	$: status = $AppStatusDetailed.data;
</script>

<Card>
	{#if $AppStatusDetailed.errors}
		<Alert variant="error">
			{#each $AppStatusDetailed.errors as error}
				{error.message}
			{/each}
		</Alert>
	{/if}
	{#if status}
		{#if status.app.name === PendingValue}
			<Loading />
		{:else}
			{#if status.app.appState.state}
				<div class="header">
					<div class="icon">
						{#if status.app.appState.state === State.NAIS}
							<Nais alt="nais" size="2rem" style="color: var(--a-icon-success)" />
						{:else if status.app.appState.state === State.FAILING}
							<WarningIcon size="2rem" style="color: var(--a-icon-danger)" />
						{:else if status.app.appState.state === State.NOTNAIS}
							<Nais alt="notnais" size="2rem" style="color: var(--a-icon-warning)" />
						{:else if status.app.appState.state === State.UNKNOWN}
							<UnknownIcon size="2rem" style="color: var(--a-icon-warning)" />
						{/if}
					</div>
					<h4>Application status for {status.app.name}</h4>
				</div>
			{/if}
			<div>
				{#if status.app.appState.errors && status.app.appState.errors.length > 0}
					{#each status.app.appState.errors as error}
						<ErrorTypeToMessage {error} />
					{/each}
				{:else}
					<Alert variant="info">All nais!</Alert>
				{/if}
			</div>
		{/if}
	{/if}
</Card>

<style>
	.header {
		display: flex;
		flex-direction: row;
	}
	.icon {
		padding: 0rem 1rem 0rem 0rem;
	}
</style>
