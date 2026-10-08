<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import ActionConfirm from '#lib/ui/ActionConfirm.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import {
		Alert,
		BodyShort,
		Button,
		Heading,
		Loader,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import BranchStatus from '../BranchStatus.svelte';

	let { data }: PageProps = $props();
	let { PostgresBranches, viewerIsMember } = $derived(data);
	let postgres = $derived($PostgresBranches.data?.team.environment.postgres);
	let branches = $derived(postgres?.branches.nodes ?? []);
	let sourceBranch = $state('');
	let newName = $state('');
	let targetTime = $state('');
	let createError = $state('');
	let createMessage = $state('');
	let creating = $state(false);
	let loadingMore = $state(false);
	let activationTarget = $state('');
	let confirmActivation = $state(false);
	let activationMessage = $state('');
	let canManage = $derived(
		viewerIsMember ||
			($PostgresBranches.data?.me?.__typename === 'User' && $PostgresBranches.data.me.isAdmin)
	);

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

	async function refresh() {
		await PostgresBranches.fetch({ policy: 'NetworkOnly' });
	}

	async function loadMore() {
		loadingMore = true;
		try {
			await PostgresBranches.loadNextPage({ first: 20 });
		} finally {
			loadingMore = false;
		}
	}

	async function create(event: SubmitEvent) {
		event.preventDefault();
		createError = '';
		createMessage = '';
		const selected = new Date(`${targetTime}Z`);
		if (
			!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(targetTime) ||
			Number.isNaN(selected.getTime()) ||
			selected.toISOString().slice(0, 16) !== targetTime ||
			selected >= new Date()
		) {
			createError = 'Choose a valid UTC time in the past.';
			return;
		}
		if (!branches.some((branch) => branch.name === sourceBranch)) {
			createError = 'Choose a source branch.';
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
		creating = true;
		try {
			const result = await createBranch.mutate({
				input: {
					teamSlug: page.params.team!,
					environmentName: page.params.env!,
					postgres: page.params.postgres!,
					branch: newName.trim(),
					sourceBranch,
					targetTime: selected
				}
			});
			if (result.errors || !result.data) return;
			const createdName = newName.trim();
			newName = '';
			targetTime = '';
			await refresh();
			createMessage = `${createdName} was created. Provisioning is asynchronous; use Refresh status to check when it is available. It will not become active automatically.`;
		} finally {
			creating = false;
		}
	}

	async function activate() {
		const target = activationTarget;
		if (!canManage || !branches.some((branch) => branch.name === target)) {
			return { ok: false, message: 'This branch is not available for activation.' };
		}
		const result = await activateBranch.mutate({
			input: {
				teamSlug: page.params.team!,
				environmentName: page.params.env!,
				postgres: page.params.postgres!,
				branch: target
			}
		});
		if (result.errors) {
			return {
				ok: false,
				message: result.errors.map((error) => error.message).join('. ')
			};
		}
		if (!result.data) {
			return { ok: false, message: 'Could not request activation. Please try again.' };
		}
		await refresh();
		activationMessage = `Requested ${target} as the active branch. Activation is asynchronous; use Refresh status to check when it has completed.`;
		return { ok: true, message: activationMessage };
	}
</script>

<GraphErrors errors={$PostgresBranches.errors} />
{#if $PostgresBranches.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="branches-page">
		<section aria-labelledby="branches-heading">
			<Heading as="h2" id="branches-heading" size="medium" spacing>Branches</Heading>
			<BodyShort>
				Each branch is a separate writable database with its own data history. Workloads normally
				use the active branch. Switching branches does not merge their data.
			</BodyShort>
			<BodyShort>
				Currently active: <strong>{postgres.activeBranch?.name ?? 'None'}</strong>
				{#if postgres.desiredActiveBranch && postgres.desiredActiveBranch !== postgres.activeBranch?.name}
					(activation requested for <strong>{postgres.desiredActiveBranch}</strong>)
				{/if}
			</BodyShort>
			<Button
				size="small"
				variant="secondary"
				onclick={refresh}
				loading={$PostgresBranches.fetching}
				disabled={loadingMore}
			>
				Refresh status
			</Button>
			{#if activationMessage}
				<Alert variant="success" size="small">{activationMessage}</Alert>
			{/if}
			<ul class="branch-list">
				{#each branches as branch (branch.id)}
					<li>
						<BranchStatus
							{branch}
							activeBranchId={postgres.activeBranch?.id}
							requestedBranch={postgres.desiredActiveBranch}
						/>
						{#if canManage && branch.name !== (postgres.desiredActiveBranch ?? postgres.activeBranch?.name)}
							<Button
								size="small"
								variant="secondary"
								onclick={() => {
									activationTarget = branch.name;
									confirmActivation = true;
								}}>Use as active</Button
							>
						{/if}
					</li>
				{:else}
					<li>No branches found.</li>
				{/each}
			</ul>
			{#if postgres.branches.pageInfo.hasNextPage}
				<Button variant="tertiary" size="small" onclick={loadMore} loading={loadingMore}>
					Load more
				</Button>
			{/if}
		</section>

		{#if canManage && branches.length > 0}
			<section aria-labelledby="recover-heading">
				<Heading as="h2" id="recover-heading" size="medium" spacing
					>Recover to a point in time</Heading
				>
				<BodyShort>
					Create a new branch using the source branch's data at the chosen time. The source remains
					unchanged. The new branch is not automatically used by workloads.
				</BodyShort>
				{#if createMessage}
					<Alert variant="success" size="small">{createMessage}</Alert>
				{/if}
				<form onsubmit={create} class="recovery-form">
					<Select label="Source branch" required bind:value={sourceBranch}>
						<option value="" disabled>Select a branch</option>
						{#each branches as branch (branch.id)}
							<option value={branch.name}>{branch.name}</option>
						{/each}
					</Select>
					<TextField
						label="New branch name"
						description="Lowercase letters, numbers and hyphens; up to 63 characters."
						required
						bind:value={newName}
					/>
					<TextField
						label="Restore to (UTC)"
						type="datetime-local"
						step={60}
						required
						bind:value={targetTime}
					/>
					{#if createError}<Alert variant="error" size="small">{createError}</Alert>{/if}
					<GraphErrors errors={$createBranch.errors} />
					<Button type="submit" loading={creating}>Create branch</Button>
				</form>
			</section>
		{/if}
	</div>
{/if}

<ActionConfirm bind:open={confirmActivation} onconfirm={activate} confirmText="Use as active">
	{#snippet header()}<Heading as="h2" size="medium">Switch active branch</Heading>{/snippet}
	This requests <strong>{activationTarget}</strong> as the active branch for workloads using this Postgres.
	Activation is asynchronous; switching does not merge data between branches.
</ActionConfirm>

<style>
	.branches-page {
		display: grid;
		gap: var(--ax-space-32);
		max-width: var(--ax-breakpoint-md);
	}
	.branch-list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--ax-space-12);
	}
	.branch-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		flex-wrap: wrap;
	}
	.recovery-form {
		display: grid;
		gap: var(--ax-space-12);
		max-width: var(--ax-breakpoint-sm);
		margin-top: var(--ax-space-16);
	}
</style>
