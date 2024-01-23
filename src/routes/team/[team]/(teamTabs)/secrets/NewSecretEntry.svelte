<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';
	import type updateState from "./+page.svelte"
	import {editState}  from "./+page.svelte"

	export let i: number; 
	export let j: number;

	/* eslint-disable-next-line no-import-assign */
	export let update: updateState

	let updateKv = () => {
		if (update) {
			update[i].secrets[j].data = update[i].secrets[j].data.concat({ key: key, value: value, editState: editState.Added  });
			key = undefined
			value = undefined
		}
	};

	let key: string | undefined
	let value: string | undefined
</script>


<div class="entry">
		<TextField size="small" htmlSize={30}   bind:value={key} placeholder="New key" />
		<TextField size="small" htmlSize={30}  bind:value placeholder="New value" />
	<div class="buttons">
	<Button size="small" on:click={updateKv }>Add</Button>
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
