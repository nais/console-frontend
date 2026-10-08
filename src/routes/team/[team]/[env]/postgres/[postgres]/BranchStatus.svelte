<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';

	interface Props {
		branch: { id: string; name: string; state: string };
		activeBranchId?: string | null;
		requestedBranch?: string | null;
	}

	let { branch, activeBranchId, requestedBranch }: Props = $props();
</script>

<div class="branch-status">
	<strong>{branch.name}</strong>
	{#if activeBranchId === branch.id}
		<Tag size="xsmall" variant="success">Active</Tag>
	{:else if requestedBranch !== branch.name}
		<Tag size="xsmall" variant="neutral">Not active</Tag>
	{/if}
	{#if requestedBranch === branch.name && activeBranchId !== branch.id}
		<Tag size="xsmall" variant="warning">Activation requested</Tag>
	{/if}
	<span>{branch.state.toLowerCase()}</span>
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
</style>
