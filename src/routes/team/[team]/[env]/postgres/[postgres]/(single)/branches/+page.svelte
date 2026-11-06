<script lang="ts">
	import { canActivateBranch, canDeleteBranch } from '#lib/domain/postgres/forms.js';
	import { branchOperation } from '#lib/domain/postgres/branchOperation.js';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import ActionConfirm from '#lib/ui/ActionConfirm.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import {
		ActionMenu,
		ActionMenuItem,
		Alert,
		BodyShort,
		Button,
		Detail,
		Heading,
		Loader,
		Modal,
		TextField
	} from '#lib/shadcn/ui/index.js';
	import { MenuElipsisVerticalIcon } from '#lib/icons/index.js';
	import { onMount } from 'svelte';
	import BranchStatus from '../BranchStatus.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresBranches, viewerIsMember } = $derived(data);
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
			if (
				document.visibilityState !== 'visible' ||
				$PostgresBranches.fetching ||
				loadingMore ||
				deleting
			) {
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
	let activationTarget = $state('');
	let confirmActivation = $state(false);
	let activationMessage = $state('');
	let deletionTarget = $state('');
	let deletionConfirmation = $state('');
	let deletionOpen = $state(false);
	let deleting = $state(false);
	let deletionError = $state('');
	let deletionMessage = $state('');
	let refreshError = $state('');
	let canManage = $derived(viewerIsMember || data.isAdmin);

	const activateBranch = graphql(`
		mutation ActivatePostgresBranch($input: ActivatePostgresBranchInput!) {
			activatePostgresBranch(input: $input) {
				postgres {
					id
					desiredActiveBranch
					activeBranch {
						id
						name
					}
				}
			}
		}
	`);
	const deleteBranch = graphql(`
		mutation DeletePostgresBranch($input: DeletePostgresBranchInput!) {
			deletePostgresBranch(input: $input) {
				postgresBranchDeleted
			}
		}
	`);

	async function removeBranch(event: SubmitEvent) {
		event.preventDefault();
		const target = deletionTarget;
		deletionError = '';
		if (
			!canManage ||
			deletionConfirmation !== target ||
			!branches.some((branch) => branch.name === target) ||
			!canDeleteBranch(target, postgres?.activeBranch?.name, postgres?.desiredActiveBranch)
		) {
			deletionError = 'Confirm an inactive branch before requesting deletion.';
			return;
		}
		deleting = true;
		try {
			const result = await branchOperation({
				request: () =>
					deleteBranch.mutate({
						input: {
							teamSlug: page.params.team!,
							environmentName: page.params.env!,
							postgres: page.params.postgres!,
							branch: target
						}
					}),
				accepted: (data) => data.deletePostgresBranch.postgresBranchDeleted === true,
				successMessage: `Deletion requested for ${target}. Cleanup is asynchronous; status updates automatically.`,
				rejectedMessage: 'Deletion was not accepted. Please try again.',
				refresh
			});
			if (!result.ok) {
				deletionError = result.message;
				return;
			}
			deletionMessage = result.message;
			deletionOpen = false;
		} finally {
			deleting = false;
		}
	}

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

	async function activate() {
		const target = activationTarget;
		if (
			!canManage ||
			!branches.some(
				(branch) =>
					branch.name === target &&
					canActivateBranch(branch, postgres?.activeBranch?.name, postgres?.desiredActiveBranch)
			)
		) {
			return { ok: false, message: 'This branch is not available for activation.' };
		}
		const result = await branchOperation({
			request: () =>
				activateBranch.mutate({
					input: {
						teamSlug: page.params.team!,
						environmentName: page.params.env!,
						postgres: page.params.postgres!,
						branch: target
					}
				}),
			accepted: (data) => !!data.activatePostgresBranch.postgres,
			successMessage: `Requested ${target} as the active branch. Activation is asynchronous; status updates automatically.`,
			rejectedMessage: 'Could not request activation. Please try again.',
			refresh
		});
		if (result.ok) activationMessage = result.message;
		return result;
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
				use the active branch. Switching branches does not merge their data.
			</BodyShort>
			<BodyShort>Creating new branches is no longer available in Console.</BodyShort>
			{#if activationMessage}
				<Alert variant="success" size="small">{activationMessage}</Alert>
			{/if}
			{#if deletionMessage}
				<Alert variant="success" size="small">{deletionMessage}</Alert>
			{/if}
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
									{#if canManage && (canActivateBranch(branch, postgres.activeBranch?.name, postgres.desiredActiveBranch) || canDeleteBranch(branch.name, postgres.activeBranch?.name, postgres.desiredActiveBranch))}
										<div class="branch-menu">
											<ActionMenu>
												{#snippet trigger(props)}
													<Button
														size="small"
														variant="tertiary"
														icon={MenuElipsisVerticalIcon}
														aria-label={`Actions for ${branch.name}`}
														{...props}
													/>
												{/snippet}
												{#if canActivateBranch(branch, postgres.activeBranch?.name, postgres.desiredActiveBranch)}
													<ActionMenuItem
														onselect={() => {
															activationTarget = branch.name;
															confirmActivation = true;
														}}
													>
														Use as active
													</ActionMenuItem>
												{/if}
												{#if canDeleteBranch(branch.name, postgres.activeBranch?.name, postgres.desiredActiveBranch)}
													<ActionMenuItem
														variant="danger"
														disabled={deleting}
														onselect={() => {
															deletionTarget = branch.name;
															deletionConfirmation = '';
															deletionError = '';
															deletionOpen = true;
														}}
													>
														Delete branch
													</ActionMenuItem>
												{/if}
											</ActionMenu>
										</div>
									{/if}
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

<ActionConfirm bind:open={confirmActivation} onconfirm={activate} confirmText="Use as active">
	{#snippet header()}<Heading as="h2" size="medium">Switch active branch</Heading>{/snippet}
	This requests <strong>{activationTarget}</strong> as the active branch for workloads using this Postgres.
	Activation is asynchronous; switching does not merge data between branches.
</ActionConfirm>

<Modal bind:open={deletionOpen} aria-label="Delete branch" onBeforeClose={() => !deleting}>
	{#snippet header()}<Heading as="h2" size="medium">Delete branch</Heading>{/snippet}
	<form onsubmit={removeBranch} class="deletion-form">
		<Alert variant="warning">
			This permanently deletes {deletionTarget} and its stored data. Remove any workload references to
			this branch before deletion. The active and requested active branches cannot be deleted.
		</Alert>
		<TextField
			label={`Confirm deletion by typing ${deletionTarget}`}
			bind:value={deletionConfirmation}
			required
		/>
		{#if deletionError}<Alert variant="error">{deletionError}</Alert>{/if}
		<Button
			type="submit"
			variant="danger"
			loading={deleting}
			disabled={deletionConfirmation !== deletionTarget}>Delete branch</Button
		>
		<Button
			type="button"
			variant="tertiary"
			disabled={deleting}
			onclick={() => (deletionOpen = false)}>Cancel</Button
		>
	</form>
</Modal>

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
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
		align-items: center;
		gap: var(--ax-space-24);
	}
	.branch-info,
	.branch-usage {
		display: grid;
		gap: var(--ax-space-4);
		min-width: 0;
	}
	.branch-menu {
		grid-column: 3;
		grid-row: 1;
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
			grid-template-columns: minmax(0, 1fr) auto;
			gap: var(--ax-space-8) var(--ax-space-16);
		}
		.branch-usage {
			grid-column: 1;
			grid-row: 2;
		}
		.branch-menu {
			grid-column: 2;
		}
	}
	.deletion-form {
		display: grid;
		gap: var(--ax-space-16);
	}
</style>
