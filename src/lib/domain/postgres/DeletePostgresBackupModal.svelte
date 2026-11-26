<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { Alert, Button, Heading, Modal } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { onDestroy } from 'svelte';
	import type { PostgresBackupRow } from './PostgresBackupsTable.svelte';

	export interface PostgresBackupDeletionTarget {
		backup: PostgresBackupRow;
		teamSlug: string;
		pathname: string;
	}

	interface Props {
		target: PostgresBackupDeletionTarget;
		ondeleted: (backup: Pick<PostgresBackupRow, 'id' | 'name' | 'createdAt'>) => Promise<void>;
		onclose: () => void;
	}

	let { target, ondeleted, onclose }: Props = $props();

	let open = $state(true);
	let deleting = $state(false);
	let errors = $state<{ message: string }[] | null>(null);
	let destroyed = false;
	onDestroy(() => (destroyed = true));

	function isCurrentTarget(pathname: string) {
		return !destroyed && pathname === page.url.pathname;
	}

	function close() {
		if (isCurrentTarget(target.pathname)) onclose();
	}

	const deleteBackup = graphql(`
		mutation DeletePostgresBackup($input: DeletePostgresBackupInput!) {
			deletePostgresBackup(input: $input) {
				deletionRequested
			}
		}
	`);

	async function confirmDelete() {
		const { backup, teamSlug, pathname } = target;
		if (deleting || !isCurrentTarget(pathname)) return;
		const { id, name, createdAt, environmentName } = backup;
		deleting = true;
		errors = null;
		try {
			const result = await deleteBackup.mutate({
				input: {
					teamSlug,
					environmentName,
					name
				}
			});
			if (result.errors?.length) {
				errors = result.errors;
				return;
			}
			if (!result.data?.deletePostgresBackup.deletionRequested) {
				errors = [{ message: 'Backup deletion could not be confirmed.' }];
				return;
			}
		} catch {
			errors = [{ message: 'Backup deletion could not be confirmed.' }];
			return;
		} finally {
			deleting = false;
		}
		if (isCurrentTarget(pathname)) {
			await ondeleted({ id, name, createdAt });
		}
	}
</script>

<Modal
	bind:open
	width="small"
	onclose={close}
	closeButton={!deleting}
	onBeforeClose={() => !deleting}
>
	{#snippet header()}
		<Heading as="h2" size="medium">Delete standalone backup</Heading>
	{/snippet}

	<div class="modal-body">
		<Alert variant="warning">
			This permanently deletes the standalone backup {target.backup.name} ({target.backup
				.environmentName}) from the disaster-recovery bucket for {target.teamSlug}. Cleanup
			continues asynchronously.
		</Alert>
		<GraphErrors {errors} />
	</div>

	{#snippet footer()}
		<Button variant="danger" size="small" loading={deleting} onclick={confirmDelete}>
			Delete backup
		</Button>
		<Button variant="secondary" size="small" type="button" disabled={deleting} onclick={close}>
			Cancel
		</Button>
	{/snippet}
</Modal>

<style>
	.modal-body {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-12);
	}
</style>
