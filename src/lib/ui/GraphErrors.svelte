<script lang="ts">
	import { extractGraphQLErrorMessages, logGraphQLErrors } from '$lib/graphql-errors';
	import { Alert, Button } from '@nais/ds-svelte-community';

	type error = {
		message: string;
		extensions?: Record<string, unknown>;
		path?: (string | number)[];
	};

	interface Props {
		size?: 'small' | 'medium';
		errors?: error[] | null;
		dismissable?: boolean;
		/**
		 * Optional operation name for error logging.
		 * Helps with debugging and tracking errors in production.
		 */
		operation?: string;
	}

	let { size = 'medium', errors = $bindable(), dismissable = false, operation }: Props = $props();

	// Log errors when they appear (useful for debugging)
	$effect(() => {
		if (errors && errors.length > 0) {
			logGraphQLErrors(operation || 'Unknown operation', errors);
		}
	});

	const pick = (errors: error[]) => {
		return new Set(extractGraphQLErrorMessages(errors));
	};

	// Check if this is a generic backend error
	const isGenericBackendError = (errors: error[]) => {
		return errors.some((err) =>
			err.message.includes('The server errored out while processing your request')
		);
	};
</script>

{#if errors && errors.length > 0}
	<div>
		<Alert variant="error" {size} style="margin-bottom: 1rem;">
			{#each pick(errors) as error (error)}
				{error}<br />
			{/each}
			{#if isGenericBackendError(errors)}
				<div
					style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--ax-border-error-subtle);"
				>
					<small>
						<strong>Debugging tip:</strong> Check the browser console (F12) for detailed error logs.
						If this issue persists, please report it to the Nais team with the error details from the
						console.
					</small>
				</div>
			{/if}
			{#if dismissable}
				<Button variant="tertiary" size="small" onclick={() => (errors = [])}>Dismiss</Button>
			{/if}
		</Alert>
	</div>
{/if}
