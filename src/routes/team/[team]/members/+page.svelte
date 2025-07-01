<script lang="ts">
	import { graphql, TeamMemberOrderField } from '$houdini';
	import Confirm from '$lib/components/Confirm.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyShort, Button, Heading } from '@nais/ds-svelte-community';
	import { PencilIcon, PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';
	import AddMember from './AddMember.svelte';
	import EditMember from './EditMember.svelte';
	import TeamActivity from '../../../../lib/components/activity/TeamActivity.svelte';

	let { data }: PageProps = $props();
	let { Members, UserInfo, viewerIsOwner } = $derived(data);
	let team = $derived($Members.data?.team);

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
		viewerIsOwner === true || (UserInfo.data?.me.__typename == 'User' && UserInfo.data?.me.isAdmin)
	);

	let after: string = $state($Members.variables?.after ?? '');
	let before: string = $state($Members.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<GraphErrors errors={$Members.errors} />
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
				title="{$Members.data?.team.members.pageInfo.totalCount} user{$Members.data?.team.members
					.pageInfo.totalCount !== 1
					? 's'
					: ''}"
			>
				{#snippet menu()}
					<OrderByMenu
						orderField={TeamMemberOrderField}
						defaultOrderField={TeamMemberOrderField.NAME}
					/>
				{/snippet}
				{#if $Members.data?.team.members.edges}
					{#each $Members.data?.team.members.edges as edge (edge.node.user.id + edge.node.role)}
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
				{/if}
			</List>
			<Pagination
				page={$Members.data?.team.members.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({
							before: $Members.data?.team.members.pageInfo.startCursor ?? '',
							after: ''
						});
					},
					loadNextPage: () => {
						changeQuery({
							after: $Members.data?.team.members.pageInfo.endCursor ?? '',
							before: ''
						});
					}
				}}
			/>
		</div>
		<!--div>Here be documentation of teams, members and roles</div-->
		<div>
			<TeamActivity {team} />
		</div>
	</div>
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
					<Heading>Delete Member</Heading>
				{/snippet}
				Are you sure you want to remove <b>{deleteUser.name}</b> from this team?
			</Confirm>
		{/if}
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
