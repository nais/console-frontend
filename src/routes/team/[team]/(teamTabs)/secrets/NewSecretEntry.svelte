<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';
	import type update from "./+page.svelte"

	export let i: number; 
	export let j: number;

	/* eslint-disable-next-line no-import-assign */
	export let update: update

	let updateKv = (key: string, value: string ) => {
		if (update) {
			update[i].secrets[j].data = update[i].secrets[j].data.concat({ key: key, value: value, added: true });
		}
	};

	let key: string 
	let value: string
</script>


<div class="entry">
		<TextField size="small" htmlSize={30}   bind:value={key} placeholder="New key" />
		<TextField size="small" htmlSize={30}  bind:value placeholder="New value" />
	<div class="buttons">
	<Button size="small" on:click={() => updateKv(key, value) }>Add</Button>
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
