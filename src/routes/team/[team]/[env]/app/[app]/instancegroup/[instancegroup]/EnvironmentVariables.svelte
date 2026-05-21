<script lang="ts">
	import type { InstanceGroupDetail$result } from '$houdini';
	import List from '$lib/ui/List.svelte';
	import { Button, CopyButton } from '@nais/ds-svelte-community';
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

	function sourceLabel(kind: EnvironmentVariable['source']['kind']): string {
		if (kind === 'SECRET') return 'Secret';
		if (kind === 'CONFIG') return 'Config';
		if (kind === 'SPEC') return 'Application manifest';
		return 'Nais';
	}
</script>

{#if envVars.length > 0}
	<section class="section">
		<List title="Environment Variables" count={envVars.length} level="h3">
			{#snippet actions()}
				{#if hasSecrets && viewerIsMember && revealedValues.size > 0}
					<Button size="xsmall" variant="tertiary" icon={EyeSlashIcon} onclick={onHideAll}>
						Hide secret values
					</Button>
				{/if}
			{/snippet}
			<ul class="instancegroup-list env-list">
				{#each envVars as env, i (i)}
					<li class="instancegroup-list-item env-item">
						<div class="instancegroup-list-cell env-cell env-name-cell">
							<span class="instancegroup-list-label">Name</span>
							<code>{env.name}</code>
						</div>

						<div class="instancegroup-list-cell env-cell env-value-cell">
							<span class="instancegroup-list-label">Value</span>
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
						</div>

						<div class="instancegroup-list-cell env-cell env-source-cell">
							<span class="instancegroup-list-label">Source</span>
							<span class="source">
								{sourceLabel(env.source.kind)}
								{#if (env.source.kind === 'SECRET' || env.source.kind === 'CONFIG') && env.source.name}
									/ {env.source.name}
								{/if}
							</span>
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

	.env-list {
		--instancegroup-list-columns: minmax(0, 2fr) minmax(0, 2fr) minmax(0, 1.6fr);
	}

	.masked {
		color: var(--ax-text-neutral-subtle);
		user-select: none;
		flex: 1 1 auto;
		min-width: 0;
	}

	.env-value {
		display: flex;
		align-items: flex-start;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.env-cell code {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.source {
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.muted {
		color: var(--ax-text-neutral-subtle);
	}

	.env-value :global(button) {
		flex-shrink: 0;
	}
</style>
