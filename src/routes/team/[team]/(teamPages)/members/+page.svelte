<script lang="ts">
	import { graphql, TeamMemberOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { PencilIcon, PersonIcon, PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import AddMember from './AddMember.svelte';
	import EditMember from './EditMember.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Members, UserInfo } = $derived(data);
	let team = $derived($Members.data?.team);

	function capitalizeFirstLetterInEachWord(str: string): string {
		return str.replaceAll(/(^|\s)[\w]/g, (c) => c.toUpperCase());
	}

	const deleteTeamMember = graphql(`
		mutation DeleteTeamMember($input: RemoveTeamMemberInput!) {
			removeTeamMember(input: $input) {
				team {
					slug
				}
			}
		}
	`);

	const refetch = () => {
		Members.fetch({
			policy: 'CacheAndNetwork'
		});
	};

	let addMemberOpen = $state(false);
	let editUser: string | null = $state(null);
	let editUserOpen = $state(false);
	let deleteUser: { email: string; name: string } | null = $state(null);
	let deleteUserOpen = $state(false);

	let canEdit = $derived(
		team?.viewerIsOwner === true ||
			(UserInfo.data?.me.__typename == 'User' && UserInfo.data?.me.isAdmin)
	);

	let tableSort = $derived({
		orderBy: $Members.variables?.orderBy?.field,
		direction: $Members.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = TeamMemberOrderField[key as keyof typeof TeamMemberOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || TeamMemberOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$Members.errors} />
{#if team}
	<div class="header">
		<IconWithText text="Members" icon={PersonIcon} size="large" />
		{#if canEdit}
			<Button
				size="small"
				onclick={() => {
					addMemberOpen = !addMemberOpen;
				}}
				icon={PlusIcon}>Add member</Button
			>
		{/if}
	</div>
	<Card>
		<Table
			size="small"
			zebraStripes
			sort={{
				orderBy: tableSort.orderBy || TeamMemberOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={TeamMemberOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={TeamMemberOrderField.EMAIL}>E-mail</Th>
					<Th sortable={true} sortKey={TeamMemberOrderField.ROLE}>Role</Th>
					<Th style="width:100px">&nbsp;</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each team.members.edges as edge (edge.node.user.id)}
					<Tr>
						<Td>{capitalizeFirstLetterInEachWord(edge.node.user.name.toString())}</Td>
						<Td>{edge.node.user.email}</Td>
						<Td>{edge.node.role.toString().toLowerCase()}</Td>
						<Td>
							{#if canEdit}
								<Button
									title="Edit member"
									size="small"
									variant="tertiary"
									onclick={() => {
										editUser = edge.node.user.email.toString();
										editUserOpen = true;
									}}
									icon={PencilIcon}
								/>
								<Button
									title="Delete member"
									size="small"
									variant="tertiary-neutral"
									onclick={() => {
										deleteUser = {
											email: edge.node.user.email.toString(),
											name: edge.node.user.name.toString()
										};
										deleteUserOpen = true;
									}}
								>
									{#snippet icon()}
										<TrashIcon style="color:var(--a-icon-danger)!important" />
									{/snippet}
								</Button>
							{/if}
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if $Members.data?.team.members.pageInfo.hasPreviousPage || $Members.data?.team.members.pageInfo.hasNextPage}
			<Pagination
				page={$Members.data.team.members.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						Members.loadPreviousPage();
					},
					loadNextPage: () => {
						Members.loadNextPage();
					}
				}}
			/>
		{/if}
	</Card>
	{#if team}
		<AddMember bind:open={addMemberOpen} team={team.slug} on:created={refetch} />

		{#if editUser && editUserOpen}
			<EditMember
				bind:open={editUserOpen}
				team={team.slug}
				email={editUser}
				on:updated={refetch}
				on:closed={() => {
					editUser = null;
				}}
			/>
		{/if}
		{#if deleteUser && deleteUserOpen}
			{@const teamSlug = team.slug}
			{@const userId = deleteUser.email}
			<Confirm
				bind:open={deleteUserOpen}
				confirmText="Delete"
				variant="danger"
				onconfirm={async () => {
					await deleteTeamMember.mutate({ input: { teamSlug: teamSlug, userEmail: userId } });
					refetch();
				}}
			>
				{#snippet header()}
					<Heading>Delete member</Heading>
				{/snippet}
				Are you sure you want to remove <b>{deleteUser.name}</b> from this team?
			</Confirm>
		{/if}
	{/if}
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
</style>
