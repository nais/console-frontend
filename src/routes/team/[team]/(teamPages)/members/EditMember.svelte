<script lang="ts">
	import { graphql, type TeamMemberRole$options } from '$houdini';
	import { Alert, Heading, Label, Modal, Select } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';
	import type { TeamMemberVariables } from './$houdini';

	interface Props {
		open: boolean;
		team: string;
		email: string;
	}

	let { open = $bindable(), team, email }: Props = $props();

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

	let errors: string[] = [];
	const updateRole = async (e: Event) => {
		if (!e.target) return;
		if (!(e.target instanceof HTMLSelectElement)) return;

		await alterRole.mutate({
			input: {
				teamSlug: team,
				userEmail: email,
				role: e.target.value as TeamMemberRole$options
			}
		});
		store.fetch({ policy: 'NetworkOnly' });
		dispatcher('updated', null);
	};
</script>

<Modal bind:open>
	{#snippet header()}
		<Heading>Edit member</Heading>
	{/snippet}

	{#if $store.data}
		{@const member = $store.data.team.member}

		{#each errors as error}
			<Alert variant="error">{error}</Alert>
		{/each}

		<div class="wrapper">
			<Label>Name</Label>
			<p>{member.user.name}</p>

			<Select label="Role" style="width:150px" value={member.role} onChange={updateRole}>
				<option value="OWNER">Owner</option>
				<option value="MEMBER">Member</option>
			</Select>
		</div>
	{/if}
</Modal>

<style>
	p {
		margin: 0 0 1rem 0;
	}
	.wrapper {
		min-width: 400px;
	}

	:global(.tooltipAddMemberWrapper) {
		width: 200px;
	}
</style>
