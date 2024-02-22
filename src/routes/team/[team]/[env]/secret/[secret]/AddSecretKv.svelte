<script lang="ts">
	import { Button, Heading, Modal, TextField, Tooltip } from '@nais/ds-svelte-community';
	import { includesOperation, type operation } from './state-machinery';
	import { PlusCircleFillIcon } from '@nais/ds-svelte-community/icons';

	export let changes: operation[];
	export let existingKeys: string[];

	let addKv = () => {
		if (key && value) {
			if (validationError(key).length > 0) {
				return
			}

			changes = [
				...changes,
				{
					type: 'AddKv',
					data: { name: key, value }
				}
			];
			key = undefined;
			value = undefined;
			open = false;
		}
	};

	const validationError = (key: string | undefined) => {
		if (!key) {
			return '';
		}

		if (existingKeys.includes(key) || includesOperation(key, changes, 'AddKv')) {
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
	let open: boolean = false;

	const openAddKvModal = () => {
		open = true;
	};

	const cancel = () => {
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
		<TextField size="small" htmlSize={30} bind:value={key} error={validationError(key)}>
			<svelte:fragment slot="label">Key</svelte:fragment>
		</TextField>
		<TextField size="small" htmlSize={30} bind:value>
			<svelte:fragment slot="label">Value</svelte:fragment>
		</TextField>
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={addKv}>Add</Button>
		<Button variant="secondary" size="small" on:click={cancel}>Cancel</Button>
	</svelte:fragment>
</Modal>

<div class="buttons">
	<Tooltip content="Add new key and value">
		<Button variant="tertiary" size="small" on:click={openAddKvModal}>
			<svelte:fragment slot="icon-left">
				<PlusCircleFillIcon />
			</svelte:fragment>
			Add row
		</Button>
	</Tooltip>
</div>

<style>
	.entry > :global(*) {
		margin: 16px 0 0 16px;
	}

	.buttons {
		margin-top: 20px;
		margin-left: 10px;
	}
</style>
