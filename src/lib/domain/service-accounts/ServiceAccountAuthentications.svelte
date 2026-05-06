<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { fragment, graphql, type ServiceAccountAuthenticationFragment } from '$houdini';
	import SearchComponent from '$lib/domain/search/Search.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import {
		Alert,
		Button,
		CopyButton,
		Detail,
		Heading,
		Modal,
		Tabs,
		TextField,
		Tooltip
	} from '@nais/ds-svelte-community';
	import {
		BranchingIcon,
		BriefcaseClockIcon,
		ClockDashedIcon,
		EnvelopeOpenIcon,
		PackageIcon,
		TokenIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';

	interface Props {
		serviceAccount: ServiceAccountAuthenticationFragment;
		viewerIsMember?: boolean;
	}

	let { serviceAccount, viewerIsMember = false }: Props = $props();

	const data = $derived(
		fragment(
			serviceAccount,
			graphql(`
				fragment ServiceAccountAuthenticationFragment on ServiceAccount {
					id
					workloadBindings(first: 20) {
						edges {
							node {
								id
								workload {
									__typename
									name
									teamEnvironment {
										environment {
											name
										}
									}
									team {
										slug
									}
								}
								environment
								teamSlug
								workloadName
								isBroken
								createdAt
								lastUsedAt
							}
						}
					}

					tokens {
						edges {
							node {
								id
								description
								name
								createdAt
								lastUsedAt
								expiresAt
							}
						}
					}
				}
			`)
		)
	);

	const searchQuery = $derived(
		graphql(`
			query TeamSAAuthorizationSearch($query: String!, $team: Slug!) {
				search(filter: { query: $query, types: [APPLICATION, JOB], teams: [$team] }) {
					nodes {
						__typename
						... on Workload {
							id
							name
							teamEnvironment {
								environment {
									name
								}
							}
						}
					}
				}
			}
		`)
	);

	let showAddModal = $state(false);
	let searchString = $state('');

	$effect(() => {
		if (searchString) {
			const timeout = setTimeout(() => {
				searchQuery.fetch({ variables: { query: searchString, team: page.params.team ?? '' } });
			}, 300);

			return () => clearTimeout(timeout);
		}
	});

	const filteredSearchResults = $derived(
		searchString && $searchQuery.data
			? $searchQuery.data.search.nodes.filter(
					(
						n
					): n is typeof n & {
						__typename: 'Application' | 'Job';
						id: string;
						name: string;
						teamEnvironment: { environment: { name: string } };
					} => n.__typename === 'Application' || n.__typename === 'Job'
				)
			: []
	);

	let tokenName = $state('');
	let tokenDescription = $state('');
	let tokenExpiresAt = $state('');
	let tokenCreating = $state(false);
	let createdTokenSecret: string | null = $state(null);
	let tokenErrors: { message: string }[] | undefined = $state();

	// Removal state
	let removeErrors: { message: string }[] | undefined = $state();
	let deleteTokenOpen = $state(false);
	let tokenToDelete: { id: string; name: string } | null = $state(null);
	let removeBindingOpen = $state(false);
	let bindingToRemove: { id: string; workloadName: string; environment: string } | null =
		$state(null);

	let deleteTokenForm: HTMLFormElement | undefined = $state();
	let removeBindingForm: HTMLFormElement | undefined = $state();

	function handleDeleteToken() {
		deleteTokenForm?.requestSubmit();
	}

	function handleRemoveBinding() {
		removeBindingForm?.requestSubmit();
	}

	let createTokenForm: HTMLFormElement | undefined = $state();

	function handleCreateToken() {
		tokenErrors = undefined;
		tokenCreating = true;
		createTokenForm?.requestSubmit();
	}

	const totalMethods = $derived($data.workloadBindings.edges.length + $data.tokens.edges.length);
</script>

<section>
	<GraphErrors errors={removeErrors} dismissable />

	{#if totalMethods > 0}
		<div class="search">
			{#if viewerIsMember}
				<Button size="small" variant="secondary" onclick={() => (showAddModal = true)}
					>Add new</Button
				>
			{/if}
		</div>

		<List title="{totalMethods} authentication method{totalMethods !== 1 ? 's' : ''}">
			{#each $data.workloadBindings.edges as { node: binding } (binding.id)}
				<ListItem>
					<IconLabel
						as="h4"
						size="large"
						label={binding.workload?.name ?? binding.workloadName}
						icon={BranchingIcon}
						tag={{
							label: binding.workload?.teamEnvironment.environment.name ?? binding.environment,
							variant: envTagVariant(
								binding.workload?.teamEnvironment.environment.name ?? binding.environment
							)
						}}
						description="Workload binding · {binding.workload?.__typename === 'Application'
							? 'Application'
							: 'Job'}{binding.isBroken ? ' · Broken' : ''}"
					/>

					<div class="right">
						{#if binding.lastUsedAt}
							<Tooltip content="Last used - {format(binding.lastUsedAt, 'PPPP', { locale: enGB })}">
								<Detail>
									Last used <Time time={binding.lastUsedAt} distance={true} />
								</Detail>
							</Tooltip>
						{:else}
							<Detail>Never used</Detail>
						{/if}
						<Tooltip content="Created - {format(binding.createdAt, 'PPPP', { locale: enGB })}">
							<Detail>
								Created <Time time={binding.createdAt} distance={true} />
							</Detail>
						</Tooltip>
						{#if viewerIsMember}
							<Button
								size="xsmall"
								variant="tertiary-neutral"
								title="Remove binding"
								onclick={() => {
									bindingToRemove = {
										id: binding.id,
										workloadName: binding.workload?.name ?? binding.workloadName,
										environment:
											binding.workload?.teamEnvironment.environment.name ?? binding.environment
									};
									removeBindingOpen = true;
								}}
							>
								{#snippet icon()}<TrashIcon
										style="color:var(--ax-text-danger-decoration)"
									/>{/snippet}
							</Button>
						{/if}
					</div>
				</ListItem>
			{/each}

			{#each $data.tokens.edges as { node: token } (token.id)}
				<ListItem>
					<IconLabel
						as="h4"
						size="large"
						label={token.name}
						icon={TokenIcon}
						description="API Token · {token.description}"
					/>

					<div class="right">
						{#if token.lastUsedAt}
							<Tooltip content="Last used - {format(token.lastUsedAt, 'PPPP', { locale: enGB })}">
								<Detail>
									Last used <Time time={token.lastUsedAt} distance={true} />
								</Detail>
							</Tooltip>
						{:else}
							<Detail>Never used</Detail>
						{/if}
						<Tooltip content="Created - {format(token.createdAt, 'PPPP', { locale: enGB })}">
							<Detail>
								Created <Time time={token.createdAt} distance={true} />
							</Detail>
						</Tooltip>
						{#if token.expiresAt}
							<Tooltip content="Expires - {format(token.expiresAt, 'PPPP', { locale: enGB })}">
								<Detail>
									Expires <Time time={token.expiresAt} distance={true} />
								</Detail>
							</Tooltip>
						{/if}
						{#if viewerIsMember}
							<Button
								size="xsmall"
								variant="tertiary-neutral"
								title="Delete token"
								onclick={() => {
									tokenToDelete = { id: token.id, name: token.name };
									deleteTokenOpen = true;
								}}
							>
								{#snippet icon()}<TrashIcon
										style="color:var(--ax-text-danger-decoration)"
									/>{/snippet}
							</Button>
						{/if}
					</div>
				</ListItem>
			{/each}
		</List>
	{:else}
		<Heading size="small" as="h3">Authentication methods</Heading>
		<p>No available authentication methods.</p>
		{#if viewerIsMember}
			<Button size="small" variant="secondary" onclick={() => (showAddModal = true)}>Add new</Button
			>
		{/if}
	{/if}
</section>

<Modal width="medium" bind:open={showAddModal} class="search-modal">
	<Tabs value="workload_binding">
		<Tabs.List>
			<Tabs.Tab value="workload_binding">
				{#snippet icon()}<ClockDashedIcon aria-label="Workload binding" />{/snippet}
				Workload binding
			</Tabs.Tab>
			<Tabs.Tab value="api_token">
				{#snippet icon()}<EnvelopeOpenIcon aria-label="API Token" />{/snippet}
				API Token
			</Tabs.Tab>
		</Tabs.List>

		<Tabs.Panel value="workload_binding">
			<SearchComponent
				close={() => (showAddModal = false)}
				placeholder="Search for workloads..."
				bind:query={searchString}
				loading={$searchQuery.fetching}
				suggestions={false}
				helpers={false}
				results={filteredSearchResults.length > 0
					? filteredSearchResults.map((node) => ({
							icon: node.__typename === 'Application' ? PackageIcon : BriefcaseClockIcon,
							label: node.name,
							description: node.__typename === 'Application' ? 'Application' : 'Job',
							tag: {
								label: node.teamEnvironment.environment.name,
								variant: envTagVariant(node.teamEnvironment.environment.name)
							},
							type: 'button' as const,
							button: {
								onclick: () => {
									const form = document.getElementById(`add-binding-${node.id}`);
									if (form instanceof HTMLFormElement) form.requestSubmit();
								},
								label: 'Add',
								variant: 'tertiary' as const
							}
						}))
					: undefined}
			/>
		</Tabs.Panel>

		<Tabs.Panel value="api_token">
			{#if createdTokenSecret}
				<div class="token-created">
					<Alert variant="success">
						Token created successfully. Copy the secret below — it will not be shown again.
					</Alert>
					<div class="token-secret">
						<code>{createdTokenSecret}</code>
						<CopyButton
							text="Copy"
							activeText="Copied"
							variant="action"
							copyText={createdTokenSecret}
							size="small"
						/>
					</div>
					<Button
						size="small"
						variant="secondary"
						onclick={() => {
							createdTokenSecret = null;
							showAddModal = false;
						}}
					>
						Done
					</Button>
				</div>
			{:else}
				<div class="token-form">
					{#if tokenErrors}
						<Alert variant="error">
							{#each tokenErrors as err (err.message)}
								<p>{err.message}</p>
							{/each}
						</Alert>
					{/if}
					<TextField size="small" label="Token name" bind:value={tokenName} autocomplete="off" />
					<TextField
						size="small"
						label="Description"
						bind:value={tokenDescription}
						autocomplete="off"
					/>
					<TextField
						size="small"
						label="Expires at (optional)"
						type="date"
						bind:value={tokenExpiresAt}
					/>
					<div class="token-form-actions">
						<Button
							size="small"
							onclick={handleCreateToken}
							loading={tokenCreating}
							disabled={!tokenName || !tokenDescription}
						>
							Create token
						</Button>
						<Button size="small" variant="tertiary" onclick={() => (showAddModal = false)}>
							Cancel
						</Button>
					</div>
				</div>
			{/if}
		</Tabs.Panel>
	</Tabs>
</Modal>

<Confirm
	bind:open={deleteTokenOpen}
	confirmText="Delete"
	variant="danger"
	onconfirm={handleDeleteToken}
>
	{#snippet header()}
		<Heading size="small" as="h3">Delete API Token</Heading>
	{/snippet}
	Are you sure you want to delete the token <strong>{tokenToDelete?.name}</strong>? This action
	cannot be undone.
</Confirm>

<Confirm
	bind:open={removeBindingOpen}
	confirmText="Remove"
	variant="danger"
	onconfirm={handleRemoveBinding}
>
	{#snippet header()}
		<Heading size="small" as="h3">Remove Workload Binding</Heading>
	{/snippet}
	Are you sure you want to remove the binding for workload
	<strong>{bindingToRemove?.workloadName}</strong> in environment
	<strong>{bindingToRemove?.environment}</strong>?
</Confirm>

{#each filteredSearchResults as node (node.id)}
	<form
		id="add-binding-{node.id}"
		method="POST"
		action="?/addBinding"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'failure') {
					tokenErrors = [
						{ message: (result.data as { error?: string })?.error ?? 'Unknown error' }
					];
				}
				await update();
			};
		}}
		hidden
	>
		<input type="hidden" name="serviceAccountID" value={$data.id} />
		<input type="hidden" name="workloadName" value={node.name} />
		<input type="hidden" name="environment" value={node.teamEnvironment.environment.name} />
		<input type="hidden" name="teamSlug" value={page.params.team ?? ''} />
	</form>
{/each}

<form
	bind:this={deleteTokenForm}
	method="POST"
	action="?/deleteToken"
	use:enhance={() => {
		removeErrors = undefined;
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				removeErrors = [{ message: (result.data as { error?: string })?.error ?? 'Unknown error' }];
			} else {
				tokenToDelete = null;
			}
			await update();
		};
	}}
	hidden
>
	<input type="hidden" name="tokenId" value={tokenToDelete?.id ?? ''} />
</form>

<form
	bind:this={removeBindingForm}
	method="POST"
	action="?/removeBinding"
	use:enhance={() => {
		removeErrors = undefined;
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				removeErrors = [{ message: (result.data as { error?: string })?.error ?? 'Unknown error' }];
			} else {
				bindingToRemove = null;
			}
			await update();
		};
	}}
	hidden
>
	<input type="hidden" name="bindingId" value={bindingToRemove?.id ?? ''} />
</form>

<form
	bind:this={createTokenForm}
	method="POST"
	action="?/createToken"
	use:enhance={() => {
		return async ({ result, update }) => {
			tokenCreating = false;
			if (result.type === 'failure') {
				tokenErrors = [{ message: (result.data as { error?: string })?.error ?? 'Unknown error' }];
			} else if (result.type === 'success') {
				createdTokenSecret = (result.data as { secret?: string | null })?.secret ?? null;
				tokenName = '';
				tokenDescription = '';
				tokenExpiresAt = '';
			}
			await update();
		};
	}}
	hidden
>
	<input type="hidden" name="serviceAccountID" value={$data.id} />
	<input type="hidden" name="name" value={tokenName} />
	<input type="hidden" name="description" value={tokenDescription} />
	<input type="hidden" name="expiresAt" value={tokenExpiresAt} />
</form>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	.search {
		display: flex;
		justify-content: flex-end;
	}

	:global(.search-modal) {
		height: 70vh;
		max-height: 600px;
	}

	@media (max-width: 767px) {
		.right {
			align-items: flex-end;
		}
	}

	.token-form {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding: var(--ax-space-24);
	}

	.token-form-actions {
		display: flex;
		gap: var(--ax-space-8);
	}

	.token-created {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding: var(--ax-space-24);
	}

	.token-secret {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-12);
		border-radius: 8px;
		overflow-x: auto;
	}

	.token-secret code {
		font-size: var(--ax-font-size-small);
		word-break: break-all;
	}
</style>
