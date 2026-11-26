<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import DeletePostgresBackupModal from '#lib/domain/postgres/DeletePostgresBackupModal.svelte';
	import PostgresBackupsTable, {
		type PostgresBackupRow
	} from '#lib/domain/postgres/PostgresBackupsTable.svelte';
	import {
		backupPending,
		defaultStandaloneBackupName,
		parseStandaloneBackupRetention,
		standaloneBackupNameError,
		standaloneBackupRetention,
		standaloneBackupRetentionError
	} from '#lib/domain/postgres/backups.js';
	import {
		Alert,
		BodyShort,
		Button,
		Heading,
		Loader,
		Modal,
		TextField
	} from '#lib/shadcn/ui/index.js';
	import Collection from '#lib/ui/Collection.svelte';
	import EmptyState from '#lib/ui/EmptyState.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { pluralize } from '#lib/utils/formatters.js';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresBackups } = $derived(data);
	let postgres = $derived($PostgresBackups.data?.team.environment.postgres);
	let backups = $derived($PostgresBackups.data?.team.environment.postgresBackups);
	let canManage = $derived(data.viewerIsMember || data.isAdmin);
	let environmentName = $derived(page.params.env!);
	let postgresName = $derived(page.params.postgres!);

	let backupToDelete = $state<PostgresBackupRow | null>(null);
	let deletedBackupName = $state<string | null>(null);
	let deletedBackupIds = $state<string[]>([]);

	$effect(() => {
		if (!deletedBackupName) return;
		const timeout = window.setTimeout(() => (deletedBackupName = null), 30_000);
		return () => window.clearTimeout(timeout);
	});

	let rows = $derived<PostgresBackupRow[]>(
		(backups?.nodes ?? [])
			.filter((b) => !deletedBackupIds.includes(b.id))
			.map((b) => ({
				...b,
				environmentName
			}))
	);
	let backupCount = $derived(
		backups
			? Math.max(
					0,
					backups.pageInfo.totalCount -
						(backups?.nodes ?? []).filter((b) => deletedBackupIds.includes(b.id)).length
				)
			: 0
	);

	let createModalOpen = $state(false);
	let backupName = $state('');
	let retentionDays = $state(String(standaloneBackupRetention.default));
	let nameTouched = $state(false);
	let retentionTouched = $state(false);
	let creating = $state(false);
	let createErrors = $state<{ message: string }[] | null>(null);

	let nameError = $derived(standaloneBackupNameError(backupName));
	let retentionError = $derived(standaloneBackupRetentionError(retentionDays));

	const createBackup = graphql(`
		mutation CreatePostgresBackup($input: CreatePostgresBackupInput!) {
			createPostgresBackup(input: $input) {
				backup {
					id
					name
					phase
				}
			}
		}
	`);

	function openCreateModal() {
		backupName = defaultStandaloneBackupName(postgresName);
		retentionDays = String(standaloneBackupRetention.default);
		nameTouched = false;
		retentionTouched = false;
		createErrors = null;
		createModalOpen = true;
	}

	async function submitCreateBackup() {
		nameTouched = true;
		retentionTouched = true;
		if (creating || nameError || retentionError) {
			return;
		}
		creating = true;
		createErrors = null;
		try {
			const result = await createBackup.mutate({
				input: {
					teamSlug: data.teamSlug,
					environmentName,
					sourcePostgres: postgresName,
					name: backupName.trim(),
					retentionDays: parseStandaloneBackupRetention(retentionDays)
				}
			});
			if (result.errors?.length) {
				createErrors = result.errors;
				return;
			}
			if (!result.data) {
				createErrors = [{ message: 'Backup creation could not be confirmed.' }];
				return;
			}
			createModalOpen = false;
			await PostgresBackups.fetch({ policy: 'NetworkOnly' });
		} catch {
			createErrors = [{ message: 'Backup creation could not be confirmed.' }];
		} finally {
			creating = false;
		}
	}

	onMount(() => {
		const interval = window.setInterval(() => {
			if (
				document.visibilityState !== 'visible' ||
				$PostgresBackups.fetching ||
				!(backups?.nodes ?? []).some((b) => backupPending(b.phase))
			) {
				return;
			}
			void PostgresBackups.fetch({ policy: 'NetworkOnly' }).catch(() => {});
		}, 5_000);

		return () => window.clearInterval(interval);
	});
