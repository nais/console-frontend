<script lang="ts">
	import Card from '$lib/Card.svelte';
	import WorkloadDeployments from '$lib/components/WorkloadDeployments.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ JobDeploys } = data);
</script>

{#if $JobDeploys.errors}
	<Alert variant="error">
		{#each $JobDeploys.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $JobDeploys.data}
	<Card>
		<Card>
			<WorkloadDeployments workload={$JobDeploys.data.team.environment.workload} />
		</Card>
	</Card>
{/if}
