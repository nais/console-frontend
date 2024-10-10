<script lang="ts">
	import { PendingValue, State } from '$houdini';
	import ErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import Card from '$lib/Card.svelte';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

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
		{#if $AppNotificationState.data.app.name === PendingValue}
			<Skeleton variant="rectangle" />
		{:else}
			{#if $AppNotificationState.data.app.status.state}
				<div class="header">
					<div class="icon">
						{#if $AppNotificationState.data.app.status.state === State.NAIS}
							<Nais alt="nais" size="1.5rem" style="color: var(--a-icon-success)" />
						{:else if $AppNotificationState.data.app.status.state === State.FAILING}
							<WarningIcon size="1.5rem" style="color: var(--a-icon-danger)" />
						{:else if $AppNotificationState.data.app.status.state === State.NOTNAIS}
							<Nais alt="notnais" size="1.5rem" style="color: var(--a-icon-warning)" />
						{:else if $AppNotificationState.data.app.status.state === State.UNKNOWN}
							<UnknownIcon size="1.5rem" style="color: var(--a-icon-warning)" />
						{/if}
					</div>
					<h4>Application status</h4>
				</div>
			{/if}
			<div>
				{#if $AppNotificationState.data.app.status.errors && $AppNotificationState.data.app.status.errors.length > 0}
					{#each $AppNotificationState.data.app.status.errors as error}
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
