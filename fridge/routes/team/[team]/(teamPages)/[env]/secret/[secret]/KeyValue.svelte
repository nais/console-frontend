<script lang="ts">
	import type { SecretVariableInput } from '$houdini';
	import { Button, Heading, Modal, Tag, Td, TextField, Tr } from '@nais/ds-svelte-community';
	import { DocPencilIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import { addedKey, type operation, updatedKey } from './state-machinery';
	import Textarea from './Textarea.svelte';

	export let initial: SecretVariableInput[];
	export let key: string;
	export let initialValue: string;
	export let changes: operation[];

	let editKvOpen = false;
	let value: string | undefined = initialValue;

	const deleteKv = () => {
		changes = [
			...changes,
			{
				type: 'DeleteKv',
				data: { name: key }
			}
		];
	};

	const updateKv = () => {
		if (!value) {
			return;
		}

		changes = [
			...changes,
			{
				type: 'UpdateValue',
				data: { name: key, value }
			}
		];

		editKvOpen = false;
	};

	const reset = () => {
		editKvOpen = false;
		value = initialValue;
	};

	const openEditKvModal = () => {
		// bug: Modal currently doesn't dispatch a 'close' event
		// initialValue is updated after updateKv is invoked, so we reset to initialValue in case it
		// was closed outside the cancel button with uncommitted updates
		value = initialValue;
		editKvOpen = true;
	};
</script>

<Tr>
	<Td>
		<p class="key">
			{key}
		</p>
	</Td>
	<Td style="width:100px;" align="right">
		<Button
			iconOnly
			size="small"
			variant="tertiary"
			title="Show or edit secret value"
			on:click={openEditKvModal}
		>
			<svelte:fragment slot="icon-left">
				<DocPencilIcon />
			</svelte:fragment>
		</Button>

		<Button
			iconOnly
			size="small"
			variant="tertiary-neutral"
			title="Delete key and value"
			on:click={deleteKv}
		>
			<svelte:fragment slot="icon-left">
				<TrashIcon style="color:var(--a-icon-danger)!important" />
			</svelte:fragment>
		</Button>
	</Td>

	<Td style="width:100px;">
		{#if addedKey(key, initial, changes)}
			<Tag size="small" variant="success">Added</Tag>
		{:else if updatedKey(key, initial, changes)}
			<Tag size="small" variant="warning">Changed</Tag>
		{/if}
	</Td>
</Tr>

{#if editKvOpen}
	<Modal bind:open={editKvOpen} width="medium" on:close={reset}>
		<svelte:fragment slot="header">
			<Heading>Edit value</Heading>
		</svelte:fragment>
		<div class="entry">
			<TextField
				style="font-family: monospace; font-size: var(--a-font-size-small);"
				size="small"
				value={key}
				readonly
			>
				<svelte:fragment slot="label">Key</svelte:fragment>
			</TextField>
		</div>
		<div class="entry">
			<Textarea bind:text={value} label="Value" description="Example: some-value" />
		</div>
		<svelte:fragment slot="footer">
			<Button variant="primary" size="small" on:click={updateKv}>Save</Button>
			<Button variant="secondary" size="small" on:click={reset}>Cancel</Button>
		</svelte:fragment>
	</Modal>
{/if}

<style>
	.key {
		font-family: monospace;
		font-size: var(--a-font-size-small);
		word-wrap: break-word;
		margin: 0;
		max-width: 36rem;
	}

	.entry {
		margin: 2rem 0;
	}
</style>
