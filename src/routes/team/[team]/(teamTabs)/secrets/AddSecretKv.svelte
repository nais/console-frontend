<script lang="ts">
	import { Button, TextField, Tooltip } from '@nais/ds-svelte-community';
	import type { operation } from './state-machinery';
	import { PlusCircleFillIcon } from '@nais/ds-svelte-community/icons';

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
		<Tooltip content="Add new key-value pair" arrow={false}>
			<Button type="submit" variant="tertiary" size="small" on:click={addKv}>
				 <svelte:fragment slot="icon-left"><PlusCircleFillIcon /></svelte:fragment>
			</Button>
		</Tooltip>
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
