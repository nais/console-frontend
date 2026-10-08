<script lang="ts">
	import { enhance } from '$app/forms';
	import PostgresConfigurationFields from '#lib/domain/postgres/PostgresConfigurationFields.svelte';
	import { quantityInUnits } from '#lib/domain/postgres/forms.js';
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
			errors={form?.errors}
			editing
			cpu={form?.cpu ?? quantityInUnits(postgres.resources.cpu, 'cores')}
			memory={form?.memory ?? quantityInUnits(postgres.resources.memory, 'GiB')}
			diskSize={form?.diskSize ?? quantityInUnits(postgres.resources.diskSize, 'GiB')}
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
