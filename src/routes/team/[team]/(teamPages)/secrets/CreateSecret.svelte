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
	import { goto } from '$app/navigation';
	import { graphql } from '$houdini';
	import { Alert, BodyShort, Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';

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
		if (validate(name).length > 0 && name.length > 0) {
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

	const validate = (name: string) => {
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

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Create new Secret in <i>{environment.name}</i></Heading>
	</svelte:fragment>
	<div class="row">
		<BodyShort size="medium" spacing>A Secret is a named set of key-value pairs.</BodyShort>
	</div>
	<div class="row">
		<TextField size="small" bind:value={name} error={validate(name)}>
			<svelte:fragment slot="label">Name</svelte:fragment>
			<svelte:fragment slot="description">
				The name is only used to reference the Secret in your workload manifest.
				<br />
				<i>Example: my-secret</i>
			</svelte:fragment>
		</TextField>
	</div>
	{#if $createSecret.errors}
		<Alert variant="error">
			{#each $createSecret.errors as error}
				{error.message}
			{/each}
		</Alert>
	{/if}
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={create}>Create</Button>
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>

<style>
	.row {
		margin: 1rem 0;
	}
</style>
