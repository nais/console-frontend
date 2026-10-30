<script lang="ts">
	import LokiLogs from '#lib/domain/logs/LokiLogs.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { formatPostgresLogInstance } from '#lib/utils/logViewer.js';
	import { page } from '$app/state';
	import { Alert, Button, Loader, Select } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresLogs } = $derived(data);
	let postgres = $derived($PostgresLogs.data?.team.environment.postgres);
	let branches = $derived.by(() => {
		const nodes = postgres?.branches.nodes ?? [];
		const active = postgres?.activeBranch;
		return active ? [active, ...nodes.filter((branch) => branch.id !== active.id)] : nodes;
	});
	let selectedBranch = $state<string>();
	let branch = $derived(
		selectedBranch !== undefined &&
			(selectedBranch === '' || branches.some((candidate) => candidate.name === selectedBranch))
			? selectedBranch
			: (postgres?.activeBranch?.name ?? branches[0]?.name ?? '')
	);
	let loadingBranches = $state(false);
	let branchLoadError = $state('');

	async function loadMoreBranches() {
		loadingBranches = true;
		branchLoadError = '';
		try {
			await PostgresLogs.loadNextPage({ first: 20 });
		} catch (error) {
			branchLoadError =
				error instanceof Error ? error.message : 'Could not load more branches. Please try again.';
		} finally {
			loadingBranches = false;
		}
	}
</script>

<GraphErrors errors={$PostgresLogs.errors} />

{#if $PostgresLogs.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="logs">
		{#if postgres.branches.pageInfo.hasNextPage}
			<Button size="small" variant="tertiary" loading={loadingBranches} onclick={loadMoreBranches}>
				Load more branches
			</Button>
		{/if}
		{#if branchLoadError}<Alert variant="error" size="small">{branchLoadError}</Alert>{/if}

		{#key `${page.params.team}/${page.params.env}/${page.params.postgres}/${branch}`}
			<LokiLogs
				team={page.params.team!}
				environment={page.params.env!}
				workload={page.params.postgres!}
				container="postgres"
				instances={[]}
				initialInstances={[]}
				podNamePrefix={`pg-${page.params.postgres}-${branch ? `${branch}-` : ''}`}
				exactPostgresBranch={branch !== ''}
				formatInstanceName={(instance) =>
					formatPostgresLogInstance(instance, page.params.postgres!)}
				startOnMount={true}
				hasLoki={true}
			>
				{#snippet filters()}
					<Select
						label="Branch"
						size="small"
						value={branch}
						onchange={(event) => (selectedBranch = event.currentTarget.value)}
					>
						<option value="">All branches</option>
						{#each branches as candidate (candidate.id)}
							<option value={candidate.name}>
								{candidate.name}{candidate.id === postgres.activeBranch?.id ? ' (active)' : ''}
							</option>
						{/each}
					</Select>
				{/snippet}
			</LokiLogs>
		{/key}
	</div>
{/if}

<style>
	.logs {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}
</style>
