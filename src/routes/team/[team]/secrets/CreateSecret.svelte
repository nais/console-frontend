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

	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { getContextClient } from '$lib/urql/context';

	import { BodyShort, Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';
	import { CreateSecretMutation } from './secrets';

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

	const client = getContextClient();
	let mutationErrors: { message: string }[] | null = $state(null);

	const create = async () => {
		if (validate(name).length > 0 && name.length > 0) {
			return;
		}

		const result = await client
			.mutation(CreateSecretMutation, {
				name: name,
				team: team,
				env: selectedEnvironment
			})
			.toPromise();

		if (result.error) {
			mutationErrors = result.error.graphQLErrors.length
				? result.error.graphQLErrors.map((e) => ({ message: e.message }))
				: [{ message: result.error.message }];
			open = true;
			return;
		}
		mutationErrors = null;
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
		<Heading as="h1" size="large">Create New Secret</Heading>
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

	<GraphErrors errors={mutationErrors} />

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
