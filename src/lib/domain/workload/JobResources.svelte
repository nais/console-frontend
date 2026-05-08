<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { CpuIcon, DatabaseIcon } from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';

	interface Props {
		requests: { cpu: number | null; memory: number | null };
		limits: { cpu: number | null; memory: number | null };
	}

	let { requests, limits }: Props = $props();

	function formatCpu(value: number | null | undefined): string {
		if (value === null || value === undefined) return '—';
		return `${value.toFixed(2)}`;
	}

	function formatMemory(value: number | null | undefined): string {
		if (value === null || value === undefined) return '—';
		return prettyBytes(value, {
			locale: 'en',
			minimumFractionDigits: 0,
			maximumFractionDigits: 1,
			binary: true
		});
	}
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
						<code>{formatCpu(requests.cpu)}</code>
					</span>
					<span class="resource-entry">
						<span class="entry-label">Lim</span>
						<code>{formatCpu(limits.cpu)}</code>
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
						<code>{formatMemory(requests.memory)}</code>
					</span>
					<span class="resource-entry">
						<span class="entry-label">Lim</span>
						<code>{formatMemory(limits.memory)}</code>
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
