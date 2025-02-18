<script lang="ts">
	import AppErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { AppNotificationState } = $derived(data);
</script>

<Card>
	<div>
		<GraphErrors errors={$AppNotificationState.errors} />
	</div>
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
</Card>
