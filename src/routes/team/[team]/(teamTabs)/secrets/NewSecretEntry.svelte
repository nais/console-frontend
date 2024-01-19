<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';

	export let i: number; 
	export let j: number;

	export let update:
		| {
				env: string;
				secrets: {
					name: string;
					id: string;
					data: {
						key: string;
						value: string;
					}[];
				}[];
		  }[]
		| undefined;

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
