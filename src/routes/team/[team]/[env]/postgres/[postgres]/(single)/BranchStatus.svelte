<script lang="ts">
	import { Tag, Tooltip } from '#lib/shadcn/ui/index.js';
	import BranchStateIndicator from './BranchStateIndicator.svelte';
	import { branchStateLabel } from './branchStateLabel.js';

	interface Props {
		branch: { id: string; name: string; state: string };
		activeBranchId?: string | null;
		requestedBranch?: string | null;
	}

	let { branch, activeBranchId, requestedBranch }: Props = $props();
	let active = $derived(activeBranchId === branch.id);
	let stateLabel = $derived(branchStateLabel(branch.state));
</script>

<div class="branch-status">
	<Tooltip content={stateLabel}>
		<span class="status-label" role="img" aria-label={stateLabel}>
			<BranchStateIndicator state={branch.state} />
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
	.status-label {
		display: flex;
	}
</style>
