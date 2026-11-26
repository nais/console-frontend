<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import DeletePostgresBackupModal, {
		type PostgresBackupDeletionTarget
	} from '#lib/domain/postgres/DeletePostgresBackupModal.svelte';
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
	import { onDestroy, onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresBackups } = $derived(data);
	let postgres = $derived($PostgresBackups.data?.team.environment.postgres);
	let backups = $derived($PostgresBackups.data?.team.postgresBackups);
	let canManage = $derived(data.viewerIsMember);
	let environmentName = $derived(page.params.env!);
	let hasBackupCursor = $derived(
		page.url.searchParams.has('after') || page.url.searchParams.has('before')
	);

	let backupToDelete = $state<PostgresBackupDeletionTarget | null>(null);
	let deletedBackupName = $state<string | null>(null);
	let createdBackupName = $state<string | null>(null);
	const unobservedBackups = new SvelteMap<string, { pathname: string; createdAt: number }>();
	let backupRefreshFailed = $state(false);
	let deletedBackups = $state<{ id: string; createdAt: Date }[]>([]);
	const isDeleted = (b: { id: string; createdAt: Date }) =>
		deletedBackups.some((d) => d.id === b.id && d.createdAt.getTime() === b.createdAt.getTime());

	$effect(() => {
		if (!deletedBackupName) return;
		const timeout = window.setTimeout(() => (deletedBackupName = null), 30_000);
		return () => window.clearTimeout(timeout);
	});

	let rows = $derived<PostgresBackupRow[]>(
		(backups?.nodes ?? [])
			.filter((b) => !isDeleted(b))
			.map((b) => ({
				...b,
				environmentName
			}))
	);
	let backupCount = $derived(
		backups
			? Math.max(0, backups.pageInfo.totalCount - (backups?.nodes ?? []).filter(isDeleted).length)
			: 0
	);

	let createModalOpen = $state(false);
	let createTarget = $state.raw<{
		pathname: string;
		teamSlug: string;
		environmentName: string;
		sourcePostgres: string;
	} | null>(null);
	let backupName = $state('');
	let retentionDays = $state(String(standaloneBackupRetention.default));
	let nameTouched = $state(false);
	let retentionTouched = $state(false);
	let creating = $state(false);
	let createErrors = $state<{ message: string }[] | null>(null);
	let routeVersion = 0;

	afterNavigate(({ from, to }) => {
		if (!from || from.url.pathname === to?.url.pathname) return;

		routeVersion++;
		backupToDelete = null;
		createTarget = null;
		createModalOpen = false;
		creating = false;
		createdBackupName = null;
		deletedBackupName = null;
		backupRefreshFailed = false;
	});

	onDestroy(() => {
		routeVersion++;
	});

	function isCurrentRoute(pathname: string, version: number) {
		return routeVersion === version && page.url.pathname === pathname;
	}

	let nameError = $derived(standaloneBackupNameError(backupName));
	let retentionError = $derived(standaloneBackupRetentionError(retentionDays));

	const createBackup = graphql(`
		mutation CreatePostgresBackup($input: CreatePostgresBackupInput!) {
			createPostgresBackup(input: $input) {
				backup {
					id
					name
					createdAt
				}
			}
		}
	`);

	function openCreateModal() {
		createTarget = {
			pathname: page.url.pathname,
			teamSlug: data.teamSlug,
			environmentName: page.params.env!,
			sourcePostgres: page.params.postgres!
		};
		backupName = defaultStandaloneBackupName(createTarget.sourcePostgres);
		retentionDays = String(standaloneBackupRetention.default);
		nameTouched = false;
		retentionTouched = false;
		createErrors = null;
		createModalOpen = true;
	}

	async function refreshBackups({ resetPagination = false } = {}) {
		const { pathname } = page.url;
		const version = routeVersion;
		backupRefreshFailed = false;
		let failed: boolean;
		try {
			if (resetPagination && hasBackupCursor) {
				await changeParams({ after: '', before: '' }, { noScroll: true });
				if (!isCurrentRoute(pathname, version)) return;
				failed = Boolean($PostgresBackups.errors?.length);
			} else {
				const result = await PostgresBackups.fetch({ policy: 'NetworkOnly' });
				failed = Boolean(result.errors?.length);
			}
		} catch {
			failed = true;
		}
		if (isCurrentRoute(pathname, version)) {
			backupRefreshFailed = failed;
		}
	}

	async function submitCreateBackup() {
		const target = createTarget;
		const version = routeVersion;
		if (!createModalOpen || !target || !isCurrentRoute(target.pathname, version)) return;
		nameTouched = true;
		retentionTouched = true;
		if (creating || nameError || retentionError) {
			return;
		}
		const { pathname, ...destination } = target;
		creating = true;
		createErrors = null;
		try {
			const result = await createBackup.mutate({
				input: {
					...destination,
					name: backupName.trim(),
					retentionDays: parseStandaloneBackupRetention(retentionDays)
				}
			});
			if (!isCurrentRoute(pathname, version)) return;
			if (result.errors?.length) {
				createErrors = result.errors;
				return;
			}
			if (!result.data) {
				createErrors = [{ message: 'Backup creation could not be confirmed.' }];
				return;
			}
			const { id, name, createdAt } = result.data.createPostgresBackup.backup;
			unobservedBackups.set(id, { pathname, createdAt: createdAt.getTime() });
			createdBackupName = name;
		} catch {
			if (isCurrentRoute(pathname, version)) {
				createErrors = [{ message: 'Backup creation could not be confirmed.' }];
			}
			return;
		} finally {
			if (isCurrentRoute(pathname, version)) {
				creating = false;
			}
		}
		createModalOpen = false;
		await refreshBackups({ resetPagination: true });
	}

	onMount(() => {
		const interval = window.setInterval(() => {
			if (document.visibilityState !== 'visible' || $PostgresBackups.fetching) {
				return;
			}
			const nodes = backups?.nodes ?? [];
			for (const { id, createdAt } of nodes) {
				if (unobservedBackups.get(id)?.createdAt === createdAt.getTime()) {
					unobservedBackups.delete(id);
				}
			}
			const waitingForCreation =
				!hasBackupCursor &&
				[...unobservedBackups.values()].some(({ pathname }) => pathname === page.url.pathname);
			if (waitingForCreation || nodes.some((backup) => backupPending(backup.phase))) {
				void refreshBackups();
			}
		}, 5_000);

		return () => window.clearInterval(interval);
	});
