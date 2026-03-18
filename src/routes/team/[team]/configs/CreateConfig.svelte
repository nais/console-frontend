<script lang="ts" module>
	export type EnvironmentType = {
		readonly name: string;
		readonly configs: {
			readonly name: string;
			readonly lastModifiedAt: Date | null;
		}[];
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';

	import { graphql } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';

	import { BodyShort, Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';

	interface Props {
		team: string;
		environments: EnvironmentType[];
		open: boolean;
	}

	let { team, environments, open = $bindable() }: Props = $props();

	let selectedEnvironment = $state('');
	let name = $state('');

	$effect(() => {
		// Only set if empty or current selection is not in the list
		if (selectedEnvironment === '' || !environments.some((e) => e.name === selectedEnvironment)) {
			selectedEnvironment = environments[0]?.name ?? '';
		}
	});

	const close = () => {
		open = false;
		name = '';
	};

	const createConfig = graphql(`
		mutation createConfig($name: String!, $team: Slug!, $env: String!) {
			createConfig(input: { name: $name, teamSlug: $team, environmentName: $env }) {
				config {
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

		await createConfig.mutate({
			name: name,
			team: team,
			env: selectedEnvironment
		});

		if ($createConfig.errors) {
			open = true;
			return;
		}
		const configPage = '/team/' + team + '/' + selectedEnvironment + '/config/' + name;
		close();
		await goto(configPage);
	};

	const validate = (name: string) => {
		if (!name) {
			return '';
		}

		const names = environments
			.filter((env) => env.name === selectedEnvironment)
			.flatMap((env) => env.configs.map((config) => config.name));

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
		<Heading as="h1" size="large">Create New Config</Heading>
	{/snippet}
	<div class="row">
		<BodyShort size="medium" spacing>A config is a named set of key-value pairs.</BodyShort>
	</div>
	<div class="row">
		<Select size="small" label="Environment" bind:value={selectedEnvironment}>
			{#snippet description()}
				The environment in which the config will be created.
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
				The name is only used to reference the config in your workload manifest.
				<br />
				<i>Example: my-config</i>
			{/snippet}
		</TextField>
	</div>

	<GraphErrors errors={$createConfig.errors} />

	{#snippet footer()}
		{#if name === '' || validate(name) !== ''}
			<Button variant="primary" size="small" onclick={create} disabled={true}>Create</Button>
		{:else}
			<Button variant="primary" size="small" onclick={create}>Create</Button>
		{/if}
		<Button variant="secondary" size="small" onclick={close}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.row {
		margin-bottom: 32px;
	}
</style>
