<script lang="ts">
	import { Alert, Button, TextField, Tooltip } from '@nais/ds-svelte-community';
	import type { operation } from './state-machinery';
	import { PlusCircleFillIcon } from '@nais/ds-svelte-community/icons';

	export let env: string;
	export let secret: string;
	export let changes: operation[];
	export let existingKeys: string[];

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

	$: validate = () => {
		if (!key) {
			return ''
		}

		if (existingKeys.includes(key)) {
			return 'Duplicate key'
		}

		if (key.length > 253) {
			return 'Key too long'
		}

		if (/^[-._a-zA-Z0-9]+$/.test(key) === false) {
			return 'Only alphanumeric, \'-\', \'_\' or \'.\''
		}

		return '';
	};

	let key: string | undefined;
	let value: string | undefined;
</script>

<div class="entry">
	<TextField size="small" htmlSize={35} bind:value={key} placeholder="New key" error={validate()}/>
	<TextField size="small" htmlSize={30} bind:value placeholder="New value" />
	{#if validate().length === 0}
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
        margin: 16px 0 0 16px;
    }

    .buttons {
        margin-left: 14px;
				margin-top: 24px;
    }
</style>
