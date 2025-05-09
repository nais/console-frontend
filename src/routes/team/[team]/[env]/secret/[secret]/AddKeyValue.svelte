<script lang="ts">
	import { graphql, type SecretValueInput } from '$houdini';
	import { Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';
	import { PlusCircleFillIcon } from '@nais/ds-svelte-community/icons';
	import Textarea from './Textarea.svelte';

	interface Props {
		initial: SecretValueInput[];
		teamSlug: string;
		env: string;
		secretName: string;
	}

	let { initial, teamSlug, env, secretName }: Props = $props();

	let open: boolean = $state(false);

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
			team: teamSlug,
			env: env,
			name: secretName
		});

		if ($addSecretValueMutation.errors) {
			return;
		}

		open = false;
		key = '';
		value = '';
	};

	let key: string = $state('');
	let value: string = $state('');

	const openModal = () => {
		open = true;
	};

	const reset = () => {
		open = false;
		key = '';
		value = '';
	};
</script>

<div class="buttons">
	<button
		title="Add new key and value"
		variant="tertiary"
		size="small"
		onclick="{openModal}"
		icon="{PlusCircleFillIcon}"
	>
		Add key and value
	</button>
</div>
<Modal bind:open onclose="{reset}" width="medium">
	{#snippet header()}
	<Heading level="1" size="large">Add new key and value</Heading>
	{/snippet}
	<div class="text-input">
		<TextField
			style="font-family: monospace; font-size: var(--ax-font-size-small, --a-font-size-small)"
			size="small"
			bind:value="{key}"
			error="{validKey(key)}"
			description="Examples: SOME_KEY, some.key, or some-key"
			label="Key"
		/>

		<textarea bind:text="{value}" label="Value" description="Example: some-value" />
	</div>

	{#snippet footer()} {#if key === '' || value === ''}
	<button variant="primary" size="small" onclick="{addSecretValue}" disabled="{true}">Add</button>
	{:else}
	<button variant="primary" size="small" onclick="{addSecretValue}">Add</button>
	{/if}
	<button variant="secondary" size="small" onclick="{reset}">Cancel</button>
	{/snippet}
</Modal>

<style>
	.text-input {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12, --a-spacing-3);
	}
	/* .buttons {
		margin-top: 1rem;
	} */
</style>
