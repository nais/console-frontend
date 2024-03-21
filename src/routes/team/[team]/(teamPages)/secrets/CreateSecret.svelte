<script lang="ts" context="module">
	export type EnvironmentType = {
		readonly name: string;
		readonly secrets: {
			readonly name: string;
			readonly lastModifiedAt: Date | null;
		}[];
	};
</script>

<script lang="ts">
	import { graphql } from '$houdini';
	import { Alert, Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';
	import { goto } from '$app/navigation';

	export let environment: EnvironmentType;

	export let team: string;
	export let open: boolean;

	let name = '';

	const close = () => {
		open = false;
		name = '';
	};

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
		if (validate(name, environment.name).length > 0 && name.length > 0) {
			return;
		}

		await createSecret.mutate({
			name: name,
			team: team,
			env: environment.name,
			data: []
		});

		if ($createSecret.errors) {
			open = true;
			return;
		}

		const secretPage = '/team/' + team + '/' + environment.name + '/secret/' + name;
		close();
		await goto(secretPage);
	};

	const validate = (name: string, env: string) => {
		if (!name) {
			return '';
		}

		const names = environment.secrets.map((s) => s.name) || [];

		if (names.includes(name)) {
			return 'Already exists in environment';
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

<Modal bind:open width="small" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Create new secret in {environment.name}</Heading>
	</svelte:fragment>
	<div class="wrapper">
		<div class="row">
			<TextField size="small" bind:value={name} error={validate(name, environment.name)}>
				<svelte:fragment slot="label">Name</svelte:fragment>
			</TextField>
		</div>
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
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>

<style>
	.wrapper {
		margin: 2rem 1rem;
	}

	.row {
		margin-bottom: 32px;
	}
</style>
