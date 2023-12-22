<script lang="ts">
	import { graphql, type TeamMemberInput } from '$houdini';
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
	import { createEventDispatcher, onMount } from 'svelte';

	export let open: boolean;
	export let team: string;

	const dispatcher = createEventDispatcher<{ created: null }>();

	const store = graphql(`
		query AddMemberQuery @load {
			users(limit: 10000) {
				nodes {
					id
					email
				}
			}

			reconcilers {
				displayName
				name
				description
				usesTeamMemberships
			}
		}
	`);

	const create = graphql(`
		mutation CreateMemberMutation($team: Slug!, $input: TeamMemberInput!) {
			addTeamMember(member: $input, slug: $team) {
				slug
			}
		}
	`);

	$: emails = $store.data?.users.nodes.map((user) => user.email) ?? [];

	type Reconciler = { name: string; value: string; description: string };
	let selectedRecs: string[] = [];
	let reconcilers: Reconciler[] = [];

	onMount(() => {
		return store.subscribe(async (v) => {
			if (!v.data) return;

			const recs = v.data.reconcilers.filter((r) => r.usesTeamMemberships);
			reconcilers =
				recs.map((r) => ({
					name: r.displayName,
					value: r.name,
					description: r.description
				})) ?? [];
		});
	});

	let role: TeamMemberInput['role'] = 'MEMBER';
	let email: string;

	let errors: string[] = [];
	const submit = async () => {
		errors = [];
		const userID = $store.data?.users.nodes.find((u) => u.email === email)?.id;
		if (!userID) {
			errors = ['User not found'];
			return;
		}

		const input: TeamMemberInput = {
			role,
			userId: userID,
			reconcilerOptOuts: reconcilers
				.filter((r) => !selectedRecs.includes(r.value))
				.map((r) => r.value)
		};

		const resp = await create.mutate({
			team: team,
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
	<svelte:fragment slot="header"><Heading>Add member</Heading></svelte:fragment>

	{#each errors as error}
		<Alert variant="error">{error}</Alert>
	{/each}

	<form on:submit|preventDefault={submit} class="wrapper">
		<TextField list="add-member-email" type="email" bind:value={email}>
			<svelte:fragment slot="label">Email</svelte:fragment>
		</TextField>
		<datalist id="add-member-email">
			{#each emails as email}
				<option value={email} />
			{/each}
		</datalist>

		<Select label="Role" style="width:150px" bind:value={role}>
			<option value="OWNER">Owner</option>
			<option value="MEMBER">Member</option>
		</Select>

		<CheckboxGroup legend="Enabled features" bind:value={selectedRecs}>
			{#each reconcilers as reconciler}
				<Checkbox value={reconciler.value} checked>
					<span class="option">
						{reconciler.name}
						<HelpText title="" wrapperClass="tooltipAddMemberWrapper">
							{reconciler.description}
						</HelpText>
					</span>
				</Checkbox>
			{/each}
		</CheckboxGroup>
	</form>

	<svelte:fragment slot="footer">
		<Button type="submit" on:click={submit}>
			<svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>
			Add member
		</Button>
	</svelte:fragment>
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
