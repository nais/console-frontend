<script lang="ts">
	import type { InstanceGroupDetail$result } from '$houdini';
	import { SvelteMap } from 'svelte/reactivity';
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
						<Th style="min-width: 160px">Name</Th>
						<Th style="min-width: 360px">Value</Th>
						<Th style="white-space: nowrap; min-width: 400px">Source</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each envVars as env (env.name)}
						<Tr>
							<Td><code>{env.name}</code></Td>
							<Td>
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
							<Td>
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
	}

	.env-value {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		white-space: nowrap;
	}

	.table-container {
		width: 100%;
		overflow-x: auto;
	}

	.table-container :global(table) {
		min-width: 720px;
	}

	.table-container :global(th),
	.table-container :global(td) {
		white-space: nowrap;
	}

	.table-container :global(tr > td:nth-child(2)) {
		min-width: 360px;
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
		overflow-wrap: normal;
		word-break: normal;
		white-space: nowrap;
		display: inline-block;
		min-width: max-content;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.section-header {
			flex-direction: column;
			gap: var(--ax-space-8);
		}

		:global(th[style*='min-width: 400px']) {
			min-width: 240px !important;
		}
	}
</style>
