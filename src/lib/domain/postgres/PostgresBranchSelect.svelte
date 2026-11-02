<script lang="ts">
	import type { PostgresInsightsStore } from '$houdini';
	import { Alert, Button, Select } from '@nais/ds-svelte-community';

	let {
		store,
		branch,
		onchange
	}: {
		store: PostgresInsightsStore;
		branch: string;
		onchange: (branch: string) => void;
	} = $props();

	let postgres = $derived($store.data?.team.environment.postgres);
	let branches = $derived.by(() => {
		const nodes = postgres?.branches.nodes ?? [];
		const active = postgres?.activeBranch;
		return active ? [active, ...nodes.filter((candidate) => candidate.id !== active.id)] : nodes;
	});
	let loading = $state(false);
	let error = $state('');

	async function loadMore() {
		loading = true;
		error = '';
		try {
			await store.loadNextPage({ first: 20 });
		} catch (cause) {
			error =
				cause instanceof Error ? cause.message : 'Could not load more branches. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

{#if postgres && (postgres.branches.pageInfo.totalCount > 1 || branch)}
	<div class="branch-selector">
		<Select
			label="Branch"
			size="small"
			value={branch}
			onchange={(event) => onchange(event.currentTarget.value)}
		>
			{#if branch && !branches.some((candidate) => candidate.name === branch)}
				<option value={branch}>{branch}</option>
			{/if}
			{#each branches as candidate (candidate.id)}
				<option value={candidate.name}>
					{candidate.name}{candidate.id === postgres.activeBranch?.id ? ' (active)' : ''}
				</option>
			{/each}
		</Select>
		{#if postgres.branches.pageInfo.hasNextPage}
			<Button size="small" variant="tertiary" {loading} onclick={loadMore}>
				Load more branches
			</Button>
		{/if}
	</div>
{/if}
{#if error}<Alert variant="error" size="small">{error}</Alert>{/if}

<style>
	.branch-selector {
		display: flex;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}
</style>
