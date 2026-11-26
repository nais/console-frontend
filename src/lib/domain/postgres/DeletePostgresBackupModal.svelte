<script lang="ts">
	import { graphql } from '$houdini';
	import { Alert, Button, Heading, Modal } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';

	interface Props {
		backup: {
			id: string;
			name: string;
			environmentName: string;
			sourcePostgres: string;
		};
		teamSlug: string;
		ondeleted: (backup: { id: string; name: string }) => void | Promise<void>;
		onclose: () => void;
	}

	let { backup, teamSlug, ondeleted, onclose }: Props = $props();

	let open = $state(true);
	let deleting = $state(false);
	let errors = $state<{ message: string }[] | null>(null);

	const deleteBackup = graphql(`
		mutation DeletePostgresBackup($input: DeletePostgresBackupInput!) {
			deletePostgresBackup(input: $input) {
				deletionRequested
			}
		}
	`);

	async function confirmDelete() {
		if (deleting) return;
		deleting = true;
		errors = null;
		try {
			const result = await deleteBackup.mutate({
				input: {
					teamSlug,
					environmentName: backup.environmentName,
					name: backup.name
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
			await ondeleted({ id: backup.id, name: backup.name });
		} catch {
			errors = [{ message: 'Backup deletion could not be confirmed.' }];
		} finally {
			deleting = false;
		}
	}
</script>

<Modal bind:open width="small" {onclose} closeButton={!deleting}>
	{#snippet header()}
		<Heading as="h2" size="medium">Delete standalone backup</Heading>
	{/snippet}

	<div class="modal-body">
		<Alert variant="warning">
			This permanently deletes the standalone backup {backup.name} ({backup.environmentName}) from
			the team's disaster-recovery bucket. Cleanup continues asynchronously.
		</Alert>
		<GraphErrors {errors} />
	</div>

	{#snippet footer()}
		<Button variant="danger" size="small" loading={deleting} onclick={confirmDelete}>
			Delete backup
		</Button>
		<Button variant="secondary" size="small" type="button" disabled={deleting} onclick={onclose}>
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
