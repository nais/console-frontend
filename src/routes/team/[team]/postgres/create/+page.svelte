<script lang="ts">
	import { enhance } from '$app/forms';
	import LabelRows from '#lib/domain/labels/LabelRows.svelte';
	import { labelRowsHaveErrors, type LabelRow } from '#lib/domain/labels/labels.js';
	import PostgresConfigurationFields from '#lib/domain/postgres/PostgresConfigurationFields.svelte';
	import PostgresExtensionFields from '#lib/domain/postgres/PostgresExtensionFields.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyShort, Button, Heading, Select, TextField } from '@nais/ds-svelte-community';
	import { untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let { CreatePostgresEnvironments } = $derived(data);
	let environments = $derived(
		($CreatePostgresEnvironments.data?.team.environments ?? []).filter(
			(environment) => !!environment.gcpProjectID
		)
	);
	let environmentSelection = $state.raw<{ name: string; form: PageProps['form'] }>();
	let environmentChanged = $derived(!!environmentSelection && environmentSelection.form === form);
	let selectedEnvironment = $derived(
		environmentChanged && environmentSelection
			? environmentSelection.name
			: environments.some((environment) => environment.environment.name === form?.environment)
				? (form?.environment ?? '')
				: (environments[0]?.environment.name ?? '')
	);
	let selectedOptions = $derived(
		data.postgresOptions.find((entry) => entry.environment === selectedEnvironment)
	);
	let options = $derived(selectedOptions?.options);
	let retainedForm = $derived(
		!environmentChanged && form?.environment === selectedEnvironment ? form : null
	);
	let majorVersion = $derived(
		retainedForm?.majorVersion ?? options?.postgresMajorVersions.defaultValues?.[0] ?? ''
	);
	let submitting = $state(false);
	let labelRows = $state<LabelRow[]>(untrack(() => form?.labelRows ?? [{ key: '', value: '' }]));
	let labelsInvalid = $derived(labelRowsHaveErrors(labelRows));
	const uid = $props.id();
</script>

<GraphErrors errors={$CreatePostgresEnvironments.errors} />
{#if !$CreatePostgresEnvironments.errors?.length && environments.length === 0}
	<Alert variant="warning">Postgres is only available in GCP environments.</Alert>
{:else if environments.length > 0}
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
			value={selectedEnvironment}
			onchange={(event) => {
				environmentSelection = { name: event.currentTarget.value, form };
			}}
		>
			{#each environments as environment (environment.environment.name)}
				<option value={environment.environment.name}>{environment.environment.name}</option>
			{/each}
		</Select>
		{#if environmentChanged}
			<Alert variant="info" role="status">
				PostgreSQL version and extensions have been reset to the selected environment's defaults.
			</Alert>
		{/if}
		<GraphErrors errors={selectedOptions?.errors} />
		{#if options && !selectedOptions?.errors?.length}
			{#if !options.postgresMajorVersions.values.length}
				<Alert variant="error">No PostgreSQL versions are available in this environment.</Alert>
			{/if}
			{#key selectedEnvironment}
				<Select name="majorVersion" label="PostgreSQL version" required value={majorVersion}>
					<option value="" disabled>Select a PostgreSQL version</option>
					{#each options.postgresMajorVersions.values as version (version)}
						<option value={version}>{version}</option>
					{/each}
				</Select>
				<PostgresExtensionFields
					available={options.postgresExtensions.values}
					selected={retainedForm?.extensions ?? options.postgresExtensions.defaultValues ?? []}
				/>
			{/key}
		{:else if !selectedOptions?.errors?.length}
			<Alert variant="error">Could not load Postgres options for this environment.</Alert>
		{/if}
		<PostgresConfigurationFields
			errors={form?.errors}
			cpu={form?.cpu}
			memory={form?.memory}
			diskSize={form?.diskSize}
			highAvailability={form?.highAvailability}
		/>
		<section aria-labelledby="{uid}-labels">
			<Heading as="h2" size="small" id="{uid}-labels" spacing>Labels</Heading>
			<LabelRows bind:rows={labelRows} />
		</section>
		{#if form?.error}<Alert variant="error">{form.error}</Alert>{/if}
		<Button
			type="submit"
			loading={submitting}
			disabled={labelsInvalid ||
				!options ||
				!!selectedOptions?.errors?.length ||
				!options.postgresMajorVersions.values.length}>Create Postgres</Button
		>
	</form>
{/if}

<style>
	form {
		display: grid;
		gap: var(--ax-space-16);
		max-width: var(--ax-breakpoint-sm);
	}
</style>
