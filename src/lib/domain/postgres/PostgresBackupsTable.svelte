<script lang="ts">
	import { envTagVariant } from '#lib/envTagVariant.js';
	import { TrashIcon } from '#lib/icons/index.js';
	import { Button, StatusIndicator, Tag, Td, Th, Tooltip, Tr } from '#lib/shadcn/ui/index.js';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { pluralize } from '#lib/utils/formatters.js';
	import prettyBytes from 'pretty-bytes';
	import { backupPhaseLabel, backupPhaseTone, backupRestorable } from './backups.js';
	import { restorePostgresBackupHref } from './recovery.js';

	export interface PostgresBackupRow {
		id: string;
		name: string;
		sourcePostgres: string;
		environmentName: string;
		phase: string;
		retentionDays: number;
		majorVersion: string | null;
		diskSize: string | null;
		extensions: readonly string[];
		sizeBytes: number | null;
		createdAt: Date;
		completedAt?: Date | null;
		expiresAt: Date | null;
		errorMessage: string | null;
	}

	interface Props {
		backups: readonly PostgresBackupRow[];
		teamSlug: string;
		showSource?: boolean;
		canManage?: boolean;
		ondelete?: (backup: PostgresBackupRow) => void;
	}

	let { backups, teamSlug, showSource = false, canManage = false, ondelete }: Props = $props();
</script>

<ResourceTable label="Backups">
	{#snippet header()}
		<Th class="status-column">Status</Th>
		<Th>Name</Th>
		{#if showSource}
			<Th>Source</Th>
			<Th>Env</Th>
		{/if}
		<Th>Version</Th>
		<Th>Size</Th>
		<Th>Created</Th>
		<Th>Expires</Th>
		{#if canManage}
			<Th><span class="sr-only">Actions</span></Th>
		{/if}
	{/snippet}
	{#each backups as backup (backup.id)}
		<Tr>
			<Td>
				<div class="status-cell">
					{#if backup.errorMessage}
						<Tooltip content={backup.errorMessage}>
							<span>
								<StatusIndicator
									label={backupPhaseLabel(backup.phase).toLowerCase()}
									tone={backupPhaseTone(backup.phase)}
								/>
							</span>
						</Tooltip>
					{:else}
						<StatusIndicator
							label={backupPhaseLabel(backup.phase).toLowerCase()}
							tone={backupPhaseTone(backup.phase)}
						/>
					{/if}
				</div>
			</Td>
			<Td>
				<span class="resource-name">{backup.name}</span>
				{#if backup.errorMessage}
					<div class="error-note">{backup.errorMessage}</div>
				{/if}
			</Td>
			{#if showSource}
				<Td><span class="table-meta">{backup.sourcePostgres}</span></Td>
				<Td>
					<Tag size="xsmall" variant={envTagVariant(backup.environmentName)}>
						{backup.environmentName}
					</Tag>
				</Td>
			{/if}
			<Td>
				<span class="table-meta"
					>{backup.majorVersion ?? '—'}{#if backup.diskSize}
						· {backup.diskSize}{/if}</span
				>
			</Td>
			<Td>
				<span class="table-meta">
					{backup.sizeBytes != null ? prettyBytes(backup.sizeBytes, { binary: true }) : '—'}
				</span>
			</Td>
			<Td>
				<span class="table-meta"><Time time={backup.createdAt} distance /></span>
			</Td>
			<Td>
				<span class="table-meta">
					{#if backup.expiresAt}
						<Time time={backup.expiresAt} dateFormat="d MMM yyyy" />
					{:else}
						{backup.retentionDays} {pluralize(backup.retentionDays, 'day')} after completion
					{/if}
				</span>
			</Td>
			{#if canManage}
				<Td>
					<div class="action-cell">
						{#if backupRestorable(backup)}
							<Button
								as="a"
								href={restorePostgresBackupHref(teamSlug, backup.environmentName, backup.name)}
								variant="tertiary"
								size="xsmall"
								aria-label="Restore backup {backup.name}"
							>
								Restore
							</Button>
						{/if}
						{#if ondelete}
							<Button
								variant="tertiary"
								size="xsmall"
								icon={TrashIcon}
								aria-label="Delete backup {backup.name}"
								onclick={() => ondelete(backup)}
							/>
						{/if}
					</div>
				</Td>
			{/if}
		</Tr>
	{/each}
</ResourceTable>

<style>
	.error-note {
		margin-top: var(--nais-space-4);
		font-size: var(--sh-font-size-xs);
		color: var(--destructive);
		overflow-wrap: anywhere;
	}

	.action-cell {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--nais-space-4);
	}
</style>
