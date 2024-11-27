<script lang="ts">
	import { Alert, Button } from '@nais/ds-svelte-community';

	type error = { message: string };

	export let size: 'small' | 'medium' = 'medium';
	export let errors: error[] | null;
	export let dismissable = false;

	const pick = (errors: error[]) => {
		return new Set(errors.map((error) => error.message));
	};
</script>

{#if errors && errors.length > 0}
	<Alert variant="error" {size}>
		{#each pick(errors) as error}
			{error}<br />
		{/each}
		{#if dismissable}
			<Button variant="tertiary" size="small" on:click={() => (errors = [])}>Dismiss</Button>
		{/if}
	</Alert>
{/if}
