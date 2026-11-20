<script lang="ts">
	import type {
		ApplicationScalingDiagnostics$data,
		ApplicationScalingState$options
	} from '$houdini';
	import { Tag, type TagProps } from '#lib/shadcn/ui/index.js';
	import Collection from '#lib/ui/Collection.svelte';

	let {
		scaling,
		resizeHref
	}: { scaling: ApplicationScalingDiagnostics$data; resizeHref?: string } = $props();

	const statuses = {
		ACTIVE: { label: 'Active', variant: 'success' },
		LIMITED_BY_MAXIMUM: { label: 'Limited by maximum', variant: 'warning' },
		METRICS_UNAVAILABLE: { label: 'Metrics unavailable', variant: 'warning' },
		UNABLE_TO_SCALE: { label: 'Unable to scale', variant: 'warning' },
		DISABLED: { label: 'Disabled', variant: 'neutral' }
	} as const satisfies Record<
		ApplicationScalingState$options,
		{ label: string; variant: TagProps['variant'] }
	>;
	const status = $derived(scaling.status);
	const presentation = $derived(
		(status && statuses[status.state]) || { label: 'Unknown', variant: 'neutral' as const }
	);
</script>

<Collection title="Automatic scaling" level="h2">
	<div class="scaling">
		{#if status}
			<div><Tag size="small" variant={presentation.variant}>{presentation.label}</Tag></div>
			<p>{status.message}</p>
		{:else}
			<p>Automatic scaling is not set up for this application.</p>
		{/if}

		<dl>
			{#if status}
				<div>
					<dt>Currently running</dt>
					<dd>{status.currentInstances}</dd>
				</div>
				<div>
					<dt>Autoscaler target</dt>
					<dd>{status.desiredInstances}</dd>
				</div>
			{/if}
			<div>
				<dt>Configured range</dt>
				<dd>{scaling.minInstances} &ndash; {scaling.maxInstances}</dd>
			</div>
		</dl>
		{#if status?.state === 'LIMITED_BY_MAXIMUM' && resizeHref}
			<a href={resizeHref}>Review scaling limits</a>
		{/if}
	</div>
</Collection>

<style>
	.scaling {
		display: grid;
		gap: var(--nais-space-8);
		padding: var(--nais-space-12) var(--nais-space-16);
		font-size: var(--sh-font-size-sm);
		overflow-wrap: anywhere;
	}

	p,
	dl,
	dd {
		margin: 0;
	}

	dl {
		display: flex;
		flex-wrap: wrap;
		gap: var(--nais-space-8) var(--nais-space-16);
	}

	dt {
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-xs);
	}

	dd {
		font-weight: var(--sh-font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}
</style>
