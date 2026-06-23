<script lang="ts">
	import { graphql, paginatedFragment, type ServiceAccountRolesFragment } from '$houdini';
	import {
		BodyLong,
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
		editable?: boolean;
	}

	let { availableRoles, serviceAccountRoles, editable = false }: Props = $props();

	const uid = $props.id();

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
					...ServiceAccountRolesFragment
				}
			}
		}
	`);

	const revokeRole = graphql(`
		mutation RevokeRoleFromServiceAccount($input: RevokeRoleFromServiceAccountInput!) {
			revokeRoleFromServiceAccount(input: $input) {
				serviceAccount {
					id
					...ServiceAccountRolesFragment
				}
			}
		}
	`);

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
		if (!editable) {
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

<section aria-labelledby="roles-heading-{uid}">
	<Heading size="small" as="h3" id="roles-heading-{uid}">Assigned Roles</Heading>
	{#if editable}
		<BodyLong>
			Service accounts have read access to everything a user has access to, except secrets. You can
			grant additional roles below.
		</BodyLong>
		{#if mutationError}
			<ErrorMessage>{mutationError}</ErrorMessage>
		{/if}
		<CheckboxGroup
			value={list.filter((r) => r.hasRole).map((r) => r.name)}
			legend="Assigned roles"
			hideLegend
			onchange={handleOnChange}
		>
			{#each list as role (role.name)}
				<Checkbox value={role.name} description={role.description}>
					{role.name}
				</Checkbox>
			{:else}
				<p>No available roles found.</p>
			{/each}
		</CheckboxGroup>
	{:else}
		{@const assignedRoles = list.filter((r) => r.hasRole)}
		{#if assignedRoles.length > 0}
			<dl class="role-list">
				{#each assignedRoles as role (role.name)}
					<div class="role-item">
						<dt>{role.name}</dt>
						<dd>{role.description}</dd>
					</div>
				{/each}
			</dl>
		{:else}
			<p>No roles assigned.</p>
		{/if}
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.role-list {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.role-item dt {
		font-weight: var(--ax-font-weight-bold);
	}

	.role-item dd {
		margin: 0;
		color: var(--ax-text-neutral);
		font-size: var(--ax-font-size-small);
	}
</style>
