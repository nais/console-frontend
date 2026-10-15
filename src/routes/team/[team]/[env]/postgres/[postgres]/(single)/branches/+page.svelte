<script lang="ts">
	import { canActivateBranch, canDeleteBranch } from '#lib/domain/postgres/forms.js';
	import { branchOperation } from '#lib/domain/postgres/branchOperation.js';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import ActionConfirm from '#lib/ui/ActionConfirm.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import List from '#lib/ui/List.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import {
		Alert,
		BodyShort,
		Button,
		Detail,
		Heading,
		Loader,
		Modal,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuItem } from '@nais/ds-svelte-community/experimental';
	import { MenuElipsisVerticalIcon } from '@nais/ds-svelte-community/icons';
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
	let sourceBranch = $state('');
	let earliestRestoreTime = $state<Date | null>(null);
	let recoveryWindowLoading = $state(false);
	let recoveryWindowError = $state('');
	let recoveryWindowRequest = 0;
	let newName = $state('');
	let targetTime = $state('');
	let creationOpen = $state(false);
	let now = $state(new Date());
	let maxTargetTime = $state<string>();
	function updateMaxTargetTime() {
		now = new Date();
		maxTargetTime = now.toISOString().slice(0, 16);
	}
	let minTargetTime = $derived.by(() => {
		if (!earliestRestoreTime) return undefined;
		const earliest = earliestRestoreTime.getTime();
		if (!Number.isFinite(earliest)) return undefined;
		const firstSelectableMinute = Math.ceil(earliest / 60_000) * 60_000;
		return new Date(firstSelectableMinute).toISOString().slice(0, 16);
	});
	onMount(() => {
		updateMaxTargetTime();
		const interval = setInterval(updateMaxTargetTime, 60_000);
		const pollingInterval = setInterval(() => {
			if (
				document.visibilityState !== 'visible' ||
				$PostgresBranches.fetching ||
				loadingMore ||
				creating ||
				deleting
			) {
				return;
			}
			void refresh().catch(() => {
				refreshError = 'Branch status could not be refreshed. Automatic updates will retry.';
			});
		}, 10_000);
		return () => {
			clearInterval(interval);
			clearInterval(pollingInterval);
		};
	});
	let createError = $state('');
	let createMessage = $state('');
	let creating = $state(false);
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

	function openCreation(source?: string) {
		if (creating) return;
		sourceBranch = source ?? postgres?.activeBranch?.name ?? branches[0]?.name ?? '';
		void loadRecoveryWindow(sourceBranch);
		newName = '';
		updateMaxTargetTime();
		targetTime = maxTargetTime ?? '';
		createError = '';
		creationOpen = true;
	}

	const branchRecoveryWindowQuery = graphql(`
		query PostgresBranchRecoveryWindow(
			$team: Slug!
			$env: String!
			$name: String!
			$branch: String!
		) {
			team(slug: $team) {
				environment(name: $env) {
					postgres(name: $name) {
						branch(name: $branch) {
							earliestRestoreTime
						}
					}
				}
			}
		}
	`);

	async function loadRecoveryWindow(branch: string) {
		const request = ++recoveryWindowRequest;
		earliestRestoreTime = null;
		recoveryWindowError = '';
		if (!branch) {
			recoveryWindowLoading = false;
			return;
		}
		recoveryWindowLoading = true;
		try {
			const result = await branchRecoveryWindowQuery.fetch({
				variables: {
					team: page.params.team!,
					env: page.params.env!,
					name: page.params.postgres!,
					branch
				},
				policy: 'NetworkOnly'
			});
			if (request !== recoveryWindowRequest) return;
			if (result.errors?.length) {
				recoveryWindowError = result.errors.map((error) => error.message).join('. ');
				return;
			}
			earliestRestoreTime =
				result.data?.team?.environment?.postgres?.branch?.earliestRestoreTime ?? null;
		} catch (error) {
			if (request === recoveryWindowRequest) {
				recoveryWindowError =
					error instanceof Error ? error.message : 'An unexpected error occurred.';
			}
		} finally {
			if (request === recoveryWindowRequest) recoveryWindowLoading = false;
		}
	}

	function changeSourceBranch(event: Event) {
		sourceBranch = (event.currentTarget as HTMLSelectElement).value;
		void loadRecoveryWindow(sourceBranch);
	}

	const createBranch = graphql(`
		mutation CreatePostgresBranch($input: CreatePostgresBranchInput!) {
			createPostgresBranch(input: $input) {
				postgresBranch {
					id
					name
					state
				}
			}
		}
	`);
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

	async function create(event: SubmitEvent) {
		event.preventDefault();
		if (creating) return;
		createError = '';
		createMessage = '';
		const selected = new Date(`${targetTime}Z`);
		const source = branches.find((branch) => branch.name === sourceBranch);
		if (!source) {
			createError = 'Choose a source branch.';
			return;
		}
		const earliestAllowed = earliestRestoreTime?.getTime() ?? NaN;
		if (
			!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(targetTime) ||
			Number.isNaN(selected.getTime()) ||
			selected.toISOString().slice(0, 16) !== targetTime ||
			!Number.isFinite(earliestAllowed) ||
			selected >= new Date() ||
			selected.getTime() < earliestAllowed
		) {
			createError =
				'Choose a restore time within the source branch recovery window and not in the future.';
			return;
		}
		if (
			!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(newName.trim()) ||
			newName.trim() === sourceBranch ||
			branches.some((branch) => branch.name === newName.trim())
		) {
			createError = 'Choose a new, unique name using lowercase letters, numbers and hyphens.';
			return;
		}
		if (!canManage) {
			createError = 'You do not have permission to create a branch.';
			return;
		}
		const createdName = newName.trim();
		creating = true;
		try {
			const result = await branchOperation({
				request: () =>
					createBranch.mutate({
						input: {
							teamSlug: page.params.team!,
							environmentName: page.params.env!,
							postgres: page.params.postgres!,
							branch: createdName,
							sourceBranch,
							targetTime: selected
						}
					}),
				accepted: (data) => !!data.createPostgresBranch.postgresBranch,
				successMessage: `${createdName} was created. Provisioning is asynchronous; status updates automatically. It will not become active automatically.`,
				rejectedMessage: 'Could not create branch. Please try again.',
				refresh
			});
			if (!result.ok) {
				createError = result.message;
				return;
			}
			creationOpen = false;
			newName = '';
			targetTime = '';
			createMessage = result.message;
		} finally {
			creating = false;
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
			<div class="section-header">
				<Heading as="h2" id="branches-heading" size="medium">
					Branches ({branches.length}{postgres.branches.pageInfo.hasNextPage ? '+' : ''})
				</Heading>
				<div class="branch-actions">
					{#if canManage && branches.length > 0}
						<Button size="small" onclick={() => openCreation()}>Create branch</Button>
					{/if}
				</div>
			</div>
			<BodyShort>
				Each branch is a separate writable database with its own data history. Workloads normally
				use the active branch. Switching branches does not merge their data.
			</BodyShort>
			{#if createMessage}
				<Alert variant="success" size="small">{createMessage}</Alert>
			{/if}
			{#if activationMessage}
				<Alert variant="success" size="small">{activationMessage}</Alert>
			{/if}
			{#if deletionMessage}
				<Alert variant="success" size="small">{deletionMessage}</Alert>
			{/if}
			<List headerless>
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
									{#if canManage}
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
												<button
													class="action-menu-button"
													onclick={() => openCreation(branch.name)}
												>
													<ActionMenuItem>Create child branch</ActionMenuItem>
												</button>
												{#if canActivateBranch(branch, postgres.activeBranch?.name, postgres.desiredActiveBranch)}
													<button
														class="action-menu-button"
														onclick={() => {
															activationTarget = branch.name;
															confirmActivation = true;
														}}
													>
														<ActionMenuItem>Use as active</ActionMenuItem>
													</button>
												{/if}
												{#if canDeleteBranch(branch.name, postgres.activeBranch?.name, postgres.desiredActiveBranch)}
													<button
														class="action-menu-button"
														disabled={deleting}
														onclick={() => {
															deletionTarget = branch.name;
															deletionConfirmation = '';
															deletionError = '';
															deletionOpen = true;
														}}
													>
														<ActionMenuItem variant="danger" disabled={deleting}
															>Delete branch</ActionMenuItem
														>
													</button>
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
			</List>
			{#if postgres.branches.pageInfo.hasNextPage}
				<Button variant="tertiary" size="small" onclick={loadMore} loading={loadingMore}>
					Load more
				</Button>
			{/if}
		</section>
	</div>
{/if}

<Modal
	bind:open={creationOpen}
	aria-label="Create branch"
	width="medium"
	onBeforeClose={() => !creating}
>
	{#snippet header()}<Heading as="h2" size="medium">Create branch</Heading>{/snippet}
	<form onsubmit={create} class="recovery-form">
		<BodyShort>
			Create a writable branch with the source branch's data and schema at the selected time. The
			source remains unchanged. Provisioning is asynchronous.
		</BodyShort>
		<TextField
			label="Branch name"
			description="Lowercase letters, numbers and hyphens; up to 63 characters."
			required
			bind:value={newName}
			disabled={creating}
		/>
		<Select
			label="Source branch"
			required
			bind:value={sourceBranch}
			onchange={changeSourceBranch}
			disabled={creating}
		>
			<option value="" disabled>Select a branch</option>
			{#each branches as branch (branch.id)}
				<option value={branch.name}>{branch.name}</option>
			{/each}
		</Select>
		{#if recoveryWindowLoading}
			<BodyShort>Checking the source branch restore window...</BodyShort>
		{:else if recoveryWindowError}
			<Alert variant="error" size="small"
				>Could not load the restore window: {recoveryWindowError}</Alert
			>
		{:else if sourceBranch && !earliestRestoreTime}
			<Alert variant="warning" size="small">
				The source branch does not have a recoverable backup window yet.
			</Alert>
		{/if}
		<TextField
			label="Restore to (UTC)"
			description="Choose a time in the source branch's currently available recovery window."
			type="datetime-local"
			min={minTargetTime}
			max={maxTargetTime}
			onfocus={updateMaxTargetTime}
			step={60}
			required
			bind:value={targetTime}
			disabled={creating || recoveryWindowLoading || !earliestRestoreTime}
		/>
		<BodyShort>The new branch will not become active automatically.</BodyShort>
		{#if createError}<Alert variant="error" size="small">{createError}</Alert>{/if}
		<div class="branch-actions">
			<Button
				type="button"
				variant="tertiary"
				disabled={creating}
				onclick={() => (creationOpen = false)}>Cancel</Button
			>
			<Button
				type="submit"
				loading={creating}
				disabled={creating || recoveryWindowLoading || !earliestRestoreTime}
			>
				Create branch
			</Button>
		</div>
	</form>
</Modal>

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
	.section-header,
	.branch-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-12);
		flex-wrap: wrap;
	}
	.branch-actions {
		justify-content: flex-end;
	}
	.action-menu-button {
		all: unset;
		display: contents;
		:global(*) {
			cursor: pointer;
		}
	}
	.recovery-form {
		display: grid;
		gap: var(--ax-space-12);
	}
	.deletion-form {
		display: grid;
		gap: var(--ax-space-16);
	}
</style>
