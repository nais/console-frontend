<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { TeamMemberOrderField } from '$lib/urql/gql/graphql';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { BodyShort, Button, Heading } from '@nais/ds-svelte-community';
	import { PencilIcon, PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import AddMember from './AddMember.svelte';
	import EditMember from './EditMember.svelte';
	import { DeleteTeamMemberMutation } from './members';

	let { data }: PageProps = $props();
	let { Members, UserInfo, viewerIsOwner } = $derived(data);
	let team = $derived(Members.data?.team);

	const client = getContextClient();

	const refetch = () => {
		// Re-run the page's `load` so the `Members` query is re-executed
		// with the same URL-driven variables. urql's normalized cache will
		// merge the result and update any subscribed components.
		void invalidateAll();
	};

	let addMemberOpen = $state(false);
	let editUser: string | null = $state(null);
	let editUserOpen = $state(false);
	let deleteUser: { email: string; name: string } | null = $state(null);
	let deleteUserOpen = $state(false);

	let canEdit = $derived(
		viewerIsOwner === true || (UserInfo.data?.me.__typename == 'User' && UserInfo.data?.me.isAdmin)
	);
</script>

<GraphErrors errors={Members.errors} />
{#if team}
	<div class="content-wrapper">
		<div>
			{#if canEdit}
				<div class="button">
					<Button
						size="small"
						onclick={() => {
							addMemberOpen = !addMemberOpen;
						}}
						icon={PlusIcon}>Add member</Button
					>
				</div>
			{/if}
			<List
				title="{team.members.pageInfo.totalCount} user{team.members.pageInfo.totalCount !== 1
					? 's'
					: ''}"
			>
				{#snippet menu()}
					<OrderByMenu
						orderField={TeamMemberOrderField}
						defaultOrderField={TeamMemberOrderField.NAME}
					/>
				{/snippet}
				{#each team.members.edges as edge (edge.node.user.id + edge.node.role)}
					<ListItem>
						<div class="item">
							<div>
								<BodyShort size="small">
									{edge.node.user.name}
								</BodyShort>
								<BodyShort size="small">
									<span style="color: var(--ax-text-subtle);">{edge.node.user.email}</span>
								</BodyShort>
							</div>

							<div class="role-and-buttons">
								<div class="role">
									<BodyShort size="small">{edge.node.role}</BodyShort>
								</div>
								{#if canEdit}
									<div>
										<Button
											title="Edit member"
											size="small"
											variant="tertiary"
											onclick={() => {
												editUser = edge.node.user.email;
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
													email: edge.node.user.email,
													name: edge.node.user.name
												};
												deleteUserOpen = true;
											}}
										>
											{#snippet icon()}
												<TrashIcon style="color:var(--ax-text-danger-decoration)!important" />
											{/snippet}
										</Button>
									</div>
								{/if}
							</div>
						</div>
					</ListItem>
				{/each}
			</List>
			<Pagination
				page={team.members.pageInfo}
				loaders={cursorPaginationLoaders(page.url, team.members.pageInfo)}
			/>
		</div>
		<div>
			<SidebarActivity activityLog={team} />
		</div>
	</div>
	<AddMember bind:open={addMemberOpen} team={team.slug} oncreated={refetch} />

	{#if editUser && editUserOpen}
		<EditMember
			bind:open={editUserOpen}
			team={team.slug}
			email={editUser}
			onupdated={refetch}
			onclosed={() => {
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
				await client
					.mutation(DeleteTeamMemberMutation, {
						input: { teamSlug: teamSlug, userEmail: userId }
					})
					.toPromise();
				refetch();
			}}
		>
			{#snippet header()}
				<Heading>Delete Member</Heading>
			{/snippet}
			Are you sure you want to remove <b>{deleteUser.name}</b> from this team?
		</Confirm>
	{/if}
{/if}

<style>
	.button {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--ax-space-24);
	}
	.content-wrapper {
		display: grid;
		gap: var(--ax-space-24);
		grid-template-columns: 1fr 300px;
	}

	.item {
		display: grid;
		grid-template-columns: 1fr 174px;
	}
	.role-and-buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 174px;
	}
	.role {
		color: var(--ax-text-subtle);
		text-transform: lowercase;
	}
	.role::first-letter {
		text-transform: uppercase;
	}
</style>
