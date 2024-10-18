<script lang="ts">
	import { graphql, type SecretValueInput } from '$houdini';
	import { Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';
	import { PlusCircleFillIcon } from '@nais/ds-svelte-community/icons';
	import Textarea from './Textarea.svelte';

	export let initial: SecretValueInput[];
	export let team: string;
	export let env: string;
	export let secretName: string;

	let open: boolean = false;

	const validKey = (key: string | undefined) => {
		if (!key) {
			return '';
		}

		const existingKeys = initial.map((kv) => kv.name);
		if (existingKeys.includes(key)) {
			return 'Key already exists';
		}

		if (key.length > 253) {
			return 'Must be less than 253 characters';
		}

		if (/^[-._a-zA-Z0-9]+$/.test(key) === false) {
			return 'Must consist of letters, numbers, or certain special characters (underscores, hyphens, and periods)';
		}

		if (/^[a-zA-Z_.-]+/.test(key) === false) {
			return 'Must start with a letter or one of the following special characters: (underscores, hyphens, and periods)';
		}
		return '';
	};

	const addSecretValueMutation = graphql(`
		mutation addSecretValue(
			$name: String!
			$team: Slug!
			$env: String!
			$value: SecretValueInput!
		) {
			addSecretValue(input: { environment: $env, name: $name, team: $team, value: $value }) {
				secret {
					id
					values {
						name
						value
					}
					lastModifiedBy {
						name
						email
					}
					lastModifiedAt
				}
			}
		}
	`);

	const addSecretValue = async () => {
		if (!key || !value) {
			return;
		}
		await addSecretValueMutation.mutate({
			value: {
				name: key,
				value: value
			},
			team: team,
			env: env,
			name: secretName
		});

		if ($addSecretValueMutation.errors) {
			return;
		}

		open = false;
		key = undefined;
		value = undefined;
	};

	let key: string | undefined;
	let value: string | undefined;

	const openModal = () => {
		open = true;
	};

	const reset = () => {
		open = false;
		key = undefined;
		value = undefined;
	};
</script>

<div class="buttons">
	<Button title="Add new key and value" variant="tertiary" size="small" on:click={openModal}>
		<svelte:fragment slot="icon-left">
			<PlusCircleFillIcon />
		</svelte:fragment>
		Add key and value
	</Button>
</div>

<Modal bind:open width="medium">
	<svelte:fragment slot="header">
		<Heading>Add new key and value</Heading>
	</svelte:fragment>
	<div class="entry">
		<TextField
			style="font-family: monospace; font-size: var(--a-font-size-small);"
			size="small"
			bind:value={key}
			error={validKey(key)}
		>
			<svelte:fragment slot="label">Key</svelte:fragment>
			<svelte:fragment slot="description"
				><i>Examples: SOME_KEY, some.key, or some-key</i></svelte:fragment
			>
		</TextField>
	</div>
	<div class="entry">
		<Textarea bind:text={value} label="Value" description="Example: some-value" />
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={addSecretValue}>Add</Button>
		<Button variant="secondary" size="small" on:click={reset}>Cancel</Button>
	</svelte:fragment>
</Modal>

<style>
	.buttons {
		margin-top: 1rem;
	}

	.entry {
		margin: 2rem 0;
	}
</style>
