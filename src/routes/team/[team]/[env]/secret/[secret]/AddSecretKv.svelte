<script lang="ts">
	import { Button, TextField, Tooltip } from '@nais/ds-svelte-community';
	import { includesOperation, type operation } from './state-machinery';
	import { PlusCircleFillIcon } from '@nais/ds-svelte-community/icons';

	export let changes: operation[];
	export let existingKeys: string[];

	let addKv = () => {
		if (key && value) {
			changes = [
				...changes,
				{
					type: 'AddKv',
					data: { name: key, value }
				}
			];
			key = undefined;
			value = undefined;
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
</script>

<div class="entry">
	<TextField
		size="small"
		htmlSize={32}
		bind:value={key}
		placeholder="New key"
		error={validationError(key)}
	/>
	<TextField size="small" htmlSize={30} bind:value placeholder="New value" />
	{#if validationError(key).length === 0}
		<div class="buttons">
			<Tooltip content="Add new key-value pair" arrow={false}>
				<Button variant="tertiary" size="small" on:click={addKv}>
					<svelte:fragment slot="icon-left"><PlusCircleFillIcon /></svelte:fragment>
				</Button>
			</Tooltip>
		</div>
	{/if}
</div>

<style>
	.entry {
		display: flex;
		height: 68px;
		align-items: start;
	}

	.entry > :global(*) {
		margin: 16px 0 0 17px;
	}

	.buttons {
		margin-left: 13px;
		margin-top: 24px;
	}
</style>
