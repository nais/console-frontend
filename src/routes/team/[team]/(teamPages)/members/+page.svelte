<script lang="ts">
	import { graphql, TeamMemberOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Confirm from '$lib/components/Confirm.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		PencilIcon,
		PlusIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
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
	<Card>
		<div class="header">
			<h3>Members</h3>
			{#if canEdit}
				<Button
					size="small"
					onclick={() => {
						addMemberOpen = !addMemberOpen;
					}}
					iconLeft={PlusIcon}
				/>
			{/if}
		</div>

		<Table
			size="small"
			zebraStripes
			sort={{
				orderBy: tableSort.orderBy || TeamMemberOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onSortChange={tableSortChange}
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
				{#each team.members.edges as edge}
					<Tr>
						<Td>{capitalizeFirstLetterInEachWord(edge.node.user.name.toString())}</Td>
						<Td>{edge.node.user.email}</Td>
						<Td>{edge.node.role.toString().toLowerCase()}</Td>
						<Td>
							{#if canEdit}
								<Button
									iconOnly
									title="Edit member"
									size="small"
									variant="tertiary"
									onclick={() => {
										editUser = edge.node.user.email.toString();
										editUserOpen = true;
									}}
									iconLeft={PencilIcon}
								/>
								<Button
									iconOnly
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
									{#snippet iconLeft()}
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
			<div class="pagination">
				<span>
					{#if $Members.data.team.members.pageInfo.pageStart !== $Members.data.team.members.pageInfo.pageEnd}
						{$Members.data.team.members.pageInfo.pageStart} - {$Members.data.team.members.pageInfo
							.pageEnd}
					{:else}
						{$Members.data.team.members.pageInfo.pageStart}
					{/if}

					of {$Members.data.team.members.pageInfo.totalCount}
				</span>

				<span style="padding-left: 1rem;">
					<Button
						size="small"
						variant="secondary"
						disabled={!$Members.data.team.members.pageInfo.hasPreviousPage}
						onclick={async () => {
							return await Members.loadPreviousPage();
						}}><ChevronLeftIcon /></Button
					>
					<Button
						size="small"
						variant="secondary"
						disabled={!$Members.data.team.members.pageInfo.hasNextPage}
						onclick={async () => {
							return await Members.loadNextPage();
						}}
					>
						<ChevronRightIcon /></Button
					>
				</span>
			</div>
		{/if}
	</Card>
	{#if team}
		<!--
		{#key team}
			<ActivityLog teamName={team.slug} style="margin-top: 1rem" /> //TODO: Fjernes?
		{/key}
		-->
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
				on:confirm={async () => {
					await deleteTeamMember.mutate({ input: { teamSlug: teamSlug, userEmail: userId } });
					refetch();
				}}
			>
				{#snippet header()}
					<Heading>Delete member</Heading>
				{/snippet}
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
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
