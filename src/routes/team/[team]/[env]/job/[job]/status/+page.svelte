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
	let result = $derived($JobStatusDetailed.data);
	let errors = $derived($JobStatusDetailed.errors);
</script>

<GraphErrors {errors} />

{#if result}
	{@const job = result.team.environment.job}

	<div>
		{#if job.status.errors && job.status.errors.length > 0}
			{#each job.status.errors as error (error)}
				<JobErrorTypeToMessage {error} />
			{/each}
		{:else}
			<Alert variant="info">All nais!</Alert>
		{/if}
	</div>
{/if}
