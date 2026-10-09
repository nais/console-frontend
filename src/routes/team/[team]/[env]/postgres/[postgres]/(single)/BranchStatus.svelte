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
	<Tooltip content={active ? 'Active branch' : 'Not the active branch'}>
		<span
			class="status-indicator"
			role="img"
			aria-label={active ? 'Active branch' : 'Not the active branch'}
		>
			{#if active}
				<span aria-hidden="true"><RunningIndicator /></span>
			{:else}
				<span class="inactive-dot" aria-hidden="true"></span>
			{/if}
		</span>
	</Tooltip>
	<strong>{branch.name}</strong>
	{#if requestedBranch === branch.name && activeBranchId !== branch.id}
		<Tag size="xsmall" variant="warning">Activation requested</Tag>
	{/if}
	<span class="state">
		{#if branch.state === 'PROGRESSING'}
			<Loader size="xsmall" aria-hidden="true" />
		{/if}
		{stateLabel}
	</span>
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-24);
		height: var(--ax-space-24);
		flex-shrink: 0;
	}
	.status-indicator > span {
		display: inline-flex;
	}
	.inactive-dot {
		width: var(--ax-space-8);
		height: var(--ax-space-8);
		border-radius: var(--ax-radius-full);
		background-color: var(--ax-text-neutral-decoration);
	}
	.state {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
	}
</style>
