<script lang="ts" module>
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
	import GraphErrors from '$lib/GraphErrors.svelte';

	import { BodyShort, Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';

	interface Props {
		team: string;
		environments: EnvironmentType[];
		open: boolean;
	}

	let { team, environments, open = $bindable() }: Props = $props();

	let selectedEnvironment = $state(environments[0].name);

	let name = $state('');

	const close = () => {
		open = false;
		name = '';
	};

	const createSecret = graphql(`
		mutation createSecret($name: String!, $team: Slug!, $env: String!) {
			createSecret(input: { name: $name, team: $team, environment: $env }) {
				secret {
					id
					name
					teamEnvironment {
						environment {
							name
						}
					}
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
			env: selectedEnvironment
		});

		if ($createSecret.errors) {
			open = true;
			return;
		}
		const secretPage = '/team/' + team + '/' + selectedEnvironment + '/secret/' + name;
		close();
		await goto(secretPage);
	};

	const validate = (name: string) => {
		if (!name) {
			return '';
		}

		const names = environments
			.filter((env) => env.name === selectedEnvironment)
			.flatMap((env) => env.secrets.map((secret) => secret.name));

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

<Modal bind:open width="medium" onclose={close}>
	{#snippet header()}
		<Heading>Create New Secret</Heading>
	{/snippet}
	<div class="row">
		<BodyShort size="medium" spacing>A secret is a named set of key-value pairs.</BodyShort>
	</div>
	<div class="row">
		<Select size="small" label="Environment" bind:value={selectedEnvironment}>
			{#snippet description()}
				The environment in which the secret will be created.
			{/snippet}
			{#each environments as option (option.name)}
				<option value={option.name}>{option.name}</option>
			{/each}
		</Select>
		<br />
		<TextField size="small" bind:value={name} error={validate(name)}>
			{#snippet label()}
				Name
			{/snippet}
			{#snippet description()}
				The name is only used to reference the secret in your workload manifest.
				<br />
				<i>Example: my-secret</i>
			{/snippet}
		</TextField>
	</div>

	<GraphErrors errors={$createSecret.errors} />

	{#snippet footer()}
		<Button variant="primary" size="small" onclick={create}>Create</Button>
		<Button variant="secondary" size="small" onclick={close}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.row {
		margin-bottom: 32px;
	}
</style>
