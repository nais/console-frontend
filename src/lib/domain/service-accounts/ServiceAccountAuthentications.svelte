<script lang="ts">
	import { enhance } from '$app/forms';
	import { fragment, graphql, type ServiceAccountAuthenticationFragment } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import { pageModalClick } from '$lib/ui/PageModal.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Button, Detail, Heading } from '@nais/ds-svelte-community';
	import { BranchingIcon, TokenIcon, TrashIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		serviceAccount: ServiceAccountAuthenticationFragment;
		canManage?: boolean;
		basePath: string;
	}

	let { serviceAccount, canManage = false, basePath }: Props = $props();

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

	const totalMethods = $derived($data.workloadBindings.edges.length + $data.tokens.edges.length);

	const saPath = $derived(basePath);
</script>

<section aria-labelledby="auth-methods-heading">
	<Heading size="small" as="h3" id="auth-methods-heading">Authentication methods</Heading>
	<GraphErrors errors={removeErrors} dismissable />

	{#if totalMethods > 0}
		{#if canManage}
			<div class="actions">
				<Button
					size="small"
					variant="secondary"
					as="a"
					href="{saPath}/binding/add"
					onclick={pageModalClick}
				>
					Add workload binding
				</Button>
				<Button
					size="small"
					variant="secondary"
					as="a"
					href="{saPath}/token/create"
					onclick={pageModalClick}
				>
					Create API token
				</Button>
			</div>
		{/if}

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
							: binding.workload?.__typename === 'Job'
								? 'Job'
								: 'Workload'} · {binding.workload?.team?.slug ?? binding.teamSlug}{binding.isBroken
							? ' · Broken'
							: ''}"
					/>

					<div class="right">
						{#if binding.lastUsedAt}
							<Detail>
								Last used <Time time={binding.lastUsedAt} distance={true} />
							</Detail>
						{:else}
							<Detail>Never used</Detail>
						{/if}
						<Detail>
							Created <Time time={binding.createdAt} distance={true} />
						</Detail>
						{#if canManage}
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
							<Detail>
								Last used <Time time={token.lastUsedAt} distance={true} />
							</Detail>
						{:else}
							<Detail>Never used</Detail>
						{/if}
						<Detail>
							Created <Time time={token.createdAt} distance={true} />
						</Detail>
						{#if token.expiresAt}
							<Detail>
								Expires <Time time={token.expiresAt} distance={true} />
							</Detail>
						{/if}
						{#if canManage}
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
		<p>No authentication methods configured.</p>
		{#if canManage}
			<div class="actions">
				<Button
					size="small"
					variant="secondary"
					as="a"
					href="{saPath}/binding/add"
					onclick={pageModalClick}
				>
					Add workload binding
				</Button>
				<Button
					size="small"
					variant="secondary"
					as="a"
					href="{saPath}/token/create"
					onclick={pageModalClick}
				>
					Create API token
				</Button>
			</div>
		{/if}
	{/if}
</section>

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

	.actions {
		display: flex;
		gap: var(--ax-space-8);
	}

	@media (max-width: 767px) {
		.right {
			align-items: flex-end;
		}
	}
</style>
