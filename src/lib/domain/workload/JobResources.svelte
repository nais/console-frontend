<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { CpuIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';

	interface Props {
		requests: { cpu: number | null; memory: number | null };
		limits: { cpu: number | null; memory: number | null };
	}

	let { requests, limits }: Props = $props();

	const DEFAULT_CPU_REQUEST = 0.2;
	const DEFAULT_CPU_LIMIT = 0.5;
	const DEFAULT_MEMORY_REQUEST = 268435456; // 256 MiB
	const DEFAULT_MEMORY_LIMIT = 536870912; // 512 MiB

	function formatCpu(
		value: number | null | undefined,
		fallback: number
	): { text: string; isDefault: boolean } {
		if (value === null || value === undefined) {
			return { text: fallback.toFixed(2), isDefault: true };
		}
		return { text: value.toFixed(2), isDefault: false };
	}

	function formatMemory(
		value: number | null | undefined,
		fallback: number
	): { text: string; isDefault: boolean } {
		const v = value ?? fallback;
		return {
			text: prettyBytes(v, {
				locale: 'en',
				minimumFractionDigits: 0,
				maximumFractionDigits: 1,
				binary: true
			}),
			isDefault: value === null || value === undefined
		};
	}

	let cpuReq = $derived(formatCpu(requests.cpu, DEFAULT_CPU_REQUEST));
	let cpuLim = $derived(formatCpu(limits.cpu, DEFAULT_CPU_LIMIT));
	let memReq = $derived(formatMemory(requests.memory, DEFAULT_MEMORY_REQUEST));
	let memLim = $derived(formatMemory(limits.memory, DEFAULT_MEMORY_LIMIT));
</script>

<SurfaceCard title="Resources">
	<div class="resources">
		<div class="resource-row">
			<div class="resource-icon">
				<CpuIcon />
			</div>
			<div class="resource-details">
				<span class="resource-label">CPU</span>
				<div class="resource-values">
					<span class="resource-entry">
						<span class="entry-label">Req</span>
						<code>{cpuReq.text}</code>
					</span>
					<span class="resource-entry">
						<span class="entry-label">Lim</span>
						<code>{cpuLim.text}</code>
					</span>
				</div>
			</div>
		</div>
		<div class="resource-row">
			<div class="resource-icon">
				<DatabaseIcon />
			</div>
			<div class="resource-details">
				<span class="resource-label">Memory</span>
				<div class="resource-values">
					<span class="resource-entry">
						<span class="entry-label">Req</span>
						<code>{memReq.text}</code>
					</span>
					<span class="resource-entry">
						<span class="entry-label">Lim</span>
						<code>{memLim.text}</code>
					</span>
				</div>
			</div>
		</div>
	</div>
</SurfaceCard>

<style>
	.resources {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.resource-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
	}

	.resource-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
		border-radius: var(--ax-radius-8);
		font-size: 1.1rem;
		color: var(--ax-text-neutral-subtle);
		background: color-mix(in srgb, var(--ax-text-neutral-subtle) 10%, transparent);
	}

	.resource-details {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
		min-width: 0;
	}

	.resource-label {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral);
	}

	.resource-values {
		display: flex;
		gap: var(--ax-space-16);
	}

	.resource-entry {
		display: flex;
		align-items: baseline;
		gap: var(--ax-space-6);
	}

	.entry-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	code {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}
</style>