</script>

<GraphErrors errors={$PostgresBackups.errors} />

{#if $PostgresBackups.fetching && !backups}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if backups}
	<div class="backups-page">
		{#if deletedBackupName}
			<Alert variant="success">
				Deletion requested for standalone backup {deletedBackupName}. Cleanup continues
				asynchronously.
			</Alert>
		{/if}

		<BodyShort size="small" class="backups-intro">
			Standalone backups are stored in your team's disaster-recovery bucket and survive database
			deletion{#if postgres}
				(distinct from this database's rolling {postgres.backupRetentionDays}-{pluralize(
					postgres.backupRetentionDays,
					'day'
				)} point-in-time recovery window){/if}.
		</BodyShort>

		<Collection title="Standalone backups" headerBorder={false} count={backupCount}>
			{#snippet actions()}
				{#if canManage}
					<Button size="small" variant="secondary" onclick={openCreateModal}>Create backup</Button>
				{/if}
			{/snippet}

			{#if rows.length > 0}
				<PostgresBackupsTable
					backups={rows}
					teamSlug={data.teamSlug}
					{canManage}
					ondelete={(b) => (backupToDelete = b)}
				/>
			{:else}
				<EmptyState
					title="No standalone backups."
					description="Standalone backups are kept in your team's disaster-recovery bucket and remain available even if this database is deleted."
				/>
			{/if}
		</Collection>

		<Pagination
			page={backups.pageInfo}
			loaders={{
				loadPreviousPage: () =>
					changeParams(
						{ after: '', before: backups.pageInfo.startCursor ?? '' },
						{ noScroll: true }
					),
				loadNextPage: () =>
					changeParams({ before: '', after: backups.pageInfo.endCursor ?? '' }, { noScroll: true })
			}}
		/>
	</div>
{/if}

<Modal
	bind:open={createModalOpen}
	width="small"
	closeButton={!creating}
	onclose={() => (createModalOpen = false)}
>
	{#snippet header()}
		<Heading as="h2" size="medium">Create standalone backup</Heading>
	{/snippet}

	<form
		class="create-form"
		onsubmit={(e) => {
			e.preventDefault();
			void submitCreateBackup();
		}}
	>
		<TextField
			label="Backup name"
			bind:value={backupName}
			onblur={() => (nameTouched = true)}
			error={nameTouched ? nameError : undefined}
			description="Lowercase letters, numbers, hyphens or dots."
		/>
		<TextField
			label="Retention (days)"
			bind:value={retentionDays}
			inputmode="numeric"
			onblur={() => (retentionTouched = true)}
			error={retentionTouched ? retentionError : undefined}
			description="1–730 days, measured from completion. Defaults to 30."
		/>
		<GraphErrors errors={createErrors} />
	</form>

	{#snippet footer()}
		<Button
			variant="primary"
			size="small"
			loading={creating}
			disabled={Boolean(nameError || retentionError)}
			onclick={submitCreateBackup}
		>
			Create backup
		</Button>
		<Button
			variant="secondary"
			size="small"
			type="button"
			disabled={creating}
			onclick={() => (createModalOpen = false)}
		>
			Cancel
		</Button>
	{/snippet}
</Modal>

{#if backupToDelete}
	<DeletePostgresBackupModal
		backup={backupToDelete}
		teamSlug={data.teamSlug}
		ondeleted={async ({ id, name }) => {
			deletedBackupIds = [...deletedBackupIds, id];
			deletedBackupName = name;
			backupToDelete = null;
			await PostgresBackups.fetch({ policy: 'NetworkOnly' });
		}}
		onclose={() => (backupToDelete = null)}
	/>
{/if}

<style>
	.backups-page {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-16);
	}

	.backups-page :global(.backups-intro) {
		color: var(--muted-foreground);
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-16);
	}
</style>
