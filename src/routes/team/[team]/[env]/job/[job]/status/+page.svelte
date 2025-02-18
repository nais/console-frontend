<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import JobErrorTypeToMessage from '$lib/JobErrorTypeToMessage.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
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

<PageHeader {...urlToPageHeader(page.url)} />

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
