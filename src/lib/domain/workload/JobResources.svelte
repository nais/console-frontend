<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import prettyBytes from 'pretty-bytes';

	interface Props {
		requests: { cpu: number | null; memory: number | null };
		limits: { cpu: number | null; memory: number | null };
	}

	let { requests, limits }: Props = $props();

	function formatCpu(value: number | null): string {
		if (value === null || value === 0) return '—';
		return `${value.toFixed(2)} CPUs`;
	}

	function formatMemory(value: number | null): string {
		if (value === null || value === 0) return '—';
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
		<div class="resource-group">
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
		<div class="resource-group">
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
</SurfaceCard>

<style>
	.resources {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.resource-group {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
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
