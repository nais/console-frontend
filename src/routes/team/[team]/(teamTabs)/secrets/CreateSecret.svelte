<script lang="ts">
	import { graphql, type VariableInput } from '$houdini';
	import { Alert, Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';
	import { goto } from '$app/navigation';

	export let open: boolean;
	export let team: string;
	export let env: string;
	export let existingNames: string[];

	let name = '';
	let data: VariableInput[] = [];

	const createSecret = graphql(`
		mutation createSecret($name: String!, $team: Slug!, $env: String!, $data: [VariableInput!]!) {
			createSecret(name: $name, team: $team, env: $env, data: $data) {
				id
				data {
					name
					value
				}
			}
		}
	`);

	const create = async () => {
		if (validationError(name).length > 0 && name.length > 0) {
			return;
		}

		await createSecret.mutate({
			name: name,
			team: team,
			env: env,
			data: data
		});
		if ($createSecret.errors) {
			open = true;
		} else {
			const secretPage = '/team/' + team + '/' + env + '/secret/' + name;
			name = '';
			open = false;
			await goto(secretPage);
		}
	};

	const cancel = () => {
		name = '';
		open = false;
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

<Modal bind:open width="small" on:close={cancel}>
	<svelte:fragment slot="header">
		<Heading>Create new secret</Heading>
		<p>The secret will be created in <b>{env}</b></p>
	</svelte:fragment>
	<div>
		<TextField size="small" htmlSize={30} bind:value={name} error={validationError(name)}>
			<svelte:fragment slot="label">Name</svelte:fragment>
		</TextField>
		{#if $createSecret.errors}
			<Alert variant="error">
				{#each $createSecret.errors as error}
					{error.message}
				{/each}
			</Alert>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={create}>Create</Button>
		<Button variant="secondary" size="small" on:click={cancel}>Cancel</Button>
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
