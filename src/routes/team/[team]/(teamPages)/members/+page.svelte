<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import { AuditEventResourceType } from '$houdini/graphql/enums';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import {
		Alert,
		Button,
		Heading,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { PencilIcon, PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import AddMember from './AddMember.svelte';
	import EditMember from './EditMember.svelte';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

	export let data: PageData;
	$: ({ Members, UserInfo } = data);
	$: team = $Members.data?.team;

	$: ({ limit, offset } = limitOffset($Members.variables));

	function capitalizeFirstLetterInEachWord(str: string): string {
		return str.replaceAll(/(^|\s)[\w]/g, (c) => c.toUpperCase());
	}

	const deleteTeamMember = graphql(`
		mutation DeleteTeamMember($team: Slug!, $userId: ID!) {
			removeUserFromTeam(slug: $team, userId: $userId) {
				slug
			}
		}
	`);

	const refetch = () => {
		Members.fetch({
			policy: 'CacheAndNetwork'
		});
	};

	let addMemberOpen = false;
	let editUser: string | null = null;
	let editUserOpen = false;
	let deleteUser: { id: string; name: string } | null = null;
	let deleteUserOpen = false;

	$: canEdit =
		team?.viewerIsOwner === true ||
		(UserInfo.data?.me.__typename == 'User' && UserInfo.data?.me.isAdmin);
</script>

{#if $Members.errors}
	<Alert variant="error">
		{#each $Members.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if team}
	<Card>
		<div class="header">
			<h3>Members</h3>
			{#if canEdit}
				<Button
					size="small"
					on:click={() => {
						addMemberOpen = !addMemberOpen;
					}}><svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>Add member</Button
				>
			{/if}
		</div>

		<Table size="small" zebraStripes>
			<Thead>
				<Th>Name</Th>
				<Th>E-mail</Th>
				<Th>Role</Th>
				<Th style="width:100px">&nbsp;</Th>
			</Thead>
			<Tbody>
				{#each team.members.nodes as node}
					<Tr>
						{#if team.slug === PendingValue}
							{#each new Array(4).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						{:else}
							<Td>{capitalizeFirstLetterInEachWord(node.user.name.toString())}</Td>
							<Td>{node.user.email}</Td>
							<Td>{node.role.toString().toLowerCase()}</Td>
							<Td>
								{#if canEdit}
									<Button
										iconOnly
										title="Edit member"
										size="small"
										variant="tertiary"
										on:click={() => {
											editUser = node.user.id.toString();
											editUserOpen = true;
										}}
									>
										<svelte:fragment slot="icon-left"><PencilIcon /></svelte:fragment>
									</Button>
									<Button
										iconOnly
										title="Delete member"
										size="small"
										variant="tertiary-neutral"
										on:click={() => {
											deleteUser = { id: node.user.id.toString(), name: node.user.name.toString() };
											deleteUserOpen = true;
										}}
									>
										<svelte:fragment slot="icon-left"
											><TrashIcon style="color:var(--a-icon-danger)!important" /></svelte:fragment
										>
									</Button>
								{/if}
							</Td>
						{/if}
					</Tr>
				{/each}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team.members.pageInfo}
			{limit}
			{offset}
			changePage={(page) => {
				changeParams({ page: page.toString() });
			}}
		/>
	</Card>
	{#if team && team.slug != PendingValue}
		{#key team}
		<ActivityLog teamName={team.slug} resourceType={AuditEventResourceType.TEAM_MEMBER} style="margin-top: 1rem"/>
		{/key}
		<AddMember bind:open={addMemberOpen} team={team.slug} on:created={refetch} />

		{#if editUser && editUserOpen}
			<EditMember
				bind:open={editUserOpen}
				team={team.slug}
				userID={editUser}
				on:updated={refetch}
				on:closed={() => {
					editUser = null;
				}}
			/>
		{/if}
		{#if deleteUser && deleteUserOpen}
			{@const teamSlug = team.slug}
			{@const userId = deleteUser.id}
			<Confirm
				bind:open={deleteUserOpen}
				confirmText="Delete"
				variant="danger"
				on:confirm={async () => {
					await deleteTeamMember.mutate({ team: teamSlug, userId });
					refetch();
				}}
			>
				<svelte:fragment slot="header"><Heading>Delete member</Heading></svelte:fragment>
				Are you sure you want to remove <b>{deleteUser.name} </b>from this team?
			</Confirm>
		{/if}
	{/if}
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.header h3 {
		margin: 0;
	}
</style>
