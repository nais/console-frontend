<script lang="ts">
	import type { InstanceGroupDetail$result } from '$houdini';
	import List from '$lib/ui/List.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import { DownloadIcon } from '@nais/ds-svelte-community/icons';

	type MountedFile =
		InstanceGroupDetail$result['team']['environment']['application']['instanceGroups'][number]['mountedFiles'][number];

	interface Props {
		files: MountedFile[];
		viewerIsMember: boolean;
		onDownloadConfigMap: (filePath: string, content: string, encoding: string) => void;
		onDownloadSecret: (fileName: string, secretName: string) => void;
	}

	let { files, viewerIsMember, onDownloadConfigMap, onDownloadSecret }: Props = $props();

	function fileNameFromPath(filePath: string): string {
		return filePath.split('/').pop() ?? filePath;
	}

	function sourceLabel(kind: MountedFile['source']['kind']): string {
		if (kind === 'CONFIG') return 'Config';
		if (kind === 'SECRET') return 'Secret';
		if (kind === 'SPEC') return 'Application manifest';
		return 'Nais';
	}
</script>

{#if files.length > 0}
	<section class="section">
		<List title="Mounted Files" count={files.length} level="h3">
			<ul class="instancegroup-list file-list">
				{#each files as file (file.path)}
					<li class="instancegroup-list-item file-item">
						<div class="instancegroup-list-cell file-cell file-path-cell">
							<span class="instancegroup-list-label">Path</span>
							<code>{file.path}</code>
						</div>

						<div class="instancegroup-list-cell file-cell file-source-cell">
							<span class="instancegroup-list-label">Type</span>
							<span class="source-kind">{sourceLabel(file.source.kind)}</span>
						</div>

						<div class="instancegroup-list-cell file-cell file-name-cell">
							<span class="instancegroup-list-label">Source</span>
							<span class="source-name">{file.source.name ?? '—'}</span>
						</div>

						<div class="instancegroup-list-cell file-cell file-action-cell">
							<span class="instancegroup-list-label">Actions</span>
							{#if file.source.kind === 'CONFIG' && file.content !== null}
								<Button
									size="xsmall"
									variant="tertiary-neutral"
									icon={DownloadIcon}
									title="Download {fileNameFromPath(file.path)}"
									onclick={() => onDownloadConfigMap(file.path, file.content ?? '', file.encoding)}
								/>
							{:else if file.source.kind === 'SECRET' && viewerIsMember}
								<Button
									size="xsmall"
									variant="tertiary-neutral"
									icon={DownloadIcon}
									title="Download {fileNameFromPath(file.path)}"
									onclick={() => onDownloadSecret(fileNameFromPath(file.path), file.source.name)}
								/>
							{:else}
								<span class="muted">-</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		</List>
	</section>
{/if}

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		width: 100%;
	}

	.file-list {
		--instancegroup-list-columns: minmax(0, 2.5fr) auto minmax(0, 1.8fr) 3rem;
	}

	.file-cell code {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.source-kind {
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		white-space: nowrap;
	}

	.source-name {
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.file-action-cell {
		justify-content: flex-start;
	}

	.muted {
		color: var(--ax-text-neutral-subtle);
	}
</style>
