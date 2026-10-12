<script lang="ts">
	import RunningIndicator from '#lib/ui/RunningIndicator.svelte';
	import { Loader, Tag, Tooltip } from '@nais/ds-svelte-community';

	interface Props {
		branch: { id: string; name: string; state: string };
		activeBranchId?: string | null;
		requestedBranch?: string | null;
	}

	let { branch, activeBranchId, requestedBranch }: Props = $props();
	let active = $derived(activeBranchId === branch.id);
	let stateLabel = $derived(
		branch.state === 'PROGRESSING'
			? 'Preparing'
			: branch.state === 'AVAILABLE'
				? 'Ready'
				: branch.state === 'DEGRADED'
					? 'Degraded'
					: branch.state
	);
</script>

<div class="branch-status">
	<Tooltip content={stateLabel}>
		<span class="status-indicator" role="img" aria-label={stateLabel}>
			{#if branch.state === 'AVAILABLE'}
				<span aria-hidden="true"><RunningIndicator /></span>
			{:else if branch.state === 'PROGRESSING'}
				<Loader size="xsmall" aria-hidden="true" />
			{:else}
				<span class="status-dot" class:degraded={branch.state === 'DEGRADED'} aria-hidden="true"
				></span>
			{/if}
		</span>
	</Tooltip>
	<strong>{branch.name}</strong>
	{#if active}
		<Tag size="xsmall" variant="neutral">Active</Tag>
	{/if}
	{#if requestedBranch === branch.name && activeBranchId !== branch.id}
		<Tag size="xsmall" variant="warning">Activation requested</Tag>
	{/if}
</div>

<style>
	.branch-status {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		flex-wrap: wrap;
		min-width: 0;
	}
	.branch-status strong {
		overflow-wrap: anywhere;
	}
	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-24);
		height: var(--ax-space-24);
		flex-shrink: 0;
	}
	.status-indicator > span {
		display: inline-flex;
	}
	.status-dot {
		width: var(--ax-space-8);
		height: var(--ax-space-8);
		border-radius: var(--ax-radius-full);
		background-color: var(--ax-text-neutral-decoration);
	}
	.status-dot.degraded {
		background-color: var(--ax-text-danger-decoration);
	}
</style>
