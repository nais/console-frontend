<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		CLONE_LATEST_POINT_BUFFER_MINUTES,
		formatLocalTime,
		parseCloneMode,
		parseLocalDateTime,
		recoveryTimeError,
		recoveryTimeMinimum,
		truncateToSeconds
	} from '#lib/domain/postgres/recovery.js';
	import LabelRows from '#lib/domain/labels/LabelRows.svelte';
	import { labelRowsHaveErrors, type LabelRow } from '#lib/domain/labels/labels.js';
	import PostgresBackupRetentionField from '#lib/domain/postgres/PostgresBackupRetentionField.svelte';
	import { backupRetention } from '#lib/domain/postgres/backupRetention.js';
	import { quantityInUnits, postgresResources } from '#lib/domain/postgres/forms.js';
	import PostgresConfigurationFields from '#lib/domain/postgres/PostgresConfigurationFields.svelte';
	import PostgresCloneConfiguration from '#lib/domain/postgres/PostgresCloneConfiguration.svelte';
	import PostgresExtensionFields from '#lib/domain/postgres/PostgresExtensionFields.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import {
		Accordion,
		AccordionItem,
		Alert,
		BodyShort,
		Button,
		Heading,
		Select,
		Tab,
		TabList,
		TabPanel,
		Tabs,
		TextField
	} from '#lib/shadcn/ui/index.js';
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
	let recovering = $derived(form ? parseCloneMode(form.mode) === 'clone' : data.recoveryMode);
	let source = $derived(data.recoverySource?.data?.team.environment.postgres);
	// Selects may show pending choices, but configuration uses only the loaded context.
	let modeChoice = $derived(recovering ? 'clone' : 'empty');
	let environmentChoice = $derived(selectedEnvironment);
	let sourceChoice = $derived(source?.name ?? '');
	let sources = $derived(data.recoverySources?.data?.team.postgreses);
	let changingSelection = $state(false);
	let navigationError = $state('');
	// Navigation clears action data. Keep the user's draft independently of it.
	let databaseName = $state(untrack(() => form?.name ?? ''));
	let targetTime = $state(untrack(() => form?.targetTime ?? ''));
	// Collapsed unless a time was already entered. Collapsing clears the typed time, so a hidden
	// stale value can never be submitted.
	let timeOpen = $state(untrack(() => !!form?.targetTime));
	let resources = $state(
		untrack(() => ({
			cpu: form?.cpu ?? '',
			memory: form?.memory ?? '',
			diskSize: form?.diskSize ?? '',
			highAvailability: form?.highAvailability ?? false,
			customizeOpen: Boolean(form?.cpu || form?.memory || form?.diskSize)
		}))
	);
	let outcomeUnknown = $state(
		untrack(() => !!form && 'outcomeUnknown' in form && form.outcomeUnknown === true)
	);
	let submissionError = $state('');
	let now = $state<Date>();
	// Browser time zone (never shown); UTC until mounted so server and client markup agree.
	let timeZone = $state('UTC');
	let timeError = $derived(
		now ? recoveryTimeError(targetTime, source?.earliestRestoreTime, now, timeZone) : undefined
	);
	// The absolute whole-second instant for the typed local time. The server never interprets the
	// typed value in its own zone.
	let targetInstant = $derived.by(() => {
		const parsed = targetTime ? parseLocalDateTime(targetTime, timeZone) : null;
		return parsed && 'instant' in parsed ? truncateToSeconds(parsed.instant).toISOString() : '';
	});
	onMount(() => {
		timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
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
		try {
			await goto(url, { replaceState: true, keepFocus: true, noScroll: true });
			navigationError = '';
		} catch {
			navigationError = 'Could not load clone options. Please try again.';
		} finally {
			modeChoice = recovering ? 'clone' : 'empty';
			environmentChoice = selectedEnvironment;
			sourceChoice = source?.name ?? '';
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
	let backupRetentionDays = $state(
		untrack(() => form?.backupRetentionDays ?? String(backupRetention.default))
	);
	// The size of a clone is its source's unless changed; either way only a rough stand-in.
	let estimateDiskSize = $derived(
		Number(
			(recovering
				? quantityInUnits(source?.resources?.diskSize, 'GiB')
				: resources.diskSize.trim()) || postgresResources.diskSize.default
		)
	);
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
			if (changingSelection || navigationError || submitting || outcomeUnknown) {
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
		<div class="intro">
			<BodyShort
				>Create a Postgres database for {data.teamSlug}. Provisioning is asynchronous.</BodyShort
			>
		</div>
		<input type="hidden" name="mode" value={recovering ? 'clone' : 'empty'} />
		<Tabs
			value={modeChoice}
			onChange={(next) => {
				const previous = modeChoice;
				modeChoice = next;
				if (next === previous || (next === 'clone') === recovering) return;
				select({ mode: next, source: '', after: '' });
			}}
		>
			<TabList aria-label="Create database">
				<Tab value="empty" disabled={changingSelection || submitting}>Empty database</Tab>
				<Tab value="clone" disabled={changingSelection || submitting}>Clone existing database</Tab>
			</TabList>
			<div class="stack tab-content">
				<TextField name="name" label="Database name" required bind:value={databaseName} />
				<Select
					name="environment"
					label="Environment"
					required
					bind:value={environmentChoice}
					disabled={changingSelection || submitting}
					onchange={(event) =>
						select({ environment: event.currentTarget.value, source: '', after: '' })}
				>
					{#each environments as environment (environment.environment.name)}
						<option value={environment.environment.name}>{environment.environment.name}</option>
					{/each}
				</Select>
				{#if navigationError}<Alert variant="error">{navigationError}</Alert>{/if}
				{#if changingSelection}<Alert variant="info" role="status">Loading clone options…</Alert
					>{/if}
				{#if recovering}
					<TabPanel value="clone">
						<div class="stack">
							<Alert variant="info"
								>Clone into a distinct new database in the same team and environment. The source
								remains unchanged. No applications are automatically moved.</Alert
							>
							<GraphErrors errors={data.recoverySources?.errors} />
							<Select
								name="sourcePostgres"
								label="Source database"
								required
								bind:value={sourceChoice}
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
									onclick={() => select({ after: sources?.pageInfo.endCursor ?? '' })}
									>More sources</Button
								>{/if}
							<GraphErrors errors={data.recoverySource?.errors} />
							{#if source && !data.recoverySource?.errors?.length}
								<!-- Stays mounted while a navigation is in flight so drafts survive pagination and a
									failed navigation; inert meanwhile so stale fields cannot be edited. The key below
									resets the configuration only when the source itself changes. -->
								<fieldset class="stack clone-fields" disabled={changingSelection}>
									{#key source.name}
										<PostgresCloneConfiguration
											{source}
											availableExtensions={options?.postgresExtensions.values}
											draft={form &&
											parseCloneMode(form.mode) === 'clone' &&
											form.sourcePostgres === source.name
												? form
												: null}
											errors={form?.errors}
										/>
									{/key}
									{#if source.earliestRestoreTime}
										<BodyShort
											>Clones from the latest available point (about {CLONE_LATEST_POINT_BUFFER_MINUTES}
											minutes ago) unless you specify a time.</BodyShort
										>
										<Accordion>
											<AccordionItem
												heading="Specify time"
												open={timeOpen}
												onOpenChange={(next) => {
													timeOpen = next;
													if (!next) targetTime = '';
												}}
											>
												{#if timeOpen}
													<div class="stack">
														{#if now}
															<BodyShort
																>Earliest clone time: {formatLocalTime(
																	source.earliestRestoreTime,
																	timeZone
																)}.</BodyShort
															>
														{/if}
														<input type="hidden" name="targetInstant" value={targetInstant} />
														<TextField
															name="targetTime"
															type="datetime-local"
															label="Target time"
															min={recoveryTimeMinimum(source.earliestRestoreTime, timeZone)}
															bind:value={targetTime}
															error={timeError}
														/>
													</div>
												{/if}
											</AccordionItem>
										</Accordion>
										{#if !timeOpen && timeError}<Alert variant="error" role="alert"
												>{timeError}</Alert
											>{/if}
									{:else}<Alert variant="warning"
											>This source has no available recovery window.</Alert
										>{/if}
								</fieldset>
							{/if}
							<Alert variant="warning"
								>Recent write-ahead logs (WAL) may not be archived yet. A time before now is not a
								guarantee of recoverability; cloning can fail.</Alert
							>
						</div>
					</TabPanel>
				{:else}
					<TabPanel value="empty">
						<div class="stack">
							<GraphErrors errors={selectedOptions?.errors} />
							{#if options && !selectedOptions?.errors?.length}
								{#if !options.postgresMajorVersions.values.length}
									<Alert variant="error"
										>No PostgreSQL versions are available in this environment.</Alert
									>
								{/if}
								{#key selectedEnvironment}
									<Select
										name="majorVersion"
										label="PostgreSQL version"
										required
										value={majorVersion}
									>
										<option value="" disabled>Select a PostgreSQL version</option>
										{#each options.postgresMajorVersions.values as version (version)}
											<option value={version}>{version}</option>
										{/each}
									</Select>
									<PostgresExtensionFields
										available={options.postgresExtensions.values}
										selected={retainedForm?.extensions ??
											options.postgresExtensions.defaultValues ??
											[]}
									/>
								{/key}
							{:else if !selectedOptions?.errors?.length}
								<Alert variant="error">Could not load Postgres options for this environment.</Alert>
							{/if}
							<PostgresConfigurationFields
								errors={form?.errors}
								bind:cpu={resources.cpu}
								bind:memory={resources.memory}
								bind:diskSize={resources.diskSize}
								bind:highAvailability={resources.highAvailability}
								bind:customizeOpen={resources.customizeOpen}
							/>
						</div>
					</TabPanel>
				{/if}
				<PostgresBackupRetentionField
					bind:value={backupRetentionDays}
					diskSizeGiB={estimateDiskSize}
				/>
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
						!!navigationError ||
						changingSelection ||
						labelsInvalid ||
						(recovering
							? !source?.earliestRestoreTime || !!data.recoverySource?.errors?.length || !!timeError
							: !options ||
								!!selectedOptions?.errors?.length ||
								!options.postgresMajorVersions.values.length)}
					>{recovering ? 'Clone database' : 'Create Postgres'}</Button
				>
			</div>
		</Tabs>
	</form>
{/if}

<style>
	form {
		max-width: var(--nais-breakpoint-sm);
	}
	.intro {
		margin-bottom: var(--nais-space-16);
	}
	.clone-fields {
		border: 0;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	.stack {
		display: grid;
		gap: var(--nais-space-16);
	}
</style>
