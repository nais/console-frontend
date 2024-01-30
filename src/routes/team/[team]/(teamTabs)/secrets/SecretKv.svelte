<script lang="ts">
	import { TextField, Button } from '@nais/ds-svelte-community';
	import type { operation } from './state-machinery';

	export let key: string;
	export let value: string;
	export let env: string;
	export let secret: string;
	export let changes: operation[];
	
	let matches = (c: operation) => c.data.key == key && c.data.secret == secret && c.data.env == env

	$: edit = changes.filter(matches).length > 0;

	let enableEdit = () => {
		changes = [...changes, {
			type: 'EditedKv',
			data: { env, key, secret }
		}];
	};

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
		edit = changes.filter(matches).length > 0;
	};

	$: deleted = changes.filter(matches).at(-1)?.type === 'DeleteKv';
	$: added = changes.filter(matches).at(-1)?.type === 'AddKv';
</script>

{#if edit}
	<div class="entry" class:deleted class:added>
		<h4>{key}</h4>
		<TextField hideLabel size="small" htmlSize={30} bind:value />
		<div class="buttons">
			<Button size="small" on:click={deleted ? unDeleteKv : deleteKv} variant="danger">
				{#if deleted}Undo{:else}Delete{/if}
			</Button>
		</div>
	</div>
{:else}
	<div class="entry" class:deleted class:added>
		<h4>{key}</h4>
		<TextField hideLabel size="small" htmlSize={30} bind:value disabled={true} readonly={true} />
		<div class="buttons">
			<Button size="small" on:click={enableEdit}>
				Edit
			</Button>
		</div>
	</div>
{/if}

<style>
		h4 {
				width: 17rem;
		}

    .entry {
        display: flex;
    }

    .entry > :global(*) {
        margin: 16px 0 0 16px;
    }

    .buttons {
        margin-left: 8px;
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
