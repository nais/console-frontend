<script lang="ts">
	import { enhance } from '$app/forms';
	import PostgresConfigurationFields from '#lib/domain/postgres/PostgresConfigurationFields.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyShort, Button } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let { EditPostgres } = $derived(data);
	let postgres = $derived($EditPostgres.data?.team.environment.postgres);
	let submitting = $state(false);
</script>

<GraphErrors errors={$EditPostgres.errors} />
{#if postgres}
	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				try {
					await update();
				} finally {
					submitting = false;
				}
			};
		}}
	>
		<BodyShort
			>Update configuration for {postgres.name}. Changes are applied asynchronously.</BodyShort
		>
		<PostgresConfigurationFields
			editing
			cpu={form?.cpu ?? postgres.resources.cpu}
			memory={form?.memory ?? postgres.resources.memory}
			diskSize={form?.diskSize ?? postgres.resources.diskSize}
			highAvailability={form?.highAvailability ?? postgres.highAvailability}
		/>
		{#if form?.error}<Alert variant="error">{form.error}</Alert>{/if}
		<Button type="submit" loading={submitting}>Save changes</Button>
	</form>
{/if}

<style>
	form {
		display: grid;
		gap: var(--ax-space-16);
		max-width: var(--ax-breakpoint-sm);
	}
</style>
