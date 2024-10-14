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
	import { BodyShort, Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';

	export let team: string;
	//export let environments: { readonly name: string }[];

	export let environments: EnvironmentType[];

	export let open: boolean;
	let selectedEnvironment = '';

	let name = '';

	console.log(environments, team);

	const close = () => {
		open = false;
		name = '';
	};

	/*const createSecret = graphql(`
		mutation createSecret(
			$name: String!
			$team: Slug!
			$env: String!
			$data: [SecretVariableInput!]!
		) {
			createSecret(input: { name: $name, team: $team, environment: $env, data: $data }) {
				secret {
					id
					data {
						name
						value
					}
				}
			}
		}
	`);*/

	/*const create = async () => {
		if (validate(name).length > 0 && name.length > 0) {
			return;
		}

		await createSecret.mutate({
			name: name,
			team: team,
			env: 'dev',
			data: []
		});

		if ($createSecret.errors) {
			open = true;
			return;
		}
		//TODO
		const secretPage = '/team/' + team + '/' + 'dev' + '/secret/' + name;
		close();
		await goto(secretPage);
	};*/

	const validate = (name: string) => {
		if (!name) {
			return '';
		}

		/*
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

		*/
		return '';
	};
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Create new secret</Heading>
	</svelte:fragment>
	<div class="row">
		<BodyShort size="medium" spacing>A secret is a named set of key-value pairs.</BodyShort>
	</div>
	<div class="row">
		<Select size="small" label="Environment" bind:value={selectedEnvironment}>
			<svelte:fragment slot="description">
				The environment in which the secret will be created.
			</svelte:fragment>
			{#each environments as option}
				<option value={option.name}>{option.name}</option>
			{/each}
		</Select>
		<br />
		<TextField size="small" bind:value={name} error={validate(name)}>
			<svelte:fragment slot="label">Name</svelte:fragment>
			<svelte:fragment slot="description">
				The name is only used to reference the secret in your workload manifest.
				<br />
				<i>Example: my-secret</i>
			</svelte:fragment>
		</TextField>
	</div>
	<!--{#if $createSecret.errors}
		<Alert variant="error">
			{#each $createSecret.errors as error}
				{error.message}
			{/each}
		</Alert>
	{/if}-->
	<svelte:fragment slot="footer">
		<!--Button variant="primary" size="small" on:click={create}>Create</Button-->
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>

<style>
	.row {
		margin-bottom: 32px;
	}
</style>
