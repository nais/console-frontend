<script lang="ts">
	import { enhance } from '$app/forms';
	import PostgresConfigurationFields from '#lib/domain/postgres/PostgresConfigurationFields.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyShort, Button, Select, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let { CreatePostgresEnvironments } = $derived(data);
	let environments = $derived($CreatePostgresEnvironments.data?.team.environments ?? []);
	let submitting = $state(false);
</script>

<GraphErrors errors={$CreatePostgresEnvironments.errors} />
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
		>Create a Postgres database for {data.teamSlug}. Provisioning is asynchronous.</BodyShort
	>
	<TextField name="name" label="Database name" required value={form?.name ?? ''} />
	<Select
		name="environment"
		label="Environment"
		required
		value={form?.environment ?? environments[0]?.environment.name ?? ''}
	>
		{#each environments as environment (environment.environment.name)}
			<option value={environment.environment.name}>{environment.environment.name}</option>
		{/each}
	</Select>
	<Select
		name="majorVersion"
		label="PostgreSQL version"
		required
		value={form?.majorVersion ?? '18'}
	>
		<option value="18">18</option>
	</Select>
	<PostgresConfigurationFields
		errors={form?.errors}
		cpu={form?.cpu}
		memory={form?.memory}
		diskSize={form?.diskSize}
		highAvailability={form?.highAvailability}
	/>
	{#if form?.error}<Alert variant="error">{form.error}</Alert>{/if}
	<Button type="submit" loading={submitting} disabled={environments.length === 0}>
		Create Postgres
	</Button>
</form>

<style>
	form {
		display: grid;
		gap: var(--ax-space-16);
		max-width: var(--ax-breakpoint-sm);
	}
</style>
