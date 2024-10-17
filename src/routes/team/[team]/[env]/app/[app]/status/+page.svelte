<script lang="ts">
	import AppErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import Card from '$lib/Card.svelte';
	import { Alert } from '@nais/ds-svelte-community';
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
		{@const app = $AppNotificationState.data.team.environment.application}
		<h4>Application status</h4>

		<div>
			{#if app.status.errors && app.status.errors.length > 0}
				{#each app.status.errors as error}
					<AppErrorTypeToMessage {error} />
				{/each}
			{:else}
				<Alert variant="info">All nais!</Alert>
			{/if}
		</div>
	{/if}
</Card>
