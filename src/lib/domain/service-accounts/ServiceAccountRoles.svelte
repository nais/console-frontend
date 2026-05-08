<script lang="ts">
	import {
		graphql,
		paginatedFragment,
		type AvailableRolesFragment,
		type ServiceAccountRolesFragment
	} from '$houdini';
	import { BodyLong, Button, Checkbox, CheckboxGroup, Heading } from '@nais/ds-svelte-community';

	interface Props {
		roles: AvailableRolesFragment;
		serviceAccountRoles: ServiceAccountRolesFragment;
		canManage?: boolean;
	}

	let { roles, serviceAccountRoles, canManage = false }: Props = $props();

	const data = $derived(
		paginatedFragment(
			roles,
			graphql(`
				fragment AvailableRolesFragment on Query
				@arguments(excludeGlobalRoles: { type: "Boolean", default: true }) {
					roles(first: 20, filter: { excludeGlobalRoles: $excludeGlobalRoles }) @paginate {
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

	const list = $derived.by(() => {
		if (!$data.data?.roles || !$actualRoles.data?.roles) {
			return [];
		}

		const actualRoleNames = new Set($actualRoles.data.roles.edges.map(({ node }) => node.name));

		return $data.data.roles.edges
			.map(({ node }) => ({
				name: node.name,
				description: node.description,
				hasRole: actualRoleNames.has(node.name)
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const handleOnChange = (e: Event & { currentTarget: EventTarget & HTMLFieldSetElement }) => {
		const target = e.target as HTMLInputElement;
		const roleName = target.value;
		const hasRole = target.checked;

		if (hasRole) {
			assignRole
				.mutate({
					input: {
						serviceAccountID: $actualRoles.data?.id ?? '',
						roleName
					}
				})
				.catch((err) => {
					// Revert the checkbox state if the mutation fails
					target.checked = !hasRole;
					console.error('Failed to assign role:', err);
				});
		} else {
			revokeRole
				.mutate({
					input: {
						serviceAccountID: $actualRoles.data?.id ?? '',
						roleName
					}
				})
				.catch((err) => {
					// Revert the checkbox state if the mutation fails
					target.checked = !hasRole;
					console.error('Failed to revoke role:', err);
				});
		}
	};
</script>

<section>
	<Heading size="small" as="h3">Roles</Heading>
	<BodyLong spacing>
		Service accounts have read access to everything a user has access to, except secrets. You can
		grant additional roles below.
	</BodyLong>

	{#if canManage}
		<Button size="small" variant="secondary" onclick={() => (editable = !editable)}>
			{editable ? 'Cancel' : 'Edit roles'}
		</Button>
	{/if}
	{#if list}
		<CheckboxGroup
			value={list.filter((r) => r.hasRole).map((r) => r.name)}
			legend="Assigned roles"
			onchange={handleOnChange}
		>
			{#each list as role (role.name)}
				<Checkbox value={role.name} description={role.description} readonly={!editable}>
					{role.name}
				</Checkbox>
			{/each}
		</CheckboxGroup>
	{:else}
		<p>No available roles found.</p>
	{/if}
</section>
