<script lang="ts">
	import { graphql, type AddTeamMemberInput } from '$houdini';
	import { Alert, Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		open: boolean;
		team: string;
		oncreated?: () => void;
	}

	let { open = $bindable(), team, oncreated }: Props = $props();

	const store = graphql(`
		query AddMemberQuery($team: Slug!) {
			users(first: 10000) {
				nodes {
					id
					email
				}
			}
			team(slug: $team) {
				members {
					nodes {
						user {
							email
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		store.fetch({
			variables: {
				team: team
			}
		});
	});

	const create = graphql(`
		mutation CreateMemberMutation($input: AddTeamMemberInput!) {
			addTeamMember(input: $input) {
				member {
					team {
						members {
							nodes {
								user {
									email
								}
							}
						}
					}
					user {
						id
					}
				}
			}
		}
	`);

	let emails = $derived.by(() => {
		const allEmails = $store.data?.users.nodes.map((user) => user.email) ?? [];
		const teamMemberEmails = new Set(
			$store.data?.team.members.nodes.map((member) => member.user.email) ?? []
		);
		return allEmails.filter((email) => !teamMemberEmails.has(email));
	});

	let role: AddTeamMemberInput['role'] = $state('MEMBER');
	let email: string = $state('');

	let errors: string[] = $state([]);
	const submit = async () => {
		errors = [];
		const userID = $store.data?.users.nodes.find((u) => u.email === email)?.email;
		if (!userID) {
			errors = ['User not found'];
			return;
		}

		const input: AddTeamMemberInput = {
			role,
			teamSlug: team,
			userEmail: userID
		};

		const resp = await create.mutate({
			input
		});

		if (resp.errors) {
			errors = resp.errors.filter((e) => e.message != 'unable to resolve').map((e) => e.message);
			return;
		}

		open = false;
		email = '';

		oncreated?.();
	};
</script>

<Modal bind:open>
	{#snippet header()}
		<Heading>Add Member to {team}</Heading>
	{/snippet}

	{#each errors as error (error)}
		<Alert variant="error">{error}</Alert>
	{/each}

	<form
		onsubmit={(e: SubmitEvent) => {
			e.preventDefault();
			submit();
		}}
		class="wrapper"
	>
		<p>Team members are given access to the team's GCP projects, Grafana, and other services.</p>
		<TextField list="add-member-email" type="email" bind:value={email}>
			{#snippet label()}
				Email
			{/snippet}
		</TextField>
		<datalist id="add-member-email">
			{#each emails as email (email)}
				<option value={email}>{email}</option>
			{/each}
		</datalist>
		<br />
		<Select label="Role" style="width:150px" bind:value={role}>
			<option value="OWNER">Owner</option>
			<option value="MEMBER">Member</option>
		</Select>
	</form>

	{#snippet footer()}
		<Button type="submit" onclick={submit} icon={PlusIcon}>Add member</Button>
	{/snippet}
</Modal>

<style>
	.wrapper {
		min-width: 400px;
	}

	:global(.tooltipAddMemberWrapper) {
		width: 200px;
	}
</style>
