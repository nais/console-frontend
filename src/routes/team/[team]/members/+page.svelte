<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, graphql, OrderDirection, TeamMemberOrderField } from '$houdini';
	import TeamActivityCard from '$lib/domain/activity/TeamActivityCard.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyShort, Button, Heading } from '@nais/ds-svelte-community';
	import { PencilIcon, PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import AddMember from './AddMember.svelte';
	import EditMember from './EditMember.svelte';

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
		viewerIsOwner === true ||
			($UserInfo.data?.me.__typename == 'User' && $UserInfo.data?.me.isAdmin)
	);

	type TeamMemberOrderFieldOptions =
		(typeof TeamMemberOrderField)[keyof typeof TeamMemberOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	const sortFields: { value: TeamMemberOrderFieldOptions; label: string }[] = [
		{ value: TeamMemberOrderField.NAME, label: 'Name' },
		{ value: TeamMemberOrderField.EMAIL, label: 'Email' },
		{ value: TeamMemberOrderField.ROLE, label: 'Role' }
	];

	const currentSortField: TeamMemberOrderFieldOptions = $derived(
		(Object.values(TeamMemberOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as TeamMemberOrderFieldOptions | undefined) ?? TeamMemberOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: TeamMemberOrderFieldOptions) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.ASC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}

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
	<div class="layout-two-column">
		<div>
			<List title="Members" count={$Members.data?.team.members.pageInfo.totalCount}>
				{#snippet actions()}
					{#if canEdit}
						<Button
							variant="secondary"
							size="small"
							onclick={() => {
								addMemberOpen = !addMemberOpen;
							}}
							icon={PlusIcon}>Add member</Button
						>
					{/if}
				{/snippet}
				{#if $Members.data?.team.members.edges}
					{#each $Members.data?.team.members.edges as edge (edge.node.user.id + edge.node.role)}
						<ListItem interactive>
							<div class="item">
								<div>
									<BodyShort size="small">
										{edge.node.user.name}
									</BodyShort>
									<BodyShort size="small">
										<span style="color: var(--ax-text-neutral-subtle);">{edge.node.user.email}</span
										>
									</BodyShort>
								</div>

								<div class="role-and-buttons">
									<div class="role">
										<BodyShort size="small">{edge.node.role}</BodyShort>
									</div>
									{#if canEdit}
										<div>
											<Button
												aria-label="Edit member"
												size="small"
												variant="tertiary"
												onclick={() => {
													editUser = edge.node.user.email;
													editUserOpen = true;
												}}
												icon={PencilIcon}
											/>
											<Button
												aria-label="Delete member"
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
		<div class="layout-sidebar" style="gap: var(--ax-space-16)">
			<SurfaceCard title="Filters">
				<ListFilters
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					onSort={(field) => setSort(field as TeamMemberOrderFieldOptions)}
				/>
			</SurfaceCard>
			<TeamActivityCard
				teamSlug={team.slug}
				viewAllHref="/team/{team.slug}/activity-log"
				filter={{
					activityTypes: [
						ActivityLogActivityType.TEAM_MEMBER_REMOVED,
						ActivityLogActivityType.TEAM_MEMBER_ADDED,
						ActivityLogActivityType.TEAM_MEMBER_SET_ROLE
					]
				}}
			/>
		</div>
	</div>
	{#if team}
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
	.item {
		display: grid;
		grid-template-columns: 1fr 174px;
		gap: var(--ax-space-8);
	}
	.role-and-buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 174px;
	}
	.role {
		color: var(--ax-text-neutral-subtle);
		text-transform: lowercase;
	}
	.role::first-letter {
		text-transform: uppercase;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.item {
			grid-template-columns: 1fr;
		}

		.role-and-buttons {
			width: 100%;
		}
	}
</style>
