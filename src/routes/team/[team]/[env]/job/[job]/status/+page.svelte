<script lang="ts">
	import IconWithText from '$lib/components/IconWithText.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import JobErrorTypeToMessage from '$lib/JobErrorTypeToMessage.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import { BellIcon } from '@nais/ds-svelte-community/icons';
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
	<div class="header">
		<IconWithText icon={BellIcon} text="Status" size="large" />
	</div>

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

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
</style>
