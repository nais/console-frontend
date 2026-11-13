<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { recoveryTimeError, recoveryTimeMinimum } from '#lib/domain/postgres/recovery.js';
	import LabelRows from '#lib/domain/labels/LabelRows.svelte';
	import { labelRowsHaveErrors, type LabelRow } from '#lib/domain/labels/labels.js';
	import PostgresConfigurationFields from '#lib/domain/postgres/PostgresConfigurationFields.svelte';
	import PostgresExtensionFields from '#lib/domain/postgres/PostgresExtensionFields.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyShort, Button, Heading, Select, TextField } from '#lib/shadcn/ui/index.js';
	import { onMount, untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let { CreatePostgresEnvironments } = $derived(data);
	let environments = $derived(
		($CreatePostgresEnvironments.data?.team.environments ?? []).filter(
			(environment) => !!environment.gcpProjectID
		)
	);
	let selectedEnvironment = $derived(form?.environment ?? data.selectedEnvironment);
	let recovering = $derived(form ? form.mode === 'recovery' : data.recoveryMode);
	let source = $derived(data.recoverySource?.data?.team.environment.postgres);
	let sources = $derived(data.recoverySources?.data?.team.postgreses);
	let changingSelection = $state(false);
	let navigationError = $state('');
	// Navigation clears action data. Keep the user's draft independently of it.
	let databaseName = $state(untrack(() => form?.name ?? ''));
	let targetTime = $state(untrack(() => form?.targetTime ?? ''));
	let outcomeUnknown = $state(
		untrack(() => !!form && 'outcomeUnknown' in form && form.outcomeUnknown === true)
	);
	let submissionError = $state('');
	let now = $state<Date>();
	let timeError = $derived(
		now && targetTime ? recoveryTimeError(targetTime, source?.earliestRestoreTime, now) : undefined
	);
	onMount(() => {
		now = new Date();
		const timer = setInterval(() => {
			now = new Date();
		}, 60_000);
		return () => clearInterval(timer);
	});
	async function select(changes: Record<string, string>) {
		if (submitting || changingSelection) return;
		const url = new URL(page.url);
		for (const [key, value] of Object.entries(changes)) {
			if (value) url.searchParams.set(key, value);
			else url.searchParams.delete(key);
		}
		changingSelection = true;
		navigationError = '';
		try {
			await goto(url, { replaceState: true, keepFocus: true, noScroll: true });
		} catch {
			navigationError = 'Could not load recovery options. Please try again.';
		} finally {
			changingSelection = false;
		}
	}
	let selectedOptions = $derived(
		data.postgresOptions.find((entry) => entry.environment === selectedEnvironment)
	);
	let options = $derived(selectedOptions?.options);
	let retainedForm = $derived(form?.environment === selectedEnvironment ? form : null);
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
		use:enhance={({ cancel }) => {
			if (changingSelection || submitting || outcomeUnknown) {
				cancel();
				return;
			}
			submitting = true;
			submissionError = '';
			return async ({ result, update }) => {
				try {
					if (result.type === 'error') {
						outcomeUnknown = true;
						submissionError =
							'The creation outcome could not be confirmed. Check whether the database exists before retrying.';
						return;
					}
					if (result.type === 'failure' && result.data?.outcomeUnknown) outcomeUnknown = true;
					await update();
				} catch {
					outcomeUnknown = true;
					submissionError =
						'The creation outcome could not be confirmed. Check whether the database exists before retrying.';
				} finally {
					submitting = false;
				}
			};
		}}
	>
		<BodyShort
			>Create a Postgres database for {data.teamSlug}. Provisioning is asynchronous.</BodyShort
		>
		<Select
			label="Create database"
			name="mode"
			value={recovering ? 'recovery' : 'empty'}
			disabled={changingSelection || submitting}
			onchange={(event) => select({ mode: event.currentTarget.value, source: '', after: '' })}
		>
			<option value="empty">Empty database</option>
			<option value="recovery">Restore from an existing database</option>
		</Select>
		<TextField
			name="name"
			label={recovering ? 'New database name' : 'Database name'}
			required
			bind:value={databaseName}
		/>
		<Select
			name="environment"
			label="Environment"
			required
			value={selectedEnvironment}
			disabled={changingSelection || submitting}
			onchange={(event) =>
				select({ environment: event.currentTarget.value, source: '', after: '' })}
		>
			{#each environments as environment (environment.environment.name)}
				<option value={environment.environment.name}>{environment.environment.name}</option>
			{/each}
		</Select>
		{#if navigationError}<Alert variant="error">{navigationError}</Alert>{/if}
		{#if changingSelection}<Alert variant="info" role="status">Loading recovery options…</Alert
			>{/if}
		{#if recovering}
			<Alert variant="info"
				>Restore into a distinct new database in the same team and environment. The source remains
				unchanged. No applications are automatically moved.</Alert
			>
			<GraphErrors errors={data.recoverySources?.errors} />
			<Select
				name="sourcePostgres"
				label="Source database"
				required
				value={source?.name ?? ''}
				disabled={changingSelection || submitting}
				onchange={(event) => select({ source: event.currentTarget.value })}
			>
				<option value="">Select a source database</option>
				{#if source && !sources?.nodes.some((entry) => entry.name === source.name)}<option
						value={source.name}>{source.name}</option
					>{/if}
				{#each sources?.nodes ?? [] as entry (entry.id)}<option value={entry.name}
						>{entry.name}</option
					>{/each}
			</Select>
			{#if page.url.searchParams.has('after')}<Button
					variant="tertiary"
					type="button"
					disabled={changingSelection || submitting}
					onclick={() => select({ after: '' })}>First sources</Button
				>{/if}
			{#if sources?.pageInfo.hasNextPage}<Button
					variant="tertiary"
					type="button"
					disabled={changingSelection || submitting}
					onclick={() => select({ after: sources?.pageInfo.endCursor ?? '' })}>More sources</Button
				>{/if}
			<GraphErrors errors={data.recoverySource?.errors} />
			{#if source && !changingSelection && !data.recoverySource?.errors?.length}
				<input type="hidden" name="majorVersion" value={source.majorVersion} />
				<BodyShort
					>PostgreSQL {source.majorVersion}. Version, extensions ({source.extensions.join(', ') ||
						'none'}), CPU, memory, storage and high availability are inherited from the source.</BodyShort
				>
				{#if source.earliestRestoreTime}
					<BodyShort
						>Earliest restore time: {source.earliestRestoreTime.toISOString()} (UTC).</BodyShort
					>
					<TextField
						name="targetTime"
						type="datetime-local"
						label="Target time (UTC)"
						description="Enter an explicit UTC date and time, not your local time."
						required
						min={recoveryTimeMinimum(source.earliestRestoreTime)}
						max={now?.toISOString().slice(0, 16)}
						bind:value={targetTime}
						error={timeError}
					/>
				{:else}<Alert variant="warning">This source has no available recovery window.</Alert>{/if}
			{/if}
			<Alert variant="warning"
				>Recent write-ahead logs (WAL) may not be archived yet. A time before now is not a guarantee
				of recoverability; restoration can fail.</Alert
			>
		{:else}
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
		{/if}
		<section aria-labelledby="{uid}-labels">
			<Heading as="h2" size="small" id="{uid}-labels" spacing>Labels</Heading>
			<LabelRows bind:rows={labelRows} />
		</section>
		{#if form?.error}<Alert variant="error">{form.error}</Alert>{/if}
		{#if submissionError}<Alert variant="error">{submissionError}</Alert>{/if}
		{#if outcomeUnknown}<BodyShort
				><a href="/team/{encodeURIComponent(data.teamSlug)}/postgres">Review team databases</a> before
				starting another creation request.</BodyShort
			>{/if}
		<Button
			type="submit"
			loading={submitting}
			disabled={outcomeUnknown ||
				changingSelection ||
				labelsInvalid ||
				(recovering
					? !source?.earliestRestoreTime ||
						!!data.recoverySource?.errors?.length ||
						!!timeError ||
						!targetTime
					: !options ||
						!!selectedOptions?.errors?.length ||
						!options.postgresMajorVersions.values.length)}
			>{recovering ? 'Restore to new database' : 'Create Postgres'}</Button
		>
	</form>
{/if}

<style>
	form {
		display: grid;
		gap: var(--nais-space-16);
		max-width: var(--nais-breakpoint-sm);
	}
</style>
