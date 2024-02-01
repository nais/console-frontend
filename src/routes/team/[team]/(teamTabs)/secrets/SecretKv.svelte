<script lang="ts">
	import { TextField, Button, Tooltip, Tag } from '@nais/ds-svelte-community';
	import { includesOperation, lastOperation, type operation } from './state-machinery';
	import { ArrowUndoIcon, EyeIcon, EyeObfuscatedIcon, TrashIcon } from '@nais/ds-svelte-community/icons';

	export let key: string;
	export let value: string;
	export let env: string;
	export let secret: string;
	export let changes: operation[];

	let deleteKv = () => {
		changes = [...changes, {
			type: 'DeleteKv',
			data: { env, key, secret }
		}];
	};

	let undoDeleteKv = () => {
		changes = [...changes, {
			type: 'UndoDeleteKv',
			data: { env, key, value, secret }
		}];
	};

	let updateKvValue = () => {
		changes = [...changes, {
			type: 'UpdateValue',
			data: { env, key, value, secret }
		}];
	};

	let toggleShowValue = () => {
		showValue = !showValue;
	};

	let showValue = false;

	$: edited = includesOperation(env, secret, key, changes, 'UpdateValue');
	$: deleted = lastOperation(env, secret, key, changes)?.type === 'DeleteKv';
	$: added = lastOperation(env, secret, key, changes)?.type === 'AddKv' || (
		includesOperation(env, secret, key, changes, 'AddKv') &&
		lastOperation(env, secret, key, changes)?.type === 'UndoDeleteKv'
	);
</script>

<div class="entry">
	<h4>
		{#if deleted}
			<s>{key}</s>
		{:else}
			{key}
		{/if}
	</h4>
	{#if showValue}
		<!-- TODO: hack to work around edits on local-only KV being overriden by value set in `AddKv`; should fix -->
		{#if added || deleted}
			<TextField hideLabel size="small" htmlSize={30} {value} readonly />
		{:else}
			<TextField hideLabel size="small" htmlSize={30} bind:value on:change={updateKvValue} />
		{/if}
		<Button size="xsmall" variant="tertiary" on:click={toggleShowValue}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Hide secret value" arrow={false}>
					<EyeObfuscatedIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{:else}
		<TextField hideLabel size="small" htmlSize={30} value="**********" readonly on:focus={toggleShowValue} />
		<Button size="xsmall" variant="tertiary" on:click={toggleShowValue}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Show secret value" arrow={false}>
					<EyeIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{/if}

	{#if deleted}
		<Button variant="tertiary" size="small" on:click={undoDeleteKv}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Undo delete" arrow={false}>
					<ArrowUndoIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{:else}
		<Button variant="tertiary" size="small" on:click={deleteKv}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Delete key and value" arrow={false}>
					<TrashIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{/if}

	<div class="status">
		{#if added}
			<Tag size="small" variant="success">Added</Tag>
		{:else if deleted}
			<Tag size="small" variant="error">Removed</Tag>
		{:else if edited}
			<Tag size="small" variant="warning">Changed</Tag>
		{/if}
	</div>
</div>

<style>
    h4 {
        font-weight: var(--a-font-weight-bold);
        display: block;
        width: 17rem;
        word-wrap: break-word;
        font-size: var(--a-font-size-medium);
        padding: 0 var(--a-spacing-2);
        min-height: 2rem;
        line-height: 2rem;
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
