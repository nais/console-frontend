<script lang="ts">
	import { graphql, type SecretTupleInput } from '$houdini';
	import { Alert, Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';

	export let open: boolean;
	export let team: string;
	export let env: string;
	export let refetch: () => void;
	export let existingNames: string[];

	let name = '';
	let data: SecretTupleInput[] = [];

	const createSecret = graphql(`
		mutation createSecret(
			$name: String!
			$team: Slug!
			$env: String!
			$data: [SecretTupleInput!]!
		) {
			createSecret(name: $name, team: $team, env: $env, data: $data) {
				id
				data {
					key
					value
				}
			}
		}
	`);

	const create = async () => {
		await createSecret.mutate({
			name: name,
			team: team,
			env: env,
			data: data
		});
		if ($createSecret.errors) {
			open = true;
		} else {
			open = false;
			refetch();
		}
	};

	const validationError = (name: string) => {
		if (!name) {
			return '';
		}

		if (existingNames.includes(name)) {
			return 'Name already exists';
		}

		if (name.length > 253) {
			return 'Must be less than 253 characters';
		}

		if (/[A-Z]+/.test(name) === true) {
			return 'Must be lowercase';
		}

		if (/^[a-z0-9]/.test(name) === false) {
			return 'Must start with a letter or number';
		}

		if (/^[-a-z0-9]+$/.test(name) === false) {
			return 'Can only contain letters, numbers, or -';
		}

		return '';
	};
</script>

<Modal bind:open width="small">
	<svelte:fragment slot="header">
		<Heading>Create new secret</Heading>
		<p>The secret will be created in <b>{env}</b></p>
	</svelte:fragment>
	<div>
		<TextField size="small" htmlSize={30} bind:value={name} error={validationError(name)}>
			<svelte:fragment slot="label">Name</svelte:fragment>
		</TextField>
		{#if $createSecret.errors}
			<Alert variant="error">{$createSecret.errors[0].message}</Alert>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		{#if validationError(name).length === 0 && name.length > 0}
			<Button variant="primary" size="small" on:click={create}>Create</Button>
		{/if}
	</svelte:fragment>
</Modal>

<style>
	div {
		padding: 16px;
	}

	div > :global(*) {
		margin-bottom: 32px;
	}
</style>
