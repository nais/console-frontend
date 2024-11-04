<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Deploys from '$lib/components/Deploys.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ TeamDeployments } = data);
</script>

{#if $TeamDeployments.errors}
	<Alert variant="error">
		{#each $TeamDeployments.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $TeamDeployments.data}
	<Card>
		<Deploys team={$TeamDeployments.data.team} />
	</Card>
{/if}
