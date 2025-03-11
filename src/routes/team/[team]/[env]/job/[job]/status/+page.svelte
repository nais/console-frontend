<script lang="ts">
	import JobErrorTypeToMessage from '$lib/JobErrorTypeToMessage.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { JobStatusDetailed } = $derived(data);
	let result = $derived($JobStatusDetailed.data);
	//let errors = $derived($JobStatusDetailed.errors);
</script>

<!--GraphErrors {errors} /-->

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
