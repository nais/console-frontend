<script lang="ts">
	import { graphql, type TeamMemberRole$options } from '$houdini';
	import { Alert, Heading, Label, Modal, Select } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';
	import type { TeamMemberVariables } from './$houdini';

	export let open: boolean;
	export let team: string;
	export let email: string;

	const dispatcher = createEventDispatcher<{ updated: null }>();

	const store = graphql(`
		query TeamMember($team: Slug!, $email: String!) @load {
			team(slug: $team) {
				member(email: $email) {
					role
					user {
						id
						name
					}
					#	reconcilers {
					#		enabled
					#		reconciler {
					#			enabled
					#			name
					#			displayName
					#			description
					#			memberAware
					#		}
					#	}
				}
			}
		}
	`);

	export const _TeamMemberVariables: TeamMemberVariables = () => {
		return {
			team,
			email
		};
	};

	const alterRole = graphql(`
		mutation UpdateMemberRoleMutation($input: SetTeamMemberRoleInput!) {
			setTeamMemberRole(input: $input) {
				member {
					role
				}
			}
		}
	`);

	/*const addReconcilerOptOut = graphql(`
		mutation AddReconcilerOptOutMutation($team: Slug!, $userId: ID!, $reconciler: String!) {
			addReconcilerOptOut(teamSlug: $team, userId: $userId, reconciler: $reconciler) {
				role
			}
		}
	`);*/

	/*
	const removeReconcilerOptOut = graphql(`
		mutation RemoveReconcilerOptOutMutation($team: Slug!, $userId: ID!, $reconciler: String!) {
			removeReconcilerOptOut(teamSlug: $team, userId: $userId, reconciler: $reconciler) {
				role
			}
		}
	`);*/

	let errors: string[] = [];
	const updateRole = async (e: Event) => {
		if (!e.target) return;
		if (!(e.target instanceof HTMLSelectElement)) return;

		await alterRole.mutate({
			/*team,
			userId: userID,
			role: e.target?.value as TeamRole$options*/
			input: {
				teamSlug: team,
				userEmail: email,
				role: e.target.value as TeamMemberRole$options
			}
		});
		store.fetch({ policy: 'NetworkOnly' });
		dispatcher('updated', null);
	};

	/*const updateReconciler = async (el: unknown | null, reconciler: string) => {
		if (!el) return;
		if (!(el instanceof HTMLInputElement)) return;

		const enabled = el.checked;
		if (!enabled) {
			await addReconcilerOptOut.mutate({
				team,
				userId: userID,
				reconciler
			});
		} else {
			await removeReconcilerOptOut.mutate({
				team,
				userId: userID,
				reconciler
			});
		}
		dispatcher('updated', null);
	};*/
</script>

<Modal bind:open>
	<svelte:fragment slot="header"><Heading>Edit member</Heading></svelte:fragment>

	{#if $store.data}
		{@const member = $store.data.team.member}

		{#each errors as error}
			<Alert variant="error">{error}</Alert>
		{/each}

		<div class="wrapper">
			<Label>Name</Label>
			<p>{member.user.name}</p>
			<p>{JSON.stringify(member)}</p>

			<Select label="Role" style="width:150px" value={member.role} on:change={updateRole}>
				<option value="OWNER">Owner</option>
				<option value="MEMBER">Member</option>
			</Select>

			<!--Fieldset class="navds-checkbox-group navds-checkbox-group--medium">
				<legend class="navds-fieldset__legend navds-label">Enabled features</legend>

				{#each member.reconcilers.filter((r) => r.reconciler.memberAware && r.reconciler.enabled) as { reconciler, enabled }}
					<Checkbox
						value={reconciler.name}
						checked={enabled}
						on:change={(e) => {
							updateReconciler(e.detail.target, reconciler.name);
						}}
					>
						<span class="option">
							{reconciler.displayName}
							<HelpText title="" wrapperClass="tooltipAddMemberWrapper">
								{reconciler.description}
							</HelpText>
						</span>
					</Checkbox>
				{/each}
			</Fieldset-->
		</div>
	{/if}

	<svelte:fragment slot="footer"></svelte:fragment>
</Modal>

<style>
	p {
		margin: 0 0 1rem 0;
	}
	.wrapper {
		min-width: 400px;
	}

	/*.option {
		display: inline-flex;
		gap: 0.5rem;
	}*/

	:global(.tooltipAddMemberWrapper) {
		width: 200px;
	}
</style>
