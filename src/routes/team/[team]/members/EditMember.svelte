<script lang="ts">
	import { getContextClient } from '$lib/urql/context';
	import type { TeamMemberRole } from '$lib/urql/gql/graphql';
	import { Alert, Detail, Heading, Label, Modal, Select } from '@nais/ds-svelte-community';
	import { queryStore } from '@urql/svelte';
	import { TeamMemberQuery, UpdateMemberRoleMutation } from './members';

	interface Props {
		open: boolean;
		team: string;
		email: string;
		onupdated?: () => void;
		onclosed?: () => void;
	}

	let { open = $bindable(), team, email, onupdated, onclosed }: Props = $props();

	const client = getContextClient();

	const store = $derived(
		queryStore({
			client,
			query: TeamMemberQuery,
			variables: { team, email }
		})
	);

	const result = $derived($store);

	let previousOpen = $state(open);
	$effect(() => {
		if (previousOpen && !open) {
			onclosed?.();
		}
		previousOpen = open;
	});

	let errors: string[] = [];
	const updateRole = async (e: Event) => {
		if (!e.target) return;
		if (!(e.target instanceof HTMLSelectElement)) return;

		await client
			.mutation(UpdateMemberRoleMutation, {
				input: {
					teamSlug: team,
					userEmail: email,
					role: e.target.value as TeamMemberRole
				}
			})
			.toPromise();
		onupdated?.();
		open = false;
	};
</script>

<Modal bind:open>
	{#snippet header()}
		<Heading>Edit Member</Heading>
	{/snippet}

	{#if result.data}
		{@const member = result.data.team.member}

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
