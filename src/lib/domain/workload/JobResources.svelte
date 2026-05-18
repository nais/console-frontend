<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { CpuIcon, FloppydiskIcon } from '@nais/ds-svelte-community/icons';
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

	function formatCpu(value: number | null | undefined, fallback: number): string {
		return (value ?? fallback).toFixed(2);
	}

	function formatMemory(value: number | null | undefined, fallback: number): string {
		return prettyBytes(value ?? fallback, {
			locale: 'en',
			minimumFractionDigits: 0,
			maximumFractionDigits: 1,
			binary: true
		});
	}

	let cpuReq = $derived(formatCpu(requests.cpu, DEFAULT_CPU_REQUEST));
	let cpuLim = $derived(formatCpu(limits.cpu, DEFAULT_CPU_LIMIT));
	let memReq = $derived(formatMemory(requests.memory, DEFAULT_MEMORY_REQUEST));
	let memLim = $derived(formatMemory(limits.memory, DEFAULT_MEMORY_LIMIT));
</script>

<SurfaceCard title="Resources">
	<div class="resources">
		<div class="resource-row">
			<div class="surface-icon">
				<CpuIcon />
			</div>
			<div class="resource-details">
				<span class="resource-label">CPU</span>
				<div class="resource-values">
					<span class="resource-entry">
						<span class="entry-label">Req</span>
						<code style="font-size: 0.8em">{cpuReq}</code>
					</span>
					<span class="resource-entry">
						<span class="entry-label">Lim</span>
						<code style="font-size: 0.8em">{cpuLim}</code>
					</span>
				</div>
			</div>
		</div>
		<div class="resource-row">
			<div class="surface-icon">
				<FloppydiskIcon />
			</div>
			<div class="resource-details">
				<span class="resource-label">Memory</span>
				<div class="resource-values">
					<span class="resource-entry">
						<span class="entry-label">Req</span>
						<code style="font-size: 0.8em">{memReq}</code>
					</span>
					<span class="resource-entry">
						<span class="entry-label">Lim</span>
						<code style="font-size: 0.8em">{memLim}</code>
					</span>
				</div>
			</div>
		</div>
	</div>
</SurfaceCard>

<style>
	.resources {
		--surface-icon-size: 2rem;
		--surface-icon-glyph-size: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.resource-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
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
