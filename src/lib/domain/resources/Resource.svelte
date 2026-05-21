<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';

	interface Props {
		title: string;
		request: string;
		limit: string;
		usage?: string;
	}

	let { title, request, limit, usage }: Props = $props();
</script>

<SurfaceCard {title} level="h4">
	<dl class="resource-kv">
		<div class="kv-row">
			<dt class="kv-label">Request</dt>
			<dd class="kv-value"><code>{request}</code></dd>
		</div>
		<div class="kv-row">
			<dt class="kv-label">Limit</dt>
			<dd class="kv-value"><code>{limit}</code></dd>
		</div>
		{#if usage}
			<div class="kv-row">
				<dt class="kv-label">Usage</dt>
				<dd class="kv-value"><code>{usage}</code></dd>
			</div>
		{/if}
	</dl>
</SurfaceCard>

<style>
	.resource-kv {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		margin: 0;
	}

	.kv-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--ax-space-8);
	}

	.kv-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	.kv-value {
		font-size: var(--ax-font-size-small);
	}

	code {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}
</style>
