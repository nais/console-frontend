<script lang="ts">
	import Card from '$lib/Card.svelte';
	import TeamDeployments from '$lib/components/TeamDeployments.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Deployments } = data);
</script>

{#if $Deployments.errors}
	<Alert variant="error">
		{#each $Deployments.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $Deployments.data}
	<Card>
		<TeamDeployments team={$Deployments.data.team} />
	</Card>
{/if}
