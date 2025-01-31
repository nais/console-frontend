<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import JobErrorTypeToMessage from '$lib/JobErrorTypeToMessage.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { JobStatusDetailed } = $derived(data);
</script>

<GraphErrors errors={$JobStatusDetailed.errors} />

{#if $JobStatusDetailed.data}
	{@const job = $JobStatusDetailed.data.team.environment.job}
	<h4>Job status</h4>

	<div>
		{#if job.status.errors && job.status.errors.length > 0}
			{#each job.status.errors as error}
				<JobErrorTypeToMessage {error} />
			{/each}
		{:else}
			<Alert variant="info">All nais!</Alert>
		{/if}
	</div>
{/if}
