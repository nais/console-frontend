<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Feedback from '$lib/components/Feedback.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import Deploys from './Deploys.svelte';
	import Teams from './Teams.svelte';

	let feedbackOpen = false;
</script>

<svelte:head><title>Console</title></svelte:head>

<div class="page">
	<div class="feedback">
		<Button
			variant="secondary"
			size="xsmall"
			on:click={() => {
				feedbackOpen = true;
			}}>Feedback</Button
		>
	</div>
	<div class="grid">
		<Card columns={4} rows={1}>
			<Teams />
		</Card>

		<Card columns={8} rows={2}>
			<Deploys />
		</Card>
	</div>
</div>

{#if feedbackOpen}
	<Feedback bind:open={feedbackOpen} />
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.feedback {
		display: flex;
		justify-content: flex-end;
		padding: 0.5rem 0;
	}
</style>
