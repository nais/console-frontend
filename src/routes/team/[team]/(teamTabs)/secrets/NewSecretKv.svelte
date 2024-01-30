<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';
	import type { operation } from './state-machinery';

	export let env: string;
	export let secret: string;

	export let changes: operation[];

	let addKv = () => {
		if (key && value) {
			changes = [...changes, {
				type: 'AddKv',
				data: { env, key, value, secret }
			}];
			key = undefined;
			value = undefined;
		}
	};

	let key: string | undefined;
	let value: string | undefined;
</script>

<div class="entry">
	<TextField size="small" htmlSize={30} bind:value={key} placeholder="New key" />
	<TextField size="small" htmlSize={30} bind:value placeholder="New value" />
	<div class="buttons">
		<Button size="small" on:click={addKv}>Add</Button>
	</div>
</div>

<style>
    .entry {
        display: flex;
    }

    .entry > :global(*) {
        margin: 16px 0 0 16px;
    }

    .buttons {
        margin-left: 8px;
        align-self: flex-end;
    }
</style>
