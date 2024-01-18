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


		function updateKv(key: string, value: string ) {
		if (update) {
			
			update[i].secrets[j].data = update[i].secrets[j].data.concat({ key: key, value: value });
		}
	}

	let key: string 
	let value: string
</script>


<div class="entry">

		<TextField size="small" htmlSize={30}   bind:value={key} placeholder="New key" />


		<TextField size="small" htmlSize={30}  bind:value placeholder="New value" />

  
	<Button size="small" on:click={() => updateKv(key, value) }>Add</Button>
	
</div>

<style>
	.entry {
		display: flex;
	}
	.entry > :global(*) {
		margin: 16px 0 0 16px; 
	}
</style>
