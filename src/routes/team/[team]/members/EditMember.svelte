<script lang="ts">
	import { graphql, type TeamMemberRole$options } from '$houdini';
	import { Alert, Detail, Heading, Label, Modal, Select } from '@nais/ds-svelte-community';

	interface Props {
		open: boolean;
		team: string;
		email: string;
		onupdated?: () => void;
		onclosed?: () => void;
	}

	let { open = $bindable(), team, email, onupdated, onclosed }: Props = $props();

	const store = graphql(`
		query TeamMember($team: Slug!, $email: String!) {
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

	$effect(() => {
		store.fetch({
			variables: {
				team: team,
				email: email
			}
		});
	});

	let previousOpen = $state(open);
	$effect(() => {
		if (previousOpen && !open) {
			onclosed?.();
		}
		previousOpen = open;
	});

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
		onupdated?.();
		open = false;
	};
</script>

<Modal bind:open>
	{#snippet header()}
		<Heading>Edit Member</Heading>
	{/snippet}

	{#if $store.data}
		{@const member = $store.data.team.member}

		{#each errors as error (error)}
			<Alert variant="error">{error}</Alert>
		{/each}

		<div class="wrapper">
			<Label>Name</Label>
			<p>{member.user.name}</p>

			<Select label="Role" style="width:150px" value={member.role} onchange={updateRole}>
				<option value="OWNER">Owner</option>
				<option value="MEMBER">Member</option>
			</Select>
			<Detail style="margin-top: 0.5rem; color: var(--ax-text-subtle)">
				{#if member.role === 'OWNER'}
					Full access including member administration
				{:else}
					Can modify resources and view secrets
				{/if}
			</Detail>
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
