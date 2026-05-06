<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		graphql,
		type AvailableRolesFragment,
		type ServiceAccountAuthenticationFragment,
		type ServiceAccountRolesFragment
	} from '$houdini';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { BodyLong, Button, Heading, Tooltip } from '@nais/ds-svelte-community';
	import { TrashIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';
	import ServiceAccountAuthentications from './ServiceAccountAuthentications.svelte';
	import ServiceAccountRoles from './ServiceAccountRoles.svelte';

	type ServiceAccountData = {
		id: string;
		name: string;
		description: string;
		createdAt: Date;
		updatedAt: Date;
		lastUsedAt: Date | null;
	} & ServiceAccountRolesFragment &
		ServiceAccountAuthenticationFragment;

	const {
		serviceAccount,
		environments,
		teamSlug,
		onmutated,
		roles,
		viewerIsMember
	}: {
		serviceAccount: ServiceAccountData;
		environments: { environment: { name: string } }[];
		teamSlug: string;
		roles: AvailableRolesFragment;
		onmutated?: () => void;
		viewerIsMember: boolean;
	} = $props();

	// --- Mutations ---

	const createToken = graphql(`
		mutation CreateServiceAccountToken($input: CreateServiceAccountTokenInput!) {
			createServiceAccountToken(input: $input) {
				secret
				serviceAccountToken {
					id
					name
					description
					createdAt
					expiresAt
				}
			}
		}
	`);

	const deleteToken = graphql(`
		mutation DeleteServiceAccountToken($input: DeleteServiceAccountTokenInput!) {
			deleteServiceAccountToken(input: $input) {
				serviceAccountTokenDeleted
			}
		}
	`);

	const addWorkload = graphql(`
		mutation AddWorkloadToServiceAccount($input: AddWorkloadToServiceAccountInput!) {
			addWorkloadToServiceAccount(input: $input) {
				binding {
					id
				}
			}
		}
	`);

	const removeWorkload = graphql(`
		mutation RemoveWorkloadFromServiceAccount($input: RemoveWorkloadFromServiceAccountInput!) {
			removeWorkloadFromServiceAccount(input: $input) {
				bindingDeleted
			}
		}
	`);

	const deleteServiceAccount = graphql(`
		mutation DeleteServiceAccount($input: DeleteServiceAccountInput!) {
			deleteServiceAccount(input: $input) {
				serviceAccountDeleted
			}
		}
	`);

	// --- State ---

	let errors: { message: string }[] | undefined = $state();

	// Token creation state
	let showCreateToken = $state(false);
	let tokenName = $state('');
	let tokenDescription = $state('');
	let tokenExpiresAt = $state('');
	let createdTokenSecret: string | null = $state(null);
	let tokenCreating = $state(false);

	// Token deletion state
	let deleteTokenOpen = $state(false);
	let tokenToDelete: { id: string; name: string } | null = $state(null);

	// Workload binding state
	let showAddWorkload = $state(false);
	let workloadEnvironment = $state('');
	let workloadTeamSlug = $state('');
	let workloadName = $state('');

	// Workload removal state
	let removeWorkloadOpen = $state(false);
	let bindingToRemove: { id: string; workloadName: string; environment: string } | null =
		$state(null);

	// Service account deletion state
	let deleteServiceAccountOpen = $state(false);

	// --- Handlers ---

	async function handleCreateToken() {
		errors = undefined;
		tokenCreating = true;
		const res = await createToken.mutate({
			input: {
				serviceAccountID: serviceAccount.id,
				name: tokenName,
				description: tokenDescription,
				expiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null
			}
		});
		tokenCreating = false;

		if (res.errors) {
			errors = res.errors;
			return;
		}

		createdTokenSecret = res.data?.createServiceAccountToken.secret ?? null;
		tokenName = '';
		tokenDescription = '';
		tokenExpiresAt = '';
		showCreateToken = false;
		onmutated?.();
	}

	async function handleDeleteToken() {
		if (!tokenToDelete) return;
		errors = undefined;
		const res = await deleteToken.mutate({
			input: { serviceAccountTokenID: tokenToDelete.id }
		});
		if (res.errors) {
			errors = res.errors;
		}
		tokenToDelete = null;
		onmutated?.();
	}

	async function handleAddWorkload() {
		if (!workloadEnvironment || !workloadTeamSlug || !workloadName) return;
		errors = undefined;
		const res = await addWorkload.mutate({
			input: {
				serviceAccountID: serviceAccount.id,
				environment: workloadEnvironment,
				teamSlug: workloadTeamSlug,
				workloadName
			}
		});
		if (res.errors) {
			errors = res.errors;
		}
		workloadEnvironment = '';
		workloadTeamSlug = '';
		workloadName = '';
		showAddWorkload = false;
		onmutated?.();
	}

	async function handleRemoveWorkload() {
		if (!bindingToRemove) return;
		errors = undefined;
		const res = await removeWorkload.mutate({
			input: { bindingID: bindingToRemove.id }
		});
		if (res.errors) {
			errors = res.errors;
		}
		bindingToRemove = null;
		onmutated?.();
	}

	async function handleDeleteServiceAccount() {
		errors = undefined;
		const res = await deleteServiceAccount.mutate({
			input: { serviceAccountID: serviceAccount.id }
		});
		if (res.errors) {
			errors = res.errors;
			return;
		}
		await goto(`/team/${teamSlug}/settings/service_accounts`);
	}
</script>

<GraphErrors {errors} dismissable />

<div class="detail-page">
	<!-- Overview Section -->
	<section>
		<Heading size="medium" as="h2">{serviceAccount.name}</Heading>
		<BodyLong spacing>{serviceAccount.description}</BodyLong>

		<dl class="metadata">
			<dt>Created</dt>
			<dd>
				<Tooltip content={format(serviceAccount.createdAt, 'PPPP', { locale: enGB })}>
					<Time time={serviceAccount.createdAt} distance={true} />
				</Tooltip>
			</dd>
			<dt>Last updated</dt>
			<dd>
				<Tooltip content={format(serviceAccount.updatedAt, 'PPPP', { locale: enGB })}>
					<Time time={serviceAccount.updatedAt} distance={true} />
				</Tooltip>
			</dd>
			<dt>Last used</dt>
			<dd>
				{#if serviceAccount.lastUsedAt}
					<Tooltip content={format(serviceAccount.lastUsedAt, 'PPPP', { locale: enGB })}>
						<Time time={serviceAccount.lastUsedAt} distance={true} />
					</Tooltip>
				{:else}
					Never
				{/if}
			</dd>
		</dl>

		{#if viewerIsMember}
			<div>
				<Button variant="danger" size="small" onclick={() => (deleteServiceAccountOpen = true)}>
					{#snippet icon()}
						<TrashIcon />
					{/snippet}
					Delete service account
				</Button>
			</div>
		{/if}
	</section>

	<!-- Roles Section -->
	<ServiceAccountRoles serviceAccountRoles={serviceAccount} {roles} {viewerIsMember} />

	<ServiceAccountAuthentications {serviceAccount} {viewerIsMember} />

	<!-- API Tokens Section -->
	<!-- <section>
		<div class="section-header">
			<Heading size="small" as="h3">API Tokens</Heading>
			<Button
				size="small"
				variant="secondary"
				icon={PlusIcon}
				onclick={() => {
					showCreateToken = true;
					createdTokenSecret = null;
				}}
			>
				Create token
			</Button>
		</div>

		{#if createdTokenSecret}
			<Alert variant="success" size="small" style="margin-bottom: 1rem;">
				<strong>Token created successfully!</strong> Copy the secret below — it will not be shown
				again.
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
			</Alert>
		{/if}

		{#if serviceAccount.tokens.nodes.length > 0}
			<Table size="small">
				<Thead>
					<Tr>
						<Th>Name</Th>
						<Th>Description</Th>
						<Th>Created</Th>
						<Th>Expires</Th>
						<Th>Last used</Th>
						<Th align="right">Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each serviceAccount.tokens.nodes as token (token.id)}
						<Tr>
							<Td><strong>{token.name}</strong></Td>
							<Td>{token.description}</Td>
							<Td>
								<Detail>
									<Time time={token.createdAt} distance={true} />
								</Detail>
							</Td>
							<Td>
								<Detail>
									{#if token.expiresAt}
										<Time time={token.expiresAt} distance={true} />
									{:else}
										Never
									{/if}
								</Detail>
							</Td>
							<Td>
								<Detail>
									{#if token.lastUsedAt}
										<Time time={token.lastUsedAt} distance={true} />
									{:else}
										Never
									{/if}
								</Detail>
							</Td>
							<Td align="right">
								<Button
									size="small"
									variant="tertiary-neutral"
									title="Delete token"
									onclick={() => {
										tokenToDelete = token;
										deleteTokenOpen = true;
									}}
								>
									{#snippet icon()}
										<TrashIcon style="color:var(--ax-text-danger-decoration)" />
									{/snippet}
								</Button>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		{:else}
			<BodyShort>No API tokens.</BodyShort>
		{/if}

		{#if showCreateToken}
			<div class="inline-form">
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
				<div class="inline-form-actions">
					<Button
						size="small"
						onclick={handleCreateToken}
						loading={tokenCreating}
						disabled={!tokenName || !tokenDescription}
					>
						Create
					</Button>
					<Button size="small" variant="tertiary" onclick={() => (showCreateToken = false)}>
						Cancel
					</Button>
				</div>
			</div>
		{/if}
	</section> -->

	<!-- Workload Bindings Section -->
	<!-- <section>
		<div class="section-header">
			<Heading size="small" as="h3">Workload Bindings</Heading>
			<Button
				size="small"
				variant="secondary"
				icon={PlusIcon}
				onclick={() => {
					showAddWorkload = true;
					workloadTeamSlug = teamSlug;
				}}
			>
				Add workload
			</Button>
		</div>

		<BodyShort spacing>
			Workload bindings allow applications or jobs to authenticate as this service account using
			their Kubernetes ServiceAccount token.
		</BodyShort>

		{#if serviceAccount.workloadBindings.nodes.length > 0}
			<Table size="small">
				<Thead>
					<Tr>
						<Th>Workload</Th>
						<Th>Environment</Th>
						<Th>Team</Th>
						<Th>Status</Th>
						<Th>Last used</Th>
						<Th align="right">Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each serviceAccount.workloadBindings.nodes as binding (binding.id)}
						<Tr>
							<Td><strong>{binding.workloadName}</strong></Td>
							<Td>{binding.environment}</Td>
							<Td>{binding.teamSlug}</Td>
							<Td>
								{#if binding.isBroken}
									<span class="status-broken">Broken</span>
								{:else}
									<span class="status-ok">OK</span>
								{/if}
							</Td>
							<Td>
								<Detail>
									{#if binding.lastUsedAt}
										<Time time={binding.lastUsedAt} distance={true} />
									{:else}
										Never
									{/if}
								</Detail>
							</Td>
							<Td align="right">
								<Button
									size="small"
									variant="tertiary-neutral"
									title="Remove binding"
									onclick={() => {
										bindingToRemove = binding;
										removeWorkloadOpen = true;
									}}
								>
									{#snippet icon()}
										<TrashIcon style="color:var(--ax-text-danger-decoration)" />
									{/snippet}
								</Button>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		{:else}
			<BodyShort>No workload bindings.</BodyShort>
		{/if}

		{#if showAddWorkload}
			<div class="inline-form">
				<Select size="small" label="Environment" bind:value={workloadEnvironment}>
					<option value="">Select environment</option>
					{#each environments as env (env.environment.name)}
						<option value={env.environment.name}>{env.environment.name}</option>
					{/each}
				</Select>
				<TextField
					size="small"
					label="Team slug"
					bind:value={workloadTeamSlug}
					autocomplete="off"
				/>
				<TextField
					size="small"
					label="Workload name"
					bind:value={workloadName}
					autocomplete="off"
				/>
				<div class="inline-form-actions">
					<Button
						size="small"
						onclick={handleAddWorkload}
						disabled={!workloadEnvironment || !workloadTeamSlug || !workloadName}
					>
						Add
					</Button>
					<Button size="small" variant="tertiary" onclick={() => (showAddWorkload = false)}>
						Cancel
					</Button>
				</div>
			</div>
		{/if}
	</section> -->
</div>

<!-- Confirm Dialogs -->
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
	bind:open={removeWorkloadOpen}
	confirmText="Remove"
	variant="danger"
	onconfirm={handleRemoveWorkload}
>
	{#snippet header()}
		<Heading size="small" as="h3">Remove Workload Binding</Heading>
	{/snippet}
	Are you sure you want to remove the binding for workload
	<strong>{bindingToRemove?.workloadName}</strong> in environment
	<strong>{bindingToRemove?.environment}</strong>?
</Confirm>

<Confirm
	bind:open={deleteServiceAccountOpen}
	confirmText="Delete"
	variant="danger"
	onconfirm={handleDeleteServiceAccount}
>
	{#snippet header()}
		<Heading size="small" as="h3">Delete service account</Heading>
	{/snippet}
	Are you sure you want to delete the service account <strong>{serviceAccount.name}</strong>? This
	action cannot be undone. All tokens and workload bindings will be removed.
</Confirm>

<style>
	.detail-page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
		max-width: 900px;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.metadata {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-4) var(--ax-space-16);
	}

	.metadata dt {
		font-weight: bold;
	}

	.inline-form {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
		max-width: 400px;
		padding: var(--ax-space-16);
		border: 1px solid var(--ax-border-neutral);
		border-radius: 8px;
		margin-top: var(--ax-space-8);
	}

	.inline-form-actions {
		display: flex;
		gap: var(--ax-space-8);
	}

	.token-secret {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		margin-top: var(--ax-space-8);
	}

	.token-secret code {
		font-family: monospace;
		font-size: 0.85rem;
		word-break: break-all;
		background: var(--ax-bg-neutral-moderate);
		padding: var(--ax-space-4) var(--ax-space-8);
		border-radius: 4px;
	}

	.status-broken {
		color: var(--ax-text-danger);
		font-weight: bold;
	}

	.status-ok {
		color: var(--ax-text-success);
	}

	@media (max-width: 767px) {
		.section-header {
			flex-wrap: wrap;
			gap: var(--ax-space-8);
		}

		.metadata {
			grid-template-columns: 1fr;
		}

		.inline-form {
			max-width: 100%;
		}
	}
</style>
