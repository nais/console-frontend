<script lang="ts">
	import AppErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { AppNotificationState } = $derived(data);
</script>

<!--GraphErrors errors={$AppNotificationState.errors} /-->

{#if $AppNotificationState.data}
	{@const app = $AppNotificationState.data.team.environment.application}

	<div>
		{#if app.status.errors && app.status.errors.length > 0}
			{#each app.status.errors as error (error)}
				<AppErrorTypeToMessage {error} />
			{/each}
		{:else}
			<Alert variant="info">All nais!</Alert>
		{/if}
	</div>
{/if}
