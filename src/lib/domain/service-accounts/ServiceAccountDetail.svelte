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
	import { BodyLong, Button, Heading } from '@nais/ds-svelte-community';
	import { TrashIcon } from '@nais/ds-svelte-community/icons';
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
	<section aria-labelledby="sa-heading">
		<div class="section-header">
			<Heading size="medium" as="h2" id="sa-heading">{serviceAccount.name}</Heading>
			{#if canManage}
				<Button variant="danger" size="small" onclick={() => (deleteServiceAccountOpen = true)}>
					{#snippet icon()}
						<TrashIcon />
					{/snippet}
					Delete service account
				</Button>
			{/if}
		</div>
		<BodyLong>{serviceAccount.description}</BodyLong>

		<dl class="settings-list">
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

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
	}
</style>