</script>

<GraphErrors errors={$PostgresBackups.errors} />

{#if createdBackupName}
	<Alert variant="success">Standalone backup {createdBackupName} was requested.</Alert>
{/if}
{#if deletedBackupName}
	<Alert variant="success">
		Deletion requested for standalone backup {deletedBackupName}. Cleanup continues asynchronously.
	</Alert>
{/if}
{#if backupRefreshFailed}
	<Alert variant="warning">
		The backup list could not be refreshed. Reload the page to see the latest backups.
	</Alert>
{/if}

{#if $PostgresBackups.fetching && !backups}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if backups}
	<div class="backups-page">
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
					ondelete={(backup) =>
						(backupToDelete = { backup, teamSlug: data.teamSlug, pathname: page.url.pathname })}
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

{#if createTarget?.pathname === page.url.pathname}
	<Modal
		bind:open={createModalOpen}
		width="small"
		closeButton={!creating}
		onBeforeClose={() => !creating}
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
{/if}

{#if backupToDelete?.pathname === page.url.pathname}
	<DeletePostgresBackupModal
		target={backupToDelete}
		ondeleted={async ({ id, name, createdAt }) => {
			if (unobservedBackups.get(id)?.createdAt === createdAt.getTime()) {
				unobservedBackups.delete(id);
			}
			deletedBackups = [...deletedBackups, { id, createdAt }];
			deletedBackupName = name;
			backupToDelete = null;
			await refreshBackups();
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
