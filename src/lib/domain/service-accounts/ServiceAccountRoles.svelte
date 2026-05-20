<script lang="ts">
	import { graphql, paginatedFragment, type ServiceAccountRolesFragment } from '$houdini';
	import {
		BodyLong,
		Button,
		Checkbox,
		CheckboxGroup,
		ErrorMessage,
		Heading
	} from '@nais/ds-svelte-community';

	interface Role {
		name: string;
		description: string;
	}

	interface Props {
		availableRoles: Role[];
		serviceAccountRoles: ServiceAccountRolesFragment;
		canManage?: boolean;
	}

	let { availableRoles, serviceAccountRoles, canManage = false }: Props = $props();

	const actualRoles = $derived(
		paginatedFragment(
			serviceAccountRoles,
			graphql(`
				fragment ServiceAccountRolesFragment on ServiceAccount {
					id
					roles(first: 20) @paginate {
						edges {
							node {
								name
								description
							}
						}
					}
				}
			`)
		)
	);

	const assignRole = graphql(`
		mutation AssignRoleToServiceAccount($input: AssignRoleToServiceAccountInput!) {
			assignRoleToServiceAccount(input: $input) {
				serviceAccount {
					id
				}
			}
		}
	`);

	const revokeRole = graphql(`
		mutation RevokeRoleFromServiceAccount($input: RevokeRoleFromServiceAccountInput!) {
			revokeRoleFromServiceAccount(input: $input) {
				serviceAccount {
					id
				}
			}
		}
	`);

	let editable = $state(false);
	let mutationError = $state<string | undefined>();

	const list = $derived.by(() => {
		if (!$actualRoles.data?.roles) {
			return [];
		}

		const actualRoleNames = new Set($actualRoles.data.roles.edges.map(({ node }) => node.name));

		return availableRoles
			.map((role) => ({
				name: role.name,
				description: role.description,
				hasRole: actualRoleNames.has(role.name)
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const handleOnChange = async (
		e: Event & { currentTarget: EventTarget & HTMLFieldSetElement }
	) => {
		if (!canManage || !editable) {
			return;
		}

		mutationError = undefined;
		const target = e.target as HTMLInputElement;
		const roleName = target.value;
		const hasRole = target.checked;

		const mutation = hasRole ? assignRole : revokeRole;
		const result = await mutation.mutate({
			input: {
				serviceAccountID: $actualRoles.data?.id ?? '',
				roleName
			}
		});

		if ((result.errors?.length ?? 0) > 0) {
			target.checked = !hasRole;
			mutationError = result.errors![0].message;
		}
	};
</script>

<section aria-labelledby="roles-heading">
	<Heading size="small" as="h3" id="roles-heading">Roles</Heading>
	<BodyLong>
		Service accounts have read access to everything a user has access to, except secrets. You can
		grant additional roles below.
	</BodyLong>
	{#if mutationError}
		<ErrorMessage>{mutationError}</ErrorMessage>
	{/if}
	<div class="section-header">
		<Heading size="xsmall" as="h4">Assigned roles</Heading>
		{#if canManage}
			<Button size="small" variant="secondary" onclick={() => (editable = !editable)}>
				{editable ? 'Done' : 'Edit roles'}
			</Button>
		{/if}
	</div>
	<CheckboxGroup
		value={list.filter((r) => r.hasRole).map((r) => r.name)}
		legend="Assigned roles"
		hideLegend
		onchange={handleOnChange}
	>
		{#each list as role (role.name)}
			<Checkbox value={role.name} description={role.description} disabled={!editable || !canManage}>
				{role.name}
			</Checkbox>
		{:else}
			<p>No available roles found.</p>
		{/each}
	</CheckboxGroup>
</section>

<style>
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		margin-top: var(--ax-space-16);
	}
</style>
