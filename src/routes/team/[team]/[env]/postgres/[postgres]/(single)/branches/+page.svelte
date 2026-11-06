<script lang="ts">
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import { Alert, BodyShort, Button, Detail, Heading, Loader } from '#lib/shadcn/ui/index.js';
	import { onMount } from 'svelte';
	import BranchStatus from '../BranchStatus.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresBranches } = $derived(data);
	let postgres = $derived($PostgresBranches.data?.team.environment.postgres);
	let branches = $derived.by(() => {
		const nodes = postgres?.branches.nodes ?? [];
		const activeBranch = postgres?.activeBranch;
		return activeBranch
			? [activeBranch, ...nodes.filter((branch) => branch.id !== activeBranch.id)]
			: nodes;
	});
	onMount(() => {
		const pollingInterval = setInterval(() => {
			if (document.visibilityState !== 'visible' || $PostgresBranches.fetching || loadingMore) {
				return;
			}
			void refresh().catch(() => {
				refreshError = 'Branch status could not be refreshed. Automatic updates will retry.';
			});
		}, 10_000);
		return () => {
			clearInterval(pollingInterval);
		};
	});
	let loadingMore = $state(false);
	let refreshError = $state('');

	async function refresh() {
		const result = await PostgresBranches.fetch({ policy: 'NetworkOnly' });
		if (result.errors?.length) {
			throw new Error(result.errors.map((error) => error.message).join('. '));
		}
		if (!result.data) throw new Error('No branch status returned.');
		refreshError = '';
	}

	async function loadMore() {
		loadingMore = true;
		try {
			await PostgresBranches.loadNextPage({ first: 20 });
		} catch {
			refreshError = 'More branches could not be loaded. Please try again.';
		} finally {
			loadingMore = false;
		}
	}
</script>

<GraphErrors errors={$PostgresBranches.errors} />
{#if refreshError}
	<Alert variant="warning" size="small">{refreshError}</Alert>
{/if}
{#if $PostgresBranches.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="branches-page">
		<section class="branches-section" aria-labelledby="branches-heading">
			<Heading as="h2" id="branches-heading" size="medium">
				Branches ({branches.length}{postgres.branches.pageInfo.hasNextPage ? '+' : ''})
			</Heading>
			<BodyShort>
				Each branch is a separate writable database with its own data history. Workloads normally
				use the active branch.
			</BodyShort>
			<BodyShort>Branch management is no longer available in Console.</BodyShort>
			<Collection headerless>
				<ul class="branch-list">
					{#each branches as branch (branch.id)}
						<li>
							<ListItem>
								<div class="branch-row">
									<div class="branch-info">
										<BranchStatus
											{branch}
											activeBranchId={postgres.activeBranch?.id}
											requestedBranch={postgres.desiredActiveBranch}
										/>
										<Detail>
											Created <Time time={branch.createdAt} dateFormat="d MMM yyyy, HH:mm" />
										</Detail>
									</div>
									<div class="branch-usage">
										{const workloads = $derived(exhaustive(branch.workloads.nodes))}
										{#if branch.workloads.pageInfo.totalCount > 0}
											<Detail>Used by</Detail>
											<ul class="branch-workloads">
												{#each workloads as workload (workload.id)}
													<li><WorkloadLink {workload} hideTeam hideEnv /></li>
												{/each}
											</ul>
											{#if branch.workloads.pageInfo.totalCount > workloads.length}
												<Detail>
													Showing first {workloads.length} of {branch.workloads.pageInfo.totalCount}
													workloads.
												</Detail>
											{/if}
										{:else}
											<Detail>No workloads</Detail>
										{/if}
									</div>
								</div>
							</ListItem>
						</li>
					{:else}
						<li><ListItem>No branches found.</ListItem></li>
					{/each}
				</ul>
			</Collection>
			{#if postgres.branches.pageInfo.hasNextPage}
				<Button variant="tertiary" size="small" onclick={loadMore} loading={loadingMore}>
					Load more
				</Button>
			{/if}
		</section>
	</div>
{/if}

<style>
	.branches-page {
		display: grid;
		gap: var(--ax-space-32);
		max-width: var(--ax-breakpoint-md);
	}
	.branches-section {
		display: grid;
		gap: var(--ax-space-16);
	}
	.branch-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.branch-list li:last-child :global(.list-item) {
		border-bottom: 0;
	}
	.branch-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
		align-items: center;
		gap: var(--ax-space-24);
	}
	.branch-info,
	.branch-usage {
		display: grid;
		gap: var(--ax-space-4);
		min-width: 0;
	}
	.branch-workloads {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-8) var(--ax-space-16);
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.branch-workloads li {
		min-width: 0;
		overflow-wrap: anywhere;
	}
	@container (max-width: 500px) {
		.branch-row {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--ax-space-8) var(--ax-space-16);
		}
		.branch-usage {
			grid-column: 1;
			grid-row: 2;
		}
	}
</style>
