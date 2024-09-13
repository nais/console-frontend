<script lang="ts">
	import { PendingValue, State } from '$houdini';
	import Card from '$lib/Card.svelte';
	import JobErrorTypeToMessage from '$lib/JobErrorTypeToMessage.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ JobStatusDetailed } = data);
</script>

<Card>
	{#if $JobStatusDetailed.errors}
		<Alert variant="error">
			{#each $JobStatusDetailed.errors as error}
				{error.message}
			{/each}
		</Alert>
	{/if}
	{#if $JobStatusDetailed.data}
		{#if $JobStatusDetailed.data.naisjob.name === PendingValue}
			<Skeleton variant="rectangle" />
		{:else}
			{#if $JobStatusDetailed.data.naisjob.status.state}
				<div class="header">
					<div class="icon">
						{#if $JobStatusDetailed.data.naisjob.status.state === State.NAIS}
							<Nais alt="nais" size="1.5rem" style="color: var(--a-icon-success)" />
						{:else if $JobStatusDetailed.data.naisjob.status.state === State.FAILING}
							<WarningIcon size="1.5rem" style="color: var(--a-icon-danger)" />
						{:else if $JobStatusDetailed.data.naisjob.status.state === State.NOTNAIS}
							<Nais alt="notnais" size="1.5rem" style="color: var(--a-icon-warning)" />
						{:else if $JobStatusDetailed.data.naisjob.status.state === State.UNKNOWN}
							<UnknownIcon size="1.5rem" style="color: var(--a-icon-warning)" />
						{/if}
					</div>
					<h4>Job status</h4>
				</div>
			{/if}
			<div>
				{#if $JobStatusDetailed.data.naisjob.status.errors && $JobStatusDetailed.data.naisjob.status.errors.length > 0}
					{#each $JobStatusDetailed.data.naisjob.status.errors as error}
						<JobErrorTypeToMessage {error} />
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
