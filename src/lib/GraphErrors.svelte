<script lang="ts">
	import { Alert, Button } from '@nais/ds-svelte-community';

	type error = { message: string };

	export let size: 'small' | 'medium' = 'medium';
	export let errors: error[];
	export let dismissable = false;

	const pick = (errors: error[]) => {
		const unique: string[] = [];
		errors.forEach((error) => {
			if (!unique.includes(error.message)) {
				unique.push(error.message);
			}
		});
		return unique;
	};
</script>

{#if errors.length > 0}
	<Alert variant="error" {size}>
		{#each pick(errors) as error}
			{error}
		{/each}
		{#if dismissable}
			<Button variant="tertiary" size="small" on:click={() => (errors = [])}>Dismiss</Button>
		{/if}
	</Alert>
{/if}
