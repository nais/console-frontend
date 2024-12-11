<script lang="ts">
	import { graphql, type AddTeamMemberInput } from '$houdini';
	import {
		Alert,
		Button,
		Checkbox,
		CheckboxGroup,
		Heading,
		HelpText,
		Modal,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		open: boolean;
		team: string;
	}

	let { open = $bindable(), team }: Props = $props();

	const dispatcher = createEventDispatcher<{ created: null }>();

	const store = graphql(`
		query AddMemberQuery @load {
			users(first: 10000) {
				nodes {
					id
					email
				}
			}

			reconcilers {
				edges {
					node {
						displayName
						name
						description
						enabled
					}
				}
			}
		}
	`);

	const create = graphql(`
		mutation CreateMemberMutation($input: AddTeamMemberInput!) {
			addTeamMember(input: $input) {
				member {
					user {
						id
					}
				}
			}
		}
	`);

	let emails = $derived($store.data?.users.nodes.map((user) => user.email) ?? []);

	type Reconciler = { name: string; value: string; description: string };
	let selectedRecs: string[] = $state([]);
	let reconcilers: Reconciler[] = [];

	let loaded = false;

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

		dispatcher('created', null);
	};
</script>

<Modal bind:open>
	{#snippet header()}
		<Heading>Add member</Heading>
	{/snippet}

	{#each errors as error}
		<Alert variant="error">{error}</Alert>
	{/each}

	<form
		onsubmit={(e: SubmitEvent) => {
			e.preventDefault();
			submit();
		}}
		class="wrapper"
	>
		<TextField list="add-member-email" type="email" bind:value={email}>
			{#snippet label()}
				Email
			{/snippet}
		</TextField>
		<datalist id="add-member-email">
			{#each emails as email}
				<option value={email}>{email}</option>
			{/each}
		</datalist>

		<Select label="Role" style="width:150px" bind:value={role}>
			<option value="OWNER">Owner</option>
			<option value="MEMBER">Member</option>
		</Select>

		{#if loaded}
			<CheckboxGroup legend="Enabled features" bind:value={selectedRecs}>
				{#each reconcilers as reconciler}
					<Checkbox value={reconciler.value} checked={true}>
						<span class="option">
							{reconciler.name}
							<HelpText title="" wrapperClass="tooltipAddMemberWrapper">
								{reconciler.description}
							</HelpText>
						</span>
					</Checkbox>
				{/each}
			</CheckboxGroup>
		{/if}
	</form>

	{#snippet footer()}
		<Button type="submit" onclick={submit} iconLeft={PlusIcon}>Add member</Button>
	{/snippet}
</Modal>

<style>
	.wrapper {
		min-width: 400px;
	}

	.option {
		display: inline-flex;
		gap: 0.5rem;
	}

	:global(.tooltipAddMemberWrapper) {
		width: 200px;
	}
</style>
