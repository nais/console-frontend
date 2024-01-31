<script lang="ts">
	import { TextField, Button, Tooltip } from '@nais/ds-svelte-community';
	import type { operation } from './state-machinery';
	import { ArrowUndoIcon, EyeIcon, EyeObfuscatedIcon, TrashIcon } from '@nais/ds-svelte-community/icons';

	export let key: string;
	export let value: string;
	export let env: string;
	export let secret: string;
	export let changes: operation[];

	let matches = (c: operation) => c.data.key == key && c.data.secret == secret && c.data.env == env;

	let deleteKv = () => {
		changes = [...changes, {
			type: 'DeleteKv',
			data: { env, key, secret }
		}];
	};

	let unDeleteKv = () => {
		changes = [...changes, {
			type: 'UndoDeleteKv',
			data: { env, key, value, secret }
		}];
	};

	let showValue = false;

	$: deleted = changes.filter(matches).at(-1)?.type === 'DeleteKv';
	$: added = changes.filter(matches).at(-1)?.type === 'AddKv';
</script>

<div class="entry" class:deleted class:added>
	<h4>
		{#if deleted}
			<s>{key}</s>
		{:else}
			{key}
		{/if}
	</h4>
	{#if showValue}
		<TextField hideLabel size="small" htmlSize={30} bind:value on:change={() => {
			changes = [...changes, {
				type: 'UpdateValue',
				data: { env, key, value, secret }
			}];
		}}/>
		<Button
			size="xsmall"
			variant="tertiary"
			on:click={() => {
				showValue = false;
			}}
		>
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
			on:focus={() => {
				showValue = true;
			}}
		/>
		<Button
			size="xsmall"
			variant="tertiary"
			on:click={() => {
				showValue = true;
			}}
		>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Show secret value" arrow={false}>
					<EyeIcon />
				</Tooltip>
			</svelte:fragment>
		</Button
		>
	{/if}

	{#if deleted}
		<Button type="submit" variant="tertiary" size="small" on:click={unDeleteKv}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Undo delete" arrow={false}>
					<ArrowUndoIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{:else}
		<Button type="submit" variant="tertiary" size="small" on:click={deleteKv}>
			<svelte:fragment slot="icon-left">
				<Tooltip content="Delete key-value pair" arrow={false}>
					<TrashIcon />
				</Tooltip>
			</svelte:fragment>
		</Button>
	{/if}
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

    .deleted {
        --ac-textfield-border: var(--a-border-danger);
        --ac-textfield-bg: var(--a-surface-danger-subtle);
    }

    .added {
        --ac-textfield-border: var(--a-surface-success-moderate);
        --ac-textfield-bg: var(--a-surface-success-subtle);
    }
</style>
