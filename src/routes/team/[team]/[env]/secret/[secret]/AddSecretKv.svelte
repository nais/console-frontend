<script lang="ts">
	import { Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';
	import { addedKey, type operation } from './state-machinery';
	import type { VariableInput } from '$houdini';

	export let initial: VariableInput[];
	export let changes: operation[];
	export let open: boolean;

	let addKv = () => {
		if (key && value) {
			if (validKey(key).length > 0) {
				return;
			}

			changes = [
				...changes,
				{
					type: 'AddKv',
					data: { name: key, value }
				}
			];

			reset();
		}
	};

	const validKey = (key: string | undefined) => {
		if (!key) {
			return '';
		}

		const existingKeys = initial.map((kv) => kv.name);
		if (existingKeys.includes(key) || addedKey(key, initial, changes)) {
			return 'Key already exists';
		}

		if (key.length > 253) {
			return 'Must be less than 253 characters';
		}

		if (/^[_a-zA-Z0-9]+$/.test(key) === false) {
			return 'Can only contain letters, numbers, or _';
		}

		if (/^[a-zA-Z_]+/.test(key) === false) {
			return 'Must start with a letter or _';
		}
		return '';
	};

	let key: string | undefined;
	let value: string | undefined;

	const reset = () => {
		open = false;
		key = undefined;
		value = undefined;
	};
</script>

<Modal bind:open width="small">
	<svelte:fragment slot="header">
		<Heading>Add new key and value</Heading>
	</svelte:fragment>
	<div class="entry">
		<TextField size="small" bind:value={key} error={validKey(key)}>
			<svelte:fragment slot="label">Key (required)</svelte:fragment>
			<svelte:fragment slot="description"><i>Example: SOME_KEY</i></svelte:fragment>
		</TextField>
	</div>
	<div class="entry">
		<TextField size="small" bind:value>
			<svelte:fragment slot="label">Value (required)</svelte:fragment>
			<svelte:fragment slot="description"><i>Example: some-value</i></svelte:fragment>
		</TextField>
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={addKv}>Add</Button>
		<Button variant="secondary" size="small" on:click={reset}>Cancel</Button>
	</svelte:fragment>
</Modal>

<style>
	.entry {
		margin: 32px 32px 16px 16px;
	}
</style>
