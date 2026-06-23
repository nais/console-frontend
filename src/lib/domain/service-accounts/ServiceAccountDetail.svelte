<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		graphql,
		type ServiceAccountAuthenticationFragment,
		type ServiceAccountRolesFragment
	} from '$houdini';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { pageModalClick } from '$lib/ui/PageModal.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Button, Heading, Modal, Textarea } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem
	} from '@nais/ds-svelte-community/experimental';
	import {
		LinkIcon,
		MenuElipsisVerticalIcon,
		PencilIcon,
		ShieldLockIcon,
		TokenIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import ServiceAccountAuthentications from './ServiceAccountAuthentications.svelte';
	import ServiceAccountRoles from './ServiceAccountRoles.svelte';

	interface Role {
		name: string;
		description: string;
	}

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
		basePath,
		availableRoles,
		canManage
	}: {
		serviceAccount: ServiceAccountData;
		basePath: string;
		availableRoles: Role[];
		canManage: boolean;
	} = $props();

	const deleteServiceAccount = graphql(`
		mutation DeleteServiceAccount($input: DeleteServiceAccountInput!) {
			deleteServiceAccount(input: $input) {
				serviceAccountDeleted
			}
		}
	`);

	const updateServiceAccount = graphql(`
		mutation UpdateServiceAccount($input: UpdateServiceAccountInput!) {
			updateServiceAccount(input: $input) {
				serviceAccount {
					id
					description
				}
			}
		}
	`);

	let errors: { message: string }[] | undefined = $state();
	let deleteServiceAccountOpen = $state(false);
	let editRolesOpen = $state(false);
	let editingDescription = $state(false);
	let newDescription = $state('');

	function closeMenu(e: Event) {
		const popover = (e.currentTarget as HTMLElement)?.closest('[popover]') as HTMLElement | null;
		popover?.hidePopover();
	}

	function startEditDescription(e: Event) {
		closeMenu(e);
		newDescription = serviceAccount.description;
		editingDescription = true;
	}

	async function saveDescription() {
		errors = undefined;
		const res = await updateServiceAccount.mutate({
			input: { serviceAccountID: serviceAccount.id, description: newDescription }
		});
		if (res.errors) {
			errors = res.errors;
			return;
		}
		editingDescription = false;
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
		await goto(basePath);
	}
</script>

<GraphErrors {errors} dismissable />

<div class="detail-page">
	<section aria-labelledby="sa-heading">
		<div class="section-header">
			<Heading size="medium" as="h2" id="sa-heading">{serviceAccount.name}</Heading>
			{#if canManage}
				<ActionMenu>
					{#snippet trigger(props)}
						<Button
							variant="secondary"
							size="small"
							icon={MenuElipsisVerticalIcon}
							iconPosition="right"
							{...props}
						>
							Actions
						</Button>
					{/snippet}
					<button class="action-menu-button" onclick={startEditDescription}>
						<ActionMenuItem icon={PencilIcon}>Edit description</ActionMenuItem>
					</button>
					<button class="action-menu-button" onclick={() => (editRolesOpen = true)}>
						<ActionMenuItem icon={ShieldLockIcon}>Edit roles</ActionMenuItem>
					</button>
					<a
						class="action-menu-button"
						href="{basePath}/{serviceAccount.id}/token/create"
						onclick={pageModalClick}
					>
						<ActionMenuItem icon={TokenIcon}>Create API token</ActionMenuItem>
					</a>
					<a
						class="action-menu-button"
						href="{basePath}/{serviceAccount.id}/binding/add"
						onclick={pageModalClick}
					>
						<ActionMenuItem icon={LinkIcon}>Add workload binding</ActionMenuItem>
					</a>
					<ActionMenuDivider />
					<button class="action-menu-button" onclick={() => (deleteServiceAccountOpen = true)}>
						<ActionMenuItem icon={TrashIcon} variant="danger">
							Delete service account
						</ActionMenuItem>
					</button>
				</ActionMenu>
			{/if}
		</div>

		<dl class="settings-list">
			<dt>Description</dt>
			<dd>
				{#if editingDescription}
					<div class="edit-description">
						<Textarea size="small" label="Description" hideLabel bind:value={newDescription} />
						<div class="edit-actions">
							<Button size="xsmall" onclick={saveDescription}>Save</Button>
							<Button
								size="xsmall"
								variant="secondary-neutral"
								onclick={() => (editingDescription = false)}>Cancel</Button
							>
						</div>
					</div>
				{:else}
					{serviceAccount.description}
				{/if}
			</dd>
			<dt>Created</dt>
			<dd>
				<Time time={serviceAccount.createdAt} distance={true} />
			</dd>
			<dt>Last updated</dt>
			<dd>
				<Time time={serviceAccount.updatedAt} distance={true} />
			</dd>
			<dt>Last used</dt>
			<dd>
				{#if serviceAccount.lastUsedAt}
					<Time time={serviceAccount.lastUsedAt} distance={true} />
				{:else}
					Never
				{/if}
			</dd>
		</dl>
	</section>

	<ServiceAccountRoles serviceAccountRoles={serviceAccount} {availableRoles} />
	<ServiceAccountAuthentications {serviceAccount} {canManage} />
</div>

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

<Modal bind:open={editRolesOpen} closeButton>
	{#snippet header()}
		<Heading size="small" as="h3">Edit roles</Heading>
	{/snippet}
	<ServiceAccountRoles serviceAccountRoles={serviceAccount} {availableRoles} editable />
	{#snippet footer()}
		<Button size="small" onclick={() => (editRolesOpen = false)}>Done</Button>
	{/snippet}
</Modal>

<style>
	.detail-page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
	}

	.edit-description {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.edit-actions {
		display: flex;
		gap: var(--ax-space-8);
	}

	.action-menu-button {
		all: unset;
		display: contents;

		:global(*) {
			cursor: pointer;
		}
	}
</style>
