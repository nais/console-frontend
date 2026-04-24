<script lang="ts">
	import type { InstanceGroupDetail$result } from '$houdini';
	import {
		Button,
		CopyButton,
		Heading,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { EyeIcon, EyeSlashIcon } from '@nais/ds-svelte-community/icons';
	import { SvelteMap } from 'svelte/reactivity';

	type EnvironmentVariable =
		InstanceGroupDetail$result['team']['environment']['application']['instanceGroups'][number]['environmentVariables'][number];

	interface Props {
		envVars: EnvironmentVariable[];
		viewerIsMember: boolean;
		revealedValues: SvelteMap<string, string>;
		onReveal: (secretName: string) => void;
		onHideAll: () => void;
	}

	let { envVars, viewerIsMember, revealedValues, onReveal, onHideAll }: Props = $props();

	const hasSecrets = $derived(envVars.some((e) => e.source.kind === 'SECRET'));
</script>

{#if envVars.length > 0}
	<section>
		<div class="section-header">
			<Heading as="h3" size="small" spacing>Environment Variables</Heading>
			{#if hasSecrets && viewerIsMember && revealedValues.size > 0}
				<Button size="xsmall" variant="tertiary" icon={EyeSlashIcon} onclick={onHideAll}>
					Hide secret values
				</Button>
			{/if}
		</div>
		<div class="table-container">
			<Table size="small" zebraStripes>
				<Thead>
					<Tr>
						<Th class="name-column">Name</Th>
						<Th class="value-column">Value</Th>
						<Th class="source-column">Source</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each envVars as env (env.name)}
						<Tr>
							<Td class="name-cell"><code>{env.name}</code></Td>
							<Td class="value-cell">
								{#if env.source.kind === 'SECRET' && revealedValues.has(env.name)}
									<span class="env-value">
										<code>{revealedValues.get(env.name)}</code>
										<CopyButton size="xsmall" copyText={revealedValues.get(env.name) ?? ''} />
									</span>
								{:else if env.source.kind === 'SECRET'}
									<span class="env-value">
										<span class="masked">••••••••••••••••</span>
										{#if viewerIsMember}
											<Button
												size="xsmall"
												variant="tertiary-neutral"
												icon={EyeIcon}
												onclick={() => onReveal(env.source.name)}
											/>
										{/if}
									</span>
								{:else if env.value !== null}
									<span class="env-value">
										<code>{env.value}</code>
										<CopyButton size="xsmall" copyText={env.value} />
									</span>
								{:else}
									<span class="muted">-</span>
								{/if}
							</Td>
							<Td class="source-cell">
								<span class="source">
									{env.source.kind === 'SECRET'
										? 'Secret'
										: env.source.kind === 'CONFIG'
											? 'Config'
											: env.source.kind === 'SPEC'
												? 'Application manifest'
												: 'Nais'}
									{#if (env.source.kind === 'SECRET' || env.source.kind === 'CONFIG') && env.source.name}/
										{env.source.name}{/if}
								</span>
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

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.masked {
		color: var(--ax-text-neutral-subtle);
		user-select: none;
		flex: 1 1 auto;
		min-width: 0;
	}

	.env-value {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.table-container {
		width: 100%;
		min-width: 0;
		overflow-x: auto;
	}

	.table-container :global(table) {
		width: 100%;
	}

	.table-container :global(th),
	.table-container :global(td) {
		vertical-align: top;
	}

	.table-container :global(th.name-column),
	.table-container :global(td.name-cell) {
		width: 1%;
		white-space: nowrap;
	}

	.table-container :global(th.source-column) {
		width: 1%;
		white-space: nowrap;
	}

	.table-container :global(td.value-cell) {
		min-width: 0;
	}

	.source {
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		white-space: nowrap;
	}

	.muted {
		color: var(--ax-text-neutral-subtle);
	}

	section :global(code) {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	.table-container :global(td.name-cell code) {
		white-space: nowrap;
	}

	.table-container :global(td.value-cell code) {
		display: block;
		flex: 1 1 auto;
		min-width: 0;
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.env-value :global(button) {
		flex-shrink: 0;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.section-header {
			flex-direction: column;
			gap: var(--ax-space-8);
		}

		.table-container :global(th.source-column) {
			width: 1%;
		}
	}
</style>
