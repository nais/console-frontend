<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		graphql,
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

	let errors: { message: string }[] | undefined = $state();
	let deleteServiceAccountOpen = $state(false);

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

		{#if canManage}
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

	<ServiceAccountRoles serviceAccountRoles={serviceAccount} {availableRoles} {canManage} />
	<ServiceAccountAuthentications
		{serviceAccount}
		{canManage}
		basePath={`${basePath}/${serviceAccount.id}`}
	/>
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

	.metadata {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-4) var(--ax-space-16);
	}

	.metadata dt {
		font-weight: bold;
	}

	@media (max-width: 767px) {
		.metadata {
			grid-template-columns: 1fr;
		}
	}
</style>
