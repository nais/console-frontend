<script lang="ts">
	import type { InstanceGroupDetail$result } from '$houdini';
	import { Button, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
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
</script>

{#if files.length > 0}
	<section>
		<Heading as="h3" size="small" spacing>Mounted Files</Heading>
		<div class="table-container">
			<Table size="small" zebraStripes>
				<Thead>
					<Tr>
						<Th>Path</Th>
						<Th>Source</Th>
						<Th style="width: 1%"></Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each files as file (file.path)}
						<Tr>
							<Td><code>{file.path}</code></Td>
							<Td>
								<span class="source">
									{file.source.kind === 'CONFIG'
										? 'Config'
										: file.source.kind === 'SECRET'
											? 'Secret'
											: file.source.kind === 'SPEC'
												? 'Application manifest'
												: 'Nais'}
									{#if file.source.name}/ {file.source.name}{/if}
								</span>
							</Td>
							<Td>
								{#if file.source.kind === 'CONFIG' && file.content !== null}
									<Button
										size="xsmall"
										variant="tertiary-neutral"
										icon={DownloadIcon}
										title="Download {fileNameFromPath(file.path)}"
										onclick={() =>
											onDownloadConfigMap(file.path, file.content ?? '', file.encoding)}
									/>
								{:else if file.source.kind === 'SECRET' && viewerIsMember}
									<Button
										size="xsmall"
										variant="tertiary-neutral"
										icon={DownloadIcon}
										title="Download {fileNameFromPath(file.path)}"
										onclick={() => onDownloadSecret(fileNameFromPath(file.path), file.source.name)}
									/>
								{/if}
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
	</section>
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
	}

	.source {
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		white-space: nowrap;
	}

	.table-container {
		width: 100%;
		overflow-x: auto;
	}

	section :global(code) {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		overflow-wrap: anywhere;
	}
</style>
