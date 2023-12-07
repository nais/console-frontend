<script lang="ts">
	import { PendingValue } from '$houdini';
	import ErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import Card from '$lib/Card.svelte';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ AppNotificationState } = data);
</script>

<Card>
	{#if $AppNotificationState.errors}
		<Alert variant="error">
			{#each $AppNotificationState.errors as error}
				{error.message}
			{/each}
		</Alert>
	{/if}
	{#if $AppNotificationState.data}
		<h4>Application status</h4>
		{#if $AppNotificationState.data.app.name === PendingValue}
			<Skeleton variant="text" />
		{:else}
			<div>
				{#if $AppNotificationState.data.app.appState.errors && $AppNotificationState.data.app.appState.errors.length > 0}
					{#each $AppNotificationState.data.app.appState.errors as error}
						<ErrorTypeToMessage {error} />
					{/each}
				{:else}
					<Alert variant="info">All nais!</Alert>
				{/if}
			</div>
		{/if}
	{/if}
</Card>
