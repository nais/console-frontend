<script lang="ts">
	import { Alert, Button } from '@nais/ds-svelte-community';

	type error = { message: string };

	interface Props {
		size?: 'small' | 'medium';
		errors?: error[] | null;
		dismissable?: boolean;
	}

	let { size = 'medium', errors = $bindable(), dismissable = false }: Props = $props();

	const pick = (errors: error[]) => {
		return new Set(errors.map((error) => error.message));
	};
</script>

{#if errors && errors.length > 0}
	<div>
		<Alert variant="error" {size} style="margin-bottom: 1rem;">
			{#each pick(errors) as error (error)}
				{error}<br />
			{/each}
			{#if dismissable}
				<Button variant="tertiary" size="small" onclick={() => (errors = [])}>Dismiss</Button>
			{/if}
		</Alert>
	</div>
{/if}
