<script lang="ts">
	import { TextField, Button, Tooltip, Tag } from '@nais/ds-svelte-community';
	import { addedKey, type operation, updatedKey } from './state-machinery';
	import { EyeIcon, EyeObfuscatedIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { VariableInput } from '$houdini';

	export let initial: VariableInput[];
	export let key: string;
	export let value: string;
	export let changes: operation[];

	let deleteKv = () => {
		changes = [
			...changes,
			{
				type: 'DeleteKv',
				data: { name: key }
			}
		];
	};

	let updateKvValue = () => {
		changes = [
			...changes,
			{
				type: 'UpdateValue',
				data: { name: key, value }
			}
		];
	};

	let toggleShowValue = () => {
		showValue = !showValue;
	};

	let showValue = false;
</script>

<div class="entry">
	<h4>
		{key}
	</h4>
	{#if showValue}
		<TextField hideLabel size="small" htmlSize={30} bind:value on:change={updateKvValue} />
		<Button size="xsmall" variant="tertiary" on:click={toggleShowValue}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Hide secret value" arrow={false}>
					<EyeObfuscatedIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{:else}
		<TextField
			hideLabel
			size="small"
			htmlSize={30}
			value="**********"
			readonly
			on:focus={toggleShowValue}
		/>
		<Button size="xsmall" variant="tertiary" on:click={toggleShowValue}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Show secret value" arrow={false}>
					<EyeIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{/if}

	<Button variant="tertiary" size="small" on:click={deleteKv}>
		<svelte:fragment slot="icon-left">
			<Tooltip content="Delete key and value" arrow={false}>
				<TrashIcon />
			</Tooltip>
		</svelte:fragment>
	</Button>

	<div class="status">
		{#if addedKey(key, initial, changes)}
			<Tag size="small" variant="success">Added</Tag>
		{:else if updatedKey(key, initial, changes)}
			<Tag size="small" variant="warning">Changed</Tag>
		{/if}
	</div>
</div>

<style>
	h4 {
		display: block;
		font-family: monospace;
		font-size: var(--a-font-size-medium);
		line-height: 2rem;
		min-height: 2rem;
		padding: 0 var(--a-spacing-2);
		width: 17rem;
		word-wrap: break-word;
	}

	.entry {
		display: flex;
	}

	.entry > :global(*) {
		margin: 16px 0 0 16px;
	}

	.status {
		display: flex;
		min-width: 70px;
	}
</style>
