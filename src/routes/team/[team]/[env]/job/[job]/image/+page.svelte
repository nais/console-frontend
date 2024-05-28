<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { Alert } from '@nais/ds-svelte-community';

	let team = $page.params.team;
	let env = $page.params.env;
	let job = $page.params.job;
</script>

<div class="grid">
	<Card columns={12}>
		<Alert variant="info">
			<p>
				Image details for <code>{team}/{env}/{job}</code> are coming soon.
			</p>
		</Alert>
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	code {
		font-size: 0.8rem;
	}
</style>
