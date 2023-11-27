<script lang="ts">
	import { PendingValue } from '$houdini';
	import ErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import Card from '$lib/Card.svelte';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
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
		<h4>Application status</h4>
		{#if status.app.name === PendingValue}
			<Skeleton variant="text" />
		{:else}
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
