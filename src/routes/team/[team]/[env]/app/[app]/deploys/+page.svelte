<script lang="ts">
	import Card from '$lib/Card.svelte';
	import WorkloadDeployments from '$lib/components/WorkloadDeployments.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ AppDeploys } = data);
</script>

{#if $AppDeploys.errors}
	<Alert variant="error">
		{#each $AppDeploys.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $AppDeploys.data}
	<Card>
		<WorkloadDeployments workload={$AppDeploys.data.team.environment.workload} />
	</Card>
{/if}
