<script lang="ts">
	import { getContextClient } from '$lib/urql/context';
	import type { AddTeamMemberInput, TeamMemberRole } from '$lib/urql/gql/graphql';
	import {
		Alert,
		Button,
		Detail,
		Heading,
		Modal,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import { queryStore } from '@urql/svelte';
	import { AddMemberQuery, AddTeamMemberMutation } from './members';

	interface Props {
		open: boolean;
		team: string;
		oncreated?: () => void;
	}

	let { open = $bindable(), team, oncreated }: Props = $props();

	const client = getContextClient();

	const store = $derived(
		queryStore({
			client,
			query: AddMemberQuery,
			variables: { team }
		})
	);

	const result = $derived($store);

	let emails = $derived.by(() => {
		const allEmails = result.data?.users.nodes.map((user) => user.email) ?? [];
		const teamMemberEmails = new Set(
			result.data?.team.members.nodes.map((member) => member.user.email) ?? []
		);
		return allEmails.filter((email) => !teamMemberEmails.has(email));
	});

	let role: TeamMemberRole | `${TeamMemberRole}` = $state('MEMBER');
	let email: string = $state('');

	let errors: string[] = $state([]);
	const submit = async () => {
		errors = [];
		const userID = result.data?.users.nodes.find(
			(u) =>
				email.localeCompare(u.email, undefined, {
					sensitivity: 'base'
				}) === 0
		)?.email;
		if (!userID) {
			errors = ['User not found'];
			return;
		}

		const input: AddTeamMemberInput = {
			role: role as TeamMemberRole,
			teamSlug: team,
			userEmail: userID
		};

		const resp = await client.mutation(AddTeamMemberMutation, { input }).toPromise();

		if (resp.error) {
			const gqlErrors = resp.error.graphQLErrors
				.filter((e) => e.message != 'unable to resolve')
				.map((e) => e.message);
			errors = gqlErrors.length > 0 ? gqlErrors : [resp.error.message];
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
		<Detail style="margin-top: 0.5rem; color: var(--ax-text-subtle)">
			{#if role === 'OWNER'}
				Full access including member administration
			{:else}
				Can modify resources and view secrets
			{/if}
		</Detail>
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
